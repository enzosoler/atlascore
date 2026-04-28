import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { useAIConsent } from '@/redesign/v3/lib/useAIConsent.js';

export default function FoodCameraScanner({ open, onOpenChange, onFoodsDetected }) {
  const { user } = useAuth();
  const t = useT();
  const { consented, grant: grantConsent } = useAIConsent({
    userId: user?.id,
    kind: 'food_vision',
    provider: 'Google Gemini or another third-party AI vision model',
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState(new Set());
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDetectedFoods([]);
    setSelectedFoods(new Set());
  }, []);

  const handleCameraClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!image) return;
    if (!consented) {
      toast.error(t('nutrition.photoConsent.error'));
      return;
    }

    setIsAnalyzing(true);
    setDetectedFoods([]);

    try {
      // Convert image to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      // Call edge function
      const { data, error } = await supabase.functions.invoke('food-vision', {
        body: { image: base64, mimeType: image.type },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.foods || data.foods.length === 0) {
        toast.info('No foods detected. Try a clearer photo with good lighting.');
        return;
      }

      setDetectedFoods(data.foods);
      // Auto-select all by default
      setSelectedFoods(new Set(data.foods.map((_, i) => i)));
    } catch (err) {
      console.error('Food vision error:', err);
      toast.error(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [consented, image, t]);

  const handleGrantConsent = useCallback(async () => {
    setIsSavingConsent(true);
    try {
      await grantConsent();
    } catch (error) {
      console.error('[FoodCameraScanner] consent save failed:', error);
      toast.error(t('nutrition.photoConsent.error'));
    } finally {
      setIsSavingConsent(false);
    }
  }, [grantConsent, t]);

  const toggleFoodSelection = useCallback((index) => {
    setSelectedFoods(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const foodsToAdd = detectedFoods.filter((_, i) => selectedFoods.has(i));
    onFoodsDetected(foodsToAdd);
    onOpenChange(false);
    resetState();
  }, [detectedFoods, selectedFoods, onFoodsDetected, onOpenChange]);

  const resetState = useCallback(() => {
    setImage(null);
    setPreviewUrl(null);
    setDetectedFoods([]);
    setSelectedFoods(new Set());
    setIsAnalyzing(false);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    resetState();
  }, [onOpenChange, resetState]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] border-border rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[16px] flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Food
          </DialogTitle>
        </DialogHeader>

        {!consented ? (
          <div className="space-y-4">
            <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">
              {t('nutrition.photoConsent.body')}
            </p>
            <Button
              onClick={handleGrantConsent}
              disabled={isSavingConsent}
              className="w-full btn btn-primary"
            >
              {isSavingConsent ? t('common.loading') : t('nutrition.photoConsent.accept')}
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full">
              {t('nutrition.photoConsent.decline')}
            </Button>
          </div>
        ) : (
        <div className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Image preview or upload button */}
          {!previewUrl ? (
            <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center">
                <Camera className="w-8 h-8 text-[hsl(var(--fg-3))]" />
              </div>
              <p className="text-[14px] font-medium text-[hsl(var(--fg))]">
                Take a photo of your meal
              </p>
              <p className="text-[12px] text-[hsl(var(--fg-2))] mt-1">
                AI will detect foods and estimate portions
              </p>
              <Button
                onClick={handleCameraClick}
                className="mt-4 btn btn-primary"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                onClick={handleCameraClick}
                className="mt-2 w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload from Gallery
              </Button>
            </div>
          ) : (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Food preview"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                onClick={() => {
                  setImage(null);
                  setPreviewUrl(null);
                  setDetectedFoods([]);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Analyze button */}
          {previewUrl && !isAnalyzing && detectedFoods.length === 0 && (
            <Button
              onClick={analyzeImage}
              className="w-full btn btn-primary"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Analyze Photo
                </>
              )}
            </Button>
          )}

          {/* Loading state */}
          {isAnalyzing && (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-[hsl(var(--brand))]" />
              <p className="mt-2 text-[13px] text-[hsl(var(--fg-2))]">
                Capturing a structured draft...
              </p>
            </div>
          )}

          {/* Detected foods */}
          {detectedFoods.length > 0 && (
            <div className="space-y-3">
              <p className="text-[13px] font-medium text-[hsl(var(--fg))]">
                Review detected foods ({detectedFoods.length})
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detectedFoods.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleFoodSelection(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedFoods.has(idx)
                        ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.1)]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.46)] hover:bg-[hsl(var(--fill)/0.72)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedFoods.has(idx)
                            ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]'
                            : 'border-[hsl(var(--fg-3))]'
                        }`}>
                          {selectedFoods.has(idx) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium text-[13px] text-[hsl(var(--fg))]">
                          {food.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-[hsl(var(--fg-2))]">
                        {food.estimatedAmount}
                      </span>
                    </div>
                    <div className="ml-7 mt-1 text-[11px] text-[hsl(var(--fg-2))]">
                      {Math.round(food.calories)} kcal · P {Math.round(food.protein)}g · C {Math.round(food.carbs)}g · F {Math.round(food.fat)}g
                    </div>
                    {food.confidence && (
                      <div className="ml-7 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          food.confidence >= 0.8
                            ? 'bg-green-100 text-green-700'
                            : food.confidence >= 0.5
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {food.confidence >= 0.8 ? 'high confidence' : food.confidence >= 0.5 ? 'needs review' : 'low confidence'}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--fg-3))]">
                <AlertCircle className="w-4 h-4" />
                <span>Portions are estimates. Adjust after adding.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImage(null);
                    setPreviewUrl(null);
                    setDetectedFoods([]);
                  }}
                  className="flex-1"
                >
                  Retake
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={selectedFoods.size === 0}
                  className="flex-1 btn btn-primary"
                >
                  Confirm {selectedFoods.size} item{selectedFoods.size !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          )}
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
