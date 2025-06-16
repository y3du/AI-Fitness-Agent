from typing import Literal, Optional, Union, List, Dict, Any

class GymStrength:
    def __init__(self, bench_press_max: float, squat_max: float, deadlift_max: float):
        self.bench_press_max = bench_press_max
        self.squat_max = squat_max
        self.deadlift_max = deadlift_max

    def dict(self):
        return {
            "bench_press_max": self.bench_press_max,
            "squat_max": self.squat_max,
            "deadlift_max": self.deadlift_max
        }

class HomeStrength:
    def __init__(self, pushups_reps: int, pullups_reps: int, bodyweight_squats_reps: int):
        self.pushups_reps = pushups_reps
        self.pullups_reps = pullups_reps
        self.bodyweight_squats_reps = bodyweight_squats_reps

    def dict(self):
        return {
            "pushups_reps": self.pushups_reps,
            "pullups_reps": self.pullups_reps,
            "bodyweight_squats_reps": self.bodyweight_squats_reps
        }

class UserFitnessInput:
    def __init__(
        self,
        name: str,
        age: Optional[int],
        height_cm: float,
        weight_kg: float,
        fat_percentage: Optional[float],
        experience_level: Optional[Literal[1, 2, 3]],
        equipment: List[str],
        fitness_goal: Optional[Literal["lose_weight", "build_muscle", "stay_fit", "improve_endurance", "increase_flexibility"]],
        gender: Literal["male", "female", "other"],
        gym_strength: Optional[GymStrength] = None,
        home_strength: Optional[HomeStrength] = None
    ):
        self.name = name
        self.age = age
        self.height_cm = height_cm
        self.weight_kg = weight_kg
        self.fat_percentage = fat_percentage
        self.experience_level = experience_level
        self.equipment = equipment
        self.fitness_goal = fitness_goal
        self.gender = gender
        self.gym_strength = gym_strength
        self.home_strength = home_strength

    def dict(self):
        return {
            "name": self.name,
            "age": self.age,
            "height_cm": self.height_cm,
            "weight_kg": self.weight_kg,
            "fat_percentage": self.fat_percentage,
            "experience_level": self.experience_level,
            "equipment": self.equipment,
            "fitness_goal": self.fitness_goal,
            "gender": self.gender,
            "gym_strength": self.gym_strength.dict() if self.gym_strength else None,
            "home_strength": self.home_strength.dict() if self.home_strength else None
        }

class Exercise:
    def __init__(
        self,
        name: str,
        sets: int,
        reps: Union[int, Literal["AMRAP"]],
        weight: Optional[str] = "N/A"
    ):
        self.name = name
        self.sets = sets
        self.reps = reps
        self.weight = weight

    def dict(self):
        return {
            "name": self.name,
            "sets": self.sets,
            "reps": self.reps,
            "weight": self.weight
        }

class DailyWorkout:
    def __init__(self, day: str, exercises: List[Exercise]):
        self.day = day
        self.exercises = exercises

    def dict(self):
        return {
            "day": self.day,
            "exercises": [exercise.dict() for exercise in self.exercises]
        }

class ExerciseFeedback:
    def __init__(
        self,
        name: str,
        sets_completed: int,
        reps_completed: Union[int, Literal["AMRAP"]],
        difficulty: Literal[1, 2, 3, 4, 5],
        notes: Optional[str] = None,
        soreness_level: Optional[int] = None
    ):
        self.name = name
        self.sets_completed = sets_completed
        self.reps_completed = reps_completed
        self.difficulty = difficulty
        self.notes = notes
        self.soreness_level = soreness_level

    def dict(self):
        return {
            "name": self.name,
            "sets_completed": self.sets_completed,
            "reps_completed": self.reps_completed,
            "difficulty": self.difficulty,
            "notes": self.notes,
            "soreness_level": self.soreness_level
        }

class DailyWorkoutFeedback:
    def __init__(self, day: str, feedback: List[ExerciseFeedback]):
        self.day = day
        self.feedback = feedback

    def dict(self):
        return {
            "day": self.day,
            "feedback": [fb.dict() for fb in self.feedback]
        }