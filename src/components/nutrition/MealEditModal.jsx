import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Edit2, Loader2, Camera, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { MEAL_TYPES } from '@/lib/atlas-theme';
import FoodSearch from './FoodSearch';
import FoodCameraScanner from './FoodCameraScanner';
import AIFoodInput from './AIFoodInput';

const MACRO_COLORS = { protein: '#4F8CFF', carbs: '#8B7CFF', fat: '#F5A83A' };

// Tabela de conversão de unidades comuns para gramas (aproximações padrão)
const UNIT_TO_GRAMS = {
  g: 1,
  ml: 1, // para líquidos, 1ml ≈ 1g (água/similar)
  unit: 60,      // unidade média (ex: 1 pão ≈ 60g, 1 banana ≈ 120g - usamos média)
  serving: 150,  // porção padrão ≈ 150g
  cup: 240,      // xícara ≈ 240g/ml
  tbsp: 15,      // colher de sopa ≈ 15g
  tsp: 5,        // colher de chá ≈ 5g
  slice: 25,     // fatia ≈ 25g
  piece: 50,     // peça ≈ 50g
};

// Converte quantidade de uma unidade para gramas
// Usa unit_weight_g específico do alimento se disponível, senão usa tabela padrão
const convertToGrams = (amount, unit, food = null) => {
  // Se o alimento tem unit_weight_g específico e a unidade é 'unit', 'slice', 'piece', etc.
  // usar o peso específico da IA
  const aiUnitWeight = food?.unit_weight_g;
  
  // Se tem dados da IA e a unidade é a mesma que a IA identificou
  if (aiUnitWeight && food?.unit_type === unit) {
    return amount * aiUnitWeight;
  }
  
  // Se tem dados da IA mas a unidade é genérica 'unit', usar o peso da IA
  if (aiUnitWeight && unit === 'unit') {
    return amount * aiUnitWeight;
  }
  
  // Fallback para tabela padrão
  const factor = UNIT_TO_GRAMS[unit] || 1;
  return amount * factor;
};

export default function MealEditModal({ open, onOpenChange, meal, date, onSuccess }) {
  const qc = useQueryClient();
  const [mealType, setMealType] = useState(meal?.meal_type || 'lunch');
  const [foods, setFoods] = useState(meal?.foods || []);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editUnit, setEditUnit] = useState('g');
  const [showCamera, setShowCamera] = useState(false);
  const [showAIInput, setShowAIInput] = useState(false);

  const totals = useMemo(() => {
    return foods.reduce(
      (a, f) => ({
        cal: a.cal + (f.kcal || 0),
        pro: a.pro + (f.protein || 0),
        carb: a.carb + (f.carbs || 0),
        fat: a.fat + (f.fat || 0),
        fib: a.fib + (f.fiber || 0),
      }),
      { cal: 0, pro: 0, carb: 0, fat: 0, fib: 0 }
    );
  }, [foods]);

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
    if (!meal?.id) {
      toast.error('No meal ID found');
      return;
    }
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
    
    // Converte tanto a quantidade antiga quanto a nova para gramas
    // Passando o objeto food para usar unit_weight_g quando disponível
    const oldGrams = convertToGrams(f.amount, f.unit || 'g', f);
    const newGrams = convertToGrams(newAmount, editUnit, f);
    
    // Calcula o ratio baseado na diferença de gramas
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

  const removeFood = (idx) => {
    setFoods(foods.filter((_, i) => i !== idx));
  };

  const handleFoodsDetected = (detectedFoods) => {
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

  const handleAIFoodsDetected = (detectedFoods) => {
    const formatted = detectedFoods.map(f => ({
      name: f.name,
      amount: f.amount || parseFloat(f.serving_description) || 100,
      unit: f.unit || 'g',
      kcal: f.calories || 0,
      protein: f.protein || 0,
      carbs: f.carbs || 0,
      fat: f.fat || 0,
      fiber: f.fiber || 0,
      _ai: true,
      // Dados de conversão da IA
      unit_weight_g: f.unit_weight_g || null,
      unit_type: f.unit_type || 'unit',
    }));
    setFoods(prev => [...prev, ...formatted]);
    setShowAIInput(false);
    toast.success(`${detectedFoods.length} food(s) added via AI`);
  };

  const duplicateMeal = () => {
    const newFoods = JSON.parse(JSON.stringify(foods));
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    Promise.resolve({}).then(() => {
      toast.success('Meal duplicated for tomorrow');
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-[hsl(var(--card))] border-border rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Edit Meal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meal type */}
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger className="h-10 rounded-lg text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MEAL_TYPES).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* AI Food Input — describe what you ate */}
          {showAIInput ? (
            <div className="p-3 rounded-xl border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)]">
              <AIFoodInput onFoodsDetected={handleAIFoodsDetected} />
            </div>
          ) : null}

          {/* Foods list with edit capability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="section-label">Foods</p>
              <div className="flex gap-2">
                {/* AI describe button */}
                <Button
                  variant={showAIInput ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowAIInput(!showAIInput)}
                  className={`h-8 gap-1.5 text-[12px] ${showAIInput ? 'bg-[hsl(var(--brand))] text-white' : ''}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Describe
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCamera(true)}
                  className="h-8 gap-1.5 text-[12px]"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Scan
                </Button>
                <FoodSearch
                  onSelectFood={(f) => setFoods([...foods, f])}
                  compact
                />
              </div>
            </div>

            {foods.length > 0 ? (
              <div className="space-y-1.5">
                {foods.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[hsl(var(--secondary))] text-[12px]"
                  >
                    {editingIdx === idx ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="flex-1 font-medium">{f.name}</span>
                        <Input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          step="0.1"
                          className="h-7 w-16 text-[11px] rounded-md"
                        />
                        <select
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          className="h-7 px-2 rounded-md border border-border bg-background text-[11px]"
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
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => handleSaveEdit(idx)}
                        >
                          ✓
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium">{f.name}</p>
                            {f._ai && (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))] font-medium">
                                AI
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            {f.amount}
                            {f.unit} · {Math.round(f.kcal)} kcal
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditFood(idx)}
                            className="text-muted-foreground hover:text-[hsl(var(--brand))] transition-colors"
                          >
                            <Edit2 className="w-3 h-3" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => removeFood(idx)}
                            className="text-muted-foreground hover:text-[hsl(var(--danger))] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-muted-foreground text-center py-3">
                No foods added
              </p>
            )}
          </div>

          {/* Totals */}
          {foods.length > 0 && (
            <div className="p-3 rounded-lg bg-[hsl(var(--secondary))] space-y-2">
              <div className="flex gap-4 text-[11px] text-muted-foreground">
                <span>
                  <b className="text-foreground">{Math.round(totals.cal)}</b> kcal
                </span>
                <span>
                  P <b className="text-foreground">{totals.pro.toFixed(0)}g</b>
                </span>
                <span>
                  C <b className="text-foreground">{totals.carb.toFixed(0)}g</b>
                </span>
                <span>
                  G <b className="text-foreground">{totals.fat.toFixed(0)}g</b>
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {foods.length === 0 && (
              <p className="text-[12px] text-[hsl(var(--err))] flex-1 py-2">
                Add at least one food to save the meal.
              </p>
            )}
            <Button
              onClick={saveMeal}
              disabled={updateMutation.isPending}
              className="btn btn-primary flex-1 h-11 rounded-xl"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
            {meal && (
              <Button
                onClick={duplicateMeal}
                variant="outline"
                className="h-11 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      <FoodCameraScanner
        open={showCamera}
        onOpenChange={setShowCamera}
        onFoodsDetected={handleFoodsDetected}
      />
    </Dialog>
  );
}
