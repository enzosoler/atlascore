import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18nContext';
import { ArrowLeft, ChevronLeft, ChevronRight, Dumbbell, Utensils, Camera } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // Sample events
  const events = {
    5: [{ type: 'workout', icon: Dumbbell }],
    10: [{ type: 'meal', icon: Utensils }],
    15: [{ type: 'photo', icon: Camera }],
    20: [{ type: 'workout', icon: Dumbbell }, { type: 'meal', icon: Utensils }],
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Calendar</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-[hsl(var(--fg-3))] py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
              const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();
              const dayEvents = events[day] || [];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-[hsl(var(--accent-primary))] text-white'
                      : isToday
                      ? 'bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))]'
                      : 'hover:bg-[hsl(var(--fill))]'
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.map((e, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[hsl(var(--accent-primary))]'}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <h3 className="font-medium mb-3">
              {selectedDate.toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-2">
              {(events[selectedDate.getDate()] || []).length === 0 ? (
                <p className="text-sm text-[hsl(var(--fg-3))]">No events scheduled</p>
              ) : (
                events[selectedDate.getDate()].map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[hsl(var(--fill))]">
                    <event.icon className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                    <span className="text-sm capitalize">{event.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
