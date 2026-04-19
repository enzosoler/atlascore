/**
 * Atlas iconography — clean line SVGs, stroke 1.75, currentColor.
 * Replaces emoji usage across the app. Every icon here is 20×20 viewBox
 * unless noted — size via `size` prop (default 18).
 *
 * Rule: emoji is banned as UI (see ARCHITECTURE.md "THE BRAND RULE").
 * Use these icons or `import { Flame, Leaf } from 'lucide-react'` for the
 * many Lucide icons not duplicated here.
 */
import React from 'react';

const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': true,
});
const s = {
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
};

/* ─── Training / fitness ────────────────────────────────────────────────── */
export const FlameIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M12 3c1.5 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 1 2 3 1 3-1 0-2-1-3 0-5z" />
  </svg>
);

export const DumbbellIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M6 9v6M4 10.5v3M10 6v12M18 9v6M20 10.5v3M14 6v12M10 12h4" />
  </svg>
);

export const MuscleIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M14 5a3 3 0 1 1 4 4l-3 3 2 4a3 3 0 0 1-5 2l-2-4H4l4-5V6a3 3 0 0 1 6 0z" />
  </svg>
);

export const ScaleIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="3" y="6" width="18" height="14" rx="2" />
    <path {...s} d="M12 10v6M9 13h6" />
  </svg>
);

export const BoltIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
  </svg>
);

/* ─── Nature / recovery / rest ──────────────────────────────────────────── */
export const LeafIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M4 20c0-8 6-14 16-14 0 9-6 14-14 14-1 0-2 0-2 0zM4 20l8-8" />
  </svg>
);

export const MoonIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const SunIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="4" />
    <path {...s} d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
  </svg>
);

export const SparkleIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" />
  </svg>
);

/* ─── Data / charts ─────────────────────────────────────────────────────── */
export const TrendUpIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M3 17l6-6 4 4 8-8M15 7h6v6" />
  </svg>
);

export const TrendDownIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M3 7l6 6 4-4 8 8M15 17h6v-6" />
  </svg>
);

export const PulseIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M3 12h4l2 6 4-12 2 6h6" />
  </svg>
);

export const ChartIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="3" y="14" width="4" height="7" rx="1" />
    <rect {...s} x="10" y="9" width="4" height="12" rx="1" />
    <rect {...s} x="17" y="4" width="4" height="17" rx="1" />
  </svg>
);

export const TargetIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="9" />
    <circle {...s} cx="12" cy="12" r="5" />
    <circle {...s} cx="12" cy="12" r="1.5" />
  </svg>
);

/* ─── Meals / nutrition ─────────────────────────────────────────────────── */
/** Breakfast — rising sun over a line (different from plain Sun icon). */
export const BreakfastIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="15" r="4" />
    <path {...s} d="M3 19h18M12 4v2M5.6 7.6l1.4 1.4M17 9l1.4-1.4" />
  </svg>
);

/** Lunch — bowl with spoon */
export const LunchIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M4 11h16a8 8 0 0 1-16 0zM8 11V8a2 2 0 0 1 2-2M18 5v4" />
  </svg>
);

/** Dinner — plate with fork + knife */
export const DinnerIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="8" />
    <path {...s} d="M8 7v4a2 2 0 0 0 2 2v5M16 7v10M14 7c0 2 1 3 2 3" />
  </svg>
);

/** Snack — apple shape */
export const SnackIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M12 7c-2-3-6-2-6 2 0 5 4 11 6 11s6-6 6-11c0-4-4-5-6-2zM12 7V3M12 3c1-1 2-1 3 0" />
  </svg>
);

export const UtensilsIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M8 3v7a2 2 0 0 0 2 2v9M6 3v5a2 2 0 0 0 2 2M10 3v5a2 2 0 0 1-2 2M16 3c0 4 3 6 3 11v7" />
  </svg>
);

export const WaterIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M12 3c4 6 6 9 6 13a6 6 0 0 1-12 0c0-4 2-7 6-13z" />
  </svg>
);

/* ─── Notifications / alerts ─────────────────────────────────────────────── */
/** Bell — notifications inbox. */
export const BellIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 8H4c0-2 2-3 2-8zM10 20a2 2 0 0 0 4 0" />
  </svg>
);

/** Settings — gear / cog. */
export const SettingsIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="3" />
    <path {...s} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

/** Receipt — billing / invoice. */
export const ReceiptIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM8 8h8M8 12h8M8 16h5" />
  </svg>
);

/** Info — neutral system notification. */
export const InfoIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="9" />
    <path {...s} d="M12 8v.01M11 12h1v5h1" />
  </svg>
);

/* ─── Navigation / actions ───────────────────────────────────────────────── */
export const ChevronLeftIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M15 6l-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M9 6l6 6-6 6" />
  </svg>
);

export const CalendarIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="3" y="5" width="18" height="16" rx="2" />
    <path {...s} d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const PlusIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M5 12h14" />
  </svg>
);

export const CheckIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M4 12l5 5L20 6" />
  </svg>
);

export const XIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const TrashIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M4 7h16M10 7V4h4v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M10 11v7M14 11v7" />
  </svg>
);

export const CopyIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="8" y="8" width="12" height="12" rx="2" />
    <path {...s} d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
  </svg>
);

export const EditIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M4 20h4l10-10-4-4L4 16v4zM13.5 6.5l4 4" />
  </svg>
);

export const UndoIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M9 14l-5-5 5-5M4 9h10a6 6 0 0 1 0 12h-3" />
  </svg>
);

/* ─── Mood (Apple-style SF Symbol feel, not emoji) ─────────────────────── */
export const MoodGreatIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="9" />
    <path {...s} d="M8 10v.01M16 10v.01M7 14c1.5 2 3.3 3 5 3s3.5-1 5-3" />
  </svg>
);
export const MoodGoodIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="9" />
    <path {...s} d="M8 10v.01M16 10v.01M8 15c1 1 2.3 1.5 4 1.5s3-.5 4-1.5" />
  </svg>
);
export const MoodOkIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="9" />
    <path {...s} d="M8 10v.01M16 10v.01M8 15h8" />
  </svg>
);
export const MoodLowIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="9" />
    <path {...s} d="M8 10v.01M16 10v.01M8 16c1-1.5 2.3-2 4-2s3 .5 4 2" />
  </svg>
);

/* ─── Chairs / activity levels ──────────────────────────────────────────── */
export const ChairIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M6 11V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6M6 11h12M7 11v10M17 11v10M5 15h14" />
  </svg>
);
export const WalkIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="13" cy="4" r="2" />
    <path {...s} d="M10 21l3-8 4 3M10 13l-4-2 3-5 4 1M7 21l3-8" />
  </svg>
);
export const RunIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="16" cy="4" r="2" />
    <path {...s} d="M10 21l3-6-4-4 5-5 4 5M5 12l4 2 3-3M14 15l2 6" />
  </svg>
);
export const TrophyIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M8 3h8v6a4 4 0 0 1-8 0zM6 6H4a2 2 0 0 0 2 2M18 6h2a2 2 0 0 1-2 2M10 15h4M9 21h6M12 15v6" />
  </svg>
);
export const BalanceIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M12 3v18M4 9h16M4 9l3 7h-6zM20 9l3 7h-6z" />
  </svg>
);

/* ─── Yoga / maintain (lotus-ish) ───────────────────────────────────────── */
export const ZenIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="6" r="2" />
    <path {...s} d="M6 20c0-4 3-8 6-8s6 4 6 8M3 15c3 0 5 1 6 3M21 15c-3 0-5 1-6 3" />
  </svg>
);

/* ─── Media / meta ──────────────────────────────────────────────────────── */
export const CameraIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="3" y="6" width="18" height="14" rx="2.5" />
    <circle {...s} cx="12" cy="13" r="3.5" />
    <path {...s} d="M8 6l1.5-2h5L16 6" />
  </svg>
);
export const MicIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="9" y="3" width="6" height="12" rx="3" />
    <path {...s} d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);
export const BarcodeIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M4 6v12M7 6v12M10 6v12M13 6v12M16 6v12M19 6v12" />
  </svg>
);
export const RobotIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="5" y="7" width="14" height="12" rx="3" />
    <circle {...s} cx="9" cy="13" r="1" />
    <circle {...s} cx="15" cy="13" r="1" />
    <path {...s} d="M12 3v4M8 19v2M16 19v2" />
  </svg>
);

/* ─── Muscle groups ─────────────────────────────────────────────────────── */
/** Chest — two shield-shaped pecs meeting at the sternum. */
export const ChestIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    {/* Left pec */}
    <path {...s} d="M12 5H9a5 5 0 0 0-5 5c0 4 3 7 6 7 1.1 0 2-.9 2-2V5z" />
    {/* Right pec */}
    <path {...s} d="M12 5h3a5 5 0 0 1 5 5c0 4-3 7-6 7-1.1 0-2-.9-2-2V5z" />
  </svg>
);

/** Back — flared lat silhouette. */
export const BackIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M8 4c-1 1-1.5 2-1.5 3 0 2 1 3 3 4-.5 2-2 3-4 5-1 1-2 2-2 5" />
    <path {...s} d="M16 4c1 1 1.5 2 1.5 3 0 2-1 3-3 4 .5 2 2 3 4 5 1 1 2 2 2 5" />
    <path {...s} d="M8 4h8" />
  </svg>
);

/** Shoulders (delts) — three rounded caps. */
export const ShouldersIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M3 12a4 4 0 0 1 8 0" />
    <path {...s} d="M13 12a4 4 0 0 1 8 0" />
    <path {...s} d="M8 12a4 4 0 0 1 8 0" />
  </svg>
);

/** Arms — flexed biceps. */
export const ArmsIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M4 19c4-1 7-4 6.5-9C10 7 11.5 4.5 14.5 4.5S19 6.5 18.5 9.5C18 12.5 15 15 11 15" />
  </svg>
);

/** Legs (quads) — thigh shape. */
export const LegsIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M8 3h8" />
    <path {...s} d="M8.5 3c.4 4 1.2 9 2 14 .2 1.5 1 3 1.5 3s1.3-1.5 1.5-3c.8-5 1.6-10 2-14" />
    <path {...s} d="M9 12c1.5-.5 4.5-.5 6 0" />
  </svg>
);

/** Glutes — two rounded globes. */
export const GlutesIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M5 12c0-4 3-6 7-6s7 2 7 6c0 4-3 7-7 7s-7-3-7-7z" />
    <path {...s} d="M12 6v13" />
  </svg>
);

/** Core / abs — six-pack grid. */
export const CoreIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="7" y="4" width="10" height="16" rx="2" />
    <path {...s} d="M7 9h10M7 14h10M12 4v16" />
  </svg>
);

/** Cardio — heart. */
export const CardioIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M20.8 8.6C20.8 12.2 16 16 12 20c-4-4-8.8-7.8-8.8-11.4C3.2 5.4 5.8 3.4 8.3 3.4c1.5 0 3 .8 3.7 2.2.7-1.4 2.2-2.2 3.7-2.2 2.5 0 5.1 2 5.1 5.2z" />
  </svg>
);

/** Ruler — measuring tape, tick marks. Used for circumference/measurements. */
export const RulerIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="2" y="9" width="20" height="6" rx="1.5" />
    <path {...s} d="M6 9v3M10 9v2M14 9v3M18 9v2" />
  </svg>
);

/** Neck — throat silhouette. */
export const NeckIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M8 4c0 3 0 5-2 7 1 1 4 1 6 1s5 0 6-1c-2-2-2-4-2-7" />
    <path {...s} d="M7 13c-1 2-3 4-3 7M17 13c1 2 3 4 3 7" />
  </svg>
);

/** Waist — hourglass pinch. */
export const WaistIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M7 4c1 3 1 5 0 8 1 3 1 5 0 8M17 4c-1 3-1 5 0 8-1 3-1 5 0 8" />
    <path {...s} d="M6 12h12" />
  </svg>
);

/** Hips — wider pelvis shape. */
export const HipsIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M4 8c2 4 2 8 0 12M20 8c-2 4-2 8 0 12" />
    <path {...s} d="M4 8h16" />
  </svg>
);

/** Share — arrow out of a box. */
export const ShareIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </svg>
);

/** Compare — two overlapping squares, split view metaphor. */
export const CompareIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="3" y="5" width="8" height="14" rx="1.5" />
    <rect {...s} x="13" y="5" width="8" height="14" rx="1.5" />
    <path {...s} d="M12 3v18" />
  </svg>
);

/* ─── Social ────────────────────────────────────────────────────────────── */

/** Users — two overlapping people (friends list, social). */
export const UsersIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="9" cy="8" r="3.5" />
    <path {...s} d="M3 20c0-3 3-5 6-5s6 2 6 5" />
    <circle {...s} cx="17" cy="9" r="2.8" />
    <path {...s} d="M15 15c3 0 6 2 6 5" />
  </svg>
);

/** User plus — add friend. */
export const UserPlusIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="10" cy="8" r="3.5" />
    <path {...s} d="M3 20c0-3 3-5 7-5s7 2 7 5" />
    <path {...s} d="M19 4v6M22 7h-6" />
  </svg>
);

/** User check — accepted / friend. */
export const UserCheckIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="10" cy="8" r="3.5" />
    <path {...s} d="M3 20c0-3 3-5 7-5s7 2 7 5" />
    <path {...s} d="M17 7l2 2 4-4" />
  </svg>
);

/** Message bubble — comments / DMs. */
export const MessageIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
  </svg>
);

/** Heart — like. */
export const HeartIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M20.8 8.6C20.8 12.2 16 16 12 20c-4-4-8.8-7.8-8.8-11.4C3.2 5.4 5.8 3.4 8.3 3.4c1.5 0 3 .8 3.7 2.2.7-1.4 2.2-2.2 3.7-2.2 2.5 0 5.1 2 5.1 5.2z" />
  </svg>
);

/** Globe — public visibility. */
export const GlobeIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="12" cy="12" r="9" />
    <path {...s} d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </svg>
);

/** Lock — private / only me. */
export const LockIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect {...s} x="4" y="10" width="16" height="11" rx="2" />
    <path {...s} d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

/** Search — magnifier. */
export const SearchIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle {...s} cx="11" cy="11" r="7" />
    <path {...s} d="M20 20l-4-4" />
  </svg>
);

/** Calves — teardrop shape. */
export const CalvesIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path {...s} d="M12 3c-3 3-4 7-4 11 0 3 1 6 2 6M12 3c3 3 4 7 4 11 0 3-1 6-2 6" />
    <path {...s} d="M10 20h4" />
  </svg>
);

/**
 * Resolve a muscle group label to the right icon.
 * Accepts the group names used in the exercise catalog (Chest, Back, Shoulders,
 * Arms, Legs, Glutes, Core, Cardio) plus finer aliases (Biceps, Triceps,
 * Quads, Hamstrings, Calves, Abs).
 */
export function MuscleGroupIcon({ muscle, size = 18 }) {
  switch (muscle) {
    case 'Chest':     return <ChestIcon size={size} />;
    case 'Back':      return <BackIcon size={size} />;
    case 'Shoulders':
    case 'Delts':     return <ShouldersIcon size={size} />;
    case 'Arms':
    case 'Biceps':
    case 'Triceps':   return <ArmsIcon size={size} />;
    case 'Legs':
    case 'Quads':
    case 'Hamstrings':return <LegsIcon size={size} />;
    case 'Calves':    return <CalvesIcon size={size} />;
    case 'Glutes':    return <GlutesIcon size={size} />;
    case 'Core':
    case 'Abs':       return <CoreIcon size={size} />;
    case 'Cardio':    return <CardioIcon size={size} />;
    default:          return <MuscleIcon size={size} />;
  }
}
