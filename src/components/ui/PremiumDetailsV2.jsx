/**
 * Atlas Core Premium Details v2.0
 * Premium animations, haptic feedback, progress rings, and micro-interactions
 * Built from scratch with the new design system
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  Sparkles,
  Award,
  Target,
  TrendingUp,
  Activity,
  CheckCircle,
  Star,
  Heart,
  Clock,
  Calendar,
  BarChart3,
  Confetti,
  Gift,
  Crown,
  Medal
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// ========================================
// HAPTIC FEEDBACK UTILITIES
// ========================================

// Haptic Feedback Hook
function useHaptic() {
  const triggerHaptic = useCallback((type = 'light') => {
    if (!('vibrate' in navigator)) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [40],
      success: [10, 30, 10],
      error: [40, 20, 40],
      warning: [20, 10, 20],
      selection: [10],
      impact: [25],
      double: [10, 10],
      triple: [10, 10, 10]
    };
    
    try {
      navigator.vibrate(patterns[type] || patterns.light);
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  }, []);

  return { triggerHaptic };
}

// ========================================
// PREMIUM PROGRESS RINGS
// ========================================

// Animated Progress Ring Component
function AnimatedProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = 'var(--color-primary-500)',
  backgroundColor = 'var(--color-base-200)',
  showPercentage = true,
  showLabel = false,
  label = '',
  animated = true,
  duration = 1000,
  delay = 0
}) {
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const { triggerHaptic } = useHaptic();

  useEffect(() => {
    if (!animated) {
      setCurrentPercentage(percentage);
      return;
    }

    const timer = setTimeout(() => {
      const increment = percentage / 60; // 60 frames for smooth animation
      let current = 0;
      
      const animate = () => {
        current += increment;
        if (current >= percentage) {
          setCurrentPercentage(percentage);
          triggerHaptic('success');
        } else {
          setCurrentPercentage(current);
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }, delay);

    return () => clearTimeout(timer);
  }, [percentage, animated, duration, delay, triggerHaptic]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: animated ? 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            filter: `drop-shadow(0 0 8px ${color}40)`
          }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-white tabular-nums">
            {Math.round(currentPercentage)}%
          </span>
        )}
        {showLabel && label && (
          <span className="text-sm text-gray-400 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}

// Multi-Progress Ring Component
function MultiProgressRing({ data, size = 140, strokeWidth = 6 }) {
  const maxRadius = size / 2 - strokeWidth;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        {data.map((segment, index) => {
          const radius = maxRadius - (index * (strokeWidth + 4));
          const circumference = radius * 2 * Math.PI;
          const strokeDashoffset = circumference - (segment.percentage / 100) * circumference;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transform: `rotate(-90deg)`,
                transformOrigin: 'center',
                transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: `drop-shadow(0 0 6px ${segment.color}40)`
              }}
            />
          );
        })}
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-3xl font-bold text-white tabular-nums">
          {data[0].value}
        </div>
        <div className="text-sm text-gray-400">{data[0].label}</div>
      </div>
    </div>
  );
}

// ========================================
// PREMIUM ANIMATIONS
// ========================================

// Streak Flame Animation
function StreakFlame({ streak, size = 24, animated = true }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { triggerHaptic } = useHaptic();

  useEffect(() => {
    if (animated && streak > 0) {
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    }
  }, [streak, animated]);

  const handleClick = () => {
    setIsAnimating(!isAnimating);
    triggerHaptic('impact');
  };

  return (
    <button 
      onClick={handleClick}
      className="relative transition-transform duration-200 active:scale-95"
    >
      <Flame 
        size={size} 
        className={`text-orange-400 ${isAnimating ? 'animate-pulse' : ''}`}
        style={{
          filter: isAnimating ? 'drop-shadow(0 0 12px #f97316)' : 'none',
          transition: 'filter 0.3s ease'
        }}
      />
      {streak > 10 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
      )}
    </button>
  );
}

// Achievement Unlock Animation
function AchievementUnlock({ achievement, isVisible, onComplete }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { triggerHaptic } = useHaptic();

  useEffect(() => {
    if (isVisible) {
      triggerHaptic('success');
      setTimeout(() => setShowConfetti(true), 200);
      setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 3000);
    }
  }, [isVisible, triggerHaptic, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="relative">
        {/* Achievement Card */}
        <div className="card bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 p-6 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              {achievement.icon || <Trophy className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h3 className="headline-md text-white mb-1">Achievement Unlocked!</h3>
              <p className="text-white font-medium">{achievement.name}</p>
              <p className="text-gray-300 text-sm">{achievement.description}</p>
            </div>
          </div>
        </div>
        
        {/* Confetti Effect */}
        {showConfetti && <ConfettiEffect />}
      </div>
    </div>
  );
}

// Confetti Effect Component
function ConfettiEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
}

// Number Animation Component
function AnimatedNumber({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '',
  className = '',
  formatter = (val) => val.toLocaleString()
}) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { triggerHaptic } = useHaptic();

  useEffect(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      const startTime = Date.now();
      const startValue = currentValue;
      const endValue = value;
      const change = endValue - startValue;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const newValue = startValue + change * easeOutQuart;
        
        setCurrentValue(newValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCurrentValue(endValue);
          setIsAnimating(false);
          triggerHaptic('light');
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, duration, currentValue, isAnimating, triggerHaptic]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{formatter(Math.round(currentValue))}{suffix}
    </span>
  );
}

// ========================================
// MICRO-INTERACTIONS
// ========================================

// Interactive Card Component
function InteractiveCard({ 
  children, 
  onClick, 
  className = '',
  hoverEffect = 'lift',
  pressEffect = true 
}) {
  const [isPressed, setIsPressed] = useState(false);
  const { triggerHaptic } = useHaptic();

  const handleMouseDown = () => {
    if (pressEffect) {
      setIsPressed(true);
      triggerHaptic('selection');
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    triggerHaptic('impact');
    onClick?.();
  };

  const hoverEffects = {
    lift: 'hover:transform hover:-translate-y-2 hover:shadow-xl',
    glow: 'hover:shadow-lg hover:shadow-green-500/20',
    scale: 'hover:scale-105',
    border: 'hover:border-green-500/50'
  };

  return (
    <div
      className={`
        card cursor-pointer transition-all duration-200
        ${hoverEffects[hoverEffect] || ''}
        ${isPressed ? 'scale-95' : ''}
        ${className}
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

// Pulse Button Component
function PulseButton({ 
  children, 
  onClick, 
  className = '',
  pulseColor = 'var(--color-primary-500)',
  intensity = 'medium' 
}) {
  const intensities = {
    light: 'animate-pulse',
    medium: 'animate-pulse',
    strong: 'animate-bounce'
  };

  return (
    <button
      onClick={onClick}
      className={`
        btn btn-primary relative overflow-hidden
        ${intensities[intensity] || ''}
        ${className}
      `}
    >
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle, ${pulseColor}40 0%, transparent 70%)`,
          animation: 'pulse 2s infinite'
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// ========================================
// PREMIUM LOADING STATES
// ========================================

// Skeleton Loader Component
function SkeletonLoader({ 
  lines = 3, 
  className = '',
  height = 'h-4',
  rounded = 'rounded' 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`${height} ${rounded} bg-gray-800 animate-shimmer`}
          style={{
            backgroundImage: 'linear-gradient(90deg, #1a1d26 25%, #232835 50%, #1a1d26 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite'
          }}
        />
      ))}
    </div>
  );
}

// Premium Loading Spinner
function PremiumSpinner({ 
  size = 40, 
  color = 'var(--color-primary-500)',
  className = '' 
}) {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="rounded-full border-2 border-transparent border-t-current animate-spin"
        style={{
          width: size,
          height: size,
          borderTopColor: color,
          filter: `drop-shadow(0 0 8px ${color}40)`
        }}
      />
      <div 
        className="absolute inset-0 rounded-full border-2 border-transparent border-b-current animate-spin"
        style={{
          width: size,
          height: size,
          borderBottomColor: color,
          animationDirection: 'reverse',
          animationDuration: '1.5s',
          opacity: 0.3
        }}
      />
    </div>
  );
}

// ========================================
// MOTIVATIONAL ELEMENTS
// ========================================

// Motivational Quote Component
function MotivationalQuote({ quotes, interval = 10000 }) {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsChanging(true);
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
        setIsChanging(false);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [quotes, interval]);

  return (
    <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
      <div className={`transition-opacity duration-300 ${isChanging ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="headline-sm text-white">Daily Motivation</h3>
        </div>
        <blockquote className="text-white font-medium italic mb-3">
          "{currentQuote.text}"
        </blockquote>
        <p className="text-gray-400 text-sm">- {currentQuote.author}</p>
      </div>
    </div>
  );
}

// Streak Celebration Component
function StreakCelebration({ streak, previousStreak }) {
  const [showCelebration, setShowCelebration] = useState(false);
  const { triggerHaptic } = useHaptic();

  useEffect(() => {
    if (streak > previousStreak && streak % 7 === 0) {
      setShowCelebration(true);
      triggerHaptic('success');
    }
  }, [streak, previousStreak, triggerHaptic]);

  if (!showCelebration) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="card bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-6 animate-scale-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
            <Flame className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h3 className="headline-lg text-white mb-2">
            {streak} Day Streak! 
          </h3>
          <p className="text-gray-300 mb-4">
            {streak === 7 ? "One week strong!" : 
             streak === 14 ? "Two weeks of consistency!" :
             streak === 30 ? "A full month! You're unstoppable!" :
             `Keep the fire burning!`}
          </p>
          <div className="flex items-center justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <ConfettiEffect />
    </div>
  );
}

export {
  useHaptic,
  AnimatedProgressRing,
  MultiProgressRing,
  StreakFlame,
  AchievementUnlock,
  AnimatedNumber,
  InteractiveCard,
  PulseButton,
  SkeletonLoader,
  PremiumSpinner,
  MotivationalQuote,
  StreakCelebration
};
