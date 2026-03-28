import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Edit2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { MEAL_TYPES } from '@/lib/atlas-theme';
import FoodPickerSheet from './FoodPickerSheet';
import FoodCameraScanner from './FoodCameraScanner';

// Unit → grams conversion table (standard approximations)
const UNIT_TO_GRAMS = {
  g: 1,
  ml: 1,
  unit: 60,
  serving: 150,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  slice: 25,
  piece: 50,
};

const convertToGrams = (amount, unit, food = null) => {
  const aiUnitWeight = food?.unit_weight_g;
  if (aiUnitWeight && food?.unit_type === unit) return amount * aiUnitWeight;
  if (aiUnitWeight && unit === 'unit') return amount * aiUnitWeight;
  return amount * (UNIT_TO_GRAMS[unit] || 1);
};

export default function MealEditModal({ open, onOpenChange, meal, date, onSuccess }) {
  const qc = useQueryClient();
  const [mealType, setMealType] = useState(meal?.meal_type || 'lunch');
  const [foods, setFoods] = useState(meal?.foods || []);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editUnit, setEditUnit] = useState('g');
  const [showPicker, setShowPicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const totals = useMemo(() => foods.reduce(
    (a, f) => ({
      cal: a.cal + (f.kcal || 0),
      pro: a.pro + (f.protein || 0),
      carb: a.carb + (f.carbs || 0),
      fat: a.fat + (f.fat || 0),
      fib: a.fib + (f.fiber || 0),
    }),
    { cal: 0, pro: 0, carb: 0, fat: 0, fib: 0 }
  ), [foods]);

  const updateMutation = useMutation({
    mutationFn: async (data) => ({}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meals', date] });
      onOpenChange(false);
      toast.success('Meal updated');
      onSuccess?.();
    },
    onError: () => toast.error('Error saving meal'),
  });

  const saveMeal = () => {
    if (!foods.length) return;
    if (!meal?.id) { toast.error('No meal ID found'); return; }
    updateMutation.mutate({
      meal_type: mealType,
      foods,
      total_calories: Math.round(totals.cal),
      total_protein: Math.round(totals.pro * 10) / 10,
      total_carbs: Math.round(totals.carb * 10) / 10,
      total_fat: Math.round(totals.fat * 10) / 10,
      total_fiber: Math.round(totals.fib * 10) / 10,
    });
  };

  const handleEditFood = (idx) => {
    setEditingIdx(idx);
    setEditAmount(foods[idx].amount.toString());
    setEditUnit(foods[idx].unit || 'g');
  };

  const handleSaveEdit = (idx) => {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) return;
    const f = foods[idx];
    const oldGrams = convertToGrams(f.amount, f.unit || 'g', f);
    const newGrams = convertToGrams(newAmount, editUnit, f);
    const ratio = newGrams / oldGrams;
    const updated = [...foods];
    updated[idx] = {
      ...f,
      amount: newAmount,
      unit: editUnit,
      kcal: Math.round(f.kcal * ratio),
      protein: Math.round(f.protein * ratio * 10) / 10,
      carbs: Math.round(f.carbs * ratio * 10) / 10,
      fat: Math.round(f.fat * ratio * 10) / 10,
      fiber: Math.round((f.fiber || 0) * ratio * 10) / 10,
    };
    setFoods(updated);
    setEditingIdx(null);
  };

  const handleAddFood = (food) => {
    setFoods(prev => [...prev, food]);
  };

  const handleCameraFoods = (detectedFoods) => {
    const formatted = detectedFoods.map(f => ({
      name: f.name,
      amount: parseFloat(f.serving_description) || 100,
      unit: 'g',
      kcal: f.calories || 0,
      protein: f.protein || 0,
      carbs: f.carbs || 0,
      fat: f.fat || 0,
      fiber: f.fiber || 0,
    }));
    setFoods(prev => [...prev, ...formatted]);
    toast.success(`${detectedFoods.length} food(s) added from photo`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[hsl(var(--card))] border-border rounded-2xl max-h-[90dvh]">
          {/* Fixed header */}
          <DialogHeader className="shrink-0 px-1 pt-1">
            <DialogTitle className="text-[15px]">Edit Meal</DialogTitle>
          </DialogHeader>

          {/* Scrollable content */}
          <div className="safe-scroll flex-1 min-h-0 space-y-3 px-1 pb-2">
            {/* Meal type selector */}
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="h-10 rounded-lg text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEAL_TYPES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Macro summary */}
            {foods.length > 0 && (
              <div className="flex gap-4 px-1 text-[11px] text-muted-foreground">
                <span><b className="text-foreground">{Math.round(totals.cal)}</b> kcal</span>
                <span>P <b className="text-foreground">{totals.pro.toFixed(0)}g</b></span>
                <span>C <b className="text-foreground">{totals.carb.toFixed(0)}g</b></span>
                <span>G <b className="text-foreground">{totals.fat.toFixed(0)}g</b></span>
              </div>
            )}

            {/* Food rows */}
            <div className="space-y-1.5">
              {foods.length === 0 && (
                <p className="text-[12px] text-muted-foreground text-center py-6">
                  No foods added yet
                </p>
              )}

              {foods.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-3 rounded-xl bg-[hsl(var(--secondary))] text-[13px]"
                >
                  {editingIdx === idx ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="flex-1 font-medium truncate">{f.name}</span>
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        step="0.1"
                        className="h-8 w-16 text-[12px] rounded-lg"
                      />
                      <select
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="h-8 px-2 rounded-lg border border-border bg-background text-[12px]"
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="unit">unidade</option>
                        <option value="serving">porção</option>
                        <option value="cup">xícara</option>
                        <option value="tbsp">colher sopa</option>
                        <option value="tsp">colher chá</option>
                        <option value="slice">fatia</option>
                        <option value="piece">peça</option>
                      </select>
                      <button
                        onClick={() => handleSaveEdit(idx)}
                        className="w-8 h-8 rounded-lg bg-[hsl(var(--brand))] text-white flex items-center justify-center text-[14px] shrink-0"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium truncate">{f.name}</p>
                          {f._ai && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))] font-medium shrink-0">
                              AI
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground">
                          {f.amount}{f.unit} · {Math.round(f.kcal)} kcal
                        </p>
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <button
                          onClick={() => handleEditFood(idx)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.08)] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setFoods(foods.filter((_, i) => i !== idx))}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.08)] transition-colors"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Persistent + Add food row */}
              <button
                onClick={() => setShowPicker(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[hsl(var(--border))] text-[13px] text-muted-foreground hover:border-[hsl(var(--brand)/0.5)] hover:text-[hsl(var(--brand))] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add food
              </button>
            </div>
          </div>

          {/* Sticky footer — always visible */}
          <div
            className="shrink-0 pt-3 border-t border-[hsl(var(--border)/0.5)]"
            style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
          >
            {foods.length === 0 && (
              <p className="text-[12px] text-[hsl(var(--err))] pb-2">
                Add at least one food to save.
              </p>
            )}
            <Button
              onClick={saveMeal}
              disabled={updateMutation.isPending || foods.length === 0}
              className="btn btn-primary w-full h-11 rounded-xl"
            >
              {updateMutation.isPending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <FoodPickerSheet
        open={showPicker}
        onOpenChange={setShowPicker}
        onFoodAdded={handleAddFood}
        onOpenCamera={() => setShowCamera(true)}
      />

      <FoodCameraScanner
        open={showCamera}
        onOpenChange={setShowCamera}
        onFoodsDetected={handleCameraFoods}
      />
    </>
  );
}
