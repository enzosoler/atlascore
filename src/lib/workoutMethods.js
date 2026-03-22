export const WORKOUT_METHODS = [
  {
    id: 'feeder',
    label: 'Feeder',
    shortLabel: 'Feeder',
    aliases: ['feeder', 'warm-up set', 'ramp-up set'],
    description: 'Light preparation sets to warm up the joint, feel the movement, and arrive ready for the main work sets.',
  },
  {
    id: 'progressive_overload',
    label: 'Progressive Overload',
    shortLabel: 'Overload',
    aliases: ['progressive overload', 'overload'],
    description: 'Use a challenging load and increase weight, reps, or movement quality whenever the target becomes comfortable.',
  },
  {
    id: 'drop_set',
    label: 'Drop Set',
    shortLabel: 'Drop set',
    aliases: ['drop', 'dropset'],
    description: 'After reaching the target, reduce the load and keep going to accumulate more reps with solid technique.',
  },
  {
    id: 'descending_pyramid',
    label: 'Descending Pyramid',
    shortLabel: 'Pyramid',
    aliases: ['pyramid', 'descending pyramid'],
    description: 'Increase the load and lower the reps across sets while keeping execution strong in the prescribed ranges.',
  },
  {
    id: 'sst',
    label: 'SST',
    shortLabel: 'SST',
    aliases: ['sarcoplasma stimulating training'],
    description: 'Take the set close to failure, use very short pauses, and repeat the effort to increase density and metabolic stimulus.',
  },
  {
    id: 'isometric_hold',
    label: 'Isometric Hold',
    shortLabel: 'Isometric',
    aliases: ['isometric', 'hold'],
    description: 'Hold the position for a set amount of time to reinforce control, stability, and muscle tension.',
  },
  {
    id: 'pre_activation',
    label: 'Pre-activation',
    shortLabel: 'Pre-activation',
    aliases: ['pre-activation', 'activation'],
    description: 'Start with a light drill or block to activate the target muscle group before the main movements.',
  },
  {
    id: 'peak_contraction',
    label: 'Peak Contraction',
    shortLabel: 'Pico',
    aliases: ['peak contraction', 'hold at peak'],
    description: 'Hold the contraction for a few seconds at peak tension to improve muscle awareness.',
  },
];

export const WORKOUT_METHOD_OPTIONS = WORKOUT_METHODS.map(method => ({
  value: method.id,
  label: method.label,
}));

export const WORKOUT_METHOD_MAP = Object.fromEntries(
  WORKOUT_METHODS.map(method => [method.id, method])
);

export function getWorkoutMethodLabel(methodId) {
  return WORKOUT_METHOD_MAP[methodId]?.label || methodId || '';
}
