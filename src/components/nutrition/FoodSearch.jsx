import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchTaco } from '@/services/tacoService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, Plus, Minus, Check, UtensilsCrossed } from 'lucide-react';
import { DataState } from '@/components/shared/DataState';
import { toast } from 'sonner';

const DEBOUNCE_MS = 300;
const MIN_SEARCH_CHARS = 2;

export default function FoodSearch({ onSelectFood, compact = false }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('g');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Local cache
  const [searchCache, setSearchCache] = useState({});

  const { data: allFoods = [] } = useQuery({
    queryKey: ['food-master'],
    queryFn: async () => [],
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['food-logs'],
    queryFn: async () => [],
    staleTime: 10 * 60 * 1000,
  });

  // Filter and rank results from FoodMaster + TACO
  const results = useMemo(() => {
    if (!debouncedSearch) return [];

    if (searchCache[debouncedSearch]) {
      return searchCache[debouncedSearch];
    }

    const q = debouncedSearch.toLowerCase();

    // Search FoodMaster
    const foodMasterResults = allFoods
      .filter(
        (f) =>
          f.canonical_name?.toLowerCase().includes(q) ||
          f.aliases?.some((a) => a.toLowerCase().includes(q))
      )
      .map((f) => ({ ...f, _source: 'foodmaster' }));

    // Search TACO (if 2+ chars)
    let tacoResults = [];
    if (debouncedSearch.length >= MIN_SEARCH_CHARS) {
      tacoResults = searchTaco(debouncedSearch, 10).map((f) => ({
        id: f.id,
        canonical_name: f.name,
        serving_base_amount: 100,
        serving_base_unit: 'g',
        calories_per_base: f.calories,
        protein_per_base: f.protein,
        carbs_per_base: f.carbs,
        fat_per_base: f.fat,
        fiber_per_base: 0,
        brand: f.brand,
        category: f.category,
        _source: 'taco',
      }));
    }

    // Combine and remove duplicates (prefer FoodMaster)
    const seen = new Set();
    const combined = [...foodMasterResults, ...tacoResults].filter((f) => {
      const key = f.canonical_name?.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const limited = combined.slice(0, 15);
    setSearchCache((prev) => ({ ...prev, [debouncedSearch]: limited }));
    return limited;
  }, [debouncedSearch, allFoods, searchCache]);

  const recent = useMemo(() => {
    if (debouncedSearch) return [];
    return recentLogs
      .map((log) =>
        allFoods.find((f) => f.id === log.food_master_id)
      )
      .filter(Boolean)
      .slice(0, 5);
  }, [debouncedSearch, recentLogs, allFoods]);

  const handleSelectFood = useCallback((food) => {
    setSelectedFood(food);
    setQuantity(food.serving_base_amount || 100);
    setUnit(food.serving_base_unit || 'g');
  }, []);

  const handleConfirmAdd = useCallback(() => {
    if (!selectedFood) return;

    const ratio = quantity / (selectedFood.serving_base_amount || 100);
    const item = {
      name: selectedFood.canonical_name,
      food_master_id: selectedFood.id,
      amount: quantity,
      unit: unit,
      kcal: Math.round((selectedFood.calories_per_base || 0) * ratio),
      protein: Math.round((selectedFood.protein_per_base || 0) * ratio * 10) / 10,
      carbs: Math.round((selectedFood.carbs_per_base || 0) * ratio * 10) / 10,
      fat: Math.round((selectedFood.fat_per_base || 0) * ratio * 10) / 10,
      fiber: Math.round((selectedFood.fiber_per_base || 0) * ratio * 10) / 10,
    };

    onSelectFood(item);

    // FoodLog update deferred (no table yet)

    toast.success(`${selectedFood.canonical_name} added`);
    setSelectedFood(null);
    setQuantity(100);
    setUnit('g');
    setSearch('');
    setOpen(false);
  }, [selectedFood, quantity, unit, onSelectFood]);

  const adjustQty = (delta) => {
    setQuantity((prev) => {
      const newVal = prev + delta;
      return newVal > 0 ? Math.round(newVal * 10) / 10 : 0.1;
    });
  };

  const handleCancel = () => {
    setSelectedFood(null);
    setQuantity(100);
    setUnit('g');
  };

  return (
    <div className="relative">
      <div className={`relative ${compact ? 'w-auto' : 'w-full'}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={compact ? '+ Food' : 'Search food...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          className={`pl-10 rounded-lg text-[13px] ${compact ? 'h-8 w-32' : 'h-10'}`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[hsl(var(--card))] border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Recent items */}
          {search === '' && recent.length > 0 && (
            <>
              <div className="sticky top-0 px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground bg-[hsl(var(--secondary))]">
                <Clock className="w-3 h-3 inline mr-1" /> Recent
              </div>
              {recent.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFood(f)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[hsl(var(--secondary))] transition-colors text-[12px]"
                >
                  <p className="font-medium">{f.canonical_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {f.serving_base_amount} {f.serving_base_unit} · {f.calories_per_base} kcal
                  </p>
                </button>
              ))}
            </>
          )}

          {/* Search results */}
          {debouncedSearch && results.length === 0 && (
            <DataState
              variant="empty"
              icon={UtensilsCrossed}
              title={`No results for "${debouncedSearch}"`}
              description="Try a different spelling or a more general term."
              className="mx-3 my-3"
            />
          )}

          {debouncedSearch && results.length > 0 && (
            <>
              <div className="sticky top-0 px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground bg-[hsl(var(--secondary))]">
                <Search className="w-3 h-3 inline mr-1" /> Results
              </div>
              {results.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFood(f)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[hsl(var(--secondary))] transition-colors text-[12px]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{f.canonical_name}</p>
                    {f._source === 'taco' && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">TACO</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {f.serving_base_amount} {f.serving_base_unit} · {f.calories_per_base} kcal
                    {f.category && ` · ${f.category}`}
                  </p>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Quantity Selector Modal */}
      {selectedFood && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[hsl(var(--card))] border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-[13px]">{selectedFood.canonical_name}</p>
            <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
              <span className="text-[11px]">Cancel</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => adjustQty(-10)}
              className="w-8 h-8 rounded-md bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.8)] flex items-center justify-center"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="h-9 w-20 text-center text-[13px]"
            />
            <button
              onClick={() => adjustQty(10)}
              className="w-8 h-8 rounded-md bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.8)] flex items-center justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-9 px-2 rounded-md border border-border bg-background text-[13px]"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="serving">serving</option>
              <option value="cup">cup</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
            </select>
          </div>

          <p className="text-[11px] text-muted-foreground mb-3">
            {Math.round((selectedFood.calories_per_base || 0) * (quantity / (selectedFood.serving_base_amount || 100)))} kcal
            {' · '}
            P {(selectedFood.protein_per_base * (quantity / (selectedFood.serving_base_amount || 100))).toFixed(1)}g
            {' · '}
            C {(selectedFood.carbs_per_base * (quantity / (selectedFood.serving_base_amount || 100))).toFixed(1)}g
            {' · '}
            F {(selectedFood.fat_per_base * (quantity / (selectedFood.serving_base_amount || 100))).toFixed(1)}g
          </p>

          <Button
            onClick={handleConfirmAdd}
            className="w-full h-9 rounded-lg text-[13px]"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" /> Add
          </Button>
        </div>
      )}

      {/* Click outside to close */}
      {open && !selectedFood && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
