/**
 * Atlas Core Workout Screen v2.0
 * Premium workout logging and tracking
 * Built from scratch with the new design system
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Plus,
  Minus,
  Timer,
  Dumbbell,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Heart,
  Flame,
  TrendingUp,
  Clock,
  Activity,
  Save,
  X,
  Edit2,
  Trash2,
  Trophy
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock workout data
const mockWorkout = {
  name: 'Upper Body Strength',
  exercises: [
    {
      id: 1,
      name: 'Bench Press',
      sets: [
        { reps: 12, weight: 135, completed: true },
        { reps: 10, weight: 155, completed: true },
        { reps: 8, weight: 175, completed: false }
      ]
    },
    {
      id: 2,
      name: 'Incline Dumbbell Press',
      sets: [
        { reps: 12, weight: 50, completed: true },
        { reps: 10, weight: 55, completed: false }
      ]
    },
    {
      id: 3,
      name: 'Cable Fly',
      sets: [
        { reps: 15, weight: 40, completed: false },
        { reps: 12, weight: 45, completed: false }
      ]
    }
  ],
  estimatedDuration: 45,
  difficulty: 'Intermediate'
};

// Timer Component
function WorkoutTimer({ isActive, isPaused, time, onStart, onPause, onResume, onReset }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30 text-center">
      <h3 className="headline-sm text-white mb-4">Workout Timer</h3>
      
      <div className="text-6xl font-bold text-white mb-6 font-mono">
        {formatTime(time)}
      </div>
      
      <div className="flex items-center justify-center gap-3">
        {!isActive ? (
          <button onClick={onStart} className="btn btn-primary">
            <Play className="w-4 h-4" />
            Start Workout
          </button>
        ) : isPaused ? (
          <button onClick={onResume} className="btn btn-primary">
            <Play className="w-4 h-4" />
            Resume
          </button>
        ) : (
          <button onClick={onPause} className="btn btn-secondary">
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        
        {(isActive || isPaused) && (
          <>
            <button onClick={onReset} className="btn btn-ghost">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button className="btn btn-danger">
              <Square className="w-4 h-4" />
              End Workout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ exercise, onUpdateSet, onAddSet, onRemoveSet }) {
  const completedSets = exercise.sets.filter(set => set.completed).length;
  const totalSets = exercise.sets.length;
  const progress = (completedSets / totalSets) * 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="headline-sm text-white">{exercise.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">{completedSets}/{totalSets}</span>
            </div>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <button className="btn btn-ghost">
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={setIndex}
            set={set}
            setNumber={setIndex + 1}
            onUpdate={(field, value) => onUpdateSet(exercise.id, setIndex, field, value)}
            onToggleComplete={() => onUpdateSet(exercise.id, setIndex, 'completed', !set.completed)}
            onRemove={() => onRemoveSet(exercise.id, setIndex)}
          />
        ))}
        
        <button 
          onClick={() => onAddSet(exercise.id)}
          className="btn btn-ghost w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Set
        </button>
      </div>
    </div>
  );
}

// Set Row Component
function SetRow({ set, setNumber, onUpdate, onToggleComplete, onRemove }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
      set.completed 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-gray-800/50 border-gray-700'
    }`}>
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
        {setNumber}
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={() => onUpdate('reps', Math.max(1, set.reps - 1))}
          className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        
        <input
          type="number"
          value={set.reps}
          onChange={(e) => onUpdate('reps', parseInt(e.target.value) || 0)}
          className="w-16 h-8 bg-gray-700 border border-gray-600 rounded-lg text-center text-white font-medium"
        />
        
        <button
          onClick={() => onUpdate('reps', set.reps + 1)}
          className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
        
        <span className="text-gray-400 text-sm">reps</span>
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={() => onUpdate('weight', Math.max(0, set.weight - 5))}
          className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        
        <input
          type="number"
          value={set.weight}
          onChange={(e) => onUpdate('weight', parseInt(e.target.value) || 0)}
          className="w-16 h-8 bg-gray-700 border border-gray-600 rounded-lg text-center text-white font-medium"
        />
        
        <button
          onClick={() => onUpdate('weight', set.weight + 5)}
          className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
        
        <span className="text-gray-400 text-sm">lbs</span>
      </div>
      
      <button
        onClick={onToggleComplete}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          set.completed 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        <CheckCircle className="w-4 h-4" />
      </button>
      
      <button
        onClick={onRemove}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// Rest Timer Component
function RestTimer({ duration, isActive, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onComplete();
    }
  }, [timeLeft, isActive, isPaused, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 max-w-sm w-full mx-4">
        <div className="text-center">
          <h3 className="headline-md text-white mb-4">Rest Time</h3>
          
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-green-500 transition-all duration-1000"
              style={{
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                transform: `rotate(${progress * 3.6}deg)`
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{timeLeft}</span>
            </div>
          </div>
          
          <p className="text-gray-400 mb-4">Next set coming up...</p>
          
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="btn btn-secondary"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onComplete}
              className="btn btn-primary"
            >
              Skip Rest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Workout Summary Component
function WorkoutSummary({ workout, onSaveWorkout }) {
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(set => set.completed).length, 0);
  const completionRate = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="headline-md text-white mb-2">Workout Complete!</h3>
        <p className="text-gray-400">Great job pushing through {workout.name}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{completedSets}</p>
          <p className="text-gray-400 text-sm">Sets Done</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{Math.round(completionRate)}%</p>
          <p className="text-gray-400 text-sm">Completion</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{workout.exercises.length}</p>
          <p className="text-gray-400 text-sm">Exercises</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button onClick={onSaveWorkout} className="btn btn-primary flex-1">
          <Save className="w-4 h-4" />
          Save Workout
        </button>
        <Link to="/dashboard" className="btn btn-secondary flex-1 justify-center">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

// Main Workout Component
function Workout() {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(mockWorkout);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerActive && !timerPaused) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerPaused]);

  const startWorkout = () => {
    setTimerActive(true);
    setTimerPaused(false);
  };

  const pauseWorkout = () => {
    setTimerPaused(true);
  };

  const resumeWorkout = () => {
    setTimerPaused(false);
  };

  const resetWorkout = () => {
    setTimerActive(false);
    setTimerPaused(false);
    setWorkoutTime(0);
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => 
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set, index) =>
                index === setIndex ? { ...set, [field]: value } : set
              )
            }
          : exercise
      )
    }));
  };

  const addSet = (exerciseId) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: [...exercise.sets, { reps: 12, weight: 135, completed: false }]
            }
          : exercise
      )
    }));
  };

  const removeSet = (exerciseId, setIndex) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, index) => index !== setIndex)
            }
          : exercise
      )
    }));
  };

  const completeSet = (exerciseId, setIndex) => {
    updateSet(exerciseId, setIndex, 'completed', true);
    setShowRestTimer(true);
  };

  const skipRest = () => {
    setShowRestTimer(false);
  };

  const saveWorkout = () => {
    // Save logic here
    navigate('/dashboard');
  };

  const checkWorkoutCompletion = () => {
    const allSetsCompleted = workout.exercises.every(exercise =>
      exercise.sets.every(set => set.completed)
    );
    if (allSetsCompleted) {
      setWorkoutComplete(true);
      setTimerActive(false);
    }
  };

  useEffect(() => {
    checkWorkoutCompletion();
  }, [workout]);

  if (workoutComplete) {
    return (
      <div className="min-h-screen bg-base-0 flex items-center justify-center p-6">
        <WorkoutSummary workout={workout} onSaveWorkout={saveWorkout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-0">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-base-0/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="btn btn-ghost">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>
              <div>
                <h1 className="headline-md text-white">{workout.name}</h1>
                <p className="text-gray-400 text-sm">{workout.difficulty} · {workout.estimatedDuration} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Exercises */}
          <div className="lg:col-span-2 space-y-6">
            {workout.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdateSet={updateSet}
                onAddSet={addSet}
                onRemoveSet={removeSet}
              />
            ))}
          </div>

          {/* Right Column - Timer & Stats */}
          <div className="space-y-6">
            {/* Workout Timer */}
            <WorkoutTimer
              isActive={timerActive}
              isPaused={timerPaused}
              time={workoutTime}
              onStart={startWorkout}
              onPause={pauseWorkout}
              onResume={resumeWorkout}
              onReset={resetWorkout}
            />

            {/* Quick Stats */}
            <div className="card">
              <h3 className="headline-sm text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300 text-sm">Est. Calories</span>
                  </div>
                  <span className="text-white font-medium">~320</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300 text-sm">Avg. Heart Rate</span>
                  </div>
                  <span className="text-white font-medium">142 bpm</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">Volume</span>
                  </div>
                  <span className="text-white font-medium">8,420 lbs</span>
                </div>
              </div>
            </div>

            {/* Rest Timer Settings */}
            <div className="card">
              <h3 className="headline-sm text-white mb-4">Rest Timer</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Duration</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRestDuration(Math.max(30, restDuration - 15))}
                      className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-white font-medium w-12 text-center">{restDuration}s</span>
                    <button
                      onClick={() => setRestDuration(Math.min(180, restDuration + 15))}
                      className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rest Timer Overlay */}
      {showRestTimer && (
        <RestTimer
          duration={restDuration}
          isActive={true}
          onComplete={skipRest}
        />
      )}
    </div>
  );
}

export default Workout;
