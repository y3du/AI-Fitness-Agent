import google.generativeai as genai
import json
import os
from models import UserFitnessInput, DailyWorkout, DailyWorkoutFeedback, Exercise
from dotenv import load_dotenv
from typing import List

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
client = genai.GenerativeModel('gemini-2.0-flash')

def round_to_standard_weight(weight: str, exercise_name: str) -> str:
    if weight in ["N/A", "bodyweight"]:
        return weight
    weight_num = float(weight.replace("kg", ""))
    if "Barbell" in exercise_name or ("Press" in exercise_name and "Dumbbell" not in exercise_name):
        increment = 5.0
        rounded_weight = round(weight_num / increment) * increment
        rounded_weight = max(20.0, rounded_weight)
    elif "Dumbbell" in exercise_name or "Raise" in exercise_name or "Extension" in exercise_name:
        increment = 2.5
        rounded_weight = round(weight_num / increment) * increment
    else:
        increment = 2.5
        rounded_weight = round(weight_num / increment) * increment
    return f"{rounded_weight:.1f}kg"

async def generate_workout(user_input: UserFitnessInput) -> List[DailyWorkout]:
    equipment_str = "gym" if "barbells" in user_input.equipment or "dumbbells" in user_input.equipment else "home"
    experience_str = {1: "beginner", 2: "intermediate", 3: "expert"}.get(user_input.experience_level, "beginner")
    fitness_goal_str = user_input.fitness_goal if user_input.fitness_goal else "general fitness"
    available_equipment = ", ".join(user_input.equipment) if user_input.equipment else "none"
    strength_data = ""
    if equipment_str == "gym":
        strength_data = f"""
        - Bench Press Max: {user_input.gym_strength.bench_press_max if user_input.gym_strength else 0} kg ({'never done' if not user_input.gym_strength or user_input.gym_strength.bench_press_max == 0 else 'completed'})
        - Squat Max: {user_input.gym_strength.squat_max if user_input.gym_strength else 0} kg ({'never done' if not user_input.gym_strength or user_input.gym_strength.squat_max == 0 else 'completed'})
        - Deadlift Max: {user_input.gym_strength.deadlift_max if user_input.gym_strength else 0} kg ({'never done' if not user_input.gym_strength or user_input.gym_strength.deadlift_max == 0 else 'completed'})
        """
    else:
        strength_data = f"""
        - Push-Ups Reps: {user_input.home_strength.pushups_reps if user_input.home_strength else 0} ({'never done' if not user_input.home_strength or user_input.home_strength.pushups_reps == 0 else 'completed'})
        - Pull-Ups Reps: {user_input.home_strength.pullups_reps if user_input.home_strength else 0} ({'never done' if not user_input.home_strength or user_input.home_strength.pullups_reps == 0 else 'completed'})
        - Bodyweight Squats Reps: {user_input.home_strength.bodyweight_squats_reps if user_input.home_strength else 0} ({'never done' if not user_input.home_strength or user_input.home_strength.bodyweight_squats_reps == 0 else 'completed'})
        """

    weight_guidance = """
    For gym-based exercises, always suggest numerical weights in kilograms based on the user's experience level and strength data:
    - Weights must follow standard gym increments:
      - For barbell exercises (e.g., Barbell Bench Press, Overhead Press), assume a 20kg barbell and use weight plates of 1.25kg, 2.5kg, 5kg, 10kg, 15kg, 20kg, 25kg. Total weight must be in 5kg increments (e.g., 45kg, 50kg, 55kg).
      - For dumbbell exercises (e.g., Incline Dumbbell Press, Dumbbell Flyes, Lateral Raises, Overhead Triceps Extension), use increments of 2.5kg (e.g., 10kg, 12.5kg, 15kg, 17.5kg, 20kg).
      - For cable machine exercises (e.g., Triceps Pushdowns), use increments of 2.5kg (e.g., 20kg, 22.5kg, 25kg).
    - If the user has never done a lift (max is 0), start with light weights suitable for their experience level:
      - Beginner (level 1): 10-20% of body weight for compound lifts, 5-10kg for isolation.
      - Intermediate (level 2): 20-40% of body weight for compound lifts, 10-15kg for isolation.
      - Expert (level 3): 40-60% of body weight for compound lifts, 15-25kg for isolation.
    - If the user has a recorded max lift, suggest a working weight at 60-70% of their max for compound lifts and 50-60% for isolation exercises.
    For home-based exercises without equipment, use 'bodyweight' or 'N/A' as appropriate.
    """

    gender_guidance = """
    Consider the user's gender when designing the workout:
    - For male users, you may suggest slightly heavier weights or higher intensity for compound lifts, as they may have higher testosterone levels and muscle mass on average.
    - For female users, you may suggest slightly lighter weights or focus on higher reps for endurance, but still ensure progressive overload based on their experience level and strength data.
    - For users who select 'other', use a balanced approach similar to the average of male and female recommendations, unless their strength data suggests otherwise.
    Always prioritize the user's experience level, strength data, and equipment over gender stereotypes, but use gender as a secondary factor to fine-tune the workout.
    """

    fitness_goal_guidance = f"""
    Tailor the workout to the user's fitness goal ({fitness_goal_str}):
    - Lose Weight: Prioritize higher rep ranges (12-15), circuit-style workouts, and include cardio exercises if equipment like treadmill or jump rope is available.
    - Build Muscle: Focus on moderate rep ranges (8-12), compound lifts, and progressive overload with heavier weights.
    - Stay Fit: Balance strength and cardio with moderate reps (10-12) and varied exercises.
    - Improve Endurance: Emphasize high reps (15-20), shorter rest periods, and cardio-based exercises.
    - Increase Flexibility: Include mobility and stretching exercises, with lighter weights and higher reps for strength components.
    """

    cot_guidance = """
    To generate the workout, follow these steps and explain your reasoning:
    1. Analyze the user's experience level, equipment, fitness goal, and strength data to determine the appropriate intensity for each day.
    2. Consider the user's gender to fine-tune the workout (e.g., adjust weights or reps as per the gender guidance).
    3. For each exercise, calculate the appropriate weight based on the user's strength data and experience level, following the weight guidance.
    4. Determine the number of sets and reps based on the user's experience level and fitness goal (e.g., beginners may need fewer sets, experts may benefit from AMRAP).
    5. Ensure the weekly workout plan is balanced (e.g., includes exercises for upper body push, upper body pull, lower body, and core across the week, with appropriate rest days).
    6. Only include exercises that can be performed with the available equipment: {available_equipment}.
    Provide your reasoning for each exercise in the format:
    - Exercise: [Name]
      Reasoning: [Your step-by-step thought process]
    Then, return the workout in the required JSON format.
    """

    prompt = f"""
    You are a fitness trainer AI. Based on the user's profile, generate a full week's workout routine (Monday to Sunday).
    The user has the following details:
    - Name: {user_input.name}
    - Age: {user_input.age if user_input.age else 'Not provided'}
    - Gender: {user_input.gender}
    - Height: {user_input.height_cm} cm
    - Weight: {user_input.weight_kg} kg
    - Body Fat Percentage: {user_input.fat_percentage if user_input.fat_percentage is not None else 'Not provided'}
    - Experience Level: {experience_str}
    - Available Equipment: {available_equipment}
    - Fitness Goal: {fitness_goal_str}
    {strength_data}

    {weight_guidance}

    {gender_guidance}

    {fitness_goal_guidance}

    {cot_guidance}

    Return the workout in the following JSON format:
    [
        {{
            "day": "Monday",
            "exercises": [
                {{"name": "Exercise Name", "sets": <int>, "reps": <int or "AMRAP">, "weight": "<numerical weight in kg (e.g., '10kg'), 'bodyweight', or 'N/A'>"}},
                ...
            ]
        }},
        {{
            "day": "Tuesday",
            "exercises": [
                {{"name": "Exercise Name", "sets": <int>, "reps": <int or "AMRAP">, "weight": "<numerical weight in kg (e.g., '10kg'), 'bodyweight', or 'N/A'>"}},
                ...
            ]
        }},
        ...
        {{
            "day": "Sunday",
            "exercises": [
                {{"name": "Exercise Name", "sets": <int>, "reps": <int or "AMRAP">, "weight": "<numerical weight in kg (e.g., '10kg'), 'bodyweight', or 'N/A'>"}},
                ...
            ]
        }}
    ]
    Ensure the workout is appropriate for the user's experience level, equipment, fitness goal, gender, and strength data.
    For some exercises, you can use "AMRAP" (As Many Reps As Possible) in the reps field, especially for timed efforts.
    Include rest days (e.g., "Rest Day") by returning an empty exercises list for that day if appropriate.
    """

    response = client.generate_content(prompt)
    try:
        response_text = response.text
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0].strip()
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0].strip()
        weekly_workouts_data = json.loads(response_text)
        weekly_workouts = []
        for workout_data in weekly_workouts_data:
            exercises = [
                Exercise(
                    name=ex["name"],
                    sets=ex["sets"],
                    reps=ex["reps"],
                    weight=round_to_standard_weight(ex["weight"], ex["name"])
                )
                for ex in workout_data["exercises"]
            ]
            weekly_workouts.append(DailyWorkout(day=workout_data["day"], exercises=exercises))
        return weekly_workouts
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse response as JSON: {e}\nRaw response: {response_text}")
    except Exception as e:
        raise Exception(f"An error occurred while parsing the workout: {e}")

async def generate_next_week_workout(user_input: UserFitnessInput, feedback: DailyWorkoutFeedback, previous_workout: DailyWorkout, previous_week: List[DailyWorkout], target_day: str) -> DailyWorkout:
    equipment_str = "gym" if "barbells" in user_input.equipment or "dumbbells" in user_input.equipment else "home"
    experience_str = {1: "beginner", 2: "intermediate", 3: "expert"}.get(user_input.experience_level, "beginner")
    fitness_goal_str = user_input.fitness_goal if user_input.fitness_goal else "general fitness"
    available_equipment = ", ".join(user_input.equipment) if user_input.equipment else "none"
    strength_data = ""
    if equipment_str == "gym":
        strength_data = f"""
        - Bench Press Max: {user_input.gym_strength.bench_press_max if user_input.gym_strength else 0} kg ({'never done' if not user_input.gym_strength or user_input.gym_strength.bench_press_max == 0 else 'completed'})
        - Squat Max: {user_input.gym_strength.squat_max if user_input.gym_strength else 0} kg ({'never done' if not user_input.gym_strength or user_input.gym_strength.squat_max == 0 else 'completed'})
        - Deadlift Max: {user_input.gym_strength.deadlift_max if user_input.gym_strength else 0} kg ({'never done' if not user_input.gym_strength or user_input.gym_strength.deadlift_max == 0 else 'completed'})
        """
    else:
        strength_data = f"""
        - Push-Ups Reps: {user_input.home_strength.pushups_reps if user_input.home_strength else 0} ({'never done' if not user_input.home_strength or user_input.home_strength.pushups_reps == 0 else 'completed'})
        - Pull-Ups Reps: {user_input.home_strength.pullups_reps if user_input.home_strength else 0} ({'never done' if not user_input.home_strength or user_input.home_strength.pullups_reps == 0 else 'completed'})
        - Bodyweight Squats Reps: {user_input.home_strength.bodyweight_squats_reps if user_input.home_strength else 0} ({'never done' if not user_input.home_strength or user_input.home_strength.bodyweight_squats_reps == 0 else 'completed'})
        """

    previous_week_str = "\nPrevious Week's Workout Plan (for context):\n"
    for workout in previous_week:
        previous_week_str += f"\nDay: {workout.day}\n"
        if not workout.exercises:
            previous_week_str += "  Rest Day\n"
        for exercise in workout.exercises:
            rounded_weight = round_to_standard_weight(exercise.weight, exercise.name)
            previous_week_str += f"""
            - Exercise: {exercise.name}
              Sets Prescribed: {exercise.sets}
              Reps Prescribed: {exercise.reps}
              Weight Prescribed: {rounded_weight}
            """

    previous_workout_str = f"\nPrevious Week's Workout for {target_day}:\n"
    for exercise in previous_workout.exercises:
        rounded_weight = round_to_standard_weight(exercise.weight, exercise.name)
        previous_workout_str += f"""
        - Exercise: {exercise.name}
          Sets Prescribed: {exercise.sets}
          Reps Prescribed: {exercise.reps}
          Weight Prescribed: {rounded_weight}
        """

    feedback_str = f"\nPrevious Week's Feedback for {target_day}:\n"
    for exercise_feedback in feedback.feedback:
        feedback_str += f"""
        - Exercise: {exercise_feedback.name}
          Sets Completed: {exercise_feedback.sets_completed}
          Reps Completed: {exercise_feedback.reps_completed}
          Difficulty (1-5): {exercise_feedback.difficulty}
          Notes: {exercise_feedback.notes if exercise_feedback.notes else 'None'}
          Soreness Level (1-5): {exercise_feedback.soreness_level if exercise_feedback.soreness_level is not None else 'Not provided'}
        """

    adjustment_guidance = """
    Adjust the workout based on the user's feedback:
    - If difficulty was 1-2 (too easy) and the user completed all prescribed sets and reps (or more), increase the intensity:
      - For barbell exercises (e.g., Barbell Bench Press, Overhead Press), increase the weight by 5kg (2.5kg per side).
      - For dumbbell exercises (e.g., Incline Dumbbell Press, Dumbbell Flyes, Lateral Raises, Overhead Triceps Extension), increase the weight by 2.5kg.
      - For cable machine exercises (e.g., Triceps Pushdowns), increase the weight by 2.5kg.
      - Alternatively, increase reps by 1-2.
    - If difficulty was 4-5 (too hard) or the user couldn't complete the prescribed sets/reps, decrease the intensity:
      - For barbell exercises, decrease the weight by 5kg.
      - For dumbbell exercises, decrease the weight by 2.5kg.
      - For cable machine exercises, decrease the weight by 2.5kg.
      - Alternatively, reduce reps by 1-2 or sets by 1.
    - If difficulty was 3 (just right), keep the intensity similar but consider slight progression (e.g., add 1 rep).
    - Consider the user's notes and soreness level:
      - If soreness level is 4 or 5 for exercises targeting a specific muscle group (e.g., shoulders for Overhead Press), reduce intensity targeting that muscle group.
      - If notes indicate strain or discomfort (e.g., 'shoulder strain'), reduce intensity for related exercises or substitute with a less taxing variation (e.g., replace Overhead Press with Dumbbell Lateral Raise).
    Do not drop exercises from the workout unless feedback explicitly indicates a need for substitution (e.g., due to strain or injury). If an exercise is substituted, replace it with a similar exercise targeting the same muscle group.
    """

    weight_guidance = """
    For gym-based exercises, always suggest numerical weights in kilograms based on the user's strength data, previous workout weights, and feedback:
    - Weights must follow standard gym increments:
      - For barbell exercises (e.g., Barbell Bench Press, Overhead Press), assume a 20kg barbell and use weight plates of 1.25kg, 2.5kg, 5kg, 10kg, 15kg, 20kg, 25kg. Total weight must increase or decrease in 5kg increments (e.g., 45kg, 50kg, 55kg).
      - For dumbbell exercises (e.g., Incline Dumbbell Press, Dumbbell Flyes, Lateral Raises, Overhead Triceps Extension), use increments of 2.5kg (e.g., 10kg, 12.5kg, 15kg, 17.5kg, 20kg).
      - For cable machine exercises (e.g., Triceps Pushdowns), use increments of 2.5kg (e.g., 20kg, 22.5kg, 25kg).
    - If the user has never done a lift (max is 0), start with light weights suitable for their experience level:
      - Beginner (level 1): 10-20% of body weight for compound lifts, 5-10kg for isolation.
      - Intermediate (level 2): 20-40% of body weight for compound lifts, 10-15kg for isolation.
      - Expert (level 3): 40-60% of body weight for compound lifts, 15-25kg for isolation.
    - If the user has a recorded max lift (e.g., bench press, squat, deadlift), suggest a working weight at 60-70% of their max for compound lifts and 50-60% for isolation exercises, then adjust based on feedback.
    - For exercises with previous weights (e.g., from the previous week's workout), adjust the weight numerically based on feedback (increase/decrease according to the increments above).
    For gym exercises, do NOT use 'N/A' or 'bodyweight' as the weight; always provide a numerical weight in kilograms.
    For home-based exercises without equipment, use 'bodyweight' or 'N/A' as appropriate.
    """

    gender_guidance = """
    Consider the user's gender when designing the workout:
    - For male users, you may suggest slightly heavier weights or higher intensity for compound lifts, as they may have higher testosterone levels and muscle mass on average.
    - For female users, you may suggest slightly lighter weights or focus on higher reps for endurance, but still ensure progressive overload based on their experience level and strength data.
    - For users who select 'other', use a balanced approach similar to the average of male and female recommendations, unless their strength data suggests otherwise.
    Always prioritize the user's experience level, strength data, and equipment over gender stereotypes, but use gender as a secondary factor to fine-tune the workout.
    """

    fitness_goal_guidance = f"""
    Tailor the workout to the user's fitness goal ({fitness_goal_str}):
    - Lose Weight: Prioritize higher rep ranges (12-15), circuit-style workouts, and include cardio exercises if equipment like treadmill or jump rope is available.
    - Build Muscle: Focus on moderate rep ranges (8-12), compound lifts, and progressive overload with heavier weights.
    - Stay Fit: Balance strength and cardio with moderate reps (10-12) and varied exercises.
    - Improve Endurance: Emphasize high reps (15-20), shorter rest periods, and cardio-based exercises.
    - Increase Flexibility: Include mobility and stretching exercises, with lighter weights and higher reps for strength components.
    """

    cot_guidance = """
    To generate the workout, follow these steps and explain your reasoning:
    1. Analyze the user's experience level, equipment, fitness goal, strength data, previous week's workout plan (for context), previous workout for this day, and feedback to determine the appropriate adjustments.
    2. Consider the user's gender to fine-tune the workout (e.g., adjust weights or reps as per the gender guidance).
    3. Use the previous week's workout plan to maintain the weekly structure (e.g., if Monday was an Upper Body Push day last week, keep it as Upper Body Push this week, unless feedback indicates a need for a major change).
    4. For each exercise, evaluate the feedback:
       - Adjust the weight based on difficulty, sets/reps completed, soreness, and notes, following the adjustment guidance.
       - Calculate the new weight, ensuring it follows standard gym increments as per the weight guidance.
    5. Determine the number of sets and reps, adjusting based on feedback and the user's experience level.
    6. Ensure the workout for this day fits into the overall weekly structure (e.g., avoid overtraining a muscle group that was heavily targeted on another day).
    7. Only include exercises that can be performed with the available equipment: {available_equipment}.
    Provide your reasoning for each exercise in the format:
    - Exercise: [Name]
      Reasoning: [Your step-by-step thought process]
    Then, return the workout in the required JSON format.
    """

    prompt = f"""
    You are a fitness trainer AI. Based on the user's profile, their previous week's workout plan (for context), their previous week's workout for {target_day}, and their feedback, generate a workout routine for {target_day} of the next week.
    The user has the following details:
    - Name: {user_input.name}
    - Age: {user_input.age if user_input.age else 'Not provided'}
    - Gender: {user_input.gender}
    - Height: {user_input.height_cm} cm
    - Weight: {user_input.weight_kg} kg
    - Body Fat Percentage: {user_input.fat_percentage if user_input.fat_percentage is not None else 'Not provided'}
    - Experience Level: {experience_str}
    - Available Equipment: {available_equipment}
    - Fitness Goal: {fitness_goal_str}
    {strength_data}

    {previous_week_str}

    {previous_workout_str}

    {feedback_str}

    {adjustment_guidance}

    {weight_guidance}

    {gender_guidance}

    {fitness_goal_guidance}

    {cot_guidance}

    Return the workout in the following JSON format:
    {{
        "day": "{target_day}",
        "exercises": [
            {{"name": "Exercise Name", "sets": <int>, "reps": <int or "AMRAP">, "weight": "<numerical weight in kg (e.g., '10kg'), 'bodyweight', or 'N/A'>"}},
            ...
        ]
    }}
    Ensure the workout is appropriate for the user's experience level, equipment, fitness goal, gender, strength data, and feedback.
    For some exercises, you can use "AMRAP" (As Many Reps As Possible) in the reps field, especially for timed efforts.
    """

    response = client.generate_content(prompt)
    try:
        response_text = response.text
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0].strip()
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0].strip()
        workout_data = json.loads(response_text)
        exercises = [
            Exercise(
                name=ex["name"],
                sets=ex["sets"],
                reps=ex["reps"],
                weight=round_to_standard_weight(ex["weight"], ex["name"])
            )
            for ex in workout_data["exercises"]
        ]
        return DailyWorkout(day=workout_data["day"], exercises=exercises)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse response as JSON: {e}\nRaw response: {response_text}")
    except Exception as e:
        raise Exception(f"An error occurred while parsing the workout: {e}")

def apply_slight_progression(workout: DailyWorkout) -> DailyWorkout:
    adjusted_exercises = []
    for exercise in workout.exercises:
        new_reps = exercise.reps
        new_weight = exercise.weight

        if exercise.reps != "AMRAP":
            new_reps = exercise.reps + 1

        if exercise.weight not in ["N/A", "bodyweight"]:
            weight_num = float(exercise.weight.replace("kg", ""))
            if "Barbell" in exercise.name or ("Press" in exercise.name and "Dumbbell" not in exercise.name):
                increment = 5.0
                new_weight_num = round((weight_num + increment) / increment) * increment
            elif "Dumbbell" in exercise.name or "Raise" in exercise.name or "Extension" in exercise.name:
                increment = 2.5
                new_weight_num = round((weight_num + increment) / increment) * increment
            else:
                increment = 2.5
                new_weight_num = round((weight_num + increment) / increment) * increment
            new_weight = f"{new_weight_num:.1f}kg"

        adjusted_exercises.append(
            Exercise(name=exercise.name, sets=exercise.sets, reps=new_reps, weight=new_weight)
        )
    return DailyWorkout(day=workout.day, exercises=adjusted_exercises)

def needs_modification(feedback: DailyWorkoutFeedback, previous_workout: DailyWorkout) -> bool:
    prescribed = {exercise.name: (exercise.sets, exercise.reps) for exercise in previous_workout.exercises}
    for exercise_feedback in feedback.feedback:
        prescribed_sets, prescribed_reps = prescribed.get(exercise_feedback.name, (0, 0))
        if exercise_feedback.difficulty in [1, 2, 4, 5]:
            return True
        if exercise_feedback.reps_completed != "AMRAP" and prescribed_reps != "AMRAP":
            if exercise_feedback.sets_completed < prescribed_sets or \
               exercise_feedback.reps_completed < prescribed_reps:
                return True
    return False