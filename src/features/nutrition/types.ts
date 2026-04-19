export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'pre_workout' | 'post_workout' | 'dinner' | 'evening_snack';

export interface Food {
  id?: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
  unit: string;
  external_id?: string | null;
  source_api?: string | null;
  brand?: string | null;
  _baseAmount?: number;
  _baseKcal?: number;
  _baseProtein?: number;
  _baseCarbs?: number;
  _baseFat?: number;
}

export interface Meal {
  id: string;
  source?: 'supabase' | 'local';
  source_row_id?: string | number | null;
  date: string;
  meal_type: MealType;
  title: string;
  foods: Food[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes?: string;
}

export interface NutritionProfile {
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
