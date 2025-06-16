import json
from user_input import collect_user_input, collect_workout_feedback
from db_ops import save_user, save_workout, save_feedback
from workout_generator import generate_workout

def process_current_week_workout():
    try:
        user_input = collect_user_input()
        user_id = save_user(user_input)
        print("\nUser specifications saved to database")

        workout = generate_workout(user_input)
        print("\nCurrent Week Day 1 Workout Routine:")
        print(json.dumps(workout.model_dump(), indent=2))

        workout_id = save_workout(user_id, workout)
        print("\nWorkout saved to database")

        feedback = collect_workout_feedback(workout)
        save_feedback(workout_id, feedback)

        print("\nFeedback Collected:")
        print(json.dumps(feedback.model_dump(), indent=2))
    except Exception as e:
        print("Error processing current week's workout:", e)

if __name__ == "__main__":
    process_current_week_workout()