import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Sparkles, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const testimonials = [
  {
    quote: "Atlas Core transformed how I track my training. The interface is lightyears ahead of anything else.",
    author: "Sarah J.",
    role: "Marathon Runner"
  },
  {
    quote: "The AI nutrition insights actually make sense. It's like having a coach in my pocket 24/7.",
    author: "Mark D.",
    role: "Fitness Enthusiast"
  }
];

export default function AuthLayoutV2({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left Side: Auth Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 z-10 bg-background relative">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <AtlasCoreLogoSVG width={120} variant="lockup" />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              {title || 'Welcome back'}
            </h1>
            <p className="text-muted-foreground">
              {subtitle || 'Please enter your details to continue.'}
            </p>
          </motion.div>

          {/* Auth Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {children}
          </motion.div>

          {/* Footer Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-border/50"
          >
            <p className="text-xs text-muted-foreground text-center">
              &copy; {new Date().getFullYear()} Atlas Core. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Marketing Section (Desktop Only) */}
      <div className="hidden lg:flex flex-1 relative bg-muted overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent-secondary/10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -mr-64 -mt-64 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-secondary/10 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Premium Fitness Platform</span>
            </div>

            <h2 className="text-5xl font-bold leading-tight mb-8">
              Elevate your <br />
              <span className="bg-gradient-to-r from-primary to-accent-secondary bg-clip-text text-transparent">
                Physical Potential
              </span>
            </h2>

            <div className="space-y-6 mb-12">
              {[
                "Precision Workout Tracking",
                "AI-Driven Nutrition Planning",
                "Advanced Progress Analytics",
                "Native Mobile Experience"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg font-medium text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-background/40 backdrop-blur-md border border-border/50 p-6 rounded-2xl relative"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground/90 italic mb-4">"{t.quote}"</p>
                  <div>
                    <p className="font-bold text-sm">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating UI Mockup element */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bottom-12 right-12 w-64 h-80 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden hidden xl:block"
        >
          <div className="h-12 bg-muted/50 border-b border-border/50 flex items-center px-4 gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <div className="p-4 space-y-4">
             <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
             <div className="h-24 w-full bg-muted rounded flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-primary/40" />
             </div>
             <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-5/6 bg-muted rounded" />
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
