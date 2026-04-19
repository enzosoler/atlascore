import React, { useState } from 'react';
import { Camera, X, Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/app/ResponsiveModal';
import FoodCameraScanner from '@/components/nutrition/FoodCameraScanner';

interface AIPhotoScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFoodsDetected: (foods: any[]) => void;
}

export function AIPhotoScanner({ open, onOpenChange, onFoodsDetected }: AIPhotoScannerProps) {
  return (
    <FoodCameraScanner
      open={open}
      onOpenChange={onOpenChange}
      onFoodsDetected={onFoodsDetected}
    />
  );
}
