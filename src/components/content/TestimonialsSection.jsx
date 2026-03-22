import React from 'react';
import { Star } from 'lucide-react';

/**
 * TestimonialsSection — reviews/testimonials section for the landing page
 */
export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Marcus Silva',
      role: 'Competitive Athlete',
      rating: 5,
      text: 'Atlas Core transformed how I train. For the first time I can actually see progress over time, and comparing workouts from six months ago with today is incredibly motivating.',
      avatar: '👨‍💼',
    },
    {
      name: 'Ana Martins',
      role: 'Personal Trainer',
      rating: 5,
      text: 'As a coach, Atlas is a game changer. I can see athlete data in real time, spot who is adhering, and know exactly who needs an adjustment. The PDF reports are client-ready.',
      avatar: '👩‍🏫',
    },
    {
      name: 'Dr. Carlos Rocha',
      role: 'Nutritionist',
      rating: 5,
      text: 'Atlas lets me prescribe with precision and follow through with context. Plan-versus-execution views reveal patterns that conversations alone never surface, and clients love the clarity.',
      avatar: '👨‍⚕️',
    },
    {
      name: 'Juliana Costa',
      role: 'Fitness Enthusiast',
      rating: 5,
      text: 'Simple, but powerful. I do not need ten different apps anymore. Atlas brings together check-ins, training, nutrition, and analysis, and the insights surface patterns I would have missed on my own.',
      avatar: '👩‍💻',
    },
  ];

  return (
    <div className="py-16 lg:py-24 border-t border-[hsl(var(--border-h))]">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[hsl(var(--brand))] mb-2">
            Trusted by Atlas Core users
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-[hsl(var(--fg))]">
            What our users say
          </h2>
          <p className="text-[16px] text-[hsl(var(--fg-2))] max-w-2xl mx-auto">
            Athletes, coaches, nutritionists, and clinicians share how Atlas Core changed their workflow and results.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.name}
              className="surface p-6 space-y-4 hover:border-[hsl(var(--brand)/0.3)] transition-colors"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 fill-[hsl(var(--warn))] text-[hsl(var(--warn))]" 
                    strokeWidth={0}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-[hsl(var(--border-h))]">
                <div className="text-2xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-semibold text-[13px] text-[hsl(var(--fg))]">
                    {testimonial.name}
                  </p>
                  <p className="text-[11px] text-[hsl(var(--fg-2))]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-16 border-t border-[hsl(var(--border-h))]">
          <p className="text-center text-[12px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-8">
            Used by athletes and professionals everywhere
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: '🏋️', label: '5,000+\nAthletes' },
              { icon: '👨‍🏫', label: '800+\nCoaches' },
              { icon: '🥗', label: '500+\nNutritionists' },
              { icon: '⭐', label: '4.9/5\nRating' },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-3xl">{stat.icon}</p>
                <p className="text-[11px] font-semibold text-[hsl(var(--fg-2))] whitespace-pre-line">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
