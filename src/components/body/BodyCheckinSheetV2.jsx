/**
 * Atlas Core Body Check-in Sheet v2.0
 * Premium body measurement tracking with new design system
 * Built from scratch with the new design system
 */

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Ruler,
  Camera,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Target,
  Activity,
  Heart,
  Zap,
  X,
  Save,
  RefreshCw
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock body metrics data
const mockMetrics = {
  weight: { current: 181.2, previous: 182.4, unit: 'lbs', goal: 175 },
  bodyFat: { current: 16.1, previous: 16.8, unit: '%', goal: 14 },
  muscle: { current: 152.3, previous: 151.1, unit: 'lbs', goal: 155 },
  waist: { current: 32.5, previous: 33.0, unit: 'in', goal: 30 },
  chest: { current: 42.0, previous: 41.5, unit: 'in', goal: 43 },
  arms: { current: 15.5, previous: 15.2, unit: 'in', goal: 16 },
  thighs: { current: 24.0, previous: 24.3, unit: 'in', goal: 25 },
  calves: { current: 16.0, previous: 16.1, unit: 'in', goal: 17 }
};

// Metric Input Component
function MetricInput({ 
  label, 
  value, 
  previousValue, 
  unit, 
  goal, 
  onChange, 
  icon,
  color = 'var(--color-primary-500)'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  
  const change = value - previousValue;
  const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
  const progress = goal > 0 ? ((value - goal) / Math.abs(goal - previousValue)) * 100 : 0;
  
  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };
  
  const getChangeIcon = () => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <div className="w-4 h-4" />;
  };
  
  const getChangeColor = () => {
    if (Math.abs(changePercent) < 1) return 'text-gray-400';
    if (label.toLowerCase().includes('weight') || label.toLowerCase().includes('fat')) {
      return change < 0 ? 'text-green-400' : 'text-red-400';
    }
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {icon}
          </div>
          <div>
            <h4 className="headline-sm text-white">{label}</h4>
            <div className="flex items-center gap-2">
              {getChangeIcon()}
              <span className={`text-sm font-medium ${getChangeColor()}`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)} {unit} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  onClick={handleSave}
                  className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400"
                >
                  <CheckCircle className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Current</span>
          {isEditing ? (
            <input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-center font-bold"
              step="0.1"
            />
          ) : (
            <span className="text-2xl font-bold text-white">
              {value} {unit}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Previous</span>
          <span className="text-gray-300">{previousValue} {unit}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Goal</span>
          <span className="text-gray-300">{goal} {unit}</span>
        </div>
        
        <div className="pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Progress</span>
            <span className="text-gray-300 text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Stats Component
function QuickStats({ metrics }) {
  const totalMetrics = Object.keys(metrics).length;
  const improvingMetrics = Object.values(metrics).filter(m => m.current < m.previous && !m.unit.includes('in')).length + 
                           Object.values(metrics).filter(m => m.current > m.previous && m.unit.includes('in')).length;
  const onTrackMetrics = Object.values(metrics).filter(m => {
    if (m.unit === 'lbs' && (m.key === 'weight' || m.key === 'bodyFat')) {
      return m.current <= m.goal;
    }
    return m.current >= m.goal;
  }).length;

  return (
    <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-green-400" />
        <h3 className="headline-sm text-white">Check-in Summary</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{totalMetrics}</p>
          <p className="text-gray-400 text-xs">Total Metrics</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{improvingMetrics}</p>
          <p className="text-gray-400 text-xs">Improving</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">{onTrackMetrics}</p>
          <p className="text-gray-400 text-xs">On Track</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-green-500/30">
        <p className="text-gray-300 text-sm">
          Great progress! You're improving in {improvingMetrics} areas and {onTrackMetrics} metrics are on track with your goals.
        </p>
      </div>
    </div>
  );
}

// Photo Upload Component
function PhotoUploadStep() {
  const [photos, setPhotos] = useState([]);
  const poses = ['Front', 'Side', 'Back', 'Flex'];

  const handlePhotoUpload = (pose) => {
    // Simulate photo upload
    console.log(`Uploading ${pose} photo`);
    setPhotos(prev => [...prev, pose]);
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Camera className="w-5 h-5 text-blue-400" />
        <h3 className="headline-sm text-white">Progress Photos</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {poses.map((pose) => (
          <button
            key={pose}
            onClick={() => handlePhotoUpload(pose)}
            className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/50 hover:border-blue-500/50 transition-colors flex flex-col items-center justify-center gap-2"
          >
            <Camera className="w-8 h-8 text-gray-500" />
            <span className="text-gray-400 text-sm">{pose}</span>
            {photos.includes(pose) && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </button>
        ))}
      </div>
      
      <p className="text-gray-400 text-xs mt-3 text-center">
        Take photos in consistent lighting and poses for best comparison
      </p>
    </div>
  );
}

// Check-in Notes Component
function CheckinNotes({ notes, onChange }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Heart className="w-5 h-5 text-red-400" />
        <h3 className="headline-sm text-white">How are you feeling?</h3>
      </div>
      
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Note your energy levels, how clothes fit, any achievements or challenges..."
        className="w-full h-32 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
      />
      
      <div className="flex items-center gap-2 mt-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-gray-400 text-sm">
          Your notes help track progress beyond the numbers
        </span>
      </div>
    </div>
  );
}

// Main Body Check-in Sheet Component
function BodyCheckinSheetV2({ isOpen = true, onClose, onSave }) {
  const [metrics, setMetrics] = useState(mockMetrics);
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const steps = ['Metrics', 'Photos', 'Notes', 'Review'];

  const handleMetricChange = (metricKey, newValue) => {
    setMetrics(prev => ({
      ...prev,
      [metricKey]: { ...prev[metricKey], current: newValue }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    onSave?.({ metrics, notes });
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <QuickStats metrics={metrics} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricInput
                label="Weight"
                value={metrics.weight.current}
                previousValue={metrics.weight.previous}
                unit={metrics.weight.unit}
                goal={metrics.weight.goal}
                onChange={(value) => handleMetricChange('weight', value)}
                icon={<Scale className="w-5 h-5" />}
                color="var(--color-primary-500)"
              />
              <MetricInput
                label="Body Fat"
                value={metrics.bodyFat.current}
                previousValue={metrics.bodyFat.previous}
                unit={metrics.bodyFat.unit}
                goal={metrics.bodyFat.goal}
                onChange={(value) => handleMetricChange('bodyFat', value)}
                icon={<Activity className="w-5 h-5" />}
                color="var(--color-warning)"
              />
              <MetricInput
                label="Muscle Mass"
                value={metrics.muscle.current}
                previousValue={metrics.muscle.previous}
                unit={metrics.muscle.unit}
                goal={metrics.muscle.goal}
                onChange={(value) => handleMetricChange('muscle', value)}
                icon={<Target className="w-5 h-5" />}
                color="var(--color-secondary-500)"
              />
              <MetricInput
                label="Waist"
                value={metrics.waist.current}
                previousValue={metrics.waist.previous}
                unit={metrics.waist.unit}
                goal={metrics.waist.goal}
                onChange={(value) => handleMetricChange('waist', value)}
                icon={<Ruler className="w-5 h-5" />}
                color="var(--color-info)"
              />
            </div>
          </div>
        );
      
      case 1:
        return <PhotoUploadStep />;
      
      case 2:
        return <CheckinNotes notes={notes} onChange={setNotes} />;
      
      case 3:
        return (
          <div className="space-y-4">
            <QuickStats metrics={metrics} />
            <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="headline-md text-white mb-2">Ready to Save</h3>
                <p className="text-gray-300 mb-4">
                  Your check-in data looks great! You're making solid progress toward your goals.
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-base-0 rounded-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="card p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="headline-lg text-white mb-1">Body Check-in</h2>
              <p className="text-gray-400">Track your physical progress and measurements</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`text-sm ${
                  index <= currentStep ? 'text-white' : 'text-gray-400'
                }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStep()}
        </div>
        
        {/* Footer */}
        <div className="card p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="btn btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Check-in
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="btn btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BodyCheckinSheetV2;
