import React, { useState } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Search, Sparkles, Camera } from 'lucide-react';
import FoodSearch from './FoodSearch';
import AIFoodInput from './AIFoodInput';

const TABS = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'ai', label: 'Describe', icon: Sparkles },
];

export default function FoodPickerSheet({ open, onOpenChange, onFoodAdded, onOpenCamera }) {
  const [tab, setTab] = useState('search');

  const handleAIFoods = (foods) => {
    foods.forEach(f => onFoodAdded({
      name: f.name,
      amount: f.amount || 100,
      unit: f.unit || 'g',
      kcal: f.calories || 0,
      protein: f.protein || 0,
      carbs: f.carbs || 0,
      fat: f.fat || 0,
      fiber: f.fiber || 0,
      _ai: true,
      unit_weight_g: f.unit_weight_g || null,
      unit_type: f.unit_type || 'unit',
    }));
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mobile-sheet">
        {/* Tab bar */}
        <div className="flex border-b border-border shrink-0 px-4 pt-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                tab === id
                  ? 'border-[hsl(var(--brand))] text-[hsl(var(--brand))]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
          {/* Camera — closes sheet, opens camera modal in parent */}
          <button
            onClick={() => { onOpenChange(false); onOpenCamera?.(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground -mb-px transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            Scan
          </button>
        </div>

        {/* Scrollable body */}
        <div className="mobile-sheet-body p-4">
          {tab === 'search' && (
            <FoodSearch
              onSelectFood={(f) => {
                onFoodAdded(f);
                onOpenChange(false);
              }}
            />
          )}
          {tab === 'ai' && (
            <AIFoodInput
              onFoodsDetected={handleAIFoods}
              onFallbackToSearch={() => setTab('search')}
            />
          )}
        </div>

        <div className="mobile-sheet-footer" />
      </DrawerContent>
    </Drawer>
  );
}
