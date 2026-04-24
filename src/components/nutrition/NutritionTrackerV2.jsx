/**
 * Atlas Core Nutrition Tracker v2.0
 * Premium nutrition tracking with new design system
 * Built from scratch with the new design system
 */

import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Camera,
  Flame,
  Calendar,
  X,
  Edit2,
  Trash2
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock nutrition data
const mockNutritionData = {
  dailyGoals: {
    calories: 2500,
    protein: 120,
    carbs: 250,
    fat: 83,
    water: 8
  },
  currentIntake: {
    calories: 1850,
    protein: 95,
    carbs: 180,
    fat: 65,
    water: 6
  },
  recentMeals: [
    {
      id: 1,
      name: "Protein Bowl",
      type: "lunch",
      calories: 650,
      protein: 45,
      carbs: 60,
      fat: 20,
      time: new Date(Date.now() - 7200000),
      image: "/api/placeholder/300/200"
    },
    {
      id: 2,
      name: "Greek Yogurt with Berries",
      type: "snack",
      calories: 220,
      protein: 20,
      carbs: 25,
      fat: 8,
      time: new Date(Date.now() - 3600000),
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      name: "Oatmeal with Protein Powder",
      type: "breakfast",
      calories: 480,
      protein: 30,
      carbs: 65,
      fat: 12,
      time: new Date(Date.now() - 14400000),
      image: "/api/placeholder/300/200"
    }
  ],
  weeklyAverage: {
    calories: 2350,
    protein: 110,
    carbs: 230,
    fat: 78
  }
};

// Macro Ring Component
function MacroRing({ label, current, goal, color, unit = 'g' }) {
  const percentage = Math.min((current / goal) * 100, 100);
  const radius = 40;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-3">
        <svg width={96} height={96} className="transform -rotate-90">
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={8}
          />
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: `drop-shadow(0 0 6px ${color}40)`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{current}</span>
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
      </div>
      <p className="text-white font-medium text-sm">{label}</p>
      <p className="text-gray-400 text-xs">{goal} {unit} goal</p>
    </div>
  );
}

// Water Tracker Component
function WaterTracker({ current, goal, onAdd }) {
  const glasses = Array.from({ length: goal }, (_, i) => i + 1);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <div className="w-6 h-6 text-blue-400"> glass</div>
          </div>
          <div>
            <h3 className="headline-sm text-white">Water Intake</h3>
            <p className="text-gray-400 text-sm">{current} of {goal} glasses</p>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-8 gap-2">
        {glasses.map((glass) => (
          <button
            key={glass}
            onClick={() => onAdd()}
            className={`aspect-square rounded-lg border-2 transition-all duration-200 ${
              glass <= current 
                ? 'bg-blue-500/20 border-blue-500' 
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className={`w-full h-full rounded-md ${
              glass <= current ? 'bg-blue-500' : 'bg-transparent'
            }`} />
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Daily Progress</span>
          <span className="text-blue-400 font-medium">{Math.round((current / goal) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(current / goal) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Meal Card Component
function MealCard({ meal, onEdit, onDelete }) {
  const mealTypes = {
    breakfast: { color: 'orange', icon: 'sun' },
    lunch: { color: 'green', icon: 'sun' },
    dinner: { color: 'blue', icon: 'moon' },
    snack: { color: 'purple', icon: 'cookie' }
  };

  const mealType = mealTypes[meal.type] || mealTypes.snack;

  return (
    <div className="card hover:transform hover:-translate-y-1 transition-all duration-200">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img 
            src={meal.image} 
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="headline-sm text-white truncate">{meal.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full bg-${mealType.color}-500/20 text-${mealType.color}-400 capitalize`}>
                  {meal.type}
                </span>
                <span className="text-gray-400 text-xs">
                  {meal.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={onEdit}
                className="w-6 h-6 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button 
                onClick={onDelete}
                className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <p className="text-white font-bold">{meal.calories}</p>
              <p className="text-gray-400">cal</p>
            </div>
            <div className="text-center">
              <p className="text-green-400 font-bold">{meal.protein}g</p>
              <p className="text-gray-400">protein</p>
            </div>
            <div className="text-center">
              <p className="text-blue-400 font-bold">{meal.carbs}g</p>
              <p className="text-gray-400">carbs</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 font-bold">{meal.fat}g</p>
              <p className="text-gray-400">fat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Add Meal Component
function QuickAddMeal({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const quickOptions = [
    { name: "Protein Shake", calories: 250, protein: 25, carbs: 10, fat: 5 },
    { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { name: "Greek Yogurt", calories: 100, protein: 10, carbs: 6, fat: 0.7 }
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="headline-sm text-white">Quick Add</h3>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
          </div>
          
          <div className="space-y-2">
            {quickOptions
              .filter(option => option.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((option, index) => (
                <button
                  key={index}
                  onClick={() => onAdd(option)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
                >
                  <span className="text-gray-300">{option.name}</span>
                  <span className="text-gray-400 text-sm">{option.calories} cal</span>
                </button>
              ))}
          </div>
          
          <div className="flex gap-2">
            <button className="btn btn-secondary flex-1 justify-center">
              <Camera className="w-4 h-4" />
              Scan
            </button>
            <button className="btn btn-secondary flex-1 justify-center">
              <UtensilsCrossed className="w-4 h-4" />
              Custom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Daily Summary Component
function DailySummary({ current, goals }) {
  const remainingCalories = goals.calories - current.calories;
  const caloriesPercentage = (current.calories / goals.calories) * 100;

  return (
    <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
      <div className="flex items-center gap-3 mb-4">
        <Flame className="w-5 h-5 text-orange-400" />
        <h3 className="headline-sm text-white">Today's Summary</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{current.calories}</p>
          <p className="text-gray-400 text-sm">Calories consumed</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${remainingCalories > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {remainingCalories > 0 ? '+' : ''}{remainingCalories}
          </p>
          <p className="text-gray-400 text-sm">Calories remaining</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Daily Progress</span>
          <span className="text-white font-medium">{Math.round(caloriesPercentage)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-green-500/30">
        <p className="text-gray-300 text-sm">
          {caloriesPercentage < 80 
            ? "You're doing great! Keep fueling your body with nutritious foods."
            : caloriesPercentage < 100
            ? "Almost there! A few more calories to hit your daily goal."
            : "Daily goal reached! Focus on recovery and hydration."
          }
        </p>
      </div>
    </div>
  );
}

// Main Nutrition Tracker Component
function NutritionTrackerV2() {
  const [nutritionData, setNutritionData] = useState(mockNutritionData);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMeal = (meal) => {
    const newMeal = {
      ...meal,
      id: Date.now(),
      type: 'snack',
      time: new Date(),
      image: '/api/placeholder/300/200'
    };
    
    setNutritionData(prev => ({
      ...prev,
      recentMeals: [newMeal, ...prev.recentMeals],
      currentIntake: {
        calories: prev.currentIntake.calories + meal.calories,
        protein: prev.currentIntake.protein + meal.protein,
        carbs: prev.currentIntake.carbs + meal.carbs,
        fat: prev.currentIntake.fat + meal.fat,
        water: prev.currentIntake.water
      }
    }));
  };

  const handleAddWater = () => {
    setNutritionData(prev => ({
      ...prev,
      currentIntake: {
        ...prev.currentIntake,
        water: Math.min(prev.currentIntake.water + 1, prev.dailyGoals.water)
      }
    }));
  };

  const handleEditMeal = (mealId) => {
    console.log('Edit meal:', mealId);
  };

  const handleDeleteMeal = (mealId) => {
    setNutritionData(prev => {
      const meal = prev.recentMeals.find(m => m.id === mealId);
      if (!meal) return prev;
      
      return {
        ...prev,
        recentMeals: prev.recentMeals.filter(m => m.id !== mealId),
        currentIntake: {
          calories: prev.currentIntake.calories - meal.calories,
          protein: prev.currentIntake.protein - meal.protein,
          carbs: prev.currentIntake.carbs - meal.carbs,
          fat: prev.currentIntake.fat - meal.fat,
          water: prev.currentIntake.water
        }
      };
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-800 rounded w-32"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-12 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="w-6 h-6 text-green-400" />
          <h2 className="headline-lg text-white">Nutrition Tracker</h2>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
      
      <DailySummary 
        current={nutritionData.currentIntake} 
        goals={nutritionData.dailyGoals} 
      />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MacroRing 
          label="Protein" 
          current={nutritionData.currentIntake.protein} 
          goal={nutritionData.dailyGoals.protein} 
          color="var(--color-success)" 
        />
        <MacroRing 
          label="Carbs" 
          current={nutritionData.currentIntake.carbs} 
          goal={nutritionData.dailyGoals.carbs} 
          color="var(--color-info)" 
        />
        <MacroRing 
          label="Fat" 
          current={nutritionData.currentIntake.fat} 
          goal={nutritionData.dailyGoals.fat} 
          color="var(--color-warning)" 
        />
        <MacroRing 
          label="Calories" 
          current={nutritionData.currentIntake.calories} 
          goal={nutritionData.dailyGoals.calories} 
          color="var(--color-primary-500)" 
          unit=""
        />
      </div>
      
      <WaterTracker 
        current={nutritionData.currentIntake.water} 
        goal={nutritionData.dailyGoals.water} 
        onAdd={handleAddWater} 
      />
      
      <QuickAddMeal onAdd={handleAddMeal} />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="headline-sm text-white">Recent Meals</h3>
          <button className="text-green-400 text-sm hover:text-green-300">
            View All
          </button>
        </div>
        
        {nutritionData.recentMeals.map((meal) => (
          <MealCard 
            key={meal.id} 
            meal={meal} 
            onEdit={() => handleEditMeal(meal.id)}
            onDelete={() => handleDeleteMeal(meal.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default NutritionTrackerV2;
