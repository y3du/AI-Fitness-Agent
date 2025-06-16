import json
from datetime import datetime
from db_ops import load_user, load_previous_workout, load_feedback, save_workout
from workout_generator import generate_next_week_workout, apply_slight_progression, needs_modification

def process_next_week_workout(user_id: int):
    try:
        target_day = datetime.now().strftime("%A")  # e.g., "Monday"

        feedback = load_feedback(user_id, target_day=target_day)
        previous_workout = load_previous_workout(user_id, target_day=target_day)

        if not needs_modification(feedback, previous_workout):
            print(f"\nNo modifications needed for {target_day}. Reusing previous workout with slight progression:")
            adjusted_workout = apply_slight_progression(previous_workout)
            print(json.dumps(adjusted_workout.model_dump(), indent=2))

            workout_id = save_workout(user_id, adjusted_workout)
            print("\nAdjusted workout saved to database")
            return workout_id

        user_input = load_user(user_id)
        print(f"\nLoaded user specifications from database for user_id {user_id}:")
        print(json.dumps(user_input.model_dump(), indent=2))

        workout = generate_next_week_workout(user_input, feedback, previous_workout, target_day=target_day)

        workout_id = save_workout(user_id, workout)
        print(f"\nNext Week {target_day} Workout Routine (Adjusted):")
        print(json.dumps(workout.model_dump(), indent=2))
        print("\nNew workout saved to database")
        return workout_id
    except Exception as e:
        print(f"Error processing next week's workout for {target_day}:", e)
        raise

if __name__ == "__main__":
    # For testing, assuming user_id 1 (you'll need to pass the correct user_id in practice)
    process_next_week_workout(user_id=1)