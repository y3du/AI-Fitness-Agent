from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import get_db_connection
from db_ops import save_user, load_user, save_workout, load_previous_workout, load_feedback, save_feedback, save_conversation, save_nutrition_plan, load_nutrition_plan, save_or_update_user_dietary_preferences, load_user_dietary_preferences
from schemas import UserFitnessInputSchema, UserResponse, WorkoutResponse, DailyWorkoutFeedbackSchema, FeedbackResponse, NextWorkoutRequest, DailyWorkoutSchema, DailyNutritionPlanSchema, UserDietaryPreferencesSchema, UserDietaryPreferencesResponse
from workout_generator import generate_workout, apply_slight_progression, needs_modification
from nutrition_generator import generate_nutrition_plan
from typing import List
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.1.3:8000","http://192.168.12.1:8000" ,"*"], # Allow mobile device
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/users/", response_model=UserResponse)
async def create_user(user_input: UserFitnessInputSchema, db=Depends(get_db_connection)):
    try:
        user_id = await save_user(user_input, db)
        logger.info(f"Created user with id: {user_id}")
        await save_conversation(user_id, "User created", user_input.dict(), db)
        return {"user_id": user_id, "message": "User created successfully"}
    except Exception as e:
        logger.error(f"Failed to create user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@app.post("/workouts/current/", response_model=List[DailyWorkoutSchema])
async def generate_current_workout(request: dict, db=Depends(get_db_connection)):
    try:
        user_id = request.get('user_id')
        if not isinstance(user_id, int):
            raise ValueError(f"Invalid user_id: {user_id}")
        logger.info(f"Generating workout for user_id: {user_id}")

        # Check if workouts exist for the user for the current week (last 7 days)
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT COUNT(*) 
            FROM Workouts 
            WHERE user_id = %s 
            AND created_at >= %s - INTERVAL '7 days'
            """,
            (user_id, datetime.now())
        )
        workout_count = cursor.fetchone()[0]
        logger.debug(f"Workout count for user_id {user_id}: {workout_count}")

        if workout_count >= 7:
            # Fetch existing workouts
            cursor.execute(
                """
                SELECT day, exercises
                FROM Workouts
                WHERE user_id = %s
                AND created_at >= %s - INTERVAL '7 days'
                ORDER BY created_at DESC
                """,
                (user_id, datetime.now())
            )
            workouts_data = cursor.fetchall()
            weekly_workouts = []
            for workout_data in workouts_data:
                exercises = [
                    Exercise(**ex)
                    for ex in workout_data[1]
                ]
                weekly_workouts.append(DailyWorkoutSchema(day=workout_data[0], exercises=exercises))
            logger.info(f"Returning {len(weekly_workouts)} existing workouts for user_id: {user_id}")
            return weekly_workouts

        # Generate new week's workout
        user_input = await load_user(user_id, db)
        logger.debug(f"Loaded user data for user_id: {user_id}")
        weekly_workouts = await generate_workout(user_input)
        
        # Save each day's workout
        for workout in weekly_workouts:
            workout_id = await save_workout(user_id, workout, db)
            await save_conversation(user_id, f"Generated workout for {workout.day}", workout.dict(), db, workout_id=workout_id)
        logger.info(f"Generated and saved {len(weekly_workouts)} workouts for user_id: {user_id}")
        
        return weekly_workouts
    except ValueError as e:
        logger.error(f"ValueError in generate_current_workout: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate workout for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate workout: {str(e)}")
    finally:
        cursor.close()

@app.get("/workouts/week/", response_model=List[DailyWorkoutSchema])
async def get_weekly_workout(user_id: int, db=Depends(get_db_connection)):
    try:
        logger.info(f"Fetching weekly workout for user_id: {user_id}")
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT day, exercises
            FROM Workouts
            WHERE user_id = %s
            AND created_at >= %s - INTERVAL '7 days'
            ORDER BY created_at DESC
            """,
            (user_id, datetime.now())
        )
        workouts_data = cursor.fetchall()
        
        if not workouts_data:
            logger.warning(f"No workouts found for user_id: {user_id}")
            raise HTTPException(status_code=404, detail="No workouts found for this user in the current week")

        weekly_workouts = []
        for workout_data in workouts_data:
            exercises = [
                Exercise(**ex)
                for ex in workout_data[1]
            ]
            weekly_workouts.append(DailyWorkoutSchema(day=workout_data[0], exercises=exercises))
        
        days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        existing_days = {workout.day for workout in weekly_workouts}
        for day in days_of_week:
            if day not in existing_days:
                weekly_workouts.append(DailyWorkoutSchema(day=day, exercises=[]))
        
        day_order = {day: idx for idx, day in enumerate(days_of_week)}
        weekly_workouts.sort(key=lambda x: day_order[x.day])
        
        logger.info(f"Returning {len(weekly_workouts)} workouts for user_id: {user_id}")
        return weekly_workouts
    except Exception as e:
        logger.error(f"Failed to fetch weekly workout for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch weekly workout: {str(e)}")
    finally:
        cursor.close()

@app.post("/workouts/feedback/", response_model=FeedbackResponse)
async def submit_workout_feedback(user_id: int, feedback: DailyWorkoutFeedbackSchema, db=Depends(get_db_connection)):
    try:
        logger.info(f"Submitting feedback for user_id: {user_id}, day: {feedback.day}")
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT workout_id
            FROM Workouts
            WHERE user_id = %s
            AND day = %s
            AND created_at >= %s - INTERVAL '7 days'
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (user_id, feedback.day, datetime.now())
        )
        workout_data = cursor.fetchone()
        if not workout_data:
            logger.error(f"No workout found for user_id {user_id}, day {feedback.day}")
            raise ValueError(f"No workout found for {feedback.day} in the current week for user {user_id}")
        workout_id = workout_data[0]

        await save_feedback(user_id, workout_id, feedback, db)
        await save_conversation(user_id, f"Submitted feedback for {feedback.day}", feedback.dict(), db, workout_id=workout_id)
        logger.info(f"Feedback submitted for user_id: {user_id}, workout_id: {workout_id}")
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        logger.error(f"Failed to submit feedback for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")
    finally:
        cursor.close()

@app.post("/workouts/next/", response_model=WorkoutResponse)
async def generate_next_workout(request: NextWorkoutRequest, db=Depends(get_db_connection)):
    try:
        user_id = request.user_id
        target_day = request.target_day
        logger.info(f"Generating next workout for user_id: {user_id}, day: {target_day}")

        previous_workout = await load_previous_workout(user_id, target_day, db)
        feedback = await load_feedback(user_id, target_day, db)
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT day, exercises
            FROM Workouts
            WHERE user_id = %s
            AND created_at >= %s - INTERVAL '14 days'
            AND created_at < %s - INTERVAL '7 days'
            ORDER BY created_at DESC
            """,
            (user_id, datetime.now(), datetime.now())
        )
        previous_week_data = cursor.fetchall()
        previous_week = []
        for workout_data in previous_week_data:
            exercises = [
                Exercise(**ex)
                for ex in workout_data[1]
            ]
            previous_week.append(DailyWorkoutSchema(day=workout_data[0], exercises=exercises))

        user_input = await load_user(user_id, db)

        if needs_modification(feedback, previous_workout):
            workout = await generate_next_week_workout(user_input, feedback, previous_workout, previous_week, target_day)
        else:
            workout = apply_slight_progression(previous_workout)

        workout_id = await save_workout(user_id, workout, db)
        await save_conversation(user_id, f"Generated next workout for {target_day}", workout.dict(), db, workout_id=workout_id)
        logger.info(f"Generated workout_id: {workout_id} for user_id: {user_id}")
        return {"workout_id": workout_id, "workout": workout, "message": "Workout generated and saved"}
    except ValueError as e:
        logger.error(f"ValueError in generate_next_workout for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate next workout for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate next workout: {str(e)}")
    finally:
        cursor.close()

@app.post("/users/{user_id}/dietary-preferences", response_model=UserDietaryPreferencesResponse)
async def create_or_update_dietary_preferences(user_id: int, preferences: UserDietaryPreferencesSchema, db=Depends(get_db_connection)):
    try:
        await save_or_update_user_dietary_preferences(user_id, preferences.dict(), db)
        logger.info(f"Saved dietary preferences for user_id: {user_id}")
        return {"message": "Dietary preferences saved successfully"}
    except Exception as e:
        logger.error(f"Failed to save dietary preferences for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save dietary preferences: {str(e)}")

@app.get("/users/{user_id}/dietary-preferences", response_model=UserDietaryPreferencesSchema)
async def get_dietary_preferences(user_id: int, db=Depends(get_db_connection)):
    try:
        preferences = await load_user_dietary_preferences(user_id, db)
        if not preferences:
            raise HTTPException(status_code=404, detail="Dietary preferences not found for this user.")
        return preferences
    except Exception as e:
        logger.error(f"Failed to load dietary preferences for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load dietary preferences: {str(e)}")

@app.post("/nutrition/plan/", response_model=List[dict])
async def get_or_generate_nutrition_plan(request: dict, db=Depends(get_db_connection)):
    try:
        user_id = request.get('user_id')
        if not isinstance(user_id, int):
            raise ValueError(f"Invalid user_id: {user_id}")
        logger.info(f"Fetching or generating nutrition plan for user_id: {user_id}")

        # Attempt to load an existing plan from the last 7 days
        existing_plan = await load_nutrition_plan(user_id, db)
        if existing_plan:
            logger.info(f"Found existing nutrition plan for user_id: {user_id}. Returning it.")
            return existing_plan

        # If no recent plan, generate a new one
        logger.info(f"No recent nutrition plan found for user_id: {user_id}. Generating a new one.")
        user_input = await load_user(user_id, db)
        if not user_input:
            raise HTTPException(status_code=404, detail="User not found.")

        logger.info(f"Generating new nutrition plan for user_id: {user_id}")
        new_plan = await generate_nutrition_plan(user_id, user_input, db)
        
        # Save the new plan
        await save_nutrition_plan(user_id, new_plan, db)
        
        await save_conversation(user_id, "Generated new nutrition plan", {"status": "success"}, db)
        logger.info(f"Successfully generated and saved new nutrition plan for user_id: {user_id}")

        return new_plan
    except ValueError as e:
        logger.error(f"ValueError in nutrition plan generation for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get or generate nutrition plan for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process nutrition plan request: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)