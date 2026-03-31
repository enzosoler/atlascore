/**
 * TodayV2 — clean rebuild of the Today page.
 *
 * Rules:
 *  - No query may crash the route
 *  - No .map() on potentially undefined
 *  - No deep access without optional chaining
 *  - If workout is done, NEVER suggest "Start workout"
 *  - Every component receives safe defaults
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Dumbbell, UtensilsCrossed, Scale, Heart,
  ArrowRight, Flame, Pill,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { useAICoach } from '@/hooks/useAICoach';
import { useCoachChat } from '@/hooks/useCoachChat';
import { buildBriefing, buildRecommendations } from '@/lib/rulesEngine';
import { ROUTES } from '@/lib/routes';
import { TodayScreen } from '@/components/today/TodayMobileUI';
import BodyCheckinSheet from '@/components/body/BodyCheckinSheet';
import CoachChatTrigger from '@/components/ai/CoachChatTrigger';
import CoachChatSheet from '@/components/ai/CoachChatSheet';

// ─── Date / greeting / weather helpers ─────────────────────────────────────────

function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getDateLabel(locale) {
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'es' ? 'es' : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());
}

function getFirstName(fullName) {
  if (!fullName) return '';
  const [first] = String(fullName).split(/[\s@._-]+/).filter(Boolean) || [];
  if (!first) return '';
  const clean = first.replace(/\d+$/u, '') || first;
  return `${clean.charAt(0).toLocaleUpperCase()}${clean.slice(1)}`;
}

function getGreeting(fullName, t) {
  const name = getFirstName(fullName) || t('common.athlete');
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('today.greeting.morning', { name });
  if (h >= 12 && h < 17) return t('today.greeting.afternoon', { name });
  if (h >= 17 && h < 21) return t('today.greeting.evening', { name });
  return t('today.greeting.late', { name });
}

function interpretWeather(temp, code, t) {
  let icon, condition;
  if (code === 0)       { icon = '☀️'; condition = 'clear'; }
  else if (code <= 3)   { icon = '⛅'; condition = 'cloudy'; }
  else if (code <= 48)  { icon = '🌫️'; condition = 'foggy'; }
  else if (code <= 67)  { icon = '🌧️'; condition = 'rainy'; }
  else if (code <= 77)  { icon = '❄️'; condition = 'snowy'; }
  else if (code <= 82)  { icon = '🌦️'; condition = 'showers'; }
  else                  { icon = '⛈️'; condition = 'stormy'; }
  
  // Smart contextual comments based on actual weather + time of day + user intent
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const isEvening = hour >= 17 && hour < 21;
  
  // Contextual weather messages that are safe and motivating
  const contextualComments = {
    clear: {
      morning: temp > 20 ? 'Great morning for outdoor training' : 'Cool start, perfect for focus',
      afternoon: temp > 25 ? 'Hot afternoon, stay hydrated' : 'Perfect conditions for activity',
      evening: temp > 18 ? 'Pleasant evening for recovery' : 'Cool evening, ideal for rest',
    },
    cloudy: {
      morning: 'Overcast morning, great for consistent work',
      afternoon: 'Comfortable conditions, no distractions',
      evening: 'Calm evening, perfect for planning',
    },
    foggy: {
      morning: 'Foggy start, stay focused on goals',
      afternoon: 'Limited visibility, time for indoor work',
      evening: 'Mysterious evening, reflect on progress',
    },
    rainy: {
      morning: 'Rainy morning, perfect for indoor training',
      afternoon: 'Rainy afternoon, ideal for recovery work',
      evening: 'Cozy evening, great for meal prep',
    },
    snowy: {
      morning: 'Snowy morning, extra energy for warming up',
      afternoon: 'Winter conditions, conserve energy wisely',
      evening: 'Cold evening, focus on nutrition',
    },
    showers: {
      morning: 'Intermittent showers, flexible training day',
      afternoon: 'Showers passing, time for quick sessions',
      evening: 'Wet evening, prioritize recovery',
    },
    stormy: {
      morning: 'Stormy morning, safety first today',
      afternoon: 'Rough weather, perfect for rest and planning',
      evening: 'Stormy evening, stay safe and recover',
    },
  };
  
  // Neutral fallback messages when weather is unavailable
  const neutralMessages = [
    'Focus on consistency today',
    'Every day is progress',
    'Stay committed to your goals',
    'Building momentum daily',
    'Execution over everything',
    'Progress is a habit',
  ];
  
  // Get contextual comment if weather data exists
  const timeOfDay = isMorning ? 'morning' : isAfternoon ? 'afternoon' : isEvening ? 'evening' : 'morning';
  const weatherComment = contextualComments[condition]?.[timeOfDay];
  
  // Return weather data with smart comment or neutral fallback
  if (weatherComment && t) {
    return { temp, icon, comment: weatherComment };
  }
  
  // If no weather data or translation issues, return neutral message
  const neutralComment = neutralMessages[Math.floor(Math.random() * neutralMessages.length)];
  return { temp, icon, comment: neutralComment };
}

// ─── Dynamic Hero Component ─────────────────────────────────────────────────────────

function DynamicHero({ weather, greeting, locale }) {
  const t = useT();
  const hour = new Date().getHours();
  
  // Time detection
  const getTimeOfDay = (hour) => {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };
  
  // Full-width background system (no card behavior)
  const getBackgroundSystem = (timeOfDay, weatherCondition) => {
    const isLight = timeOfDay !== 'night';
    
    const backgrounds = {
      morning: {
        sunny: {
          base: 'linear-gradient(180deg, #FFE5CC 0%, #FFD4A3 20%, #FFC299 40%, #FFB380 60%, #FFA366 80%, #FF944D 100%)',
          secondary: 'linear-gradient(135deg, rgba(255, 220, 180, 0.3), rgba(255, 180, 120, 0.2))',
          radial: 'radial-gradient(ellipse at 25% 15%, rgba(255, 200, 150, 0.6), rgba(255, 160, 100, 0.3), transparent 70%)'
        },
        cloudy: {
          base: 'linear-gradient(180deg, #F5E6D3 0%, #E8D5C4 20%, #DBC4B5 40%, #CEB3A6 60%, #C1A297 80%, #B49188 100%)',
          secondary: 'linear-gradient(135deg, rgba(230, 210, 190, 0.4), rgba(200, 180, 160, 0.3))',
          radial: 'radial-gradient(ellipse at 30% 20%, rgba(255, 245, 230, 0.5), rgba(230, 210, 190, 0.3), transparent 60%)'
        },
        rain: {
          base: 'linear-gradient(180deg, #E8DCD0 0%, #D4C4B8 20%, #C0B0A0 40%, #AC9C88 60%, #988870 80%, #847458 100%)',
          secondary: 'linear-gradient(135deg, rgba(180, 160, 140, 0.4), rgba(140, 120, 100, 0.3))',
          radial: 'radial-gradient(ellipse at 40% 10%, rgba(200, 180, 160, 0.4), rgba(160, 140, 120, 0.2), transparent 50%)'
        }
      },
      afternoon: {
        sunny: {
          base: 'linear-gradient(180deg, #E6F3FF 0%, #D4EBFF 20%, #C2E3FF 40%, #B0DBFF 60%, #9ED3FF 80%, #8CCBFF 100%)',
          secondary: 'linear-gradient(135deg, rgba(200, 220, 240, 0.3), rgba(150, 200, 230, 0.2))',
          radial: 'radial-gradient(ellipse at 35% 10%, rgba(255, 245, 220, 0.4), rgba(255, 230, 180, 0.2), transparent 60%)'
        },
        cloudy: {
          base: 'linear-gradient(180deg, #F0F4F8 0%, #E4E8ED 20%, #D8DCE2 40%, #CCD0D7 60%, #C0C4CC 80%, #B4B8C1 100%)',
          secondary: 'linear-gradient(135deg, rgba(220, 225, 230, 0.3), rgba(180, 185, 190, 0.2))',
          radial: 'radial-gradient(ellipse at 40% 15%, rgba(255, 250, 245, 0.4), rgba(240, 235, 230, 0.2), transparent 50%)'
        },
        rain: {
          base: 'linear-gradient(180deg, #DDE4EA 0%, #C8D0D8 20%, #B3BCC6 40%, #9EA8B4 60%, #8994A2 80%, #748090 100%)',
          secondary: 'linear-gradient(135deg, rgba(160, 170, 180, 0.4), rgba(120, 130, 140, 0.3))',
          radial: 'radial-gradient(ellipse at 45% 5%, rgba(200, 210, 220, 0.3), rgba(160, 170, 180, 0.2), transparent 50%)'
        }
      },
      evening: {
        sunny: {
          base: 'linear-gradient(180deg, #FFE5F1 0%, #FFD3E8 20%, #FFC1DF 40%, #FFAFD6 60%, #FF9DCD 80%, #FF8BC4 100%)',
          secondary: 'linear-gradient(135deg, rgba(255, 200, 220, 0.3), rgba(255, 150, 180, 0.2))',
          radial: 'radial-gradient(ellipse at 75% 25%, rgba(255, 180, 200, 0.5), rgba(255, 140, 160, 0.3), transparent 60%)'
        },
        cloudy: {
          base: 'linear-gradient(180deg, #F0E5EA 0%, #E0D2D8 20%, #D0BFC6 40%, #C0ACB4 60%, #B09AA2 80%, #A08890 100%)',
          secondary: 'linear-gradient(135deg, rgba(220, 200, 210, 0.4), rgba(180, 160, 170, 0.3))',
          radial: 'radial-gradient(ellipse at 70% 20%, rgba(240, 220, 230, 0.4), rgba(220, 200, 210, 0.2), transparent 50%)'
        },
        rain: {
          base: 'linear-gradient(180deg, #E5DCE0 0%, #D0C4CA 20%, #BBACB4 40%, #A6949E 60%, #917C88 80%, #7C6472 100%)',
          secondary: 'linear-gradient(135deg, rgba(180, 160, 170, 0.4), rgba(140, 120, 130, 0.3))',
          radial: 'radial-gradient(ellipse at 65% 15%, rgba(220, 200, 210, 0.3), rgba(180, 160, 170, 0.2), transparent 50%)'
        }
      },
      night: {
        sunny: {
          base: 'linear-gradient(180deg, #1A1F3A 0%, #161D36 20%, #121B32 40%, #0E192E 60%, #0A172A 80%, #061526 100%)',
          secondary: 'linear-gradient(135deg, rgba(60, 80, 120, 0.3), rgba(40, 60, 100, 0.2))',
          radial: 'radial-gradient(ellipse at 85% 20%, rgba(100, 140, 200, 0.4), rgba(60, 100, 160, 0.2), transparent 50%)'
        },
        cloudy: {
          base: 'linear-gradient(180deg, #1F1F2E 0%, #1A1A28 20%, #151522 40%, #10101C 60%, #0B0B16 80%, #060610 100%)',
          secondary: 'linear-gradient(135deg, rgba(60, 60, 80, 0.3), rgba(40, 40, 60, 0.2))',
          radial: 'radial-gradient(ellipse at 75% 25%, rgba(80, 80, 100, 0.3), rgba(60, 60, 80, 0.2), transparent 40%)'
        },
        rain: {
          base: 'linear-gradient(180deg, #1A1A24 0%, #14141E 20%, #0E0E18 40%, #080812 60%, #02020C 80%, #000006 100%)',
          secondary: 'linear-gradient(135deg, rgba(40, 40, 50, 0.4), rgba(20, 20, 30, 0.3))',
          radial: 'radial-gradient(ellipse at 70% 15%, rgba(60, 60, 70, 0.3), rgba(40, 40, 50, 0.2), transparent 40%)'
        }
      }
    };
    
    const variant = backgrounds[timeOfDay]?.[weatherCondition] || backgrounds[timeOfDay].sunny;
    return {
      base: variant.base,
      secondary: variant.secondary,
      radial: variant.radial,
      isLight
    };
  };
  
  // Natural contextual lines
  const getContextualLine = (timeOfDay, weatherCondition) => {
    const messages = {
      sunny: "Perfect window to train.",
      cloudy: "Steady conditions. Keep momentum.",
      rain: "Rain outside. Stay consistent.",
      night: "Wind down or finish strong."
    };
    
    return messages[weatherCondition] || "Keep momentum today.";
  };
  
  // Safe defaults
  const safeWeather = weather || null;
  const safeGreeting = greeting || 'Welcome';
  const timeOfDay = getTimeOfDay(hour);
  const weatherCondition = safeWeather?.condition || 'sunny';
  const backgroundSystem = getBackgroundSystem(timeOfDay, weatherCondition);
  const contextualLine = safeWeather ? getContextualLine(timeOfDay, weatherCondition) : "Keep momentum today.";
  
  try {
    return (
      <div 
        style={{
          width: '100%',
          height: '320px',
          position: 'relative',
          overflow: 'hidden',
          background: backgroundSystem.base,
          marginLeft: '-24px',
          marginRight: '-24px',
          marginTop: '-24px'
        }}
      >
        {/* Multi-layer atmospheric system */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: backgroundSystem.secondary,
            mixBlendMode: 'soft-light'
          }}
        />
        
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: backgroundSystem.radial,
            mixBlendMode: 'overlay'
          }}
        />
        
        {/* Subtle noise overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="a"><feTurbulence baseFrequency="0.6" numOctaves="3"/></filter><rect width="200" height="200" filter="url(#a)" opacity="0.03"/></svg>')}`,
            mixBlendMode: 'multiply'
          }}
        />
        
        {/* Readability overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: backgroundSystem.isLight ? 'rgba(11, 18, 32, 0.08)' : 'rgba(0, 0, 0, 0.3)'
          }}
        />
        
        {/* Content */}
        <div 
          style={{
            position: 'relative',
            zIndex: 10,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 24px 24px 24px'
          }}
        >
          {/* Top: Date + time context */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div 
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: backgroundSystem.isLight ? '#0B1220' : '#FFFFFF',
                opacity: 0.7
              }}
            >
              {getDateLabel(locale)}
            </div>
            <div 
              style={{
                fontSize: '11px',
                color: backgroundSystem.isLight ? '#0B1220' : '#FFFFFF',
                opacity: 0.5,
                textTransform: 'capitalize'
              }}
            >
              {timeOfDay}
            </div>
          </div>
          
          {/* Center: Large greeting */}
          <div 
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div 
              style={{
                fontSize: '36px',
                fontWeight: 600,
                lineHeight: 1.1,
                color: backgroundSystem.isLight ? '#0B1220' : '#FFFFFF',
                textAlign: 'center'
              }}
            >
              {safeGreeting}
            </div>
          </div>
          
          {/* Below: Weather row */}
          {safeWeather && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}
            >
              <span 
                style={{
                  fontSize: '28px',
                  color: backgroundSystem.isLight ? '#0B1220' : '#FFFFFF',
                  opacity: 0.9
                }}
              >
                {safeWeather.icon}
              </span>
              <span 
                style={{
                  fontSize: '20px',
                  fontWeight: 500,
                  color: backgroundSystem.isLight ? '#0B1220' : '#FFFFFF',
                  opacity: 0.9
                }}
              >
                {safeWeather.temp}°
              </span>
            </div>
          )}
          
          {/* Bottom: One contextual line */}
          <div 
            style={{
              fontSize: '15px',
              color: backgroundSystem.isLight ? '#0B1220' : '#FFFFFF',
              opacity: 0.8,
              textAlign: 'center'
            }}
          >
            {contextualLine}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('DynamicHero error:', error);
    // Fallback hero
    return (
      <div 
        style={{
          width: '100%',
          height: '320px',
          marginLeft: '-24px',
          marginRight: '-24px',
          marginTop: '-24px',
          background: 'linear-gradient(180deg, #E6F3FF 0%, #8CCBFF 100%)'
        }}
      >
        <div style={{ 
          fontSize: '36px', 
          fontWeight: 600, 
          color: '#0B1220', 
          textAlign: 'center',
          padding: '120px 24px 24px'
        }}>
          {safeGreeting}
        </div>
      </div>
    );
  }
}

// ─── Hero Card ─────────────────────────────────────────────────────────────────

function HeroCard({ text, focus, primaryAction, loading }) {
  if (loading) {
    return (
      <div className="space-y-2.5 rounded-2xl bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] p-5">
        <div className="h-4 w-44 rounded-lg bg-[hsl(var(--fill))] animate-pulse" />
        <div className="h-3 w-60 rounded-lg bg-[hsl(var(--fill)/0.6)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] p-5 space-y-3">
      <p className="text-[15px] font-medium text-[hsl(var(--fg-2))] leading-relaxed">{text}</p>
      {primaryAction && (
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link to={primaryAction.path}>
            {primaryAction.label}
            <ArrowRight className="w-3.5 h-3.5 ml-1" strokeWidth={2} />
          </Link>
        </Button>
      )}
    </div>
  );
}

// ─── Quick Action Tile ─────────────────────────────────────────────────────────

function ActionTile({ icon: Icon, label, done = false, to, onClick }) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-4 px-3 transition-all active:scale-[0.97] ${
      done
        ? 'bg-[hsl(var(--ok)/0.06)]'
        : 'bg-[hsl(var(--card))] shadow-[var(--shadow-xs)]'
    }`}>
      <Icon className={`w-5 h-5 ${done ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-3))]'}`} strokeWidth={1.8} />
      <span className={`text-[11px] font-semibold ${done ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-2))]'}`}>{label}</span>
    </div>
  );

  if (onClick) return <button onClick={onClick} className="text-center w-full">{content}</button>;
  return <Link to={to} className="text-center">{content}</Link>;
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────

const planIconColors = {
  brand: 'bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
  ok: 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
  warn: 'bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
};

function PlanCard({ icon: Icon, label, value, sub, to, color = 'brand' }) {
  return (
    <Link to={to} className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] active:bg-[hsl(var(--fill)/0.4)] transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${planIconColors[color] || planIconColors.brand}`}>
        <Icon className="w-4 h-4" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))] tracking-[-0.01em]">{label}</p>
        {sub && <p className="text-[11px] text-[hsl(var(--fg-3))] mt-0.5">{sub}</p>}
      </div>
      <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg-2))] shrink-0">{value}</p>
    </Link>
  );
}

// ─── Recommendation Card ───────────────────────────────────────────────────────

function RecCard({ rec, onDismiss }) {
  const t = useT();
  return (
    <div className="flex items-start gap-3 py-3 px-4 rounded-2xl bg-[hsl(var(--card))] shadow-[var(--shadow-xs)]">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[hsl(var(--fg))]">{rec.title}</p>
        {rec.reason && <p className="text-[12px] text-[hsl(var(--fg-3))] mt-0.5 leading-relaxed">{rec.reason}</p>}
        {rec.actionPath && (
          <Link to={rec.actionPath} className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[hsl(var(--brand))]">
            {rec.actionLabel || t('today.doThis')} <ArrowRight className="w-3 h-3" strokeWidth={2} />
          </Link>
        )}
      </div>
      <button onClick={() => onDismiss?.(rec)} className="text-[12px] py-1 px-2 text-[hsl(var(--fg-3))] shrink-0 rounded-lg hover:bg-[hsl(var(--fill))] transition-colors">
        {rec.dismissLabel || t('common.dismiss')}
      </button>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function TodayContent() {
  console.log('TodayContent starting...');
  
  const { user } = useAuth();
  const { locale } = useI18n();
  const t = useT();
  const navigate = useNavigate();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('Weather effect starting...');
    if (!navigator?.geolocation) {
      console.log('Geolocation not available');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          console.log('Weather API call:', { lat: coords.latitude, lon: coords.longitude });
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(4)}&longitude=${coords.longitude.toFixed(4)}&current=temperature_2m,weather_code`
          );
          if (!res.ok) {
            console.log('Weather API failed:', res.status);
            return;
          }
          const json = await res.json();
          console.log('Weather API response:', json);
          const temp = Math.round(json.current?.temperature_2m ?? 0);
          const code = json.current?.weather_code ?? 0;
          const weatherData = interpretWeather(temp, code, t);
          console.log('Weather data processed:', weatherData);
          setWeather(weatherData);
        } catch (error) {
          console.error('Weather fetch error:', error);
          setHasError(true);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setHasError(true);
      },
      { timeout: 6000, maximumAge: 600000 }
    );
  }, []);

  const daily = useDailyStateV2();
  const ai = useAICoach({ userId: user?.id });

  const chat = useCoachChat({
    userId: user?.id,
    invalidateAfterAction: daily?.invalidateAfterAction,
    activePlan: daily?.activePlan,
  });

  // Defensive defaults for all data
  const safeDaily = daily || {};
  const safePlan = safeDaily?.plan || {};
  const safeNutrition = safeDaily?.nutrition || {};
  const safeProtocols = safeDaily?.protocols || {};
  const safeAi = ai || {};
  const safeChat = chat || {};
  
  // Briefing: AI when available, rules-based fallback
  const kcalRemaining = Math.max(0, (safeNutrition.caloriesTarget || 2000) - (safeNutrition.caloriesConsumed || 0));
  const briefing = safeAi.briefing
    ? { text: safeAi.briefing.body || safeAi.briefing.title, focus: safeAi.briefing.focus, primaryAction: null, secondaryAction: null }
    : buildBriefing({
        workoutDone: safeDaily.workoutDone,
        nutritionLogged: safeDaily.nutritionLogged,
        hasActivePlan: safePlan.id != null,
        planName: safePlan.name,
        preferredName: safeDaily.preferredName,
        kcalRemaining,
        t,
      });

  // Recommendations: AI when available, rules-based fallback (max 2)
  const aiRecs = safeAi.recommendations || [];
  const fallbackRecs = buildRecommendations({
    workoutDone: safeDaily.workoutDone,
    hasActivePlan: safePlan.id != null,
    proteinConsumed: safeNutrition.proteinConsumed || 0,
    proteinTarget: safeNutrition.proteinTarget || 0,
    weightLogged: safeDaily.weightLogged,
    hasPhotos: false,
    t,
  }) || [];
  
  const recs = Array.isArray(aiRecs) && aiRecs.length > 0 ? aiRecs.slice(0, 2) : (Array.isArray(fallbackRecs) ? fallbackRecs : []);

  console.log('TodayContent state:', { safeDaily, weather, hasError, briefing, recs });

  try {
    return (
      <TodayScreen>
        {/* Error Fallback */}
        {hasError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200">
            <p className="text-red-800">Something went wrong. Please refresh the page.</p>
          </div>
        )}

        {/* Dynamic Hero - Priority 1 */}
        <div className="mb-6">
          <DynamicHero 
            weather={weather} 
            greeting={getGreeting(safeDaily.preferredName, t)}
            locale={locale}
          />
        </div>

        {/* ONE Primary Next Action - Priority 2 */}
        {briefing.primaryAction && (
          <div className="mb-8">
            <Link to={briefing.primaryAction.path} className="block w-full">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-black text-white px-6 py-6 transform transition-all duration-200 hover:scale-105 active:scale-95">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="text-[20px] font-bold leading-tight">{briefing.primaryAction.label}</div>
                  <div className="text-[14px] opacity-90">{kcalRemaining > 0 ? `${kcalRemaining} kcal remaining` : 'Daily target met'}</div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Coach Input - Priority 3 */}
        <div className="mb-6">
          <CoachChatTrigger />
        </div>

        {/* Quick Actions (4) - Priority 4 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to={ROUTES.workouts} className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 transition-all duration-200 hover:bg-[hsl(var(--fill))] hover:shadow-md active:scale-95">
              <Dumbbell className="w-5 h-5 text-[hsl(var(--brand))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Train</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">{safeDaily.workoutDone ? 'Completed' : 'Start session'}</p>
              </div>
            </div>
          </Link>
          <Link to={ROUTES.nutrition} className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 transition-all duration-200 hover:bg-[hsl(var(--fill))] hover:shadow-md active:scale-95">
              <UtensilsCrossed className="w-5 h-5 text-[hsl(var(--brand-ai))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Fuel</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">{safeDaily.nutritionLogged ? 'Track meals' : 'Log first meal'}</p>
              </div>
            </div>
          </Link>
          <Link to={ROUTES.body} className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 transition-all duration-200 hover:bg-[hsl(var(--fill))] hover:shadow-md active:scale-95">
              <Scale className="w-5 h-5 text-[hsl(var(--ok))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Check-in</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">{safeDaily.weightLogged ? 'Logged' : 'Update metrics'}</p>
              </div>
            </div>
          </Link>
          <Link to={ROUTES.goals} className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 transition-all duration-200 hover:bg-[hsl(var(--fill))] hover:shadow-md active:scale-95">
              <Target className="w-5 h-5 text-[hsl(var(--warn))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Progress</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">Review trends</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Today's Plan - Priority 5 */}
        {safePlan.id && (
          <div className="mb-6">
            <PlanCard
              icon={Dumbbell}
              label={safePlan.name || 'Today\'s workout'}
              value={safeDaily.workoutDone ? 'Done' : 'Start'}
              sub={safePlan.todayExercises?.length ? `${safePlan.todayExercises.length} exercises` : null}
              to={ROUTES.workouts}
              color={safeDaily.workoutDone ? 'ok' : 'brand'}
            />
          </div>
        )}

        {/* Recommendations - Only if compelling */}
        {Array.isArray(recs) && recs.length > 0 && (
          <div className="mb-6">
            <p className="text-[13px] font-medium text-[hsl(var(--fg-3))] mb-3">Recommendations</p>
            <div className="space-y-3">
              {recs.map((rec) => (
                <RecCard key={rec.id || Math.random()} rec={rec} onDismiss={() => {}} />
              ))}
            </div>
          </div>
        )}

        {/* Coach Chat Sheet */}
        <CoachChatSheet open={chatOpen} onOpenChange={setChatOpen} />
        <BodyCheckinSheet open={checkinOpen} onOpenChange={setCheckinOpen} />
      </TodayScreen>
    );
  } catch (error) {
    console.error('TodayContent error:', error);
    setHasError(true);
    return (
      <TodayScreen>
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200">
          <p className="text-red-800">Something went wrong. Please refresh the page.</p>
        </div>
      </TodayScreen>
    );
  }
}

export default function TodayV2() {
  return <TodayContent />;
}
