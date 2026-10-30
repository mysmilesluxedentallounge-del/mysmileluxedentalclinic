"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, Check, Download, Loader2, RefreshCw, ShieldCheck, Upload } from "lucide-react"
import {
  MIN_TOOTH_COVERAGE,
  mouthGuideRegion,
  simulateSmile,
} from "@/lib/smile-simulation"
import {
  buildResultFileName,
  composeSmileResultImage,
  formatCaptureStamp,
} from "@/lib/smile-result-image"
import {
  validateSmilePrediction,
  type SmilePredictionErrors,
  type SmilePredictionInput,
} from "@/lib/smile-predictions"

const MAIN_SITE_URL = "https://mysmileluxedentallounge.com"
const REDIRECT_SECONDS = 30

type Step = "details" | "capture" | "result"

const EMPTY_FORM: SmilePredictionInput = { fullName: "", phone: "", email: "", address: "" }

const fieldBaseClass =
  "w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-[var(--brand-dark)] outline-none transition focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[var(--brand-gold)]/35"

function fieldClass(hasError: boolean) {
  return `${fieldBaseClass} ${hasError ? "border-red-400" : "border-black/10"}`
}

export default function SmilePredictor() {
  const [step, setStep] = useState<Step>("details")
  const [form, setForm] = useState<SmilePredictionInput>(EMPTY_FORM)
  const [errors, setErrors] = useState<SmilePredictionErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const [cameraError, setCameraError] = useState("")
  const [cameraReady, setCameraReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [coverageWarning, setCoverageWarning] = useState("")

  const [capturedAt, setCapturedAt] = useState<Date | null>(null)
  const [beforeUrl, setBeforeUrl] = useState("")
  const [afterUrl, setAfterUrl] = useState("")
  const [downloading, setDownloading] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const beforeCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const afterCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  // Releasing the camera matters: on mobile the indicator stays on otherwise.
  useEffect(() => stopCamera, [stopCamera])

  const startCamera = useCallback(async () => {
    setCameraError("")
    setCameraReady(false)

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Your browser cannot open the camera here. Use the upload option below instead."
      )
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch (error) {
      const name = error instanceof Error ? error.name : ""
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraError(
          "Camera permission was blocked. Allow camera access in your browser settings, or upload a photo instead."
        )
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCameraError("No front camera was found. You can upload a photo instead.")
      } else {
        setCameraError("The camera could not be opened. You can upload a photo instead.")
      }
    }
  }, [])

  useEffect(() => {
    if (step === "capture") {
      void startCamera()
    } else {
      stopCamera()
    }
  }, [step, startCamera, stopCamera])

  function updateField(key: keyof SmilePredictionInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Clear a field's error as soon as the visitor starts correcting it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  async function handleDetailsSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError("")

    const validation = validateSmilePrediction(form)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/smile-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        if (data?.errors) setErrors(data.errors as SmilePredictionErrors)
        throw new Error(data?.error || "We could not save your details.")
      }

      setStep("capture")
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  /** Shared by the live capture and the upload fallback. */
  const renderSimulation = useCallback(
    (source: CanvasImageSource, width: number, height: number, mirror: boolean) => {
      const beforeCanvas = beforeCanvasRef.current
      const afterCanvas = afterCanvasRef.current
      if (!beforeCanvas || !afterCanvas) return

      beforeCanvas.width = width
      beforeCanvas.height = height
      afterCanvas.width = width
      afterCanvas.height = height

      const beforeCtx = beforeCanvas.getContext("2d")
      const afterCtx = afterCanvas.getContext("2d", { willReadFrequently: true })
      if (!beforeCtx || !afterCtx) return

      if (mirror) {
        // Match what the visitor saw in the mirrored preview.
        beforeCtx.translate(width, 0)
        beforeCtx.scale(-1, 1)
      }
      beforeCtx.drawImage(source, 0, 0, width, height)
      beforeCtx.setTransform(1, 0, 0, 1, 0, 0)

      afterCtx.drawImage(beforeCanvas, 0, 0)
      const imageData = afterCtx.getImageData(0, 0, width, height)
      const region = mouthGuideRegion(width, height)
      const { toothCoverage } = simulateSmile(imageData, region)
      afterCtx.putImageData(imageData, 0, 0)

      setCoverageWarning(
        toothCoverage < MIN_TOOTH_COVERAGE
          ? "We could not clearly see your teeth. For a better result, move closer and smile wide inside the guide."
          : ""
      )

      setBeforeUrl(beforeCanvas.toDataURL("image/jpeg", 0.92))
      setAfterUrl(afterCanvas.toDataURL("image/jpeg", 0.92))
      setCapturedAt(new Date())
      setStep("result")
    },
    []
  )

  function handleCapture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    setProcessing(true)
    try {
      renderSimulation(video, video.videoWidth, video.videoHeight, true)
      stopCamera()
    } finally {
      setProcessing(false)
    }
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setProcessing(true)
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        renderSimulation(img, img.naturalWidth, img.naturalHeight, false)
        stopCamera()
        setProcessing(false)
      }
      img.onerror = () => {
        setCameraError("That image could not be read. Please try another photo.")
        setProcessing(false)
      }
      img.src = String(reader.result)
    }
    reader.onerror = () => {
      setCameraError("That image could not be read. Please try another photo.")
      setProcessing(false)
    }
    reader.readAsDataURL(file)
  }

  async function handleDownload() {
    const beforeCanvas = beforeCanvasRef.current
    const afterCanvas = afterCanvasRef.current
    if (!beforeCanvas || !afterCanvas || !capturedAt) return

    setDownloading(true)
    try {
      const dataUrl = await composeSmileResultImage({
        before: beforeCanvas,
        after: afterCanvas,
        sourceWidth: beforeCanvas.width,
        sourceHeight: beforeCanvas.height,
        patientName: form.fullName,
        capturedAt,
      })

      const link = document.createElement("a")
      link.href = dataUrl
      link.download = buildResultFileName(form.fullName, capturedAt)
      document.body.appendChild(link)
      link.click()
      link.remove()

      // Send them on to the main site once they have their image.
      setCountdown(REDIRECT_SECONDS)
    } catch {
      setFormError("The image could not be prepared. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      window.location.href = MAIN_SITE_URL
      return
    }
    const timer = window.setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  function retake() {
    setBeforeUrl("")
    setAfterUrl("")
    setCapturedAt(null)
    setCoverageWarning("")
    setCountdown(null)
    setStep("capture")
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      {/* Progress */}
      <ol className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
        {(["details", "capture", "result"] as const).map((key, index) => {
          const labels = { details: "Your details", capture: "Capture", result: "Your preview" }
          const order: Step[] = ["details", "capture", "result"]
          const done = order.indexOf(step) > index
          const active = step === key
          return (
            <li key={key} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                  active
                    ? "border-[var(--brand-gold)] bg-[var(--brand-gold)] text-[var(--brand-dark)]"
                    : done
                      ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                      : "border-black/15 bg-white text-[var(--grey-mid)]"
                }`}
              >
                {done ? <Check size={13} /> : index + 1}
              </span>
              <span
                className={`hidden sm:inline ${active ? "text-[var(--brand-dark)]" : "text-[var(--grey-mid)]"}`}
              >
                {labels[key]}
              </span>
            </li>
          )
        })}
      </ol>

      {/* ---------------------------------------------------------------- */}
      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="sp-name" className="mb-1.5 block text-sm font-medium text-[var(--brand-dark)]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="sp-name"
              name="fullName"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className={fieldClass(Boolean(errors.fullName))}
              placeholder="e.g. Asha Rao"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "sp-name-error" : undefined}
              autoComplete="name"
            />
            {errors.fullName && (
              <p id="sp-name-error" className="mt-1.5 text-sm text-red-600">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sp-phone" className="mb-1.5 block text-sm font-medium text-[var(--brand-dark)]">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              id="sp-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={fieldClass(Boolean(errors.phone))}
              placeholder="e.g. 98765 43210"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "sp-phone-error" : undefined}
              autoComplete="tel"
            />
            {errors.phone && (
              <p id="sp-phone-error" className="mt-1.5 text-sm text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sp-email" className="mb-1.5 block text-sm font-medium text-[var(--brand-dark)]">
              Email <span className="text-[var(--grey-mid)]">(optional)</span>
            </label>
            <input
              id="sp-email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={fieldClass(Boolean(errors.email))}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "sp-email-error" : undefined}
              autoComplete="email"
            />
            {errors.email && (
              <p id="sp-email-error" className="mt-1.5 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sp-address" className="mb-1.5 block text-sm font-medium text-[var(--brand-dark)]">
              Address <span className="text-[var(--grey-mid)]">(optional)</span>
            </label>
            <textarea
              id="sp-address"
              name="address"
              rows={2}
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className={fieldClass(Boolean(errors.address))}
              placeholder="Area, city"
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address && <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>}
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-dark)] px-6 py-3.5 text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            {submitting ? "Please wait…" : "Continue to camera"}
          </button>

          <p className="-mt-2 text-center text-sm font-medium text-[var(--brand-dark)]">
            Click to get your smile transformation now
          </p>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-[var(--grey-mid)]">
            <ShieldCheck size={15} className="mt-0.5 shrink-0" />
            Your photo is processed entirely on your own device and is never uploaded or stored.
            We keep only the contact details above so our team can follow up.
          </p>
        </form>
      )}

      {/* ---------------------------------------------------------------- */}
      {step === "capture" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="block h-auto w-full -scale-x-100"
              aria-label="Front camera preview"
            />
            {/* Guide band — the visitor lines their mouth up with this, which is
                what lets the simulation find the teeth without face tracking. */}
            {cameraReady && (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[18%] top-[30%] h-[40%] w-[64%] rounded-[50%] border-2 border-dashed border-[var(--brand-gold)]/90" />
                <p className="absolute inset-x-0 bottom-3 text-center text-xs font-medium text-white/90 drop-shadow">
                  Line your smile up inside the guide
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{cameraError}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCapture}
              disabled={!cameraReady || processing}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--brand-dark)] px-6 py-3.5 text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {processing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              {processing ? "Processing…" : "Capture my smile"}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-lg border border-black/15 px-6 py-3.5 text-base font-semibold text-[var(--brand-dark)] transition hover:bg-[var(--brand-cream)]"
            >
              <Upload size={18} />
              Upload a photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          <ul className="space-y-1.5 text-sm text-[var(--grey-mid)]">
            <li>• Face a window or bright light — avoid backlight.</li>
            <li>• Hold the phone about 20–30 cm away.</li>
            <li>• Smile wide so the upper and lower teeth are both visible.</li>
          </ul>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {step === "result" && (
        <div className="space-y-5">
          {coverageWarning && (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{coverageWarning}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <figure>
              <figcaption className="mb-2 rounded-md bg-[var(--grey-light)] py-1.5 text-center text-xs font-bold uppercase tracking-wider text-[var(--grey-dark)]">
                Before
              </figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={beforeUrl} alt="Your smile before the simulation" className="w-full rounded-lg" />
            </figure>
            <figure>
              <figcaption className="mb-2 rounded-md bg-[var(--brand-gold)] py-1.5 text-center text-xs font-bold uppercase tracking-wider text-[var(--brand-dark)]">
                After
              </figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={afterUrl} alt="Simulated whitening preview of your smile" className="w-full rounded-lg" />
            </figure>
          </div>

          {capturedAt && (
            <p className="text-center text-xs text-[var(--grey-mid)]">
              Captured {formatCaptureStamp(capturedAt)}
            </p>
          )}

          <p className="rounded-lg bg-[var(--brand-cream)] px-4 py-3 text-xs leading-relaxed text-[var(--grey-dark)]">
            <strong className="text-[var(--brand-dark)]">About this preview:</strong> this is an
            illustrative simulation of a professional whitening result, generated on your device.
            It is not a diagnosis or a guarantee — your actual result depends on your enamel,
            staining and dental health, which our dentist will assess in person.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--brand-dark)] px-6 py-3.5 text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {downloading ? "Preparing…" : "Download my smile (JPG)"}
            </button>
            <button
              type="button"
              onClick={retake}
              className="flex items-center justify-center gap-2 rounded-lg border border-black/15 px-6 py-3.5 text-base font-semibold text-[var(--brand-dark)] transition hover:bg-[var(--brand-cream)]"
            >
              <RefreshCw size={18} />
              Retake
            </button>
          </div>

          {countdown !== null ? (
            <div className="flex flex-col items-center gap-2 rounded-lg bg-[var(--yellow-lightest)] px-4 py-3 text-sm">
              <p className="text-[var(--brand-dark)]">
                Taking you to our website in <strong>{countdown}s</strong>…
              </p>
              <div className="flex gap-3">
                <a
                  href={MAIN_SITE_URL}
                  className="font-semibold text-[var(--brand-dark)] underline underline-offset-2"
                >
                  Go now
                </a>
                <button
                  type="button"
                  onClick={() => setCountdown(null)}
                  className="text-[var(--grey-mid)] underline underline-offset-2"
                >
                  Stay here
                </button>
              </div>
            </div>
          ) : (
            <a
              href={MAIN_SITE_URL}
              className="block rounded-lg border border-[var(--brand-gold)] bg-[var(--brand-gold)] px-6 py-3.5 text-center text-base font-semibold text-[var(--brand-dark)] transition hover:opacity-90"
            >
              Explore our treatments &amp; book a consultation →
            </a>
          )}
        </div>
      )}

      {/* Offscreen working canvases. */}
      <canvas ref={beforeCanvasRef} className="hidden" />
      <canvas ref={afterCanvasRef} className="hidden" />
    </div>
  )
}
