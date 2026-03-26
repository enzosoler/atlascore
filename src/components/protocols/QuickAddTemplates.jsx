import React, { useState } from 'react';
import { Zap, Dumbbell, Flame, HeartPulse, Sparkles, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_TEMPLATES = [
  {
    id: 'trt',
    name: 'TRT',
    icon: HeartPulse,
    description: 'Testosterone replacement therapy',
    color: 'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))] border-[hsl(var(--brand)/0.18)]',
    items: [
      { substance_name: 'Testosterone', category: 'hormone', dose: '100', unit: 'mg', frequency: '2x/week', schedule: 'Morning' },
    ],
  },
  {
    id: 'fat-loss',
    name: 'Fat Loss',
    icon: Flame,
    description: 'Cutting stack essentials',
    color: 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))] border-[hsl(var(--warn)/0.2)]',
    items: [
      { substance_name: 'Caffeine', category: 'supplement', dose: '200', unit: 'mg', frequency: 'Pre-workout', schedule: 'Morning' },
      { substance_name: 'Green Tea Extract', category: 'supplement', dose: '500', unit: 'mg', frequency: 'Daily', schedule: 'With meals' },
    ],
  },
  {
    id: 'muscle-gain',
    name: 'Muscle Gain',
    icon: Dumbbell,
    description: 'Bulking support stack',
    color: 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))] border-[hsl(var(--ok)/0.18)]',
    items: [
      { substance_name: 'Creatine', category: 'supplement', dose: '5', unit: 'g', frequency: 'Daily', schedule: 'Any time' },
      { substance_name: 'Whey Protein', category: 'supplement', dose: '25', unit: 'g', frequency: 'Post-workout', schedule: 'After training' },
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery',
    icon: Zap,
    description: 'Sleep and recovery aid',
    color: 'bg-[hsl(var(--accent-secondary)/0.12)] text-[hsl(var(--accent-secondary))] border-[hsl(var(--accent-secondary)/0.18)]',
    items: [
      { substance_name: 'Magnesium', category: 'supplement', dose: '400', unit: 'mg', frequency: 'Daily', schedule: 'Before bed' },
      { substance_name: 'Melatonin', category: 'supplement', dose: '3', unit: 'mg', frequency: 'Daily', schedule: 'Before bed' },
    ],
  },
];

export default function QuickAddTemplates({ onSelect, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelect?.(selectedTemplate);
    }
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (aiInput.trim()) {
      onSelect?.({ type: 'ai', prompt: aiInput.trim() });
    }
  };

  if (isAiMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[hsl(var(--fg))]">What are you taking?</h3>
          <button
            onClick={() => setIsAiMode(false)}
            className="flex items-center gap-1 text-[13px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))]"
          >
            <X className="h-4 w-4" strokeWidth={2} />
            Back
          </button>
        </div>
        
        <form onSubmit={handleAiSubmit} className="space-y-3">
          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="e.g., testosterone 100mg twice a week, creatine 5g daily..."
            className="min-h-[100px] w-full resize-none rounded-[16px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] p-4 text-[14px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:border-[hsl(var(--brand)/0.5)] focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsAiMode(false)}
              className="flex-1 rounded-full border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] px-4 py-2.5 text-[14px] font-medium text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--fill)/0.72)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!aiInput.trim()}
              className="flex-1 rounded-full bg-[hsl(var(--brand))] px-4 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[hsl(var(--brand)/0.9)] disabled:opacity-50"
            >
              <Sparkles className="mr-1.5 inline h-4 w-4" strokeWidth={2} />
              Generate
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI-first input */}
      <button
        onClick={() => setIsAiMode(true)}
        className="flex w-full items-center gap-3 rounded-[20px] border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.06)] p-4 text-left transition-all hover:bg-[hsl(var(--brand)/0.1)]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">Describe what you take</p>
          <p className="text-[13px] text-[hsl(var(--fg-2))]">AI will structure it automatically</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2} />
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[hsl(var(--border)/0.5)]" />
        <span className="text-[12px] font-medium uppercase tracking-wide text-[hsl(var(--fg-3))]">
          Or start with a template
        </span>
        <div className="h-px flex-1 bg-[hsl(var(--border)/0.5)]" />
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-3">
        {QUICK_TEMPLATES.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate?.id === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={cn(
                'rounded-[18px] border p-4 text-left transition-all',
                isSelected
                  ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.08)] ring-2 ring-[hsl(var(--brand)/0.2)]'
                  : 'border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] hover:border-[hsl(var(--border)/0.92)] hover:bg-[hsl(var(--fill)/0.4)]'
              )}
            >
              <div className={cn(
                'mb-3 flex h-10 w-10 items-center justify-center rounded-xl border',
                template.color
              )}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">{template.name}</p>
              <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-3))]">{template.description}</p>
            </button>
          );
        })}
      </div>

      {/* Selected template preview */}
      {selectedTemplate && (
        <div className="rounded-[16px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.4)] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-3))]">
            Includes {selectedTemplate.items.length} item{selectedTemplate.items.length !== 1 ? 's' : ''}
          </p>
          <ul className="mt-2 space-y-1">
            {selectedTemplate.items.map((item, i) => (
              <li key={i} className="text-[13px] text-[hsl(var(--fg-2))]">
                • {item.substance_name} {item.dose}{item.unit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-full border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] px-4 py-2.5 text-[14px] font-medium text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--fill)/0.72)]"
        >
          Manual entry
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedTemplate}
          className="flex-1 rounded-full bg-[hsl(var(--brand))] px-4 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[hsl(var(--brand)/0.9)] disabled:opacity-50"
        >
          Use template
        </button>
      </div>
    </div>
  );
}
