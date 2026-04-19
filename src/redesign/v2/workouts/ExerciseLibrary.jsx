/**
 * ExerciseLibrary — searchable catalogue of exercises.
 * Ref: Jefit library + Hevy exercise picker + Fitbod exercise detail.
 *
 * Rules applied:
 *  - ZERO emojis — brand rule. Instead each card has a clean SVG **muscle-group
 *    icon** (chest, back, delts, arms, legs, glutes, core, cardio, calves) tinted
 *    to its group, plus a colored equipment chip pinned to the bottom.
 *  - Large catalog (130+) with real variations: Pendulum squat, Hack squat,
 *    Smith variations, Cable crossover positions, Meadows row, Zercher squat,
 *    etc. Enzo specifically asked for variation depth.
 *  - Multi-signal search: name, aliases (PT + EN), muscles, equipment. "agachamento"
 *    matches all squat variants. "free weight" matches free-weight ones only.
 *
 * This screen works standalone (/app/exercises) AND as a modal picker inside
 * ManualWorkoutPlan — both paths use the same component.
 */
import React, { useMemo, useState } from 'react';
import { SafeScreen, SpringReveal } from '../lib/glass';
import { MuscleGroupIcon } from '../lib/icons';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Core', 'Cardio'];
const EQUIPMENT_FILTERS = ['Any', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Smith', 'Bodyweight'];

export const EQUIPMENT_COLORS = {
  'Barbell':    { bg: 'rgba(0,255,255,0.08)',   bd: 'rgba(0,255,255,0.22)',   c: 'hsl(var(--rd-accent))' },
  'Dumbbell':   { bg: 'rgba(139,92,246,0.08)',  bd: 'rgba(139,92,246,0.22)',  c: '#A78BFA' },
  'Cable':      { bg: 'rgba(251,191,36,0.08)',  bd: 'rgba(251,191,36,0.22)',  c: '#FBBF24' },
  'Machine':    { bg: 'rgba(52,211,153,0.08)',  bd: 'rgba(52,211,153,0.22)',  c: '#34D399' },
  'Smith':      { bg: 'rgba(96,165,250,0.08)',  bd: 'rgba(96,165,250,0.22)',  c: '#60A5FA' },
  'Bodyweight': { bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.14)', c: 'hsl(var(--rd-fg-secondary))' },
  'Kettlebell': { bg: 'rgba(201,169,106,0.08)', bd: 'rgba(201,169,106,0.22)', c: 'hsl(var(--rd-premium))' },
  'Bar':        { bg: 'rgba(0,255,255,0.05)',   bd: 'rgba(0,255,255,0.18)',   c: 'hsl(var(--rd-accent))' },
  'Bands':      { bg: 'rgba(251,113,133,0.08)', bd: 'rgba(251,113,133,0.22)', c: '#FB7185' },
  'EZ bar':     { bg: 'rgba(0,255,255,0.06)',   bd: 'rgba(0,255,255,0.20)',   c: 'hsl(var(--rd-accent))' },
  'Bench':      { bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.14)', c: 'hsl(var(--rd-fg-secondary))' },
};

/** Tint per primary muscle group — icon tile color on each card. */
export const MUSCLE_COLORS = {
  'Chest':     { bg: 'rgba(0,255,255,0.10)',   bd: 'rgba(0,255,255,0.26)',   c: 'hsl(var(--rd-accent))' },
  'Back':      { bg: 'rgba(139,92,246,0.10)',  bd: 'rgba(139,92,246,0.26)',  c: '#A78BFA' },
  'Shoulders': { bg: 'rgba(251,191,36,0.10)',  bd: 'rgba(251,191,36,0.26)',  c: '#FBBF24' },
  'Arms':      { bg: 'rgba(251,113,133,0.10)', bd: 'rgba(251,113,133,0.26)', c: '#FB7185' },
  'Legs':      { bg: 'rgba(52,211,153,0.10)',  bd: 'rgba(52,211,153,0.26)',  c: '#34D399' },
  'Glutes':    { bg: 'rgba(192,132,252,0.10)', bd: 'rgba(192,132,252,0.26)', c: '#C084FC' },
  'Core':      { bg: 'rgba(96,165,250,0.10)',  bd: 'rgba(96,165,250,0.26)',  c: '#60A5FA' },
  'Cardio':    { bg: 'rgba(248,113,113,0.10)', bd: 'rgba(248,113,113,0.26)', c: '#F87171' },
};
export const FALLBACK_MUSCLE_COLOR = { bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.14)', c: 'hsl(var(--rd-fg-secondary))' };

export const DEMO_EXERCISES = [
  // ── Chest ──────────────────────────────────────────────────────────────
  { id: 'ch1',  name: 'Barbell bench press',          muscles: ['Chest', 'Triceps'],     equipment: 'Barbell',    aliases: ['supino reto', 'bench'] },
  { id: 'ch2',  name: 'Incline barbell bench press',  muscles: ['Chest'],                 equipment: 'Barbell',    aliases: ['supino inclinado'] },
  { id: 'ch3',  name: 'Decline barbell bench press',  muscles: ['Chest'],                 equipment: 'Barbell',    aliases: ['supino declinado'] },
  { id: 'ch4',  name: 'Close-grip bench press',       muscles: ['Chest', 'Triceps'],     equipment: 'Barbell',    aliases: ['supino fechado'] },
  { id: 'ch5',  name: 'Flat dumbbell press',          muscles: ['Chest'],                 equipment: 'Dumbbell',   aliases: ['supino reto com halteres'] },
  { id: 'ch6',  name: 'Incline dumbbell press',       muscles: ['Chest'],                 equipment: 'Dumbbell',   aliases: ['supino inclinado com halteres'] },
  { id: 'ch7',  name: 'Decline dumbbell press',       muscles: ['Chest'],                 equipment: 'Dumbbell',   aliases: [] },
  { id: 'ch8',  name: 'Dumbbell fly',                 muscles: ['Chest'],                 equipment: 'Dumbbell',   aliases: ['crucifixo reto'] },
  { id: 'ch9',  name: 'Incline dumbbell fly',         muscles: ['Chest'],                 equipment: 'Dumbbell',   aliases: ['crucifixo inclinado'] },
  { id: 'ch10', name: 'Cable fly (high to low)',      muscles: ['Chest'],                 equipment: 'Cable',      aliases: ['crossover alto'] },
  { id: 'ch11', name: 'Cable fly (low to high)',      muscles: ['Chest'],                 equipment: 'Cable',      aliases: ['crossover baixo'] },
  { id: 'ch12', name: 'Cable fly (mid)',              muscles: ['Chest'],                 equipment: 'Cable',      aliases: ['crossover', 'crucifixo na polia altura dos ombros', 'crucifixo polia'] },
  { id: 'ch13', name: 'Pec deck',                     muscles: ['Chest'],                 equipment: 'Machine',    aliases: ['peck deck', 'voador'] },
  { id: 'ch14', name: 'Machine chest press',          muscles: ['Chest'],                 equipment: 'Machine',    aliases: ['supino máquina'] },
  { id: 'ch15', name: 'Smith machine bench press',    muscles: ['Chest'],                 equipment: 'Smith',      aliases: ['supino smith', 'supino reto no smith', 'supino reto smith'] },
  { id: 'ch16', name: 'Incline Smith press',          muscles: ['Chest'],                 equipment: 'Smith',      aliases: ['supino inclinado smith'] },
  { id: 'ch17', name: 'Push-up',                      muscles: ['Chest', 'Core'],         equipment: 'Bodyweight', aliases: ['flexão'] },
  { id: 'ch18', name: 'Incline push-up',              muscles: ['Chest'],                 equipment: 'Bodyweight', aliases: [] },
  { id: 'ch19', name: 'Decline push-up',              muscles: ['Chest'],                 equipment: 'Bodyweight', aliases: [] },
  { id: 'ch20', name: 'Chest dip',                    muscles: ['Chest', 'Triceps'],     equipment: 'Bodyweight', aliases: ['paralelas'] },
  { id: 'ch21', name: 'Incline machine fly',          muscles: ['Chest'],                 equipment: 'Machine',    aliases: ['crucifixo inclinado máquina', 'peck deck inclinado', 'voador inclinado'] },
  { id: 'ch22', name: 'Machine fly (flat)',           muscles: ['Chest'],                 equipment: 'Machine',    aliases: ['crucifixo máquina', 'peck deck reto'] },

  // ── Back ───────────────────────────────────────────────────────────────
  { id: 'b1',  name: 'Pull-up (overhand)',            muscles: ['Back', 'Biceps'],        equipment: 'Bar',        aliases: ['barra fixa pronada'] },
  { id: 'b2',  name: 'Chin-up (underhand)',           muscles: ['Back', 'Biceps'],        equipment: 'Bar',        aliases: ['barra fixa supinada'] },
  { id: 'b3',  name: 'Neutral grip pull-up',          muscles: ['Back'],                  equipment: 'Bar',        aliases: ['barra fixa pegada neutra'] },
  { id: 'b4',  name: 'Weighted pull-up',              muscles: ['Back'],                  equipment: 'Bar',        aliases: [] },
  { id: 'b5',  name: 'Lat pulldown (wide)',           muscles: ['Back'],                  equipment: 'Cable',      aliases: ['puxada aberta'] },
  { id: 'b6',  name: 'Lat pulldown (close, neutral)', muscles: ['Back'],                  equipment: 'Cable',      aliases: ['puxada neutra', 'pulldown pegada neutra', 'pulldown neutra'] },
  { id: 'b7',  name: 'Reverse-grip lat pulldown',     muscles: ['Back', 'Biceps'],        equipment: 'Cable',      aliases: ['puxada supinada'] },
  { id: 'b8',  name: 'Straight-arm pulldown',         muscles: ['Back'],                  equipment: 'Cable',      aliases: ['pullover polia'] },
  { id: 'b9',  name: 'Barbell row (pronated)',        muscles: ['Back'],                  equipment: 'Barbell',    aliases: ['remada curvada'] },
  { id: 'b10', name: 'Pendlay row',                   muscles: ['Back'],                  equipment: 'Barbell',    aliases: [] },
  { id: 'b11', name: 'Yates row (underhand)',         muscles: ['Back'],                  equipment: 'Barbell',    aliases: ['remada supinada'] },
  { id: 'b12', name: 'T-bar row',                     muscles: ['Back'],                  equipment: 'Machine',    aliases: ['remada T'] },
  { id: 'b13', name: 'Chest-supported row',           muscles: ['Back'],                  equipment: 'Machine',    aliases: ['remada peito apoiado'] },
  { id: 'b14', name: 'Seated cable row',              muscles: ['Back'],                  equipment: 'Cable',      aliases: ['remada baixa'] },
  { id: 'b15', name: 'Single-arm cable row',          muscles: ['Back'],                  equipment: 'Cable',      aliases: ['remada unilateral'] },
  { id: 'b16', name: 'Dumbbell row',                  muscles: ['Back'],                  equipment: 'Dumbbell',   aliases: ['remada serrote'] },
  { id: 'b17', name: 'Meadows row',                   muscles: ['Back'],                  equipment: 'Barbell',    aliases: [] },
  { id: 'b18', name: 'Kroc row',                      muscles: ['Back'],                  equipment: 'Dumbbell',   aliases: [] },
  { id: 'b19', name: 'Machine row',                   muscles: ['Back'],                  equipment: 'Machine',    aliases: ['remada máquina', 'remada máquina pegada neutra', 'remada máquina neutra'] },
  { id: 'b20', name: 'Cable pullover',                muscles: ['Back'],                  equipment: 'Cable',      aliases: ['pullover na polia', 'pullover polia', 'pullover cabo'] },
  { id: 'b21', name: 'Shrug (barbell)',               muscles: ['Back'],                  equipment: 'Barbell',    aliases: ['encolhimento'] },
  { id: 'b22', name: 'Shrug (dumbbell)',              muscles: ['Back'],                  equipment: 'Dumbbell',   aliases: [] },
  { id: 'b23', name: 'Chest-supported T-bar row',     muscles: ['Back'],                  equipment: 'Machine',    aliases: ['remada cavalinho com apoio de peito', 'remada cavalinho', 'cavalinho peito apoiado'] },

  // ── Shoulders ──────────────────────────────────────────────────────────
  { id: 's1',  name: 'Overhead press (standing)',     muscles: ['Shoulders'],             equipment: 'Barbell',    aliases: ['desenvolvimento militar', 'ohp'] },
  { id: 's2',  name: 'Seated barbell press',          muscles: ['Shoulders'],             equipment: 'Barbell',    aliases: [] },
  { id: 's3',  name: 'Seated dumbbell press',         muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: ['desenvolvimento com halteres'] },
  { id: 's4',  name: 'Arnold press',                  muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: [] },
  { id: 's5',  name: 'Smith machine overhead press',  muscles: ['Shoulders'],             equipment: 'Smith',      aliases: ['desenvolvimento smith', 'desenvolvimento no smith'] },
  { id: 's6',  name: 'Machine shoulder press',        muscles: ['Shoulders'],             equipment: 'Machine',    aliases: [] },
  { id: 's7',  name: 'Lateral raise (dumbbell)',      muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: ['elevação lateral'] },
  { id: 's8',  name: 'Cable lateral raise',           muscles: ['Shoulders'],             equipment: 'Cable',      aliases: ['elevação lateral polia', 'elevação lateral cabo'] },
  { id: 's9',  name: 'Machine lateral raise',         muscles: ['Shoulders'],             equipment: 'Machine',    aliases: [] },
  { id: 's10', name: 'Front raise (dumbbell)',        muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: ['elevação frontal'] },
  { id: 's11', name: 'Cable front raise',             muscles: ['Shoulders'],             equipment: 'Cable',      aliases: [] },
  { id: 's12', name: 'Rear delt fly (dumbbell)',      muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: ['crucifixo invertido'] },
  { id: 's13', name: 'Reverse pec deck',              muscles: ['Shoulders'],             equipment: 'Machine',    aliases: ['crucifixo invertido na máquina', 'voador invertido', 'peck deck invertido'] },
  { id: 's14', name: 'Face pull',                     muscles: ['Shoulders', 'Back'],     equipment: 'Cable',      aliases: [] },
  { id: 's15', name: 'Upright row',                   muscles: ['Shoulders'],             equipment: 'Barbell',    aliases: ['remada alta'] },
  { id: 's16', name: 'Cable upright row',             muscles: ['Shoulders'],             equipment: 'Cable',      aliases: [] },
  { id: 's17', name: 'Single-arm cable lateral raise',muscles: ['Shoulders'],             equipment: 'Cable',      aliases: ['elevação lateral polia unilateral', 'elevação lateral cabo cruzado', 'cabo cruzado lateral'] },

  // ── Arms (biceps + triceps) ────────────────────────────────────────────
  { id: 'a1',  name: 'Barbell curl',                  muscles: ['Arms'],                  equipment: 'Barbell',    aliases: ['rosca direta'] },
  { id: 'a2',  name: 'EZ bar curl',                   muscles: ['Arms'],                  equipment: 'EZ bar',     aliases: ['rosca W', 'rosca direta com barra W', 'rosca direta W', 'rosca barra W'] },
  { id: 'a3',  name: 'Dumbbell curl (alternating)',   muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['rosca alternada'] },
  { id: 'a4',  name: 'Hammer curl',                   muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['rosca martelo'] },
  { id: 'a5',  name: 'Preacher curl',                 muscles: ['Arms'],                  equipment: 'EZ bar',     aliases: ['rosca scott'] },
  { id: 'a6',  name: 'Incline dumbbell curl',         muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['rosca inclinada', 'rosca inclinada no banco'] },
  { id: 'a7',  name: 'Spider curl',                   muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: [] },
  { id: 'a8',  name: 'Concentration curl',            muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['rosca concentrada'] },
  { id: 'a9',  name: 'Cable curl (straight bar)',     muscles: ['Arms'],                  equipment: 'Cable',      aliases: [] },
  { id: 'a10', name: 'Cable curl (rope)',             muscles: ['Arms'],                  equipment: 'Cable',      aliases: [] },
  { id: 'a11', name: 'Machine preacher curl',         muscles: ['Arms'],                  equipment: 'Machine',    aliases: ['rosca scott na máquina', 'scott máquina'] },
  { id: 'a12', name: 'Triceps pushdown (rope)',       muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['tríceps pulley corda', 'tríceps na polia com corda', 'tríceps polia corda'] },
  { id: 'a13', name: 'Triceps pushdown (bar)',        muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['tríceps pulley'] },
  { id: 'a14', name: 'Overhead cable extension',      muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['tríceps francês cabo', 'tríceps polia alta com corda overhead', 'tríceps polia overhead', 'tríceps corda overhead'] },
  { id: 'a15', name: 'Skullcrusher',                  muscles: ['Arms'],                  equipment: 'EZ bar',     aliases: ['tríceps testa'] },
  { id: 'a16', name: 'Dumbbell overhead extension',   muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['tríceps francês', 'tríceps francês com halter', 'francês halter'] },
  { id: 'a17', name: 'Dumbbell kickback',             muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['tríceps coice'] },
  { id: 'a18', name: 'Tricep dip',                    muscles: ['Arms'],                  equipment: 'Bodyweight', aliases: [] },
  { id: 'a19', name: 'Machine tricep extension',      muscles: ['Arms'],                  equipment: 'Machine',    aliases: [] },
  { id: 'a20', name: 'Wrist curl',                    muscles: ['Arms'],                  equipment: 'Barbell',    aliases: ['rosca punho'] },
  { id: 'a21', name: 'Cable tricep kickback',         muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['tríceps coice na polia', 'tríceps coice cabo', 'kickback polia'] },

  // ── Legs (quad-dominant) ────────────────────────────────────────────────
  { id: 'l1',  name: 'Back squat (high-bar)',         muscles: ['Legs', 'Glutes'],        equipment: 'Barbell',    aliases: ['agachamento livre alta'] },
  { id: 'l2',  name: 'Back squat (low-bar)',          muscles: ['Legs', 'Glutes'],        equipment: 'Barbell',    aliases: ['agachamento livre baixa'] },
  { id: 'l3',  name: 'Front squat',                   muscles: ['Legs'],                  equipment: 'Barbell',    aliases: ['agachamento frontal'] },
  { id: 'l4',  name: 'Zercher squat',                 muscles: ['Legs', 'Core'],          equipment: 'Barbell',    aliases: [] },
  { id: 'l5',  name: 'Goblet squat',                  muscles: ['Legs', 'Glutes'],        equipment: 'Dumbbell',   aliases: ['agachamento goblet'] },
  { id: 'l6',  name: 'Pendulum squat',                muscles: ['Legs', 'Glutes'],        equipment: 'Machine',    aliases: ['agachamento pêndulo', 'pendulum'] },
  { id: 'l7',  name: 'Hack squat (machine)',          muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['agachamento hack'] },
  { id: 'l8',  name: 'Smith machine squat',           muscles: ['Legs'],                  equipment: 'Smith',      aliases: ['agachamento smith'] },
  { id: 'l9',  name: 'Box squat',                     muscles: ['Legs', 'Glutes'],        equipment: 'Barbell',    aliases: ['agachamento no caixote'] },
  { id: 'l10', name: 'Bulgarian split squat',         muscles: ['Legs', 'Glutes'],        equipment: 'Dumbbell',   aliases: ['búlgaro'] },
  { id: 'l11', name: 'Split squat (static)',          muscles: ['Legs'],                  equipment: 'Dumbbell',   aliases: ['afundo parado'] },
  { id: 'l12', name: 'Walking lunge',                 muscles: ['Legs', 'Glutes'],        equipment: 'Dumbbell',   aliases: ['afundo andando'] },
  { id: 'l13', name: 'Reverse lunge',                 muscles: ['Legs', 'Glutes'],        equipment: 'Dumbbell',   aliases: ['afundo reverso'] },
  { id: 'l14', name: 'Step-up',                       muscles: ['Legs', 'Glutes'],        equipment: 'Dumbbell',   aliases: ['subida no banco'] },
  { id: 'l15', name: 'Leg press (45°)',               muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['leg press 45'] },
  { id: 'l16', name: 'Horizontal leg press',          muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['leg press horizontal'] },
  { id: 'l17', name: 'Leg extension',                 muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['cadeira extensora'] },
  { id: 'l17b',name: 'Single-leg leg extension',      muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['cadeira extensora unilateral', 'extensora unilateral'] },
  { id: 'l18', name: 'Sissy squat',                   muscles: ['Legs'],                  equipment: 'Bodyweight', aliases: [] },
  { id: 'l19', name: 'Belt squat',                    muscles: ['Legs', 'Glutes'],        equipment: 'Machine',    aliases: [] },

  // ── Legs (hip/hamstring-dominant) ──────────────────────────────────────
  { id: 'l20', name: 'Conventional deadlift',         muscles: ['Back', 'Legs', 'Glutes'],equipment: 'Barbell',    aliases: ['levantamento terra'] },
  { id: 'l21', name: 'Sumo deadlift',                 muscles: ['Legs', 'Glutes', 'Back'],equipment: 'Barbell',    aliases: ['terra sumo'] },
  { id: 'l22', name: 'Romanian deadlift',             muscles: ['Legs', 'Glutes'],        equipment: 'Barbell',    aliases: ['stiff romeno', 'rdl'] },
  { id: 'l23', name: 'Stiff-leg deadlift',            muscles: ['Legs', 'Glutes'],        equipment: 'Barbell',    aliases: ['stiff'] },
  { id: 'l24', name: 'Trap bar deadlift',             muscles: ['Legs', 'Back'],          equipment: 'Barbell',    aliases: ['terra trap'] },
  { id: 'l25', name: 'Rack pull',                     muscles: ['Back', 'Legs'],          equipment: 'Barbell',    aliases: [] },
  { id: 'l26', name: 'Deficit deadlift',              muscles: ['Back', 'Legs'],          equipment: 'Barbell',    aliases: [] },
  { id: 'l27', name: 'Single-leg Romanian deadlift',  muscles: ['Legs', 'Glutes'],        equipment: 'Dumbbell',   aliases: [] },
  { id: 'l28', name: 'Good morning',                  muscles: ['Legs', 'Back'],          equipment: 'Barbell',    aliases: ['bom dia'] },
  { id: 'l29', name: 'Lying leg curl',                muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['cadeira flexora deitado', 'mesa flexora'] },
  { id: 'l29b',name: 'Single-leg lying leg curl',     muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['mesa flexora unilateral', 'flexora deitada unilateral'] },
  { id: 'l30', name: 'Seated leg curl',               muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['cadeira flexora sentado', 'cadeira flexora'] },
  { id: 'l31', name: 'Standing leg curl',             muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['flexora em pé', 'flexora unilateral em pé'] },
  { id: 'l32', name: 'Nordic curl',                   muscles: ['Legs'],                  equipment: 'Bodyweight', aliases: ['nórdico'] },

  // ── Calves ─────────────────────────────────────────────────────────────
  { id: 'l33', name: 'Standing calf raise (machine)', muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['panturrilha em pé'] },
  { id: 'l34', name: 'Seated calf raise',             muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['panturrilha sentado'] },
  { id: 'l35', name: 'Calf raise on leg press',       muscles: ['Legs'],                  equipment: 'Machine',    aliases: [] },
  { id: 'l36', name: 'Smith machine calf raise',      muscles: ['Legs'],                  equipment: 'Smith',      aliases: [] },
  { id: 'l37', name: 'Single-leg calf raise',         muscles: ['Legs'],                  equipment: 'Bodyweight', aliases: [] },

  // ── Glutes ─────────────────────────────────────────────────────────────
  { id: 'g1',  name: 'Hip thrust (barbell)',          muscles: ['Glutes'],                equipment: 'Barbell',    aliases: ['elevação pélvica'] },
  { id: 'g2',  name: 'Machine hip thrust',            muscles: ['Glutes'],                equipment: 'Machine',    aliases: ['hip thrust na máquina', 'hip thrust máquina'] },
  { id: 'g3',  name: 'Smith hip thrust',              muscles: ['Glutes'],                equipment: 'Smith',      aliases: [] },
  { id: 'g4',  name: 'Glute bridge',                  muscles: ['Glutes'],                equipment: 'Bodyweight', aliases: ['ponte'] },
  { id: 'g5',  name: 'Cable glute kickback',          muscles: ['Glutes'],                equipment: 'Cable',      aliases: [] },
  { id: 'g6',  name: 'Machine glute kickback',        muscles: ['Glutes'],                equipment: 'Machine',    aliases: [] },
  { id: 'g7',  name: 'Cable hip abduction',           muscles: ['Glutes'],                equipment: 'Cable',      aliases: [] },
  { id: 'g8',  name: 'Machine hip abduction',         muscles: ['Glutes'],                equipment: 'Machine',    aliases: ['abdutora'] },
  { id: 'g9',  name: 'Machine hip adduction',         muscles: ['Glutes', 'Legs'],        equipment: 'Machine',    aliases: ['adutora'] },

  // ── Core ───────────────────────────────────────────────────────────────
  { id: 'c1',  name: 'Plank',                         muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['prancha'] },
  { id: 'c2',  name: 'Side plank',                    muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['prancha lateral'] },
  { id: 'c3',  name: 'Hanging leg raise',             muscles: ['Core'],                  equipment: 'Bar',        aliases: [] },
  { id: 'c4',  name: 'Hanging knee raise',            muscles: ['Core'],                  equipment: 'Bar',        aliases: [] },
  { id: 'c5',  name: 'Cable crunch',                  muscles: ['Core'],                  equipment: 'Cable',      aliases: [] },
  { id: 'c6',  name: 'Machine crunch',                muscles: ['Core'],                  equipment: 'Machine',    aliases: [] },
  { id: 'c7',  name: 'Russian twist',                 muscles: ['Core'],                  equipment: 'Bodyweight', aliases: [] },
  { id: 'c8',  name: 'Ab wheel rollout',              muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['roda abdominal'] },
  { id: 'c9',  name: 'Dragon flag',                   muscles: ['Core'],                  equipment: 'Bodyweight', aliases: [] },
  { id: 'c10', name: 'Pallof press',                  muscles: ['Core'],                  equipment: 'Cable',      aliases: [] },
  { id: 'c11', name: 'Dead bug',                      muscles: ['Core'],                  equipment: 'Bodyweight', aliases: [] },
  { id: 'c12', name: 'Bird dog',                      muscles: ['Core'],                  equipment: 'Bodyweight', aliases: [] },
  { id: 'c13', name: 'Decline sit-up',                muscles: ['Core'],                  equipment: 'Bench',      aliases: ['abdominal declinado'] },

  // ── Cardio / conditioning ──────────────────────────────────────────────
  { id: 'cd1', name: 'Treadmill (steady)',            muscles: ['Cardio'],                equipment: 'Machine',    aliases: ['esteira'] },
  { id: 'cd2', name: 'Treadmill intervals',           muscles: ['Cardio'],                equipment: 'Machine',    aliases: ['hiit esteira'] },
  { id: 'cd3', name: 'Stationary bike',               muscles: ['Cardio', 'Legs'],        equipment: 'Machine',    aliases: ['bike ergométrica'] },
  { id: 'cd4', name: 'Assault bike',                  muscles: ['Cardio'],                equipment: 'Machine',    aliases: [] },
  { id: 'cd5', name: 'Rowing machine',                muscles: ['Cardio', 'Back'],        equipment: 'Machine',    aliases: ['remo ergômetro'] },
  { id: 'cd6', name: 'StairMaster',                   muscles: ['Cardio', 'Legs'],        equipment: 'Machine',    aliases: ['escada'] },
  { id: 'cd7', name: 'Jump rope',                     muscles: ['Cardio'],                equipment: 'Bands',      aliases: ['pular corda'] },
  { id: 'cd8', name: 'Sled push',                     muscles: ['Legs', 'Cardio'],        equipment: 'Machine',    aliases: [] },
  { id: 'cd9', name: 'Farmer carry',                  muscles: ['Core', 'Cardio'],        equipment: 'Dumbbell',   aliases: ['farmer walk'] },

  // ═══════════════════════════════════════════════════════════════════════
  // MVP expansion — unilateral variants, regional aliases, staples
  // ═══════════════════════════════════════════════════════════════════════

  // ── Chest (more) ───────────────────────────────────────────────────────
  { id: 'ch23', name: 'Decline Smith press',              muscles: ['Chest'],                 equipment: 'Smith',      aliases: ['supino declinado smith'] },
  { id: 'ch24', name: 'Landmine press',                   muscles: ['Chest', 'Shoulders'],    equipment: 'Barbell',    aliases: ['landmine', 'supino landmine'] },
  { id: 'ch25', name: 'Floor press (barbell)',            muscles: ['Chest', 'Triceps'],      equipment: 'Barbell',    aliases: ['supino no chão'] },
  { id: 'ch26', name: 'Floor press (dumbbell)',           muscles: ['Chest'],                 equipment: 'Dumbbell',   aliases: ['supino no chão halteres'] },
  { id: 'ch27', name: 'Svend press',                      muscles: ['Chest'],                 equipment: 'Barbell',    aliases: ['svend'] },
  { id: 'ch28', name: 'Dumbbell pullover',                muscles: ['Chest', 'Back'],         equipment: 'Dumbbell',   aliases: ['pullover halteres', 'pullover banco'] },
  { id: 'ch29', name: 'Single-arm dumbbell bench press',  muscles: ['Chest'],                 equipment: 'Dumbbell',   aliases: ['supino unilateral halter'] },
  { id: 'ch30', name: 'Single-arm machine chest press',   muscles: ['Chest'],                 equipment: 'Machine',    aliases: ['supino máquina unilateral'] },
  { id: 'ch31', name: 'Single-arm cable fly',             muscles: ['Chest'],                 equipment: 'Cable',      aliases: ['crucifixo cabo unilateral', 'crossover unilateral'] },
  { id: 'ch32', name: 'Single-arm pec deck',              muscles: ['Chest'],                 equipment: 'Machine',    aliases: ['pec deck unilateral', 'voador unilateral'] },
  { id: 'ch33', name: 'Reverse-grip bench press',         muscles: ['Chest'],                 equipment: 'Barbell',    aliases: ['supino pegada invertida', 'supino supinado'] },
  { id: 'ch34', name: 'Wide-grip bench press',            muscles: ['Chest'],                 equipment: 'Barbell',    aliases: ['supino pegada aberta'] },
  { id: 'ch35', name: 'Spoto press',                      muscles: ['Chest'],                 equipment: 'Barbell',    aliases: [] },
  { id: 'ch36', name: 'Diamond push-up',                  muscles: ['Chest', 'Triceps'],      equipment: 'Bodyweight', aliases: ['flexão diamante', 'flexão tríceps'] },
  { id: 'ch37', name: 'Wide-grip push-up',                muscles: ['Chest'],                 equipment: 'Bodyweight', aliases: ['flexão aberta'] },
  { id: 'ch38', name: 'Archer push-up',                   muscles: ['Chest'],                 equipment: 'Bodyweight', aliases: ['flexão arqueiro'] },
  { id: 'ch39', name: 'Clap push-up',                     muscles: ['Chest', 'Cardio'],       equipment: 'Bodyweight', aliases: ['flexão com palma', 'flexão pliométrica'] },
  { id: 'ch40', name: 'Weighted push-up',                 muscles: ['Chest'],                 equipment: 'Bodyweight', aliases: ['flexão com carga'] },
  { id: 'ch41', name: 'Deficit push-up',                  muscles: ['Chest'],                 equipment: 'Bodyweight', aliases: ['flexão com déficit'] },
  { id: 'ch42', name: 'Assisted dip (machine)',           muscles: ['Chest', 'Triceps'],      equipment: 'Machine',    aliases: ['paralelas assistida', 'mergulho assistido'] },
  { id: 'ch43', name: 'Weighted dip',                     muscles: ['Chest', 'Triceps'],      equipment: 'Bodyweight', aliases: ['paralelas com carga'] },

  // ── Back (more) ────────────────────────────────────────────────────────
  { id: 'b24', name: 'Assisted pull-up (machine)',        muscles: ['Back'],                  equipment: 'Machine',    aliases: ['barra fixa assistida', 'pull-up assistida'] },
  { id: 'b25', name: 'Band-assisted pull-up',             muscles: ['Back'],                  equipment: 'Bands',      aliases: ['barra fixa com elástico'] },
  { id: 'b26', name: 'Inverted row',                      muscles: ['Back'],                  equipment: 'Bodyweight', aliases: ['remada invertida', 'remada australiana'] },
  { id: 'b27', name: 'Single-arm lat pulldown',           muscles: ['Back'],                  equipment: 'Cable',      aliases: ['puxada unilateral', 'pulldown unilateral'] },
  { id: 'b28', name: 'Half-kneeling single-arm pulldown', muscles: ['Back'],                  equipment: 'Cable',      aliases: ['puxada semi-ajoelhado'] },
  { id: 'b29', name: 'Seal row',                          muscles: ['Back'],                  equipment: 'Barbell',    aliases: ['remada deitado', 'seal row'] },
  { id: 'b30', name: 'Landmine row',                      muscles: ['Back'],                  equipment: 'Barbell',    aliases: ['remada landmine'] },
  { id: 'b31', name: 'Single-arm landmine row',           muscles: ['Back'],                  equipment: 'Barbell',    aliases: ['remada landmine unilateral'] },
  { id: 'b32', name: 'Smith machine row',                 muscles: ['Back'],                  equipment: 'Smith',      aliases: ['remada smith'] },
  { id: 'b33', name: 'Single-arm machine row',            muscles: ['Back'],                  equipment: 'Machine',    aliases: ['remada máquina unilateral'] },
  { id: 'b34', name: 'Wide-grip seated cable row',        muscles: ['Back'],                  equipment: 'Cable',      aliases: ['remada baixa aberta'] },
  { id: 'b35', name: 'Back extension (hyperextension)',   muscles: ['Back'],                  equipment: 'Bench',      aliases: ['hiperextensão', 'extensão lombar', 'lombar no banco'] },
  { id: 'b36', name: '45° back extension',                muscles: ['Back', 'Glutes'],        equipment: 'Machine',    aliases: ['hiperextensão 45', 'roman chair'] },
  { id: 'b37', name: 'Reverse hyperextension',            muscles: ['Back', 'Glutes'],        equipment: 'Machine',    aliases: ['hiperextensão reversa'] },
  { id: 'b38', name: 'Cable shrug',                       muscles: ['Back'],                  equipment: 'Cable',      aliases: ['encolhimento cabo'] },
  { id: 'b39', name: 'Machine shrug',                     muscles: ['Back'],                  equipment: 'Machine',    aliases: ['encolhimento máquina'] },
  { id: 'b40', name: 'Trap bar shrug',                    muscles: ['Back'],                  equipment: 'Barbell',    aliases: ['encolhimento trap bar'] },
  { id: 'b41', name: 'Dead hang',                         muscles: ['Back'],                  equipment: 'Bar',        aliases: ['pendura na barra'] },
  { id: 'b42', name: 'Bent-over dumbbell row',            muscles: ['Back'],                  equipment: 'Dumbbell',   aliases: ['remada curvada halteres'] },
  { id: 'b43', name: 'Single-arm cable pullover',         muscles: ['Back'],                  equipment: 'Cable',      aliases: ['pullover cabo unilateral'] },

  // ── Shoulders (more) ───────────────────────────────────────────────────
  { id: 's18', name: 'Push press',                        muscles: ['Shoulders'],             equipment: 'Barbell',    aliases: [] },
  { id: 's19', name: 'Behind-the-neck press',             muscles: ['Shoulders'],             equipment: 'Barbell',    aliases: ['desenvolvimento atrás da nuca', 'militar nuca'] },
  { id: 's20', name: 'Landmine shoulder press',           muscles: ['Shoulders'],             equipment: 'Barbell',    aliases: ['landmine ombro', 'desenvolvimento landmine'] },
  { id: 's21', name: 'Z-press',                           muscles: ['Shoulders'],             equipment: 'Barbell',    aliases: ['desenvolvimento sentado no chão'] },
  { id: 's22', name: 'Single-arm dumbbell press',         muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: ['desenvolvimento unilateral halter'] },
  { id: 's23', name: 'Single-arm machine shoulder press', muscles: ['Shoulders'],             equipment: 'Machine',    aliases: ['desenvolvimento máquina unilateral'] },
  { id: 's24', name: 'Leaning cable lateral raise',       muscles: ['Shoulders'],             equipment: 'Cable',      aliases: ['elevação lateral cabo inclinado'] },
  { id: 's25', name: 'Y-raise',                           muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: ['elevação em y'] },
  { id: 's26', name: 'Plate front raise',                 muscles: ['Shoulders'],             equipment: 'Barbell',    aliases: ['elevação frontal anilha'] },
  { id: 's27', name: 'Barbell front raise',               muscles: ['Shoulders'],             equipment: 'Barbell',    aliases: ['elevação frontal barra'] },
  { id: 's28', name: 'Cable rear delt fly',               muscles: ['Shoulders'],             equipment: 'Cable',      aliases: ['crucifixo invertido cabo', 'rear delt cabo'] },
  { id: 's29', name: 'Cuban press',                       muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: [] },
  { id: 's30', name: 'External rotation (dumbbell)',      muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: ['rotação externa halter', 'rotator cuff halter'] },
  { id: 's31', name: 'External rotation (cable)',         muscles: ['Shoulders'],             equipment: 'Cable',      aliases: ['rotação externa cabo'] },
  { id: 's32', name: 'Internal rotation (cable)',         muscles: ['Shoulders'],             equipment: 'Cable',      aliases: ['rotação interna cabo'] },
  { id: 's33', name: 'Pike push-up',                      muscles: ['Shoulders'],             equipment: 'Bodyweight', aliases: ['flexão pike'] },
  { id: 's34', name: 'Handstand push-up',                 muscles: ['Shoulders'],             equipment: 'Bodyweight', aliases: ['flexão parada de mão', 'hspu'] },
  { id: 's35', name: 'Machine rear delt fly',             muscles: ['Shoulders'],             equipment: 'Machine',    aliases: ['voador invertido', 'rear delt máquina'] },
  { id: 's36', name: 'Seated Arnold press',               muscles: ['Shoulders'],             equipment: 'Dumbbell',   aliases: ['arnold sentado'] },

  // ── Arms (more) ────────────────────────────────────────────────────────
  { id: 'a22', name: 'Zottman curl',                      muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['zottman'] },
  { id: 'a23', name: 'Reverse curl (barbell)',            muscles: ['Arms'],                  equipment: 'Barbell',    aliases: ['rosca inversa', 'rosca pronada'] },
  { id: 'a24', name: 'Reverse curl (EZ bar)',             muscles: ['Arms'],                  equipment: 'EZ bar',     aliases: ['rosca inversa w'] },
  { id: 'a25', name: 'Reverse curl (cable)',              muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['rosca inversa cabo'] },
  { id: 'a26', name: 'Cross-body hammer curl',            muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['martelo cruzado'] },
  { id: 'a27', name: 'Rope hammer curl (cable)',          muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['rosca martelo na corda', 'rosca martelo cabo'] },
  { id: 'a28', name: 'Drag curl',                         muscles: ['Arms'],                  equipment: 'Barbell',    aliases: [] },
  { id: 'a29', name: '21s curl',                          muscles: ['Arms'],                  equipment: 'Barbell',    aliases: ['21s', 'rosca 21'] },
  { id: 'a30', name: 'Bayesian curl (cable)',             muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['bayesian', 'rosca bayesian'] },
  { id: 'a31', name: 'Cable spider curl',                 muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['spider cabo'] },
  { id: 'a32', name: 'Machine biceps curl',               muscles: ['Arms'],                  equipment: 'Machine',    aliases: ['rosca máquina', 'bíceps máquina'] },
  { id: 'a33', name: 'Single-arm cable curl',             muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['rosca cabo unilateral', 'rosca direta unilateral cabo'] },
  { id: 'a34', name: 'Incline hammer curl',               muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['martelo inclinado'] },
  { id: 'a35', name: 'Waiter curl',                       muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['rosca garçom'] },
  { id: 'a36', name: 'Single-arm triceps pushdown',       muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['tríceps polia unilateral'] },
  { id: 'a37', name: 'Reverse-grip pushdown',             muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['tríceps polia supinada', 'tríceps pulley supinada'] },
  { id: 'a38', name: 'V-bar triceps pushdown',            muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['tríceps barra v', 'tríceps pulley v-bar'] },
  { id: 'a39', name: 'Cable skullcrusher',                muscles: ['Arms'],                  equipment: 'Cable',      aliases: ['testa no cabo', 'tríceps testa cabo'] },
  { id: 'a40', name: 'JM press',                          muscles: ['Arms', 'Chest'],         equipment: 'Barbell',    aliases: [] },
  { id: 'a41', name: 'Tate press',                        muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: [] },
  { id: 'a42', name: 'Bench dip',                         muscles: ['Arms'],                  equipment: 'Bench',      aliases: ['tríceps no banco'] },
  { id: 'a43', name: 'Single-arm dumbbell extension',     muscles: ['Arms'],                  equipment: 'Dumbbell',   aliases: ['francês unilateral halter'] },
  { id: 'a44', name: 'Reverse wrist curl',                muscles: ['Arms'],                  equipment: 'Barbell',    aliases: ['rosca punho inversa', 'extensão de punho'] },
  { id: 'a45', name: 'Forearm roller',                    muscles: ['Arms'],                  equipment: 'Bodyweight', aliases: ['rolo de antebraço'] },

  // ── Legs — quads / unilaterals / variations ────────────────────────────
  { id: 'l40', name: 'Overhead squat',                    muscles: ['Legs', 'Core'],          equipment: 'Barbell',    aliases: ['agachamento overhead'] },
  { id: 'l41', name: 'Safety bar squat',                  muscles: ['Legs'],                  equipment: 'Barbell',    aliases: ['agachamento safety bar', 'ssb'] },
  { id: 'l42', name: 'Pause squat',                       muscles: ['Legs'],                  equipment: 'Barbell',    aliases: ['agachamento com pausa'] },
  { id: 'l43', name: 'Cossack squat',                     muscles: ['Legs'],                  equipment: 'Bodyweight', aliases: ['cossaco'] },
  { id: 'l44', name: 'Pistol squat',                      muscles: ['Legs'],                  equipment: 'Bodyweight', aliases: ['pistol', 'agachamento pistola'] },
  { id: 'l45', name: 'Dumbbell squat',                    muscles: ['Legs'],                  equipment: 'Dumbbell',   aliases: ['agachamento com halteres'] },
  { id: 'l46', name: 'Lateral lunge',                     muscles: ['Legs', 'Glutes'],        equipment: 'Bodyweight', aliases: ['afundo lateral'] },
  { id: 'l47', name: 'Curtsy lunge',                      muscles: ['Legs', 'Glutes'],        equipment: 'Dumbbell',   aliases: ['afundo reverência'] },
  { id: 'l48', name: 'Forward lunge',                     muscles: ['Legs'],                  equipment: 'Dumbbell',   aliases: ['afundo à frente'] },
  { id: 'l49', name: 'Jumping lunge',                     muscles: ['Legs', 'Cardio'],        equipment: 'Bodyweight', aliases: ['afundo com salto'] },
  { id: 'l50', name: 'Single-leg press',                  muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['leg press unilateral'] },
  { id: 'l51', name: 'Wall sit',                          muscles: ['Legs'],                  equipment: 'Bodyweight', aliases: ['cadeira na parede'] },
  { id: 'l52', name: 'Air squat',                         muscles: ['Legs'],                  equipment: 'Bodyweight', aliases: ['agachamento livre sem carga'] },
  { id: 'l53', name: 'Smith lunge',                       muscles: ['Legs'],                  equipment: 'Smith',      aliases: ['afundo smith'] },
  { id: 'l54', name: 'Single-leg Smith squat',            muscles: ['Legs'],                  equipment: 'Smith',      aliases: ['agachamento smith unilateral'] },
  { id: 'l55', name: 'TKE (terminal knee extension)',     muscles: ['Legs'],                  equipment: 'Bands',      aliases: ['extensão terminal de joelho'] },
  { id: 'l56', name: 'Cable pull-through',                muscles: ['Legs', 'Glutes'],        equipment: 'Cable',      aliases: ['pull through', 'tração cabo entre pernas'] },
  { id: 'l57', name: 'Snatch-grip deadlift',              muscles: ['Back', 'Legs'],          equipment: 'Barbell',    aliases: ['terra pegada arrancada'] },
  { id: 'l58', name: 'Block pull',                        muscles: ['Back', 'Legs'],          equipment: 'Barbell',    aliases: ['terra sobre blocos'] },
  { id: 'l59', name: 'Dumbbell Romanian deadlift',        muscles: ['Legs', 'Glutes'],        equipment: 'Dumbbell',   aliases: ['stiff halteres', 'rdl halteres'] },
  { id: 'l60', name: 'Glute-ham raise (GHR)',             muscles: ['Legs', 'Glutes'],        equipment: 'Machine',    aliases: ['ghr', 'flexora ghr'] },
  { id: 'l61', name: 'Single-leg seated leg curl',        muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['cadeira flexora unilateral', 'flexora sentado unilateral'] },
  { id: 'l62', name: 'Reverse Nordic curl',               muscles: ['Legs'],                  equipment: 'Bodyweight', aliases: ['nórdico reverso'] },
  { id: 'l63', name: 'Tibialis raise',                    muscles: ['Legs'],                  equipment: 'Bodyweight', aliases: ['tibial anterior', 'tibia raise'] },
  { id: 'l64', name: 'Donkey calf raise',                 muscles: ['Legs'],                  equipment: 'Machine',    aliases: ['panturrilha burrinho'] },
  { id: 'l65', name: 'Dumbbell calf raise',               muscles: ['Legs'],                  equipment: 'Dumbbell',   aliases: ['panturrilha halteres'] },
  { id: 'l66', name: 'Barbell calf raise',                muscles: ['Legs'],                  equipment: 'Barbell',    aliases: ['panturrilha barra'] },
  { id: 'l67', name: 'Single-leg RDL (barbell)',          muscles: ['Legs', 'Glutes'],        equipment: 'Barbell',    aliases: ['rdl unilateral barra'] },
  { id: 'l68', name: 'Hack squat — reverse (glute focus)',muscles: ['Glutes', 'Legs'],        equipment: 'Machine',    aliases: ['hack invertido', 'reverse hack'] },

  // ── Glutes (more) ──────────────────────────────────────────────────────
  { id: 'g10', name: 'Single-leg hip thrust',             muscles: ['Glutes'],                equipment: 'Bodyweight', aliases: ['hip thrust unilateral'] },
  { id: 'g11', name: 'B-stance hip thrust',               muscles: ['Glutes'],                equipment: 'Barbell',    aliases: ['hip thrust b-stance'] },
  { id: 'g12', name: 'Dumbbell hip thrust',               muscles: ['Glutes'],                equipment: 'Dumbbell',   aliases: ['hip thrust halteres'] },
  { id: 'g13', name: 'Barbell glute bridge',              muscles: ['Glutes'],                equipment: 'Barbell',    aliases: ['ponte com barra'] },
  { id: 'g14', name: 'Single-leg glute bridge',           muscles: ['Glutes'],                equipment: 'Bodyweight', aliases: ['ponte unilateral'] },
  { id: 'g15', name: 'Frog pump',                         muscles: ['Glutes'],                equipment: 'Bodyweight', aliases: [] },
  { id: 'g16', name: 'Clamshell',                         muscles: ['Glutes'],                equipment: 'Bands',      aliases: ['concha'] },
  { id: 'g17', name: 'Fire hydrant',                      muscles: ['Glutes'],                equipment: 'Bodyweight', aliases: ['hidrante'] },
  { id: 'g18', name: 'Donkey kick',                       muscles: ['Glutes'],                equipment: 'Bodyweight', aliases: ['coice glúteo', 'quatro apoios'] },
  { id: 'g19', name: 'Banded hip abduction',              muscles: ['Glutes'],                equipment: 'Bands',      aliases: ['abdução com elástico'] },
  { id: 'g20', name: 'Kas glute bridge',                  muscles: ['Glutes'],                equipment: 'Barbell',    aliases: ['kas bridge'] },
  { id: 'g21', name: 'Standing cable hip abduction',      muscles: ['Glutes'],                equipment: 'Cable',      aliases: ['abdução em pé cabo'] },
  { id: 'g22', name: 'Rear-foot-elevated hip thrust',     muscles: ['Glutes'],                equipment: 'Barbell',    aliases: ['hip thrust pé elevado'] },
  { id: 'g23', name: 'Single-arm cable kickback',         muscles: ['Glutes'],                equipment: 'Cable',      aliases: ['glúteo cabo unilateral', 'coice cabo unilateral'] },

  // ── Core (more) ────────────────────────────────────────────────────────
  { id: 'c14', name: 'Sit-up',                            muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['abdominal completo', 'sit up'] },
  { id: 'c15', name: 'Crunch',                            muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['abdominal crunch'] },
  { id: 'c16', name: 'Reverse crunch',                    muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['abdominal reverso'] },
  { id: 'c17', name: 'Bicycle crunch',                    muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['abdominal bicicleta'] },
  { id: 'c18', name: 'V-up',                              muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['abdominal em v'] },
  { id: 'c19', name: 'Lying leg raise',                   muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['elevação de pernas deitado'] },
  { id: 'c20', name: 'Flutter kicks',                     muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['pernadas', 'flutter'] },
  { id: 'c21', name: 'Scissor kicks',                     muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['tesoura'] },
  { id: 'c22', name: 'Mountain climber',                  muscles: ['Core', 'Cardio'],        equipment: 'Bodyweight', aliases: ['escalador'] },
  { id: 'c23', name: 'Hollow hold',                       muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['barco isométrico', 'hollow body'] },
  { id: 'c24', name: 'L-sit',                             muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['l-sit'] },
  { id: 'c25', name: 'Oblique crunch',                    muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['abdominal oblíquo'] },
  { id: 'c26', name: 'Cable woodchop (high to low)',      muscles: ['Core'],                  equipment: 'Cable',      aliases: ['lenhador alto', 'woodchop alto'] },
  { id: 'c27', name: 'Cable woodchop (low to high)',      muscles: ['Core'],                  equipment: 'Cable',      aliases: ['lenhador baixo', 'woodchop baixo'] },
  { id: 'c28', name: 'Standing cable crunch',             muscles: ['Core'],                  equipment: 'Cable',      aliases: ['abdominal em pé cabo'] },
  { id: 'c29', name: 'Weighted plank',                    muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['prancha com carga'] },
  { id: 'c30', name: 'Plank with shoulder tap',           muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['prancha com toque'] },
  { id: 'c31', name: 'Bear crawl',                        muscles: ['Core', 'Cardio'],        equipment: 'Bodyweight', aliases: ['urso', 'rastejo urso'] },
  { id: 'c32', name: 'Windshield wiper',                  muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['limpador de para-brisa'] },
  { id: 'c33', name: 'Copenhagen plank',                  muscles: ['Core'],                  equipment: 'Bodyweight', aliases: ['prancha copenhague', 'adutor prancha'] },
  { id: 'c34', name: 'Toes-to-bar',                       muscles: ['Core'],                  equipment: 'Bar',        aliases: ['t2b', 'pés na barra'] },
  { id: 'c35', name: 'Medicine ball slam',                muscles: ['Core', 'Cardio'],        equipment: 'Bodyweight', aliases: ['slam ball'] },
  { id: 'c36', name: 'Single-arm cable crunch',           muscles: ['Core'],                  equipment: 'Cable',      aliases: ['abdominal cabo unilateral'] },
  { id: 'c37', name: 'Side bend (dumbbell)',              muscles: ['Core'],                  equipment: 'Dumbbell',   aliases: ['inclinação lateral halter'] },
  { id: 'c38', name: 'Cable side bend',                   muscles: ['Core'],                  equipment: 'Cable',      aliases: ['inclinação lateral cabo'] },
  { id: 'c39', name: 'Suitcase carry',                    muscles: ['Core'],                  equipment: 'Dumbbell',   aliases: ['caminhada da mala'] },

  // ── Cardio / conditioning (more) ───────────────────────────────────────
  { id: 'cd10', name: 'Elliptical',                       muscles: ['Cardio'],                equipment: 'Machine',    aliases: ['elíptico', 'transport'] },
  { id: 'cd11', name: 'Ski erg',                          muscles: ['Cardio'],                equipment: 'Machine',    aliases: ['ski erg'] },
  { id: 'cd12', name: 'Outdoor running',                  muscles: ['Cardio'],                equipment: 'Bodyweight', aliases: ['corrida rua', 'corrida'] },
  { id: 'cd13', name: 'Outdoor walking',                  muscles: ['Cardio'],                equipment: 'Bodyweight', aliases: ['caminhada'] },
  { id: 'cd14', name: 'Outdoor cycling',                  muscles: ['Cardio'],                equipment: 'Bodyweight', aliases: ['ciclismo', 'bike rua'] },
  { id: 'cd15', name: 'Hiking',                           muscles: ['Cardio'],                equipment: 'Bodyweight', aliases: ['trilha'] },
  { id: 'cd16', name: 'Swimming',                         muscles: ['Cardio'],                equipment: 'Bodyweight', aliases: ['natação'] },
  { id: 'cd17', name: 'Box jump',                         muscles: ['Legs', 'Cardio'],        equipment: 'Bodyweight', aliases: ['salto no caixote'] },
  { id: 'cd18', name: 'Burpee',                           muscles: ['Cardio'],                equipment: 'Bodyweight', aliases: ['burpee'] },
  { id: 'cd19', name: 'High knees',                       muscles: ['Cardio'],                equipment: 'Bodyweight', aliases: ['skipping alto', 'joelho alto'] },
  { id: 'cd20', name: 'Jumping jacks',                    muscles: ['Cardio'],                equipment: 'Bodyweight', aliases: ['polichinelo'] },
  { id: 'cd21', name: 'Battle ropes',                     muscles: ['Cardio'],                equipment: 'Bands',      aliases: ['cordas navais', 'battle rope'] },
  { id: 'cd22', name: 'Kettlebell swing',                 muscles: ['Glutes', 'Cardio'],      equipment: 'Kettlebell', aliases: ['swing kettlebell', 'balanço kettlebell'] },
  { id: 'cd23', name: 'Kettlebell goblet squat',          muscles: ['Legs'],                  equipment: 'Kettlebell', aliases: ['agachamento goblet kettlebell'] },
  { id: 'cd24', name: 'Kettlebell clean',                 muscles: ['Cardio'],                equipment: 'Kettlebell', aliases: ['clean kettlebell'] },
  { id: 'cd25', name: 'Kettlebell snatch',                muscles: ['Cardio'],                equipment: 'Kettlebell', aliases: ['arranco kettlebell'] },
  { id: 'cd26', name: 'Turkish get-up',                   muscles: ['Core', 'Cardio'],        equipment: 'Kettlebell', aliases: ['turkish get up', 'get up turco'] },
  { id: 'cd27', name: 'Clean and press',                  muscles: ['Cardio'],                equipment: 'Barbell',    aliases: ['clean and press'] },
  { id: 'cd28', name: 'Power clean',                      muscles: ['Cardio'],                equipment: 'Barbell',    aliases: ['clean', 'levantada olímpica'] },
  { id: 'cd29', name: 'Snatch',                           muscles: ['Cardio'],                equipment: 'Barbell',    aliases: ['arranco olímpico'] },
  { id: 'cd30', name: 'Thruster',                         muscles: ['Cardio'],                equipment: 'Barbell',    aliases: [] },
  { id: 'cd31', name: 'Wall ball',                        muscles: ['Cardio'],                equipment: 'Bodyweight', aliases: ['wall ball'] },
  { id: 'cd32', name: 'Sled pull',                        muscles: ['Legs', 'Cardio'],        equipment: 'Machine',    aliases: ['trenó puxada'] },
  { id: 'cd33', name: 'Yoke carry',                       muscles: ['Core', 'Cardio'],        equipment: 'Machine',    aliases: ['caminhada com yoke'] },
  { id: 'cd34', name: 'Tuck jump',                        muscles: ['Cardio', 'Legs'],        equipment: 'Bodyweight', aliases: ['salto agrupado'] },
  { id: 'cd35', name: 'Broad jump',                       muscles: ['Legs', 'Cardio'],        equipment: 'Bodyweight', aliases: ['salto em distância'] },
];

/** Look up an exercise in the main catalog by its id. Returns null when not found. */
export function findExerciseById(id, catalogue = DEMO_EXERCISES) {
  if (!id) return null;
  return catalogue.find((ex) => ex.id === id) || null;
}

/**
 * Surface related exercises based on shared primary muscle group.
 * Returns up to `limit` exercises, excluding the reference one. Prefers same
 * equipment first so the user sees swappable variants (e.g. dumbbell alternative
 * to a cable movement).
 */
export function findRelatedExercises(exercise, limit = 6, catalogue = DEMO_EXERCISES) {
  if (!exercise) return [];
  const primary = exercise.muscles?.[0];
  if (!primary) return [];
  const pool = catalogue.filter((e) => e.id !== exercise.id && e.muscles?.includes(primary));
  pool.sort((a, b) => {
    const aSame = a.equipment === exercise.equipment ? 0 : 1;
    const bSame = b.equipment === exercise.equipment ? 0 : 1;
    return aSame - bSame;
  });
  return pool.slice(0, limit);
}

export default function ExerciseLibrary({
  onClose,
  onPick,
  onOpen,
  catalogue = DEMO_EXERCISES,
}) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All');
  const [equip, setEquip] = useState('Any');

  const results = useMemo(() => {
    const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const tokens = norm(q).split(/\s+/).filter(Boolean);

    return catalogue.filter((ex) => {
      // Muscle group
      if (group !== 'All' && !ex.muscles.includes(group)) return false;
      // Equipment
      if (equip !== 'Any' && ex.equipment !== equip) return false;
      // Search tokens — every token must hit somewhere
      if (tokens.length === 0) return true;
      const hay = [
        norm(ex.name),
        ...ex.muscles.map(norm),
        norm(ex.equipment),
        ...(ex.aliases || []).map(norm),
      ].join(' ');
      return tokens.every((t) => hay.includes(t));
    });
  }, [q, group, equip, catalogue]);

  return (
    <SafeScreen paddingX={0}>
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
          paddingInline: 16,
          paddingBottom: 10,
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.94) 0%, rgba(5,7,10,0.82) 70%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36, height: 36, borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'hsl(var(--rd-fg-primary))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <span aria-hidden style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--rd-fg-muted))' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search · agachamento, pendulum, cable…"
              style={{
                width: '100%', height: 44, borderRadius: 14,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                color: 'hsl(var(--rd-fg-primary))',
                padding: '0 14px 0 40px',
                fontSize: 15, outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Muscle group chips */}
        <ChipRow items={MUSCLE_GROUPS} value={group} onChange={setGroup} style={{ marginTop: 10 }} />
        {/* Equipment filter */}
        <ChipRow items={EQUIPMENT_FILTERS} value={equip} onChange={setEquip} tint="neutral" style={{ marginTop: 6 }} />
      </div>

      {/* Count strip */}
      <div style={{ paddingInline: 16, paddingTop: 6, paddingBottom: 8, fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
        {results.length} {results.length === 1 ? 'exercise' : 'exercises'}
      </div>

      {/* Grid */}
      <div style={{ paddingInline: 16, paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'hsl(var(--rd-fg-muted))' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'hsl(var(--rd-fg-primary))', marginBottom: 4 }}>
              No exercises match
            </div>
            <div style={{ fontSize: 12 }}>
              Try clearing filters or a different search term.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {results.map((ex, i) => (
              <SpringReveal key={ex.id} delay={Math.min(i * 6, 120)}>
                <ExerciseRow
                  exercise={ex}
                  onClick={() => {
                    // Picker mode (onPick defined) → return the exercise to caller.
                    // Standalone mode → open the detail screen.
                    if (onPick) onPick(ex);
                    else onOpen?.(ex);
                  }}
                />
              </SpringReveal>
            ))}
          </div>
        )}
      </div>
    </SafeScreen>
  );
}
export { ExerciseLibrary };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function ChipRow({ items, value, onChange, tint = 'accent', style }) {
  const activeStyles = tint === 'neutral'
    ? { bg: 'rgba(255,255,255,0.08)', bd: 'rgba(255,255,255,0.22)', c: 'hsl(var(--rd-fg-primary))' }
    : { bg: 'rgba(0,255,255,0.14)',   bd: 'rgba(0,255,255,0.4)',    c: 'hsl(var(--rd-accent))' };
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2, ...style }}>
      {items.map((g) => {
        const active = value === g;
        return (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            style={{
              flex: '0 0 auto',
              height: 30, paddingInline: 12, borderRadius: 9999,
              background: active ? activeStyles.bg : 'rgba(255,255,255,0.04)',
              border: active ? `1px solid ${activeStyles.bd}` : '1px solid rgba(255,255,255,0.08)',
              color: active ? activeStyles.c : 'hsl(var(--rd-fg-secondary))',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}

/**
 * List row — the canonical layout used by Hevy / Fitbod / Strong for exercise
 * pickers. Full-width rows with a fixed-size icon tile on the left, bold name,
 * subtitle that combines muscles + equipment, and a subtle chevron on the right.
 * Every row has identical structure and vertical rhythm, regardless of how long
 * the exercise name is.
 */
function ExerciseRow({ exercise: ex, onClick }) {
  const primary = ex.muscles[0];
  const mc = MUSCLE_COLORS[primary] || FALLBACK_MUSCLE_COLOR;
  const eq = EQUIPMENT_COLORS[ex.equipment] || EQUIPMENT_COLORS['Bodyweight'];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 10,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'transform 160ms cubic-bezier(.34,1.56,.64,1), background 160ms',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.992)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* Muscle icon tile */}
      <div
        aria-hidden
        style={{
          width: 44, height: 44, borderRadius: 12,
          background: mc.bg,
          border: `1px solid ${mc.bd}`,
          color: mc.c,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MuscleGroupIcon muscle={primary} size={22} />
      </div>

      {/* Text block — name + subtitle (muscles · equipment) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
          lineHeight: 1.25,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: 'hsl(var(--rd-fg-primary))',
        }}>
          {ex.name}
        </div>
        <div style={{
          fontSize: 11, lineHeight: 1.35, marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: 'hsl(var(--rd-fg-muted))',
        }}>
          {ex.muscles.join(' · ')}
          <span style={{ color: 'rgba(255,255,255,0.24)', margin: '0 6px' }}>•</span>
          <span style={{ color: eq.c, fontWeight: 600, letterSpacing: '0.02em' }}>
            {ex.equipment}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <svg
        aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none"
        style={{ flexShrink: 0, color: 'hsl(var(--rd-fg-muted))' }}
      >
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
