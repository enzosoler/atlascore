import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Bookmark, Play, Clock, BarChart3, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DetailView() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[hsl(var(--bg))]/95 backdrop-blur border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="h-48 bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Hypertrophy Chest</h1>
            <p className="opacity-90">Advanced • 60 min</p>
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--fill))] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Atlas Team</p>
              <p className="text-sm text-[hsl(var(--fg-2))]">Published 2 days ago</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">Follow</Button>
          </div>

          <div className="flex items-center gap-4 mb-6 text-sm text-[hsl(var(--fg-2))]">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              60 min
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              Advanced
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              1.2k likes
            </div>
          </div>

          <h2 className="font-semibold mb-3">Description</h2>
          <p className="text-[hsl(var(--fg-2))] mb-6 text-sm leading-relaxed">
            A comprehensive chest workout designed for maximum muscle hypertrophy. 
            This routine combines compound and isolation movements to target all 
            areas of the chest. Perfect for intermediate to advanced lifters looking 
            to break through plateaus.
          </p>

          <h2 className="font-semibold mb-3">Exercises</h2>
          <div className="space-y-2 mb-6">
            {[
              'Barbell Bench Press - 4x8',
              'Incline Dumbbell Press - 4x10',
              'Cable Flys - 3x12',
              'Dips - 3xFailure',
              'Push Ups - 3x15',
            ].map((exercise, i) => (
              <div key={i} className="p-3 rounded-lg bg-[hsl(var(--fill))] flex items-center justify-between">
                <span className="text-sm">{exercise}</span>
                <span className="text-xs text-[hsl(var(--fg-3))]">#{i + 1}</span>
              </div>
            ))}
          </div>

          <Button className="w-full mb-4">
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
