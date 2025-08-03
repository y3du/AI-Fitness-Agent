from models import UserFitnessInput, DailyWorkout, DailyWorkoutFeedback, GymStrength, HomeStrength, Exercise, ExerciseFeedback
from psycopg2.extras import Json
import json
import psycopg2.extras
from datetime import datetime
from typing import Optional, List

async def save_user(user_input: UserFitnessInput, db) -> int:
    try:
        cursor = db.cursor()
        cursor.execute(
            """
            INSERT INTO Users (
                name, age, height_cm, weight_kg, fat_percentage, experience_level, 
                equipment, fitness_goal, gender, gym_strength, home_strength
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING user_id
            """,
            (
                user_input.name,
                user_input.age,
                user_input.height_cm,
                user_input.weight_kg,
                user_input.fat_percentage,
                user_input.experience_level,
                Json(user_input.equipment or []),  # Ensure empty list if None
                user_input.fitness_goal,
                user_input.gender,
                Json(user_input.gym_strength.dict() if user_input.gym_strength else None),
                Json(user_input.home_strength.dict() if user_input.home_strength else None)
            )
        )
        user_id = cursor.fetchone()[0]
        db.commit()
        return user_id
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to save user specifications to database: {e}")

async def load_user(user_id: int, db) -> UserFitnessInput:
    try:
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT name, age, height_cm, weight_kg, fat_percentage, experience_level, 
                   equipment, fitness_goal, gender, gym_strength, home_strength
            FROM Users
            WHERE user_id = %s
            """,
            (user_id,)
        )
        user_data = cursor.fetchone()
        if not user_data:
            raise ValueError("User not found in database")
        return UserFitnessInput(
            name=user_data[0],
            age=user_data[1],
            height_cm=user_data[2],
            weight_kg=user_data[3],
            fat_percentage=user_data[4],
            experience_level=user_data[5],
            equipment=user_data[6] or [],  # Convert JSONB to list, default to []
            fitness_goal=user_data[7],
            gender=user_data[8],
            gym_strength=GymStrength(**user_data[9]) if user_data[9] else None,
            home_strength=HomeStrength(**user_data[10]) if user_data[10] else None
        )
    except Exception as e:
        raise Exception(f"Failed to load user specifications: {e}")

async def save_workout(user_id: int, workout: DailyWorkout, db) -> int:
    try:
        cursor = db.cursor()
        cursor.execute(
            """
            INSERT INTO Workouts (user_id, day, exercises)
            VALUES (%s, %s, %s)
            RETURNING workout_id
            """,
            (user_id, workout.day, Json([ex.dict() for ex in workout.exercises]))
        )
        workout_id = cursor.fetchone()[0]
        db.commit()
        return workout_id
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to save workout to database: {e}")

async def load_previous_workout(user_id: int, target_day: str, db) -> DailyWorkout:
    try:
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT day, exercises
            FROM Workouts
            WHERE user_id = %s
            AND day = %s
            AND created_at >= %s - INTERVAL '14 days'
            AND created_at < %s - INTERVAL '7 days'
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (user_id, target_day, datetime.now(), datetime.now())
        )
        workout_data = cursor.fetchone()
        if not workout_data:
            raise ValueError(f"No previous workout found for {target_day} from the previous week")
        exercises = [
            Exercise(**ex)
            for ex in workout_data[1]
        ]
        return DailyWorkout(day=workout_data[0], exercises=exercises)
    except Exception as e:
        raise Exception(f"Failed to load previous workout: {e}")

async def load_feedback(user_id: int, target_day: str, db) -> DailyWorkoutFeedback:
    try:
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT workout_id, day
            FROM Workouts
            WHERE user_id = %s
            AND day = %s
            AND created_at >= %s - INTERVAL '14 days'
            AND created_at < %s - INTERVAL '7 days'
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (user_id, target_day, datetime.now(), datetime.now())
        )
        workout_data = cursor.fetchone()
        if not workout_data:
            raise ValueError(f"No workout found for {target_day} from the previous week")
        workout_id, day = workout_data

        cursor.execute(
            """
            SELECT exercise_name, sets_completed, reps_completed, difficulty, notes, soreness_level
            FROM Feedback
            WHERE workout_id = %s
            """,
            (workout_id,)
        )
        feedback_rows = cursor.fetchall()
        feedback_list = [
            ExerciseFeedback(
                name=row[0],
                sets_completed=row[1],
                reps_completed=row[2] if row[2] == "AMRAP" else int(row[2]),
                difficulty=row[3],
                notes=row[4],
                soreness_level=row[5]
            )
            for row in feedback_rows
        ]
        return DailyWorkoutFeedback(day=day, feedback=feedback_list)
    except Exception as e:
        raise Exception(f"Failed to load feedback: {e}")

async def save_feedback(user_id: int, workout_id: int, feedback: DailyWorkoutFeedback, db):
    if not feedback.feedback:
        return
    try:
        cursor = db.cursor()
        for fb in feedback.feedback:
            cursor.execute(
                """
                INSERT INTO Feedback (
                    user_id, workout_id, exercise_name, sets_completed, reps_completed, 
                    difficulty, notes, soreness_level
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    user_id,
                    workout_id,
                    fb.name,
                    fb.sets_completed,
                    str(fb.reps_completed),
                    fb.difficulty,
                    fb.notes,
                    fb.soreness_level
                )
            )
        db.commit()
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to save feedback to database: {e}")

async def save_or_update_user_dietary_preferences(user_id: int, preferences: dict, db):
    try:
        cursor = db.cursor()
        cursor.execute(
            """
            INSERT INTO UserDietaryPreferences (user_id, allergies, is_vegan, is_vegetarian, other_restrictions)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                allergies = EXCLUDED.allergies,
                is_vegan = EXCLUDED.is_vegan,
                is_vegetarian = EXCLUDED.is_vegetarian,
                other_restrictions = EXCLUDED.other_restrictions;
            """,
            (user_id, preferences.get('allergies', []), preferences.get('is_vegan', False), preferences.get('is_vegetarian', False), preferences.get('other_restrictions'))
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to save dietary preferences: {e}")

async def load_user_dietary_preferences(user_id: int, db):
    try:
        cursor = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cursor.execute("SELECT * FROM UserDietaryPreferences WHERE user_id = %s", (user_id,))
        record = cursor.fetchone()
        return dict(record) if record else None
    except Exception as e:
        raise Exception(f"Failed to load dietary preferences: {e}")

async def save_nutrition_plan(user_id: int, plan: List[dict], db):
    try:
        cursor = db.cursor()
        # First, delete any existing plan for this user to avoid stale data.
        cursor.execute("DELETE FROM NutritionPlans WHERE user_id = %s", (user_id,))
        
        # Now, insert the new plan
        for daily_plan in plan:
            day = daily_plan['day']
            meals_json = json.dumps(daily_plan['meals'])
            cursor.execute(
                """
                INSERT INTO NutritionPlans (user_id, day, meals)
                VALUES (%s, %s, %s)
                RETURNING plan_id;
                """,
                (user_id, day, meals_json)
            )
        db.commit()
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to save nutrition plan: {e}")

async def load_nutrition_plan(user_id: int, db):
    try:
        cursor = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
        # Load the most recent plan for the last 7 days
        cursor.execute(
            """
            SELECT day, meals 
            FROM NutritionPlans 
            WHERE user_id = %s AND created_at >= NOW() - INTERVAL '7 days'
            ORDER BY created_at DESC, day ASC;
            """,
            (user_id,)
        )
        records = cursor.fetchall()
        # Assuming one plan per week, we group by the creation date implicitly by ordering
        if not records:
            return None
        
        # Reconstruct the weekly plan from daily rows
        weekly_plan = []
        # This logic assumes the latest 7 day-rows form a single plan.
        # A more robust solution might involve a batch_id on the NutritionPlans table.
        for record in records[:7]: # Limit to 7 days
            weekly_plan.append(dict(record))
        return weekly_plan

    except Exception as e:
        raise Exception(f"Failed to load nutrition plan: {e}")

async def save_conversation(user_id: Optional[int], action: str, data: dict, db, workout_id: Optional[int] = None):
    try:
        cursor = db.cursor()
        cursor.execute(
            """
            INSERT INTO Conversations (user_id, workout_id, action, data)
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, workout_id, action, Json(data))
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to save conversation to database: {e}")