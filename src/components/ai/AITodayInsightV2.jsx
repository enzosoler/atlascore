/**
 * Atlas Core AI Today Insight v2.0
 * Premium AI insights component with new design system
 * Built from scratch with the new design system
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Brain,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Zap,
  Trophy
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock AI insights data
const mockInsights = {
  daily: {
    title: "Today's Focus",
    insight: "Based on your recent workouts, your upper body strength is improving rapidly. Consider increasing weight on bench press by 5-10 lbs today.",
    type: 'recommendation',
    confidence: 0.85,
    actionItems: [
      "Increase bench press weight by 5-10 lbs",
      "Focus on form over speed",
      "Add 2 extra minutes of rest between sets"
    ],
    impact: 'high'
  },
  weekly: {
    title: "Weekly Pattern",
    insight: "You've been consistent with 4 workouts this week! Your protein intake has been excellent, but consider adding more vegetables to your meals.",
    type: 'achievement',
    confidence: 0.92,
    actionItems: [
      "Maintain current workout frequency",
      "Add 1-2 cups of vegetables to each meal",
      "Try a new vegetable recipe this weekend"
    ],
    impact: 'medium'
  },
  warning: {
    title: "Recovery Alert",
    insight: "Your sleep quality has declined 3 nights in a row. This may impact tomorrow's workout performance.",
    type: 'warning',
    confidence: 0.78,
    actionItems: [
      "Prioritize 8+ hours of sleep tonight",
      "Avoid screens 1 hour before bed",
      "Consider a light stretching routine before sleep"
    ],
    impact: 'high'
  }
};

// AI Insight Card Component
function AIInsightCard({ insight, onAction, onRefresh }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const getIcon = () => {
    switch (insight.type) {
      case 'recommendation': return <Lightbulb className="w-5 h-5" />;
      case 'achievement': return <Trophy className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch (insight.type) {
      case 'recommendation': return 'var(--color-primary-500)';
      case 'achievement': return 'var(--color-warning)';
      case 'warning': return 'var(--color-danger)';
      default: return 'var(--color-secondary-500)';
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case 'recommendation': return 'var(--color-primary-500)/10';
      case 'achievement': return 'var(--color-warning)/10';
      case 'warning': return 'var(--color-danger)/10';
      default: return 'var(--color-secondary-500)/10';
    }
  };

  const getBorderColor = () => {
    switch (insight.type) {
      case 'recommendation': return 'var(--color-primary-500)/30';
      case 'achievement': return 'var(--color-warning)/30';
      case 'warning': return 'var(--color-danger)/30';
      default: return 'var(--color-secondary-500)/30';
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onRefresh?.();
  };

  return (
    <div 
      className="card p-0 overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${getBgColor()} 0%, transparent 100%)`,
        borderColor: getBorderColor()
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: getBgColor(), color: getColor }}
            >
              {getIcon()}
            </div>
            <div>
              <h3 className="headline-sm text-white">{insight.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Brain className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400 text-xs">AI Insight</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-gray-400 text-xs">{Math.round(insight.confidence * 100)}% confidence</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <p className="text-gray-200 mb-4 leading-relaxed">{insight.insight}</p>
        
        {insight.actionItems && insight.actionItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-gray-400 text-sm font-medium">Recommended Actions:</p>
            <div className="space-y-2">
              {insight.actionItems.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onAction?.(action)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{action}</span>
                  <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400 text-xs capitalize">{insight.impact} impact</span>
          </div>
          <button className="text-green-400 text-sm hover:text-green-300 transition-colors">
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
}

// AI Insights List Component
function AIInsightsList({ insights, onAction, onRefresh }) {
  return (
    <div className="space-y-4">
      {Object.values(insights).map((insight, index) => (
        <AIInsightCard
          key={index}
          insight={insight}
          onAction={onAction}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

// AI Insights Summary Component
function AIInsightsSummary({ insights }) {
  const totalInsights = Object.keys(insights).length;
  const highImpactCount = Object.values(insights).filter(i => i.impact === 'high').length;
  const avgConfidence = Object.values(insights).reduce((sum, i) => sum + i.confidence, 0) / totalInsights;

  return (
    <div className="card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="headline-sm text-white">AI Insights Summary</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{totalInsights}</p>
          <p className="text-gray-400 text-xs">Total Insights</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-400">{highImpactCount}</p>
          <p className="text-gray-400 text-xs">High Impact</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{Math.round(avgConfidence * 100)}%</p>
          <p className="text-gray-400 text-xs">Avg Confidence</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-purple-500/30">
        <p className="text-gray-300 text-sm">
          Your AI coach has analyzed your recent activity and personalized recommendations for optimal results.
        </p>
      </div>
    </div>
  );
}

// Main AI Today Insight Component
function AITodayInsightV2() {
  const [insights, setInsights] = useState(mockInsights);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = (action) => {
    console.log('AI Action:', action);
    // Handle action implementation
  };

  const handleRefresh = () => {
    // Refresh insights logic
    console.log('Refreshing insights...');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-800 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-800 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-800 rounded animate-pulse w-32"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="headline-md text-white">AI Coach Insights</h2>
        </div>
        <button className="btn btn-ghost">
          <Sparkles className="w-4 h-4" />
          View All
        </button>
      </div>
      
      <AIInsightsSummary insights={insights} />
      <AIInsightsList insights={insights} onAction={handleAction} onRefresh={handleRefresh} />
    </div>
  );
}

export default AITodayInsightV2;
