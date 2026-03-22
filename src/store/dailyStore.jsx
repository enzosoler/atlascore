/**
 * Atlas Core — Daily Data Store
 * Shares current-day nutrition and workout data between Nutrition, Workouts, and Diary.
 * Uses React Context + useReducer to avoid a Zustand dependency.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';

const DailyStoreContext = createContext(null);

const initialState = {
  /** Map<dateStr, Meal[]> - meals indexed by date (YYYY-MM-DD) */
  mealsByDate: {},
  /** Map<dateStr, Workout[]> - workouts indexed by date */
  workoutsByDate: {},
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MEALS':
      return {
        ...state,
        mealsByDate: {
          ...state.mealsByDate,
          [action.date]: action.meals,
        },
      };
    case 'ADD_MEAL': {
      const existing = state.mealsByDate[action.date] || [];
      return {
        ...state,
        mealsByDate: {
          ...state.mealsByDate,
          [action.date]: [...existing, action.meal],
        },
      };
    }
    case 'REMOVE_MEAL': {
      const existing = state.mealsByDate[action.date] || [];
      return {
        ...state,
        mealsByDate: {
          ...state.mealsByDate,
          [action.date]: existing.filter((m) => m.id !== action.mealId),
        },
      };
    }
    case 'SET_WORKOUTS':
      return {
        ...state,
        workoutsByDate: {
          ...state.workoutsByDate,
          [action.date]: action.workouts,
        },
      };
    default:
      return state;
  }
}

export function DailyStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setMeals = useCallback((date, meals) => {
    dispatch({ type: 'SET_MEALS', date, meals });
  }, []);

  const addMeal = useCallback((date, meal) => {
    dispatch({ type: 'ADD_MEAL', date, meal });
  }, []);

  const removeMeal = useCallback((date, mealId) => {
    dispatch({ type: 'REMOVE_MEAL', date, mealId });
  }, []);

  const setWorkouts = useCallback((date, workouts) => {
    dispatch({ type: 'SET_WORKOUTS', date, workouts });
  }, []);

  const getMealsForDate = useCallback((date) => {
    return state.mealsByDate[date] || [];
  }, [state.mealsByDate]);

  const getWorkoutsForDate = useCallback((date) => {
    return state.workoutsByDate[date] || [];
  }, [state.workoutsByDate]);

  return (
    <DailyStoreContext.Provider
      value={{ setMeals, addMeal, removeMeal, setWorkouts, getMealsForDate, getWorkoutsForDate, state }}
    >
      {children}
    </DailyStoreContext.Provider>
  );
}

export function useDailyStore() {
  const ctx = useContext(DailyStoreContext);
  if (!ctx) throw new Error('useDailyStore must be used inside DailyStoreProvider');
  return ctx;
}
