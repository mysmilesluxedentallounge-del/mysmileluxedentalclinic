/**
 * Builds the downloadable before/after JPG for the Smile Predictor.
 *
 * Branding: clinic logo top-left, capture date/time top-right, and a footer
 * making clear the "after" is an illustrative simulation.
 */

const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 840
const HEADER_HEIGHT = 128
const FOOTER_HEIGHT = 96
const PANEL_GAP = 24
const PANEL_MARGIN = 28

const CREAM = "#fff9ef"
const GOLD = "#ffc566"
const DARK = "#2c2c2c"
const MUTED = "#7a7a7a"

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Arial, Helvetica, sans-serif"

export type SmileResultImageInput = {
  before: CanvasImageSource
  after: CanvasImageSource
  /** Natural size of the source frames, used to preserve aspect ratio. */
  sourceWidth: number
  sourceHeight: number
  patientName: string
  capturedAt: Date
  logoSrc?: string
}

export function formatCaptureStamp(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    // A missing logo must not block the download.
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/** Draws `source` to fill the box, cropping overflow rather than distorting. */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / sourceWidth, height / sourceHeight)
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.clip()
  ctx.drawImage(
    source,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  )
  ctx.restore()
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  label: string,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: string
) {
  const labelHeight = 40

  drawImageCover(ctx, source, sourceWidth, sourceHeight, x, y + labelHeight, width, height - labelHeight)

  ctx.fillStyle = accent
  ctx.fillRect(x, y, width, labelHeight)

  ctx.fillStyle = label === "AFTER" ? DARK : "#ffffff"
  ctx.font = `bold 18px ${SANS}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(label, x + width / 2, y + labelHeight / 2 + 1)

  ctx.strokeStyle = "rgba(0,0,0,0.12)"
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1)
}

/**
 * Renders the composite and returns it as a JPEG data URL, ready to hand to a
 * download link.
 */
export async function composeSmileResultImage(
  input: SmileResultImageInput
): Promise<string> {
  const canvas = document.createElement("canvas")
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not create the result image.")

  ctx.fillStyle = CREAM
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // --- Header -------------------------------------------------------------
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, CANVAS_WIDTH, HEADER_HEIGHT)
  ctx.fillStyle = GOLD
  ctx.fillRect(0, HEADER_HEIGHT - 4, CANVAS_WIDTH, 4)

  const logo = await loadImage(input.logoSrc ?? "/logo.png")
  let textLeft = PANEL_MARGIN
  if (logo) {
    const logoHeight = 60
    const logoWidth = (logo.naturalWidth / logo.naturalHeight) * logoHeight
    ctx.drawImage(logo, PANEL_MARGIN, (HEADER_HEIGHT - 4 - logoHeight) / 2, logoWidth, logoHeight)
    textLeft = PANEL_MARGIN + logoWidth + 18
  }

  ctx.textAlign = "left"
  ctx.textBaseline = "alphabetic"
  ctx.fillStyle = DARK
  ctx.font = `bold 26px ${SERIF}`
  ctx.fillText("MySmile Luxe Dental Lounge", textLeft, 54)
  ctx.fillStyle = MUTED
  ctx.font = `14px ${SANS}`
  ctx.fillText("Smile Predictor — personalised preview", textLeft, 78)

  // Date and time, top right as requested.
  ctx.textAlign = "right"
  ctx.fillStyle = DARK
  ctx.font = `bold 15px ${SANS}`
  ctx.fillText(formatCaptureStamp(input.capturedAt), CANVAS_WIDTH - PANEL_MARGIN, 50)
  ctx.fillStyle = MUTED
  ctx.font = `13px ${SANS}`
  ctx.fillText("mysmileluxedentallounge.com", CANVAS_WIDTH - PANEL_MARGIN, 74)

  const name = input.patientName.trim()
  if (name) {
    ctx.fillStyle = MUTED
    ctx.font = `13px ${SANS}`
    ctx.fillText(name, CANVAS_WIDTH - PANEL_MARGIN, 96)
  }

  // --- Before / after panels ----------------------------------------------
  const panelTop = HEADER_HEIGHT + PANEL_MARGIN
  const panelHeight = CANVAS_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - PANEL_MARGIN * 2
  const panelWidth = (CANVAS_WIDTH - PANEL_MARGIN * 2 - PANEL_GAP) / 2

  drawPanel(
    ctx,
    "BEFORE",
    input.before,
    input.sourceWidth,
    input.sourceHeight,
    PANEL_MARGIN,
    panelTop,
    panelWidth,
    panelHeight,
    "#8a8a8a"
  )
  drawPanel(
    ctx,
    "AFTER",
    input.after,
    input.sourceWidth,
    input.sourceHeight,
    PANEL_MARGIN + panelWidth + PANEL_GAP,
    panelTop,
    panelWidth,
    panelHeight,
    GOLD
  )

  // --- Footer -------------------------------------------------------------
  const footerTop = CANVAS_HEIGHT - FOOTER_HEIGHT
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, footerTop, CANVAS_WIDTH, FOOTER_HEIGHT)
  ctx.fillStyle = GOLD
  ctx.fillRect(0, footerTop, CANVAS_WIDTH, 3)

  ctx.textAlign = "left"
  ctx.fillStyle = DARK
  ctx.font = `bold 15px ${SANS}`
  ctx.fillText("Book your smile consultation — +91 6304693676", PANEL_MARGIN, footerTop + 38)

  ctx.fillStyle = MUTED
  ctx.font = `12px ${SANS}`
  ctx.fillText(
    "Illustrative simulation of a professional whitening result. Not a clinical guarantee — actual outcomes vary by individual.",
    PANEL_MARGIN,
    footerTop + 64
  )

  ctx.textAlign = "right"
  ctx.fillStyle = DARK
  ctx.font = `bold 13px ${SANS}`
  ctx.fillText("Level 2, SLN Terminus Mall, Gachibowli", CANVAS_WIDTH - PANEL_MARGIN, footerTop + 38)

  return canvas.toDataURL("image/jpeg", 0.92)
}

/** Filename like `MySmile-Smile-Predictor-Asha-Rao-2026-10-26.jpg`. */
export function buildResultFileName(patientName: string, capturedAt: Date) {
  const slug =
    patientName
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40) || "Guest"
  const date = capturedAt.toISOString().slice(0, 10)
  return `MySmile-Smile-Predictor-${slug}-${date}.jpg`
}
