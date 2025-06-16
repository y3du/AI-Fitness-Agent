import React, { createContext, useState, useContext } from 'react';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const [workouts, setWorkouts] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);

  const startWorkout = (workout) => {
    setCurrentWorkout({
      ...workout,
      startTime: new Date(),
      exercises: workout.exercises.map(ex => ({
        ...ex,
        completed: false,
        sets: ex.sets || 3,
        reps: ex.reps || 12,
        weight: ex.weight || 0,
      })),
    });
  };

  const completeWorkout = () => {
    if (currentWorkout) {
      const completedWorkout = {
        ...currentWorkout,
        endTime: new Date(),
        completed: true,
      };
      
      setWorkoutHistory(prev => [completedWorkout, ...prev]);
      setCurrentWorkout(null);
    }
  };

  const addWorkout = (workout) => {
    setWorkouts(prev => [...prev, workout]);
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        currentWorkout,
        workoutHistory,
        startWorkout,
        completeWorkout,
        addWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export default WorkoutContext;
