export const WORKOUT_METHODS = [
  {
    id: 'feeder',
    label: 'Feeder',
    shortLabel: 'Feeder',
    aliases: ['serie feeder', 'séries feeder', 'aquecimento', 'warm-up set'],
    description: 'Séries leves de preparação para aquecer a articulação, sentir o movimento e chegar melhor nas séries principais.',
  },
  {
    id: 'progressive_overload',
    label: 'Sobrecarga Progressiva',
    shortLabel: 'Sobrecarga',
    aliases: ['sobrecarga', 'progressão de carga', 'progressive overload'],
    description: 'Use uma carga desafiadora e aumente peso, repetições ou controle do movimento sempre que a meta ficar confortável.',
  },
  {
    id: 'drop_set',
    label: 'Drop Set',
    shortLabel: 'Drop set',
    aliases: ['drop', 'dropset'],
    description: 'Depois de atingir a meta, reduza a carga e continue a série para acumular mais repetições com boa técnica.',
  },
  {
    id: 'descending_pyramid',
    label: 'Pirâmide Decrescente',
    shortLabel: 'Pirâmide',
    aliases: ['piramide', 'pirâmide', 'pyramid'],
    description: 'Aumente a carga e reduza as repetições ao longo das séries, mantendo execução sólida nas faixas propostas.',
  },
  {
    id: 'sst',
    label: 'SST',
    shortLabel: 'SST',
    aliases: ['sarcoplasma stimulating training'],
    description: 'Leve a série perto da falha, faça pausas muito curtas e repita o esforço para elevar densidade e estímulo metabólico.',
  },
  {
    id: 'isometric_hold',
    label: 'Isometria',
    shortLabel: 'Isometria',
    aliases: ['isometrica', 'isométrica', 'hold'],
    description: 'Mantenha a posição por um tempo definido para reforçar controle, estabilidade e tensão muscular.',
  },
  {
    id: 'pre_activation',
    label: 'Pré-ativação',
    shortLabel: 'Pré-ativação',
    aliases: ['pre activacion', 'pré ativação', 'pre-activation'],
    description: 'Comece com um exercício ou bloco leve para ativar a musculatura alvo antes dos movimentos principais.',
  },
  {
    id: 'peak_contraction',
    label: 'Pico de Contração',
    shortLabel: 'Pico',
    aliases: ['2seg pico de contração', 'peak contraction'],
    description: 'Segure a contração por alguns segundos no ponto de maior tensão para melhorar consciência muscular.',
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
