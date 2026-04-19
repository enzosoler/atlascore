import React from 'react';
import { cn } from '../lib/cn';
import { Brand } from '../ui/Brand';

/** Navigation items (shared between sidebar and bottom nav). */
export const NAV_ITEMS = [
  { id: 'today',     label: 'Today',     href: '/app/today',     icon: TodayIcon },
  { id: 'nutrition', label: 'Nutrition', href: '/app/nutrition', icon: NutritionIcon },
  { id: 'workouts',  label: 'Workouts',  href: '/app/workouts',  icon: WorkoutIcon },
  { id: 'body',      label: 'Body',      href: '/app/body',      icon: BodyIcon },
  { id: 'coach',     label: 'Coach',     href: '/app/coach',     icon: CoachIcon },
];

export function Sidebar({ current }) {
  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-rd-border bg-rd-surface/40 sticky top-0">
      <div className="flex items-center px-5 h-rd-top-bar">
        <Brand size="md" href="/v2" />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((n) => {
          const Icon = n.icon;
          const active = current === n.id;
          return (
            <a key={n.id} href={n.href} className={cn(
              'flex items-center gap-3 rounded-rd-md px-3 py-2.5 text-[14px] font-medium transition-colors duration-rd-fast',
              active ? 'bg-rd-surface-2 text-rd-fg' : 'text-rd-fg-secondary hover:bg-rd-surface-2 hover:text-rd-fg',
            )}>
              <Icon className={cn('h-5 w-5', active ? 'text-rd-accent' : 'text-rd-fg-muted')} />
              {n.label}
            </a>
          );
        })}
        <div className="my-3 h-px bg-rd-border" />
        <a href="/app/labs"     className="flex items-center gap-3 rounded-rd-md px-3 py-2.5 text-[13px] text-rd-fg-muted hover:text-rd-fg hover:bg-rd-surface-2"><LabIcon className="h-4 w-4" /> Labs</a>
        <a href="/app/insights" className="flex items-center gap-3 rounded-rd-md px-3 py-2.5 text-[13px] text-rd-fg-muted hover:text-rd-fg hover:bg-rd-surface-2"><InsightIcon className="h-4 w-4" /> Insights</a>
        <a href="/app/social"   className="flex items-center gap-3 rounded-rd-md px-3 py-2.5 text-[13px] text-rd-fg-muted hover:text-rd-fg hover:bg-rd-surface-2"><ShareIcon className="h-4 w-4" /> Social</a>
      </nav>
      <div className="border-t border-rd-border p-3">
        <a href="/app/settings" className="flex items-center gap-3 rounded-rd-md px-3 py-2 text-[13px] text-rd-fg-secondary hover:text-rd-fg hover:bg-rd-surface-2">
          <SettingsIcon className="h-4 w-4" /> Settings
        </a>
        <a href="/app/profile"  className="flex items-center gap-3 rounded-rd-md px-3 py-2 text-[13px] text-rd-fg-secondary hover:text-rd-fg hover:bg-rd-surface-2">
          <UserIcon className="h-4 w-4" /> Profile
        </a>
      </div>
    </aside>
  );
}

export function BottomNav({ current }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[50] border-t border-rd-border bg-rd-bg/90 backdrop-blur rd-safe-bottom">
      <ul className="flex h-rd-bottom-nav items-center justify-around px-2">
        {NAV_ITEMS.map((n) => {
          const Icon = n.icon;
          const active = current === n.id;
          return (
            <li key={n.id} className="flex-1">
              <a href={n.href} className={cn(
                'flex flex-col items-center gap-1 py-1.5 text-[10px] font-medium',
                active ? 'text-rd-accent' : 'text-rd-fg-muted',
              )}>
                <Icon className="h-[22px] w-[22px]" />
                <span className={cn('tracking-[0.02em]', active && 'text-rd-fg')}>{n.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── Icons — stroke-based, 24x24 ───────────────────────────────────────── */
function TodayIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z M4 10h16 M8 3v4 M16 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>);}
function NutritionIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M12 3c4 0 7 3 7 7s-3 10-7 10-7-5-7-10 3-7 7-7z M12 3v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>);}
function WorkoutIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M3 12h2 M19 12h2 M6 7v10 M18 7v10 M9 9v6 M15 9v6 M9 12h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>);}
function BodyIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="3" stroke="currentColor" strokeWidth="1.75"/><path d="M6 21v-3a6 6 0 0 1 12 0v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>);}
function CoachIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M4 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2z M12 14v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function LabIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M9 3v6l-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3 M9 3h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>);}
function InsightIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18 M7 14l4-4 3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>);}
function ShareIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75"/><circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.75"/><circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.75"/><path d="m8 11 8-4 M8 13l8 4" stroke="currentColor" strokeWidth="1.75"/></svg>);}
function SettingsIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75"/><path d="M19.4 15a1.7 1.7 0 0 0 .4 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.4 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .4-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.4-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.4h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.4 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" stroke="currentColor" strokeWidth="1.4"/></svg>);}
function UserIcon(p){return(<svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>);}
