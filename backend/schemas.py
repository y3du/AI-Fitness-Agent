from pydantic import BaseModel, Field
from typing import Literal, Optional, Union, List

class GymStrengthSchema(BaseModel):
    bench_press_max: float
    squat_max: float
    deadlift_max: float

class HomeStrengthSchema(BaseModel):
    pushups_reps: int
    pullups_reps: int
    bodyweight_squats_reps: int

class UserFitnessInputSchema(BaseModel):
    name: str
    age: Optional[int] = Field(None, ge=1)
    height_cm: float
    weight_kg: float
    fat_percentage: Optional[float] = None
    experience_level: Optional[Literal[1, 2, 3]] = 1  # Default to beginner
    equipment: List[str]  # Array of equipment types
    fitness_goal: Optional[Literal["lose_weight", "build_muscle", "stay_fit", "improve_endurance", "increase_flexibility"]] = None
    gender: Literal["male", "female", "other"]
    gym_strength: Optional[GymStrengthSchema] = None
    home_strength: Optional[HomeStrengthSchema] = None

    class Config:
        from_attributes = True

class ExerciseSchema(BaseModel):
    name: str
    sets: int
    reps: Union[int, Literal["AMRAP"]]
    weight: Optional[str] = "N/A"

    class Config:
        from_attributes = True

class DailyWorkoutSchema(BaseModel):
    day: str
    exercises: List[ExerciseSchema]

    class Config:
        from_attributes = True

class ExerciseFeedbackSchema(BaseModel):
    name: str
    sets_completed: int
    reps_completed: Union[int, Literal["AMRAP"]]
    difficulty: Literal[1, 2, 3, 4, 5]
    notes: Optional[str] = None
    soreness_level: Optional[int] = Field(None, ge=1, le=5)

    class Config:
        from_attributes = True

class DailyWorkoutFeedbackSchema(BaseModel):
    day: str
    feedback: List[ExerciseFeedbackSchema]

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    user_id: int
    message: str

class WorkoutResponse(BaseModel):
    workout_id: int
    workout: DailyWorkoutSchema
    message: str

class FeedbackResponse(BaseModel):
    message: str

class NextWorkoutRequest(BaseModel):
    user_id: int
    target_day: str