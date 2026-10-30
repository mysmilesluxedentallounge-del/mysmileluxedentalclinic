/**
 * Smile Predictor — in-browser cosmetic simulation.
 *
 * Runs entirely on the visitor's device: the captured photo is never uploaded.
 * The result is an *illustrative* whitening/brightening preview, not a clinical
 * prediction, and the UI labels it as such.
 *
 * `simulateSmile` is deliberately the single entry point so a different engine
 * (e.g. a hosted image-to-image model) can replace it without touching the page.
 */

export type SmileRegion = { x: number; y: number; width: number; height: number }

export type SmileSimulationOptions = {
  /** How strongly the yellow cast is neutralised (0-1). */
  whitening?: number
  /** How much the teeth are lifted toward white (0-1). */
  brightness?: number
}

export type SmileSimulationResult = {
  /** Fraction of the guide region that looked like tooth enamel (0-1). */
  toothCoverage: number
}

const DEFAULTS = { whitening: 0.78, brightness: 0.26 }

/** Smooth 0→1 ramp; avoids the hard edges a plain threshold would leave. */
function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge1 === edge0) return value < edge0 ? 0 : 1
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * How much a pixel looks like tooth enamel, 0-1.
 *
 * Enamel is bright and close to neutral; lips and gums are darker and strongly
 * red. Scoring on all three axes keeps the effect off skin and lips without
 * needing a face-landmark model.
 */
function toothScore(r: number, g: number, b: number) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const saturation = max === 0 ? 0 : (max - min) / max
  const redness = (r - (g + b) / 2) / 255

  const bright = smoothstep(0.3, 0.56, luminance)
  const neutral = 1 - smoothstep(0.34, 0.62, saturation)
  const notLip = 1 - smoothstep(0.1, 0.27, redness)

  return bright * neutral * notLip
}

/**
 * Applies the whitening simulation in place to the pixels inside `region`.
 * Returns how much of the region registered as teeth, so the caller can ask
 * for a retake when the mouth clearly was not in frame.
 */
export function simulateSmile(
  imageData: ImageData,
  region: SmileRegion,
  options: SmileSimulationOptions = {}
): SmileSimulationResult {
  const whitening = options.whitening ?? DEFAULTS.whitening
  const brightness = options.brightness ?? DEFAULTS.brightness

  const { data, width, height } = imageData

  const startX = Math.max(0, Math.floor(region.x))
  const startY = Math.max(0, Math.floor(region.y))
  const endX = Math.min(width, Math.ceil(region.x + region.width))
  const endY = Math.min(height, Math.ceil(region.y + region.height))

  let scoreTotal = 0
  let pixelCount = 0

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const i = (y * width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const score = toothScore(r, g, b)
      scoreTotal += score
      pixelCount++

      if (score <= 0.01) continue

      // Pull every channel toward the brightest one: a yellow pixel
      // (r > g > b) becomes neutral without changing its overall lightness.
      const max = Math.max(r, g, b)
      const pull = whitening * score
      let nr = r + (max - r) * pull
      let ng = g + (max - g) * pull
      let nb = b + (max - b) * pull

      // Then lift toward white so the enamel reads as brighter.
      const lift = brightness * score
      nr += (255 - nr) * lift
      ng += (255 - ng) * lift
      nb += (255 - nb) * lift

      data[i] = Math.round(Math.min(255, nr))
      data[i + 1] = Math.round(Math.min(255, ng))
      data[i + 2] = Math.round(Math.min(255, nb))
    }
  }

  return { toothCoverage: pixelCount === 0 ? 0 : scoreTotal / pixelCount }
}

/**
 * The capture guide is a band across the middle of the frame; the visitor lines
 * their mouth up with it, which is what lets us skip face detection entirely.
 */
export function mouthGuideRegion(width: number, height: number): SmileRegion {
  return {
    x: width * 0.18,
    y: height * 0.3,
    width: width * 0.64,
    height: height * 0.4,
  }
}

/** Below this, the guide area almost certainly did not contain teeth. */
export const MIN_TOOTH_COVERAGE = 0.055
