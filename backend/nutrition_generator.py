from models import UserFitnessInput
from schemas import MealSchema # Keep for internal structure
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import random
import json
from db_ops import load_user_dietary_preferences

def calculate_caloric_needs(user: UserFitnessInput) -> float:
    # Mifflin-St Jeor Equation for BMR
    if user.gender == "male":
        bmr = 10 * user.weight_kg + 6.25 * user.height_cm - 5 * user.age + 5
    else:
        bmr = 10 * user.weight_kg + 6.25 * user.height_cm - 5 * user.age - 161
    
    # Using a simplified activity level mapping for now
    activity_level_map = {
        1: 1.2, # Sedentary
        2: 1.375, # Lightly active
        3: 1.55, # Moderately active
        4: 1.725, # Very active
        5: 1.9 # Extra active
    }
    # Assuming user.experience_level can map to activity. This might need refinement.
    activity_multiplier = activity_level_map.get(user.experience_level, 1.55)

    tdee = bmr * activity_multiplier
    
    # Adjust for fitness goal
    goal_adjustments = {
        "lose_weight": 0.8,  # 20% deficit
        "build_muscle": 1.15,  # 15% surplus
        "stay_fit": 1.0,
    }
    # Defaulting to 1.0 if goal not in map
    return tdee * goal_adjustments.get(user.fitness_goal, 1.0)

def get_macro_ratios(user: UserFitnessInput) -> dict:
    default_ratios = {
        "lose_weight": {"protein": 0.4, "carbs": 0.3, "fat": 0.3},
        "build_muscle": {"protein": 0.35, "carbs": 0.4, "fat": 0.25},
        "stay_fit": {"protein": 0.3, "carbs": 0.4, "fat": 0.3},
    }
    return default_ratios.get(user.fitness_goal, {"protein": 0.3, "carbs": 0.4, "fat": 0.3})

async def load_recent_meal_ids(user_id: int, db, days_back: int) -> List[int]:
    try:
        cursor = db.cursor()
        query = """
            SELECT meals FROM NutritionPlans
            WHERE user_id = %s AND created_at >= %s
        """
        cursor.execute(query, (user_id, datetime.now() - timedelta(days=days_back)))
        
        recent_meal_ids = []
        for row in cursor.fetchall():
            meals_json = row[0]
            if meals_json:
                # meals_json could be a string or already a dict/list
                meals_list = json.loads(meals_json) if isinstance(meals_json, str) else meals_json
                for meal in meals_list:
                    recent_meal_ids.append(meal.get('meal_id'))
        
        return list(set(filter(None, recent_meal_ids)))
    except Exception as e:
        # It's better to log the exception and return an empty list
        # to avoid breaking the whole plan generation.
        print(f"Error loading recent meal IDs: {e}")
        return []

async def select_meals(user_id: int, db, daily_calories: float, macro_ratios: dict, dietary_preferences: Optional[Dict] = None, excluded_meal_ids: Optional[List[int]] = None) -> List[dict]:
    try:
        cursor = db.cursor()

        # Build query based on dietary preferences
        query_conditions = []
        query_params = []

        if dietary_preferences:
            if dietary_preferences.get('is_vegan'):
                query_conditions.append("dietary_tags @> %s")
                query_params.append(json.dumps(['vegan']))
            elif dietary_preferences.get('is_vegetarian'):
                query_conditions.append("dietary_tags @> %s")
                query_params.append(json.dumps(['vegetarian']))
            
            allergies = dietary_preferences.get('allergies')
            if allergies:
                query_conditions.append("NOT (dietary_tags ?| %s)")
                query_params.append(allergies)

        # Add exclusion for recent meals
        if excluded_meal_ids:
            query_conditions.append("meal_id NOT IN %s")
            query_params.append(tuple(excluded_meal_ids))

        where_clause = "WHERE " + " AND ".join(query_conditions) if query_conditions else ""
        
        query = f"""
            SELECT meal_id, name, meal_type, calories, protein_g, carbs_g, fat_g, dietary_tags
            FROM Meals
            {where_clause}
        """
        
        cursor.execute(query, tuple(query_params))
        
        meals_data = cursor.fetchall()
        available_meals = [
            MealSchema(
                meal_id=row[0], name=row[1], meal_type=row[2], foods=[],
                calories=row[3], protein_g=row[4], carbs_g=row[5], fat_g=row[6],
                dietary_tags=row[7]
            )
            for row in meals_data
        ]

        # Split meals by type
        meal_lists = {
            "breakfast": [m for m in available_meals if m.meal_type == "breakfast"],
            "lunch": [m for m in available_meals if m.meal_type == "lunch"],
            "dinner": [m for m in available_meals if m.meal_type == "dinner"],
            "snack": [m for m in available_meals if m.meal_type == "snack"]
        }

        selected_meals = []
        total_calories = 0

        # Select one meal per type, ensuring we don't pick the same meal twice in one day
        used_meal_ids_today = set()
        for meal_type in ["breakfast", "lunch", "dinner", "snack"]:
            candidates = [m for m in meal_lists.get(meal_type, []) if m.meal_id not in used_meal_ids_today]
            if not candidates:
                continue
            
            meal = random.choice(candidates)
            selected_meals.append({
                "meal_id": meal.meal_id,
                "name": meal.name,
                "meal_type": meal.meal_type,
                "calories": meal.calories,
                "protein_g": meal.protein_g,
                "carbs_g": meal.carbs_g,
                "fat_g": meal.fat_g,
                "portion_size_multiplier": 1.0
            })
            total_calories += meal.calories
            used_meal_ids_today.add(meal.meal_id)

        # Basic portion adjustment
        if total_calories > 0 and daily_calories > 0:
            multiplier = daily_calories / total_calories
            # Clamp multiplier to avoid extreme portions
            multiplier = max(0.5, min(2.0, multiplier))
            for meal in selected_meals:
                meal["portion_size_multiplier"] = round(multiplier, 2)
                meal["calories"] = round(meal["calories"] * multiplier, 2)
                meal["protein_g"] = round(meal["protein_g"] * multiplier, 2)
                meal["carbs_g"] = round(meal["carbs_g"] * multiplier, 2)
                meal["fat_g"] = round(meal["fat_g"] * multiplier, 2)

        return selected_meals
    except Exception as e:
        print(f"Failed to select meals: {e}")
        return [] # Return empty list on failure

async def generate_nutrition_plan(user_id: int, user: UserFitnessInput, db) -> List[Dict]:
    daily_calories = calculate_caloric_needs(user)
    macro_ratios = get_macro_ratios(user)
    dietary_preferences = await load_user_dietary_preferences(user_id, db)
    
    # Load meals used in the last 3 days to ensure variety from previous weeks
    recently_used_meal_ids = await load_recent_meal_ids(user_id=user_id, db=db, days_back=3)
    
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekly_plan = []
    
    # Keep track of all meals used to ensure variety across the week
    all_excluded_ids = set(recently_used_meal_ids)

    for day in days:
        daily_meals = await select_meals(
            user_id=user_id, 
            db=db, 
            daily_calories=daily_calories, 
            macro_ratios=macro_ratios,
            dietary_preferences=dietary_preferences,
            excluded_meal_ids=list(all_excluded_ids)
        )
        
        # Add the newly selected meal IDs to the set for the next days
        for meal in daily_meals:
            all_excluded_ids.add(meal['meal_id'])
            
        weekly_plan.append({"day": day, "meals": daily_meals})

    return weekly_plan