"use client"

import type { ReactNode } from "react"

/**
 * Detailed artwork for all 32 permanent teeth.
 *
 * Every tooth is drawn with the same 9-layer model (background root, primary
 * roots, root trunk, crown geometry, volumetric depth blend, cervical line,
 * occlusal grooves, specular highlights) and the same enamel/dentine gradients,
 * so the arch reads as one consistent set. Geometry varies per tooth class and
 * is mirrored for the left quadrants.
 */

export type ArtIds = {
  crownGrad: string
  rootGrad: string
  crownShadow: string
  specular: string
}

export type ToothOrientationArt = "upper" | "lower"

type Specular = { cx: number; cy: number; rx: number; ry: number; rot: number }

type Geometry = {
  viewBox: string
  width: number
  height: number
  /** Optional third (palatal) root drawn behind the others. */
  bgRoot?: string
  roots: string[]
  trunk: string
  crown: string
  cervical: string
  grooves: string[]
  speculars: Specular[]
}

type ArchetypeKey =
  | "molarUpper"
  | "molarLower"
  | "premolarUpper"
  | "premolarLower"
  | "canine"
  | "incisorUpper"
  | "incisorLower"

const ARCHETYPES: Record<ArchetypeKey, Geometry> = {
  // Three roots (two buccal + palatal), broad 4-cusp crown.
  molarUpper: {
    viewBox: "0 0 44 104",
    width: 44,
    height: 104,
    bgRoot: "M 20 42 C 21 55 22 72 23 88 C 23.2 93 20 95 19.5 91 C 18.5 75 17.5 58 17 42 Z",
    roots: [
      "M 9 40 C 8 52 9 68 11 86 C 11.5 91 14.5 91 14.5 86 C 14 68 15 52 16.5 40 Z",
      "M 35 40 C 36 52 35 68 33 88 C 32.5 93 29.5 93 29.5 87 C 30 68 29 52 27.5 40 Z",
    ],
    trunk: "M 8 36 C 8 24 10 16 15 14 L 29 14 C 34 16 36 24 36 36 L 35 41 C 31 39 13 39 9 41 Z",
    crown:
      "M 8 36 C 7 28 9 18 12 11 C 14 5 18 4 22 4 C 26 4 30 5 32 11 C 35 18 37 28 36 36 C 32 40 28 41 22 41 C 16 41 12 40 8 36 Z",
    cervical: "M 8 36.5 C 12 39.5 16 41 22 41 C 28 41 32 39.5 36 36.5",
    grooves: [
      "M 14 14 C 17 19 19 20 22 20 C 25 20 27 19 30 14",
      "M 22 6 L 22 20",
      "M 11 22 C 15 19 22 20 29 22",
    ],
    speculars: [
      { cx: 15, cy: 16, rx: 5, ry: 8, rot: -15 },
      { cx: 28, cy: 14, rx: 3.5, ry: 6, rot: 10 },
    ],
  },

  // Two stout roots (mesial + distal), wide 5-cusp crown.
  molarLower: {
    viewBox: "0 0 44 104",
    width: 44,
    height: 104,
    roots: [
      "M 10 40 C 8 54 9 70 11 88 C 11.5 93 15 93 15 88 C 14.5 70 15.5 54 17 40 Z",
      "M 34 40 C 36 54 35 70 33 88 C 32.5 93 29 93 29 88 C 29.5 70 28.5 54 27 40 Z",
    ],
    trunk: "M 7 36 C 7 24 9 16 14 14 L 30 14 C 35 16 37 24 37 36 L 36 41 C 32 39 12 39 8 41 Z",
    crown:
      "M 7 36 C 6 27 8 17 11 11 C 13 5 17 4 22 4 C 27 4 31 5 33 11 C 36 17 38 27 37 36 C 33 40 28 41 22 41 C 16 41 11 40 7 36 Z",
    cervical: "M 7 36.5 C 11 39.5 16 41 22 41 C 28 41 33 39.5 37 36.5",
    grooves: [
      "M 12 15 C 16 20 19 21 22 21 C 25 21 28 20 32 15",
      "M 22 6 L 22 21",
      "M 10 24 C 15 21 22 22 34 24",
    ],
    speculars: [
      { cx: 14, cy: 17, rx: 5, ry: 8, rot: -15 },
      { cx: 29, cy: 14, rx: 3.5, ry: 6, rot: 10 },
    ],
  },

  // Bifurcated root, two-cusp crown.
  premolarUpper: {
    viewBox: "0 0 36 104",
    width: 36,
    height: 104,
    roots: [
      "M 10 38 C 9 50 10 66 12 84 C 12.5 89 15 89 15 84 C 14.5 66 15 50 16 38 Z",
      "M 26 38 C 27 50 26 66 24 84 C 23.5 89 21 89 21 84 C 21.5 66 21 50 20 38 Z",
    ],
    trunk: "M 8 34 C 8 24 10 16 14 13 L 22 13 C 26 16 28 24 28 34 L 27 39 C 24 37 12 37 9 39 Z",
    crown:
      "M 8 34 C 7 26 9 16 12 10 C 14 5 16 4 18 4 C 20 4 22 5 24 10 C 27 16 29 26 28 34 C 25 38 22 39 18 39 C 14 39 11 38 8 34 Z",
    cervical: "M 8 34.5 C 11 37.5 14 39 18 39 C 22 39 25 37.5 28 34.5",
    grooves: ["M 12 13 C 15 18 16 19 18 19 C 20 19 21 18 24 13", "M 18 5 L 18 19"],
    speculars: [
      { cx: 13, cy: 15, rx: 4, ry: 7, rot: -15 },
      { cx: 23, cy: 13, rx: 3, ry: 5, rot: 10 },
    ],
  },

  // Single tapered root, two-cusp crown.
  premolarLower: {
    viewBox: "0 0 34 104",
    width: 34,
    height: 104,
    roots: ["M 11 38 C 9 52 10 70 14 90 C 15 95 19 95 20 90 C 24 70 25 52 23 38 Z"],
    trunk: "M 8 34 C 8 24 10 16 14 13 L 20 13 C 24 16 26 24 26 34 L 25 39 C 22 37 12 37 9 39 Z",
    crown:
      "M 8 34 C 7 26 9 16 12 10 C 14 5 16 4 17 4 C 19 4 21 5 22 10 C 25 16 27 26 26 34 C 23 38 21 39 17 39 C 13 39 11 38 8 34 Z",
    cervical: "M 8 34.5 C 11 37.5 13 39 17 39 C 21 39 24 37.5 26 34.5",
    grooves: ["M 11 13 C 14 18 15 19 17 19 C 19 19 20 18 23 13", "M 17 5 L 17 19"],
    speculars: [
      { cx: 12, cy: 15, rx: 4, ry: 7, rot: -15 },
      { cx: 22, cy: 13, rx: 2.5, ry: 5, rot: 10 },
    ],
  },

  // Longest single root, pointed cusp.
  canine: {
    viewBox: "0 0 30 112",
    width: 30,
    height: 112,
    roots: ["M 9 40 C 7 56 8 80 12 102 C 13 108 17 108 18 102 C 22 80 23 56 21 40 Z"],
    trunk: "M 7 36 C 7 26 9 18 12 15 L 18 15 C 21 18 23 26 23 36 L 22 41 C 19 39 11 39 8 41 Z",
    crown:
      "M 15 4 C 11 9 8 18 7 27 C 6 33 8 39 11 42 L 19 42 C 22 39 24 33 23 27 C 22 18 19 9 15 4 Z",
    cervical: "M 7 37 C 10 40.5 12 42 15 42 C 18 42 20 40.5 23 37",
    grooves: ["M 15 9 L 15 38"],
    speculars: [{ cx: 12, cy: 20, rx: 3.5, ry: 9, rot: -10 }],
  },

  // Wide chisel crown with mamelon lines, conical root.
  incisorUpper: {
    viewBox: "0 0 30 100",
    width: 30,
    height: 100,
    roots: ["M 9 38 C 7 54 8 76 12 94 C 13 99 17 99 18 94 C 22 76 23 54 21 38 Z"],
    trunk: "M 7 34 C 7 24 8 17 11 14 L 19 14 C 22 17 23 24 23 34 L 22 39 C 19 37 11 37 8 39 Z",
    crown:
      "M 6 8 C 6 5 7 4 9 4 L 21 4 C 23 4 24 5 24 8 C 25 18 24 30 22 37 C 20 41 17 42 15 42 C 13 42 10 41 8 37 C 6 30 5 18 6 8 Z",
    cervical: "M 7 37 C 10 40.5 12 42 15 42 C 18 42 20 40.5 23 37",
    grooves: ["M 15 7 L 15 36", "M 11 8 L 11 28", "M 19 8 L 19 28"],
    speculars: [{ cx: 11, cy: 18, rx: 3.5, ry: 9, rot: -8 }],
  },

  // Narrow chisel crown, slender root.
  incisorLower: {
    viewBox: "0 0 26 96",
    width: 26,
    height: 96,
    roots: ["M 8 36 C 6 50 7 70 10 88 C 11 93 15 93 16 88 C 19 70 20 50 18 36 Z"],
    trunk: "M 6 32 C 6 23 7 16 10 13 L 16 13 C 19 16 20 23 20 32 L 19 37 C 16 35 10 35 7 37 Z",
    crown:
      "M 6 8 C 6 5 7 4 8 4 L 18 4 C 19 4 20 5 20 8 C 21 17 20 28 18 34 C 16 38 14 39 13 39 C 12 39 10 38 8 34 C 6 28 5 17 6 8 Z",
    cervical: "M 6 34 C 9 37.5 11 39 13 39 C 15 39 17 37.5 20 34",
    grooves: ["M 13 7 L 13 33"],
    speculars: [{ cx: 10, cy: 17, rx: 3, ry: 8, rot: -8 }],
  },
}

/** FDI number → archetype + whether it belongs to a left quadrant (mirrored). */
const TOOTH_MAP: Record<string, { key: ArchetypeKey; mirror: boolean }> = {}

function register(numbers: string[], key: ArchetypeKey, mirror: boolean) {
  for (const number of numbers) TOOTH_MAP[number] = { key, mirror }
}

// Quadrant 1 — upper right (not mirrored)
register(["18", "17", "16"], "molarUpper", false)
register(["15", "14"], "premolarUpper", false)
register(["13"], "canine", false)
register(["12", "11"], "incisorUpper", false)
// Quadrant 2 — upper left (mirrored)
register(["21", "22"], "incisorUpper", true)
register(["23"], "canine", true)
register(["24", "25"], "premolarUpper", true)
register(["26", "27", "28"], "molarUpper", true)
// Quadrant 3 — lower left (mirrored)
register(["31", "32"], "incisorLower", true)
register(["33"], "canine", true)
register(["34", "35"], "premolarLower", true)
register(["36", "37", "38"], "molarLower", true)
// Quadrant 4 — lower right (not mirrored)
register(["41", "42"], "incisorLower", false)
register(["43"], "canine", false)
register(["44", "45"], "premolarLower", false)
register(["46", "47", "48"], "molarLower", false)

/** Compose the vertical flip (upper arch) with the horizontal mirror (left quadrants). */
function buildTransform(geometry: Geometry, orientation: ToothOrientationArt, mirror: boolean) {
  const parts: string[] = []
  if (orientation === "upper") parts.push(`translate(0 ${geometry.height}) scale(1 -1)`)
  if (mirror) parts.push(`translate(${geometry.width} 0) scale(-1 1)`)
  return parts.length ? parts.join(" ") : undefined
}

function renderGeometry(geometry: Geometry, ids: ArtIds, transform: string | undefined): ReactNode {
  return (
    <>
      <defs>
        {/* Realistic 3D enamel gradients */}
        <linearGradient id={ids.crownGrad} x1="0.1" y1="0.1" x2="0.8" y2="0.9">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fdfbf4" />
          <stop offset="75%" stopColor="#f3ebd1" />
          <stop offset="100%" stopColor="#decfa4" />
        </linearGradient>

        <linearGradient id={ids.rootGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2d4af" />
          <stop offset="25%" stopColor="#caa470" />
          <stop offset="100%" stopColor="#a47f52" />
        </linearGradient>

        {/* Volumetric smooth lighting shadow */}
        <radialGradient id={ids.crownShadow} cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#e3d5b0" stopOpacity="0" />
          <stop offset="80%" stopColor="#c4b182" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a08d5f" stopOpacity="0.8" />
        </radialGradient>

        {/* Organic specular highlight */}
        <radialGradient id={ids.specular} cx="0.3" cy="0.25" r="0.4">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={transform}>
        {/* 1. Background root (palatal anchor) */}
        {geometry.bgRoot ? (
          <path
            d={geometry.bgRoot}
            fill="#bc9969"
            stroke="#8c7048"
            strokeWidth="1.1"
            strokeLinejoin="round"
            opacity="0.8"
          />
        ) : null}

        {/* 2-3. Primary roots */}
        {geometry.roots.map((root, index) => (
          <path
            key={`root-${index}`}
            d={root}
            fill={`url(#${ids.rootGrad})`}
            stroke="#927954"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        ))}

        {/* 4. Root trunk base body */}
        <path d={geometry.trunk} fill="#d9caa0" stroke="#927954" strokeWidth="1.4" strokeLinejoin="round" />

        {/* 5. Anatomical crown geometry */}
        <path
          d={geometry.crown}
          fill={`url(#${ids.crownGrad})`}
          stroke="#968560"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* 6. Depth layer blend */}
        <path d={geometry.crown} fill={`url(#${ids.crownShadow})`} />

        {/* 7. Cervical line enamel transition (CEJ boundary) */}
        <path d={geometry.cervical} fill="none" stroke="#bead83" strokeWidth="1.2" opacity="0.8" />

        {/* 8. Occlusal developmental grooves & fissures */}
        {geometry.grooves.map((groove, index) => (
          <path
            key={`groove-${index}`}
            d={groove}
            fill="none"
            stroke={index === 0 ? "#b2a17b" : "#a4936c"}
            strokeWidth={index === 0 ? 1.4 : 1.1}
            strokeLinecap="round"
            opacity={index === 0 ? 1 : 0.8}
          />
        ))}

        {/* 9. Glossy enamel wet specular highlights */}
        {geometry.speculars.map((spec, index) => (
          <ellipse
            key={`spec-${index}`}
            cx={spec.cx}
            cy={spec.cy}
            rx={spec.rx}
            ry={spec.ry}
            fill={`url(#${ids.specular})`}
            transform={`rotate(${spec.rot} ${spec.cx} ${spec.cy})`}
          />
        ))}
      </g>
    </>
  )
}

export type ToothArt = {
  viewBox: string
  height: number
  render: (ids: ArtIds, orientation: ToothOrientationArt) => ReactNode
}

export const TOOTH_ART: Record<string, ToothArt> = Object.fromEntries(
  Object.entries(TOOTH_MAP).map(([tooth, { key, mirror }]) => {
    const geometry = ARCHETYPES[key]
    return [
      tooth,
      {
        viewBox: geometry.viewBox,
        height: geometry.height,
        render: (ids: ArtIds, orientation: ToothOrientationArt) =>
          renderGeometry(geometry, ids, buildTransform(geometry, orientation, mirror)),
      } satisfies ToothArt,
    ]
  })
)
