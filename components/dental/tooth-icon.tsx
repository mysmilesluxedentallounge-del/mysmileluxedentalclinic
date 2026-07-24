"use client"

import { useId } from "react"
import type { ToothType } from "@/lib/dental-charting"
import { TOOTH_ART } from "@/components/dental/tooth-art"

export type ToothState = "default" | "marked" | "active"
export type ToothOrientation = "upper" | "lower"

type ToothIconProps = {
  type: ToothType
  /** FDI number — enables the detailed per-tooth artwork when one exists. */
  tooth?: string
  state?: ToothState
  orientation?: ToothOrientation
  className?: string
}

/** Tint the realistic artwork for selection states without altering its paths. */
const ART_STATE_FILTER: Record<ToothState, string | undefined> = {
  default: undefined,
  marked: "sepia(0.35) saturate(1.7) hue-rotate(-12deg)",
  active: "sepia(0.6) saturate(2.2) hue-rotate(-16deg) brightness(1.03)",
}

type Shape = {
  viewBox: string
  height: number
  /**
   * ONE continuous tooth silhouette: occlusal edge → sides → neck → roots
   * (furcations cut into the same outline). Filled with the root tone.
   */
  outline: string
  /** Crown overlay drawn on top; its lower edge forms the cervical line. */
  crown: string
  /** Occlusal grooves / developmental line. */
  detail?: string
}

type ShapeKey =
  | "upper_molar"
  | "lower_molar"
  | "upper_premolar"
  | "lower_premolar"
  | "canine"
  | "upper_incisor"
  | "lower_incisor"

const TOOTH_SHAPES: Record<ShapeKey, Shape> = {
  // Three roots: mesio-buccal, palatal (centre), disto-buccal.
  upper_molar: {
    viewBox: "0 0 44 104",
    height: 104,
    outline:
      "M8 14 C8 7 12 4 17 4 L27 4 C32 4 36 7 36 14 L36 36 C36 40 35 41 34 43 " +
      "C34 60 33 80 32 96 C32 100 29 100 29 96 C28 80 27 62 26 46 L24 44 " +
      "C23 62 23 80 23 96 C23 100 21 100 21 96 C21 80 21 62 20 44 L18 46 " +
      "C17 62 16 80 15 96 C15 100 12 100 12 96 C11 80 10 60 10 43 " +
      "C9 41 8 40 8 36 Z",
    crown: "M8 14 C8 7 12 4 17 4 L27 4 C32 4 36 7 36 14 L36 36 C36 40 33 43 29 43 L15 43 C11 43 8 40 8 36 Z",
    detail: "M12 8 Q17 15 22 9 Q27 15 32 8",
  },
  // Two stout roots: mesial + distal.
  lower_molar: {
    viewBox: "0 0 44 104",
    height: 104,
    outline:
      "M7 14 C7 7 11 4 16 4 L28 4 C33 4 37 7 37 14 L37 36 C37 40 36 41 35 43 " +
      "C35 60 34 80 33 96 C33 100 30 100 30 96 C29 80 28 62 26 46 L22 44 L18 46 " +
      "C16 62 15 80 14 96 C14 100 11 100 11 96 C10 80 9 60 9 43 " +
      "C8 41 7 40 7 36 Z",
    crown: "M7 14 C7 7 11 4 16 4 L28 4 C33 4 37 7 37 14 L37 36 C37 40 34 43 30 43 L14 43 C10 43 7 40 7 36 Z",
    detail: "M11 8 Q17 15 22 9 Q27 15 33 8",
  },
  // Bifurcated root.
  upper_premolar: {
    viewBox: "0 0 32 104",
    height: 104,
    outline:
      "M7 14 C7 7 10 4 14 4 L18 4 C22 4 25 7 25 14 L25 34 C25 38 24 40 23 42 " +
      "C23 58 22 76 21 92 C21 96 19 96 19 92 C18 76 17 60 16 44 L14 44 " +
      "C13 60 12 76 11 92 C11 96 9 96 9 92 C8 76 8 58 9 42 " +
      "C8 40 7 38 7 34 Z",
    crown: "M7 14 C7 7 10 4 14 4 L18 4 C22 4 25 7 25 14 L25 34 C25 38 22 42 19 42 L13 42 C10 42 7 38 7 34 Z",
    detail: "M10 8 Q16 15 22 8",
  },
  // Single tapering root.
  lower_premolar: {
    viewBox: "0 0 30 104",
    height: 104,
    outline:
      "M7 14 C7 7 10 4 14 4 L17 4 C21 4 24 7 24 14 L24 34 C24 38 23 40 22 42 " +
      "C22 62 21 82 19 95 C18 99 14 99 13 95 C11 82 10 62 10 42 " +
      "C9 40 7 38 7 34 Z",
    crown: "M7 14 C7 7 10 4 14 4 L17 4 C21 4 24 7 24 14 L24 34 C24 38 21 42 18 42 L13 42 C10 42 7 38 7 34 Z",
    detail: "M10 8 Q15 15 21 8",
  },
  // Pointed cusp, longest root.
  canine: {
    viewBox: "0 0 28 112",
    height: 112,
    outline:
      "M14 4 C10 9 7 18 7 28 C7 34 8 40 9 44 C9 64 8 88 11 104 C12 109 16 109 17 104 " +
      "C20 88 19 64 19 44 C20 40 21 34 21 28 C21 18 18 9 14 4 Z",
    crown: "M14 4 C10 9 7 18 7 28 C7 36 10 42 14 45 C18 42 21 36 21 28 C21 18 18 9 14 4 Z",
    detail: "M14 10 L14 40",
  },
  // Wide chisel crown, conical root.
  upper_incisor: {
    viewBox: "0 0 28 100",
    height: 100,
    outline:
      "M6 8 C6 5 7 4 9 4 L19 4 C21 4 22 5 22 8 C23 18 23 30 21 38 C20 41 19 43 19 46 " +
      "C19 62 18 80 16 93 C15 97 13 97 12 93 C10 80 9 62 9 46 C9 43 8 41 7 38 " +
      "C5 30 5 18 6 8 Z",
    crown: "M6 8 C6 5 7 4 9 4 L19 4 C21 4 22 5 22 8 C23 18 23 30 21 38 C20 42 17 44 14 44 C11 44 8 42 7 38 C5 30 5 18 6 8 Z",
    detail: "M14 8 L14 40",
  },
  // Narrow chisel crown, slender root.
  lower_incisor: {
    viewBox: "0 0 24 96",
    height: 96,
    outline:
      "M5 8 C5 5 6 4 8 4 L16 4 C18 4 19 5 19 8 C20 17 20 28 18 35 C17 38 16 40 16 43 " +
      "C16 58 15 74 13 88 C12 92 10 92 9 88 C7 74 6 58 6 43 C6 40 5 38 5 35 " +
      "C3 28 3 17 5 8 Z",
    crown: "M5 8 C5 5 6 4 8 4 L16 4 C18 4 19 5 19 8 C20 17 20 28 18 35 C17 39 14 41 12 41 C10 41 7 39 6 35 C4 28 4 17 5 8 Z",
    detail: "M12 8 L12 37",
  },
}

function shapeKeyFor(type: ToothType, orientation: ToothOrientation): ShapeKey {
  const isUpper = orientation === "upper"
  if (type === "molar") return isUpper ? "upper_molar" : "lower_molar"
  if (type === "premolar") return isUpper ? "upper_premolar" : "lower_premolar"
  if (type === "canine") return "canine"
  return isUpper ? "upper_incisor" : "lower_incisor"
}

/** White crown over tan roots — the classic dental-chart look. */
const STATE_COLORS: Record<ToothState, { crownLight: string; crownBase: string; root: string; stroke: string; detail: string }> = {
  default: { crownLight: "#ffffff", crownBase: "#f5f1e6", root: "#e3d6b6", stroke: "#a89778", detail: "#c2b391" },
  marked: { crownLight: "#fffbf2", crownBase: "#fdefd0", root: "#eed596", stroke: "#c8902d", detail: "#d5b263" },
  active: { crownLight: "#fff9e8", crownBase: "#ffe7ae", root: "#f7cc72", stroke: "#d1821f", detail: "#d9a337" },
}

export default function ToothIcon({
  type,
  tooth,
  state = "default",
  orientation = "lower",
  className,
}: ToothIconProps) {
  const rawId = useId()
  // Strip colons so the ids are safe inside url(#...) references.
  const uid = rawId.replace(/:/g, "")

  // Detailed per-tooth artwork takes precedence over the generic shapes.
  const art = tooth ? TOOTH_ART[tooth] : undefined
  if (art) {
    return (
      <svg
        viewBox={art.viewBox}
        className={className}
        aria-hidden="true"
        focusable="false"
        style={ART_STATE_FILTER[state] ? { filter: ART_STATE_FILTER[state] } : undefined}
      >
        {art.render(
          {
            crownGrad: `${uid}-crown`,
            rootGrad: `${uid}-root`,
            crownShadow: `${uid}-shadow`,
            specular: `${uid}-spec`,
          },
          orientation
        )}
      </svg>
    )
  }

  const gradientId = `${uid}-grad`
  const shape = TOOTH_SHAPES[shapeKeyFor(type, orientation)]
  const colors = STATE_COLORS[state]
  const flip = orientation === "upper" ? `translate(0 ${shape.height}) scale(1 -1)` : undefined

  return (
    <svg viewBox={shape.viewBox} className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={colors.crownLight} />
          <stop offset="1" stopColor={colors.crownBase} />
        </linearGradient>
      </defs>
      <g transform={flip}>
        {/* Continuous silhouette (crown + roots) in the root tone */}
        <path
          d={shape.outline}
          fill={colors.root}
          stroke={colors.stroke}
          strokeWidth={1.7}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Crown on top — its lower edge becomes the cervical line */}
        <path
          d={shape.crown}
          fill={`url(#${gradientId})`}
          stroke={colors.stroke}
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
        {shape.detail ? (
          <path d={shape.detail} fill="none" stroke={colors.detail} strokeWidth={1.3} strokeLinecap="round" opacity={0.9} />
        ) : null}
      </g>
    </svg>
  )
}
