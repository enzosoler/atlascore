import React, { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Filter,
  HeartPulse,
  HelpCircle,
  Info,
  Loader2,
  Minus,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AppContainer,
  Card,
  Section,
} from '@/components/shared/AppContainer';
import {
  PageShell,
  PrimaryButton,
  SecondaryButton,
} from '@/components/shared/StablePage';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18nContext';
import * as labService from '@/services/labExamService';

// --- Example Data for Preview ---
const EXAMPLE_MARKERS = [
  { name: 'Testosterone', value: '650', unit: 'ng/dL', ref_range: '300-900', status: 'normal', trend: 'stable' },
  { name: 'LDL Cholesterol', value: '142', unit: 'mg/dL', ref_range: '<100', status: 'high', trend: 'up' },
  { name: 'Vitamin D', value: '18', unit: 'ng/mL', ref_range: '30-80', status: 'low', trend: 'down' },
  { name: 'HDL Cholesterol', value: '55', unit: 'mg/dL', ref_range: '>40', status: 'normal', trend: 'stable' },
  { name: 'Glucose', value: '94', unit: 'mg/dL', ref_range: '70-100', status: 'normal', trend: 'stable' },
];

const EXAMPLE_INSIGHTS = [
  { marker: 'LDL Cholesterol', level: 'high', message: 'Above optimal range. Consider reducing saturated fat intake and increasing fiber.', priority: 'high' },
  { marker: 'Vitamin D', level: 'low', message: 'Deficiency detected. Supplementation and increased sun exposure recommended.', priority: 'medium' },
];

const EXAMPLE_RECOMMENDATIONS = [
  { icon: HeartPulse, title: 'Increase fiber intake', description: 'Aim for 30g daily to help lower LDL cholesterol', impact: 'high' },
  { icon: Target, title: 'Reduce saturated fats', description: 'Limit red meat and full-fat dairy products', impact: 'medium' },
  { icon: Zap, title: 'Vitamin D3 supplement', description: '2000-4000 IU daily with fatty meal', impact: 'high' },
  { icon: Activity, title: 'Recheck in 8 weeks', description: 'Schedule follow-up to monitor improvements', impact: 'low' },
];

// --- Components ---

const StatusBadge = ({ status, size = 'md' }) => {
  const configs = {
    normal: { 
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', 
      icon: CheckCircle2,
      label: 'Normal' 
    },
    low: { 
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', 
      icon: ArrowDownRight,
      label: 'Low' 
    },
    high: { 
      color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', 
      icon: ArrowUpRight,
      label: 'High' 
    },
    critical: { 
      color: 'bg-red-500/15 text-red-600 border-red-500/30', 
      icon: AlertTriangle,
      label: 'Critical' 
    },
  };

  const config = configs[status] || configs.normal;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <Badge variant="outline" className={cn('font-medium capitalize flex items-center gap-1', config.color, sizeClasses)}>
      <Icon size={size === 'sm' ? 10 : 12} />
      {config.label}
    </Badge>
  );
};

const MarkerTrend = ({ trend }) => {
  const configs = {
    up: { icon: TrendingUp, color: 'text-rose-500', label: 'Rising' },
    down: { icon: TrendingDown, color: 'text-amber-500', label: 'Falling' },
    stable: { icon: Minus, color: 'text-emerald-500', label: 'Stable' },
  };
  
  const config = configs[trend] || configs.stable;
  const Icon = config.icon;
  
  return (
    <div className={cn('flex items-center gap-1 text-xs', config.color)}>
      <Icon size={12} />
      <span className="capitalize">{config.label}</span>
    </div>
  );
};

const PriorityIndicator = ({ priority }) => {
  const colors = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className={cn('w-2 h-2 rounded-full', colors[priority])} />
      <span className="text-xs text-[hsl(var(--fg-3))] capitalize">{priority} priority</span>
    </div>
  );
};

const HeroSection = ({ onUploadClick, hasExams }) => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--fill))] border border-[hsl(var(--separator))] p-8 md:p-10">
    {/* Background decoration */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
    
    <div className="relative">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
        <Sparkles size={12} />
        <span>AI-Powered Health Intelligence</span>
      </div>
      
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--fg))] mb-3">
        Understand your health markers
      </h1>
      
      {/* Subtitle */}
      <p className="text-lg text-[hsl(var(--fg-2))] max-w-2xl mb-8">
        Upload your lab results and get clear insights on what matters. 
        We analyze your markers and show you exactly what to improve.
      </p>
      
      {/* What you'll get */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Activity, label: 'Abnormal markers', desc: 'Instantly highlighted' },
          { icon: TrendingUp, label: 'Trends over time', desc: 'Track progress' },
          { icon: Target, label: 'What to improve', desc: 'Actionable guidance' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--fill))] flex items-center justify-center flex-shrink-0">
              <item.icon size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(var(--fg))]">{item.label}</p>
              <p className="text-xs text-[hsl(var(--fg-2))]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* CTA */}
      <div className="flex flex-wrap items-center gap-4">
        <PrimaryButton onClick={onUploadClick} className="h-12 px-6 text-base">
          <Upload size={18} className="mr-2" />
          Upload your lab results
        </PrimaryButton>
        <p className="text-sm text-[hsl(var(--fg-2))]">
          PDF or image · Auto-extracted · Analyzed in seconds
        </p>
      </div>
    </div>
  </div>
);

const UploadCTA = ({ onUploadClick }) => (
  <div className="relative group">
    <button
      onClick={onUploadClick}
      className="w-full relative overflow-hidden rounded-2xl border-2 border-dashed border-[hsl(var(--separator))] hover:border-primary/30 hover:bg-primary/5 transition-all p-8 text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Brain size={28} className="text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">
          Upload your lab results
        </h3>
        <p className="text-sm text-[hsl(var(--fg-2))] mb-4">
          PDF or image · We automatically extract and analyze your markers
        </p>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--fill))] text-sm font-medium text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <Upload size={16} />
          Select file
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  </div>
);

const ExampleAnalysisPanel = ({ onUploadClick }) => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-[hsl(var(--fg))]">Example Analysis</h3>
        <p className="text-sm text-[hsl(var(--fg-2))]">See what you get when you upload</p>
      </div>
      <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
        Preview
      </Badge>
    </div>
    
    {/* Markers Preview */}
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-[hsl(var(--fill))] to-transparent px-4 py-3 border-b border-[hsl(var(--separator))]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[hsl(var(--fg))]">Blood Panel · Jan 15, 2025</span>
          <span className="text-xs text-[hsl(var(--fg-2))]">5 markers analyzed</span>
        </div>
      </div>
      
      <div className="divide-y divide-[hsl(var(--separator))]">
        {EXAMPLE_MARKERS.map((marker, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between hover:bg-[hsl(var(--fill))] transition-colors">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-2 h-2 rounded-full',
                marker.status === 'normal' ? 'bg-emerald-500' : 
                marker.status === 'high' ? 'bg-rose-500' : 'bg-amber-500'
              )} />
              <div>
                <p className="text-sm font-medium text-[hsl(var(--fg))]">{marker.name}</p>
                <p className="text-xs text-[hsl(var(--fg-2))]">Ref: {marker.ref_range}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[hsl(var(--fg))]">
                {marker.value} <span className="text-xs font-normal text-[hsl(var(--fg-2))]">{marker.unit}</span>
              </p>
              <StatusBadge status={marker.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </Card>
    
    {/* Insights Preview */}
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[hsl(var(--fg))] flex items-center gap-2">
        <Sparkles size={14} className="text-primary" />
        AI Insights
      </h4>
      
      {EXAMPLE_INSIGHTS.map((insight, idx) => (
        <div key={idx} className="p-4 rounded-xl bg-[hsl(var(--fill))] border border-[hsl(var(--separator))]">
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              insight.level === 'high' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
            )}>
              <AlertTriangle size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-[hsl(var(--fg))]">{insight.marker}</span>
                <PriorityIndicator priority={insight.priority} />
              </div>
              <p className="text-sm text-[hsl(var(--fg-2))]">{insight.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Recommendations Preview */}
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[hsl(var(--fg))] flex items-center gap-2">
        <Target size={14} className="text-primary" />
        Recommendations
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXAMPLE_RECOMMENDATIONS.map((rec, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--separator))] hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <rec.icon size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[hsl(var(--fg))]">{rec.title}</p>
                <p className="text-xs text-[hsl(var(--fg-2))] mt-0.5">{rec.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Upload CTA at bottom */}
    <div className="pt-4 border-t border-[hsl(var(--separator))]">
      <button
        onClick={onUploadClick}
        className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Upload size={18} />
        Upload your results to see yours
      </button>
    </div>
  </div>
);

const ExamRow = ({ exam, onClick, onDelete, isSelected }) => {
  const abnormalCount = exam.markers?.filter(m => m.status !== 'normal').length || 0;
  const hasAbnormal = abnormalCount > 0;

  return (
    <div
      onClick={() => onClick(exam)}
      className={cn(
        'group flex items-center justify-between p-4 cursor-pointer border-b border-[hsl(var(--separator))] last:border-0 transition-all',
        isSelected 
          ? 'bg-primary/5 border-l-4 border-l-primary' 
          : 'hover:bg-[hsl(var(--fill))] border-l-4 border-l-transparent'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          hasAbnormal ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
        )}>
          <FileText size={18} />
        </div>
        <div>
          <h4 className="font-medium text-[hsl(var(--fg))]">{exam.panel_name}</h4>
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-[hsl(var(--fg-3))]" />
            <p className="text-xs text-[hsl(var(--fg-2))]">
              {new Date(exam.exam_date).toLocaleDateString(undefined, { 
                year: 'numeric', month: 'short', day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-[hsl(var(--fg))]">{exam.markers?.length || 0} markers</p>
          {hasAbnormal ? (
            <p className="text-xs text-rose-600 font-medium">{abnormalCount} need attention</p>
          ) : (
            <p className="text-xs text-emerald-600">All normal</p>
          )}
        </div>
        <ChevronRight size={16} className={cn(
          'transition-colors',
          isSelected ? 'text-primary' : 'text-[hsl(var(--fg-3))]'
        )} />
      </div>
    </div>
  );
};

const AnalysisPanel = ({ exam, onClose, onAskAI }) => {
  const abnormalMarkers = exam.markers?.filter(m => m.status !== 'normal') || [];
  const normalMarkers = exam.markers?.filter(m => m.status === 'normal') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[hsl(var(--fg))]">{exam.panel_name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-[hsl(var(--fg-2))]" />
            <span className="text-sm text-[hsl(var(--fg-2))]">
              {new Date(exam.exam_date).toLocaleDateString(undefined, { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg transition-colors"
        >
          <X size={18} className="text-[hsl(var(--fg-2))]" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-[hsl(var(--fg))]">{exam.markers?.length || 0}</p>
          <p className="text-xs text-[hsl(var(--fg-2))]">Total Markers</p>
        </Card>
        <Card className={cn(
          'p-3 text-center',
          abnormalMarkers.length > 0 && 'bg-rose-500/5 border-rose-500/20'
        )}>
          <p className={cn(
            'text-2xl font-bold',
            abnormalMarkers.length > 0 ? 'text-rose-600' : 'text-emerald-600'
          )}>
            {abnormalMarkers.length}
          </p>
          <p className="text-xs text-[hsl(var(--fg-2))]">Need Attention</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{normalMarkers.length}</p>
          <p className="text-xs text-[hsl(var(--fg-2))]">Normal</p>
        </Card>
      </div>

      {/* Abnormal Markers */}
      {abnormalMarkers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[hsl(var(--fg))] flex items-center gap-2">
            <AlertTriangle size={14} className="text-rose-500" />
            Markers Needing Attention
          </h3>
          
          <div className="space-y-2">
            {abnormalMarkers.map((marker, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-[hsl(var(--fg))]">{marker.name}</p>
                    <p className="text-xs text-[hsl(var(--fg-2))]">Ref range: {marker.ref_range || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-lg font-bold',
                      marker.status === 'high' ? 'text-rose-600' : 'text-amber-600'
                    )}>
                      {marker.value}
                    </p>
                    <StatusBadge status={marker.status} />
                  </div>
                </div>
                
                {/* AI Interpretation */}
                <div className="pt-3 border-t border-rose-500/10">
                  <p className="text-sm text-[hsl(var(--fg-2))]">
                    {marker.status === 'high' 
                      ? `Your ${marker.name} is above the optimal range. This may indicate need for lifestyle adjustments.`
                      : `Your ${marker.name} is below the optimal range. Consider supplementation or dietary changes.`
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Markers */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[hsl(var(--fg))]">All Markers</h3>
        
        <div className="space-y-2">
          {exam.markers?.map((marker, idx) => (
            <div 
              key={idx} 
              className={cn(
                'p-3 rounded-xl border flex items-center justify-between',
                marker.status === 'normal' 
                  ? 'bg-[hsl(var(--fill))] border-[hsl(var(--separator))]' 
                  : 'bg-rose-500/5 border-rose-500/20'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  marker.status === 'normal' ? 'bg-emerald-500' : 
                  marker.status === 'high' ? 'bg-rose-500' : 'bg-amber-500'
                )} />
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--fg))]">{marker.name}</p>
                  <p className="text-xs text-[hsl(var(--fg-2))]">{marker.ref_range || 'No ref range'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[hsl(var(--fg))]">
                  {marker.value} <span className="text-xs font-normal text-[hsl(var(--fg-2))]">{marker.unit}</span>
                </p>
                <StatusBadge status={marker.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ask AI CTA */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-[hsl(var(--fg))]">Ask about this result</h4>
            <p className="text-xs text-[hsl(var(--fg-2))] mt-0.5 mb-3">
              Get personalized insights and recommendations from AI
            </p>
            <button
              onClick={() => onAskAI?.(exam)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Brain size={16} />
              Ask AI
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      {exam.notes && (
        <div className="p-4 rounded-xl bg-[hsl(var(--fill))] border border-[hsl(var(--separator))]">
          <h4 className="text-sm font-medium text-[hsl(var(--fg))] mb-2">Notes</h4>
          <p className="text-sm text-[hsl(var(--fg-2))] italic">"{exam.notes}"</p>
        </div>
      )}
    </motion.div>
  );
};

const UploadDialog = ({ isOpen, onClose, onUpload, isExtracting, error }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] border-[hsl(var(--border)/0.82)] rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-[17px] font-bold text-[hsl(var(--fg))] flex items-center gap-2">
          <Sparkles size={18} className="text-[hsl(var(--brand))]" />
          AI Lab Analysis
        </DialogTitle>
        <DialogDescription className="text-[13px] text-[hsl(var(--fg-2))]">
          Upload your lab results for instant AI-powered insights
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        {/* Upload Area */}
        <div className="relative">
          <input
            type="file"
            onChange={onUpload}
            accept="application/pdf,image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isExtracting}
          />
          <div className={cn(
            'border border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all',
            isExtracting
              ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.04)]'
              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.04)]'
          )}>
            {isExtracting ? (
              <>
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--brand)/0.12)] flex items-center justify-center mb-3">
                  <Loader2 className="w-5 h-5 text-[hsl(var(--brand))] animate-spin" />
                </div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Analyzing...</p>
                <p className="text-[12px] text-[hsl(var(--fg-2))] mt-1">Extracting markers with AI</p>
              </>
            ) : (
              <>
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--brand)/0.08)] flex items-center justify-center mb-3">
                  <Upload size={20} className="text-[hsl(var(--brand))]" />
                </div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Upload lab results</p>
                <p className="text-[12px] text-[hsl(var(--fg-2))] mt-1">PDF, JPG, or PNG up to 10MB</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-[hsl(var(--err)/0.08)] border border-[hsl(var(--err)/0.2)] p-3 text-[12px] text-[hsl(var(--err))]">
            {error}
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[hsl(var(--border)/0.5)]" />
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-[hsl(var(--card))] px-3 text-[hsl(var(--fg-3))]">or</span>
          </div>
        </div>

        <SecondaryButton className="w-full" disabled={isExtracting} onClick={() => { setIsUploadDialogOpen(false); toast.info('Manual marker entry coming soon.'); }}>
          <Plus size={16} className="mr-2" />
          Enter markers manually
        </SecondaryButton>
      </div>
    </DialogContent>
  </Dialog>
);

// --- Main Page ---

export default function LabExams() {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [selectedExam, setSelectedExam] = useState(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Queries
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['lab_exams', user?.id],
    queryFn: () => labService.listExams(user?.id),
    enabled: !!user?.id,
  });

  const hasExams = exams.length > 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => labService.createExam(user?.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['lab_exams']);
      setIsUploadDialogOpen(false);
      toast.success('Lab results analyzed and saved!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => labService.deleteExam(user?.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lab_exams']);
      setSelectedExam(null);
      toast.success('Exam deleted');
    },
  });

  // Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setUploadError(null);
    try {
      const data = await labService.extractExamFromFile(file);
      await createMutation.mutateAsync({
        panel_name: data.panel_name || file.name.split('.')[0],
        exam_date: data.exam_date || new Date().toISOString().split('T')[0],
        markers: data.markers || [],
      });
    } catch (err) {
      const msg = err?.message || 'Failed to extract data from file';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
  };

  const handleAskAI = (exam) => {
    toast.info('AI Q&A feature coming soon!');
  };

  return (
    <PageShell title={t('pages.lab_exams.title')}>
      <AppContainer>
        <div className="space-y-8">
          {/* Hero Section */}
          <HeroSection 
            onUploadClick={() => setIsUploadDialogOpen(true)} 
            hasExams={hasExams} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Upload + Exam List */}
            <div className="lg:col-span-5 space-y-6">
              {/* Upload CTA (when no exams) */}
              {!hasExams && !isLoading && (
                <UploadCTA onUploadClick={() => setIsUploadDialogOpen(true)} />
              )}

              {/* Exam List */}
              <Section title={hasExams ? 'Your Lab History' : ''}>
                <Card className="overflow-hidden">
                  {isLoading ? (
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : hasExams ? (
                    <div className="divide-y divide-[hsl(var(--separator))]">
                      {exams.map(exam => (
                        <ExamRow
                          key={exam.id}
                          exam={exam}
                          onClick={handleExamClick}
                          onDelete={(id) => {
                            if (confirm('Delete this exam?')) {
                              deleteMutation.mutate(id);
                            }
                          }}
                          isSelected={selectedExam?.id === exam.id}
                        />
                      ))}
                    </div>
                  ) : null}
                  
                  {/* Add new button at bottom of list */}
                  {hasExams && (
                    <div className="p-4 border-t border-[hsl(var(--separator))]">
                      <button
                        onClick={() => setIsUploadDialogOpen(true)}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-[hsl(var(--separator))] hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium text-[hsl(var(--fg-2))] hover:text-primary"
                      >
                        <Plus size={16} />
                        Add new lab results
                      </button>
                    </div>
                  )}
                </Card>
              </Section>
            </div>

            {/* Right Column: Analysis Panel or Example */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {selectedExam ? (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AnalysisPanel 
                      exam={selectedExam} 
                      onClose={() => setSelectedExam(null)}
                      onAskAI={handleAskAI}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="example"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ExampleAnalysisPanel 
                      onUploadClick={() => setIsUploadDialogOpen(true)} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </AppContainer>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => !isExtracting && setIsUploadDialogOpen(false)}
        onUpload={handleFileUpload}
        isExtracting={isExtracting}
        error={uploadError}
      />
    </PageShell>
  );
}

