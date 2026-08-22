/** Custom-fit adjustment bounds, mirrored by the product page UI and the checkout schema (M1). */
export const FIT_BOUNDS = {
  chest:  { min: -6, max: 6, step: 0.5 },
  waist:  { min: -6, max: 6, step: 0.5 },
  hips:   { min: -6, max: 6, step: 0.5 },
  length: { min: -4, max: 4, step: 0.5 },
} as const

export type FitKey = keyof typeof FIT_BOUNDS
export const FIT_KEYS = Object.keys(FIT_BOUNDS) as FitKey[]

export const FIT_LABELS: Record<FitKey, string> = {
  chest: 'Chest',
  waist: 'Waist',
  hips: 'Hips',
  length: 'Length',
}
