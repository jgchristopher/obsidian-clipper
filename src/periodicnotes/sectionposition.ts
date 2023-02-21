export const SectionPosition = {
  PREPEND: 'prepend',
  APPEND: 'append',
} as const;

export type SectionPosition =
  typeof SectionPosition[keyof typeof SectionPosition];
