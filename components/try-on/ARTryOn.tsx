"use client";

/**
 * ARTryOn.tsx — Gesture-Triggered AI Virtual Try-On
 * ===================================================
 * Real-time 2D overlay via MediaPipe Pose + Hands.
 * Gesture → countdown → canvas capture → IDM-VTON (HF Spaces)
 * → realistic AI-generated try-on image in the result modal.
 *
 * Gesture vocabulary:
 *   ✋ 1 hand raised (wrist above shoulder) → starts 3s countdown → lower hand & pose freely → AI snapshot
 *   🤚 2 hands raised                       → starts 3s countdown → cycle to next garment (demo mode only)
 *   [Hủy button on screen]                  → cancel countdown at any time
 *
 * Modal tabs:
 *   "overlay" — AR overlay snapshot (instant, math-based positioning)
 *   "tryon"   — AI-generated realistic image from IDM-VTON (30–90s, free on HF)
 *
 * Props:
 *   product — when provided, the component locks to that product's arOverlay
 *             image and config; the garment carousel is hidden.
 *             Falls back to the built-in GARMENTS demo list when omitted.
 */

import { useRef, useEffect, useState, useCallback } from "react";
import type { Product } from "@/app/data/products";
import Webcam from "react-webcam";
import {
  Camera as CameraIcon,
  Download,
  FlipHorizontal,
  Bug,
  Loader2,
  Sparkles,
  Shirt,
  Eye,
  EyeOff,
  X,
  HandMetal,
  ImageIcon,
  Layers,
  RefreshCw,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface GarmentOption {
  id: string;
  name: string;
  image: string;
  emoji: string;
  widthMultiplier: number;
  aspectRatio: number;
  verticalOffsetRatio: number;
  /** Natural language description for IDM-VTON */
  description: string;
}

interface SmoothedLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface CountdownState {
  active: boolean;
  remaining: number; // seconds
  handsUp: number;   // 1 or 2
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const GARMENTS: GarmentOption[] = [
  {
    id: "white-tee",
    name: "White Tee",
    image: "/try-on/overlays/p1-white-tee.png",
    emoji: "👕",
    widthMultiplier: 2.0,
    aspectRatio: 1.2,
    verticalOffsetRatio: 0,
    description: "A plain white cotton crew-neck t-shirt, short sleeves, relaxed fit.",
  },
  {
    id: "hoodie",
    name: "Black Hoodie",
    image: "/try-on/overlays/p2-hoodie.png",
    emoji: "🧥",
    widthMultiplier: 2.1,
    aspectRatio: 1.25,
    verticalOffsetRatio: 0,
    description: "An oversized black pullover hoodie with front kangaroo pocket and drawstring hood.",
  },
  {
    id: "sweatshirt",
    name: "Sweatshirt",
    image: "/try-on/overlays/p3-sweatshirt.png",
    emoji: "👔",
    widthMultiplier: 2.0,
    aspectRatio: 1.2,
    verticalOffsetRatio: 0,
    description: "A classic grey crewneck sweatshirt, medium weight fleece, regular fit.",
  },
  {
    id: "denim-jacket",
    name: "Denim Jacket",
    image: "/try-on/overlays/p4-denim-jacket.png",
    emoji: "🧣",
    widthMultiplier: 2.2,
    aspectRatio: 1.15,
    verticalOffsetRatio: 0,
    description: "A classic mid-blue denim jacket with two chest pockets and button front closure.",
  },
];

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;
const LERP_FACTOR = 0.35;
const COUNTDOWN_SEC = 3;

// MediaPipe Hands wrist landmark index
const WRIST = 0;

// ─── UTILITY ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpLandmark(
  prev: SmoothedLandmark,
  next: { x: number; y: number; z: number; visibility?: number },
  t: number,
): SmoothedLandmark {
  return {
    x: lerp(prev.x, next.x, t),
    y: lerp(prev.y, next.y, t),
    z: lerp(prev.z, next.z, t),
    visibility: lerp(prev.visibility, next.visibility ?? 0, t),
  };
}

/**
 * Convert a canvas to a base64 JPEG string (no data-URL prefix).
 * Downscales to max 1024px on the longest side for API efficiency.
 */
function canvasToBase64(canvas: HTMLCanvasElement): string {
  const MAX = 1024;
  const scale = Math.min(1, MAX / Math.max(canvas.width, canvas.height));
  const tmp = document.createElement("canvas");
  tmp.width = Math.round(canvas.width * scale);
  tmp.height = Math.round(canvas.height * scale);
  const ctx = tmp.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0, tmp.width, tmp.height);
  // Remove the "data:image/jpeg;base64," prefix
  return tmp.toDataURL("image/jpeg", 0.85).split(",")[1];
}

/**
 * Composites the transparent garment image onto a white background canvas
 * and returns it as a base64 JPEG string (no data-URL prefix).
 * IDM-VTON expects a flat-lay garment on a solid background (ideally white).
 */
function getGarmentBase64WithWhiteBg(img: HTMLImageElement | null): string | null {
  if (!img) return null;
  try {
    const canvas = document.createElement("canvas");
    // Standard size for IDM-VTON garment input is typically 768x1024
    canvas.width = 768;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fill with solid white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get the source image size
    const imgWidth = img.naturalWidth || img.width || 768;
    const imgHeight = img.naturalHeight || img.height || 1024;

    // Fit garment with padding
    const padding = 40;
    const maxWidth = canvas.width - padding * 2;
    const maxHeight = canvas.height - padding * 2;

    const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    // Convert to JPEG (stripping transparency, keeping white background)
    return canvas.toDataURL("image/jpeg", 0.95).split(",")[1];
  } catch (e) {
    console.error("Failed to render garment with white background:", e);
    return null;
  }
}

// ─── IDM-VTON (via /api/virtual-tryon proxy) ─────────────────────────────────

interface VirtualTryOnResult {
  resultUrl?: string;
  fallback: boolean;
  error?: string;
}

async function fetchVirtualTryOn(
  personImageBase64: string,
  garment: GarmentOption,
  garmentImageBase64?: string,
): Promise<VirtualTryOnResult> {
  const response = await fetch("/api/virtual-tryon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personImageBase64,
      garmentId: garment.id,
      garmentDescription: garment.description,
      garmentImageBase64,
    }),
  });

  const data = await response.json() as VirtualTryOnResult;
  return data;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

interface Props {
  /** When provided, locks the AR overlay to this product's tryOn.arOverlay config. */
  product?: Product;
}

export default function ARTryOn({ product }: Props = {}) {
  // ─── EFFECTIVE GARMENTS ───────────────────────────────────────────────────
  // Single-product mode: derive one GarmentOption from the product's arOverlay.
  // Demo / standalone mode: fall back to the built-in GARMENTS list.
  const effectiveGarments: GarmentOption[] = product?.tryOn?.arOverlay
    ? [
      {
        id: product.id,
        name: product.name,
        image: product.tryOn.arOverlay.src,
        emoji: "👕",
        widthMultiplier: product.tryOn.arOverlay.widthMultiplier ?? 2.0,
        aspectRatio: product.tryOn.arOverlay.aspectRatio ?? 1.2,
        verticalOffsetRatio: product.tryOn.arOverlay.verticalOffsetRatio ?? 0,
        description: product.description,
      },
    ]
    : GARMENTS;

  // True when a specific product was passed in (single-garment mode)
  const isSingleProductMode = effectiveGarments.length === 1;
  // Refs
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const garmentImgRef = useRef<HTMLImageElement | null>(null);
  const smoothedLandmarksRef = useRef<SmoothedLandmark[] | null>(null);
  const fpsRef = useRef({ count: 0, lastTime: performance.now(), fps: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poseRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handsRef = useRef<any>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // True while the snapshot/result modal is open — gesture trigger is suppressed
  const snapshotOpenRef = useRef(false);

  // Latest pose landmarks for the hand-gesture checker
  const latestPoseLandmarks = useRef<SmoothedLandmark[] | null>(null);
  // Latest hand landmarks from MediaPipe Hands
  const latestHandData = useRef<{ count: number; allWristsAboveShoulder: boolean }>({
    count: 0,
    allWristsAboveShoulder: false,
  });

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState("Initializing...");
  const [selectedGarment, setSelectedGarment] = useState<GarmentOption>(effectiveGarments[0]);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [fps, setFps] = useState(0);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [poseDetected, setPoseDetected] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>({
    active: false, remaining: COUNTDOWN_SEC, handsUp: 0,
  });

  // ── IDM-VTON state ────────────────────────────────────────────────
  const [tryOnUrl, setTryOnUrl] = useState<string | null>(null);
  const [tryOnState, setTryOnState] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [tryOnError, setTryOnError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overlay" | "tryon">("overlay");

  // Keep selectedGarment accessible in callbacks without re-initialising pose
  const selectedGarmentRef = useRef(selectedGarment);
  useEffect(() => { selectedGarmentRef.current = selectedGarment; }, [selectedGarment]);

  const isMirroredRef = useRef(isMirrored);
  useEffect(() => { isMirroredRef.current = isMirrored; }, [isMirrored]);

  const showOverlayRef = useRef(showOverlay);
  useEffect(() => { showOverlayRef.current = showOverlay; }, [showOverlay]);

  const showSkeletonRef = useRef(showSkeleton);
  useEffect(() => { showSkeletonRef.current = showSkeleton; }, [showSkeleton]);

  // Sync snapshotOpenRef so gesture callbacks can check without stale closures
  useEffect(() => { snapshotOpenRef.current = snapshotUrl !== null; }, [snapshotUrl]);

  // ─── PRELOAD GARMENT IMAGE ───────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedGarment.image;
    img.onload = () => { garmentImgRef.current = img; };
    img.onerror = () => { garmentImgRef.current = null; };
  }, [selectedGarment]);

  // ─── FPS ────────────────────────────────────────────────────────────
  const updateFps = useCallback(() => {
    const now = performance.now();
    fpsRef.current.count++;
    if (now - fpsRef.current.lastTime >= 1000) {
      fpsRef.current.fps = fpsRef.current.count;
      fpsRef.current.count = 0;
      fpsRef.current.lastTime = now;
      setFps(fpsRef.current.fps);
    }
  }, []);

  // ─── AI SNAPSHOT → IDM-VTON ─────────────────────────────────────
  const triggerAISnapshot = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture snapshot + reset all states
    const imageBase64 = canvasToBase64(canvas);
    const snapshotDataUrl = canvas.toDataURL("image/png");

    setSnapshotUrl(snapshotDataUrl);
    setTryOnUrl(null);
    setTryOnState("generating");
    setTryOnError("");
    // Only reset to overlay on a fresh trigger — don't yank user away if they're already watching the tryon tab
    setActiveTab((prev) => (prev === "tryon" ? "tryon" : "overlay"));

    const garment = selectedGarmentRef.current;

    // Composite the garment on a white background before sending to IDM-VTON
    const garmentImg = garmentImgRef.current;
    const garmentImageBase64 = getGarmentBase64WithWhiteBg(garmentImg) || undefined;

    // Call IDM-VTON — takes 30–90s on free HF ZeroGPU
    try {
      const result = await fetchVirtualTryOn(imageBase64, garment, garmentImageBase64);
      if (result.fallback || !result.resultUrl) {
        setTryOnState("error");
        setTryOnError(result.error ?? "IDM-VTON không khả dụng lúc này.");
      } else {
        setTryOnUrl(result.resultUrl);
        setTryOnState("done");
        setActiveTab("tryon"); // auto-switch when result is ready
      }
    } catch (err) {
      console.error("IDM-VTON error:", err);
      setTryOnState("error");
      setTryOnError("Không thể kết nối IDM-VTON. Thử lại sau.");
    }
  }, []);

  // ─── GESTURE → COUNTDOWN LOGIC ───────────────────────────────────────
  const startCountdown = useCallback(
    (handsUp: number) => {
      if (countdownTimerRef.current) return; // already running

      setCountdown({ active: true, remaining: COUNTDOWN_SEC, handsUp });

      let remaining = COUNTDOWN_SEC;
      countdownTimerRef.current = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(countdownTimerRef.current!);
          countdownTimerRef.current = null;
          setCountdown({ active: false, remaining: COUNTDOWN_SEC, handsUp: 0 });

          if (handsUp === 2 && effectiveGarments.length > 1) {
            // Cycle garment (demo/multi-garment mode only)
            setSelectedGarment((prev) => {
              const idx = effectiveGarments.findIndex((g) => g.id === prev.id);
              return effectiveGarments[(idx + 1) % effectiveGarments.length];
            });
          } else {
            // Trigger AI snapshot
            triggerAISnapshot();
          }
        } else {
          setCountdown({ active: true, remaining, handsUp });
        }
      }, 1000);
    },
    [triggerAISnapshot],
  );

  const cancelCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown({ active: false, remaining: COUNTDOWN_SEC, handsUp: 0 });
  }, []);

  // ─── CHECK GESTURE EACH FRAME ────────────────────────────────────────
  const checkGesture = useCallback(() => {
    if (countdownTimerRef.current) return;
    if (snapshotOpenRef.current) return; // modal is open — don't re-trigger

    const pose = latestPoseLandmarks.current;
    const hands = latestHandData.current;

    if (!pose || hands.count === 0 || !hands.allWristsAboveShoulder) return;

    const lShoulder = pose[LEFT_SHOULDER];
    const rShoulder = pose[RIGHT_SHOULDER];
    if (!lShoulder || !rShoulder) return;

    startCountdown(hands.count);
  }, [startCountdown]);

  // ─── DRAW OVERLAY ON CANVAS ─────────────────────────────────────────
  const drawOverlay = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      smoothed: SmoothedLandmark[],
    ) => {
      const mirrored = isMirroredRef.current;
      const showOvr = showOverlayRef.current;
      const showSkel = showSkeletonRef.current;
      const garment = selectedGarmentRef.current;

      const leftShoulder = smoothed[LEFT_SHOULDER];
      const rightShoulder = smoothed[RIGHT_SHOULDER];
      const leftHip = smoothed[LEFT_HIP];
      const rightHip = smoothed[RIGHT_HIP];

      if (Math.min(leftShoulder.visibility, rightShoulder.visibility) < 0.3) return;

      const toX = (n: number) =>
        mirrored ? canvas.width - n * canvas.width : n * canvas.width;
      const toY = (n: number) => n * canvas.height;

      const lsX = toX(leftShoulder.x), lsY = toY(leftShoulder.y);
      const rsX = toX(rightShoulder.x), rsY = toY(rightShoulder.y);
      const lhX = toX(leftHip.x), lhY = toY(leftHip.y);
      const rhX = toX(rightHip.x), rhY = toY(rightHip.y);

      const shoulderDist = Math.hypot(rsX - lsX, rsY - lsY);
      const centerX = (lsX + rsX) / 2;
      const centerY = (lsY + rsY) / 2;
      const angle = Math.atan2(rsY - lsY, rsX - lsX);
      const hipCenterX = (lhX + rhX) / 2;
      const hipCenterY = (lhY + rhY) / 2;
      const torsoLength = Math.hypot(hipCenterX - centerX, hipCenterY - centerY);

      const { widthMultiplier, aspectRatio, verticalOffsetRatio } = garment;

      // Base computed values
      const baseWidth = shoulderDist * widthMultiplier;
      const baseHeight = Math.max(baseWidth * aspectRatio, torsoLength * 1.3);
      const baseVOffset = torsoLength * verticalOffsetRatio;

      // Overlay uses fixed math-based positioning (no AI params needed)
      const scale = 1.2;
      const dxPx = 0;
      const dyPx = 0;
      const rotExtra = 0;
      const opacity = 0.92;

      const clothingWidth = baseWidth * scale;
      const clothingHeight = baseHeight * scale;

      if (showOvr && garmentImgRef.current) {
        ctx.save();
        ctx.translate(centerX + dxPx, centerY + baseVOffset + dyPx);
        ctx.rotate(angle + rotExtra);
        ctx.globalAlpha = opacity;
        ctx.drawImage(
          garmentImgRef.current,
          -clothingWidth / 2,
          -clothingHeight * 0.3,
          clothingWidth,
          clothingHeight,
        );
        ctx.globalAlpha = 1.0;
        ctx.restore();
      }

      // Debug skeleton
      if (showSkel) {
        const dLandmarks = smoothed.map((lm) => ({
          ...lm,
          x: mirrored ? 1 - lm.x : lm.x,
        }));

        ctx.fillStyle = "#00FFD1";
        ctx.beginPath(); ctx.arc(lsX, lsY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rsX, rsY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FF6B6B";
        ctx.beginPath(); ctx.arc(centerX, centerY, 5, 0, Math.PI * 2); ctx.fill();

        dLandmarks.forEach((lm) => {
          if (lm.visibility > 0.3) {
            ctx.fillStyle = "#FF006640";
            ctx.beginPath();
            ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    },
    [],
  );

  // ─── MEDIAPIPE POSE CALLBACK ─────────────────────────────────────────
  const onResultsRef = useRef<((results: unknown) => void) | null>(null);

  const onPoseResults = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (results: any) => {
      updateFps();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const video = webcamRef.current?.video;
      if (!video) return;

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      if (isMirroredRef.current) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (!results.poseLandmarks?.length) {
        setPoseDetected(false);
        latestPoseLandmarks.current = null;
        return;
      }
      setPoseDetected(true);

      const rawLandmarks = results.poseLandmarks;
      let smoothed: SmoothedLandmark[];

      if (smoothedLandmarksRef.current) {
        smoothed = rawLandmarks.map(
          (lm: { x: number; y: number; z: number; visibility?: number }, i: number) =>
            lerpLandmark(smoothedLandmarksRef.current![i], lm, LERP_FACTOR),
        );
      } else {
        smoothed = rawLandmarks.map(
          (lm: { x: number; y: number; z: number; visibility?: number }) => ({
            x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility ?? 0,
          }),
        );
      }
      smoothedLandmarksRef.current = smoothed;
      latestPoseLandmarks.current = smoothed;

      drawOverlay(ctx, canvas, smoothed);
      checkGesture();
    },
    [updateFps, drawOverlay, checkGesture],
  );

  useEffect(() => { onResultsRef.current = onPoseResults; }, [onPoseResults]);

  // ─── MEDIAPIPE HANDS CALLBACK ────────────────────────────────────────
  const onHandsResultsRef = useRef<((results: unknown) => void) | null>(null);

  const onHandsResults = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (results: any) => {
      const pose = latestPoseLandmarks.current;
      if (!pose) { latestHandData.current = { count: 0, allWristsAboveShoulder: false }; return; }

      const handLandmarks = results.multiHandLandmarks ?? [];
      const count = handLandmarks.length;

      if (count === 0) {
        latestHandData.current = { count: 0, allWristsAboveShoulder: false };
        return;
      }

      // Average shoulder Y (normalised) — a wrist above this is raised
      const shoulderY = (pose[LEFT_SHOULDER].y + pose[RIGHT_SHOULDER].y) / 2;

      const allAbove = handLandmarks.every(
        (hand: { x: number; y: number; z: number }[]) =>
          hand[WRIST].y < shoulderY - 0.05, // 5% above shoulder for comfort
      );

      latestHandData.current = { count, allWristsAboveShoulder: allAbove };
    },
    [],
  );

  useEffect(() => { onHandsResultsRef.current = onHandsResults; }, [onHandsResults]);

  // ─── INITIALIZE MEDIAPIPE POSE + HANDS + CAMERA ──────────────────────
  useEffect(() => {
    let isMounted = true;

    const initAll = async () => {
      try {
        setLoadingProgress("Loading AI Pose Model...");

        const loadScriptGlobal = async (url: string, globalName: string) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof (window as any)[globalName] === "function") return;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
          const code = await res.text();
          (0, eval)(code); // indirect eval → runs in global scope
        };

        await loadScriptGlobal(
          "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js",
          "Pose",
        );

        setLoadingProgress("Loading Hand Detection Model...");
        await loadScriptGlobal(
          "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js",
          "Hands",
        );

        setLoadingProgress("Loading Camera Utils...");
        await loadScriptGlobal(
          "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js",
          "Camera",
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        const { Pose, Hands, Camera } = w;

        if (typeof Pose !== "function") throw new Error("Pose failed to load");
        if (typeof Hands !== "function") throw new Error("Hands failed to load");
        if (typeof Camera !== "function") throw new Error("Camera failed to load");

        // ── Pose ──
        const pose = new Pose({
          locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        pose.onResults((r: unknown) => {
          if (isMounted && onResultsRef.current) onResultsRef.current(r);
        });
        poseRef.current = pose;

        // ── Hands ──
        const hands = new Hands({
          locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 0,           // light model for speed
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });
        hands.onResults((r: unknown) => {
          if (isMounted && onHandsResultsRef.current) onHandsResultsRef.current(r);
        });
        handsRef.current = hands;

        setLoadingProgress("Starting camera feed...");

        // Wait for video
        const waitForVideo = () =>
          new Promise<HTMLVideoElement>((resolve, reject) => {
            const check = (retries = 0) => {
              const video = webcamRef.current?.video;
              if (video && video.readyState >= 2) {
                resolve(video);
              } else if (retries > 60) {
                reject(new Error("Webcam timeout — check camera permissions"));
              } else {
                setTimeout(() => check(retries + 1), 200);
              }
            };
            check();
          });

        const video = await waitForVideo();

        // Alternate sending frames to Pose and Hands every other frame
        // to keep FPS high (both share the same video element)
        let frameIdx = 0;
        const camera = new Camera(video, {
          onFrame: async () => {
            if (!isMounted) return;
            try {
              frameIdx++;
              // Send to Pose every frame, Hands every 2nd frame
              await poseRef.current?.send({ image: video });
              if (frameIdx % 2 === 0) {
                await handsRef.current?.send({ image: video });
              }
            } catch {
              // ignore teardown errors
            }
          },
          width: 1280,
          height: 720,
        });

        cameraRef.current = camera;
        await camera.start();

        if (isMounted) setIsLoading(false);
      } catch (error) {
        console.error("Init error:", error);
        if (isMounted) {
          setCameraError(
            error instanceof Error ? error.message : "Failed to initialize camera or AI model",
          );
          setIsLoading(false);
        }
      }
    };

    initAll();

    return () => {
      isMounted = false;
      cameraRef.current?.stop();
      poseRef.current?.close();
      handsRef.current?.close();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── SNAPSHOT (MANUAL) ───────────────────────────────────────────────
  const takeSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSnapshotUrl(canvas.toDataURL("image/png"));
    setTryOnUrl(null);
    setTryOnState("idle");
    setTryOnError("");
    setActiveTab("overlay");
  }, []);

  const downloadSnapshot = useCallback(() => {
    const url = activeTab === "tryon" && tryOnUrl ? tryOnUrl : snapshotUrl;
    if (!url) return;
    const suffix = activeTab === "tryon" ? "ai-tryon" : "overlay";
    const link = document.createElement("a");
    link.download = `vtry-${selectedGarment.id}-${suffix}-${Date.now()}.png`;
    link.href = url;
    link.click();
  }, [snapshotUrl, tryOnUrl, activeTab, selectedGarment.id]);

  // ─── RENDER ──────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden select-none">

      {/* Hidden webcam */}
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={isMirrored}
        videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
        onUserMediaError={(err) => {
          setCameraError(
            typeof err === "string" ? err : "Camera access denied. Please allow camera permissions.",
          );
          setIsLoading(false);
        }}
        style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
      />

      {/* AR Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain" />

      {/* ── COUNTDOWN OVERLAY ──────────────────────────────────────── */}
      {countdown.active && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
          {/* Dimmed ring */}
          <div className="relative flex items-center justify-center">
            <svg className="absolute" width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx="90" cy="90" r="80"
                fill="none"
                stroke="rgba(255,111,97,0.15)"
                strokeWidth="8"
              />
              <circle
                cx="90" cy="90" r="80"
                fill="none"
                stroke="#FF6F61"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(countdown.remaining / COUNTDOWN_SEC) * 502} 502`}
                transform="rotate(-90 90 90)"
                style={{ transition: "stroke-dasharray 0.9s linear" }}
              />
            </svg>
            <div className="flex flex-col items-center pointer-events-none">
              <span className="text-7xl font-black text-white tabular-nums leading-none">
                {countdown.remaining}
              </span>
              <span className="text-[#FF6F61] text-sm font-semibold mt-1">
                {countdown.handsUp === 2 && !isSingleProductMode ? "👕 Đang đổi áo..." : "📸 Tạo dáng đi!"}
              </span>
            </div>
          </div>
          <p className="text-zinc-400 text-xs mt-4 pointer-events-none">
            {countdown.handsUp === 2 && !isSingleProductMode
              ? "Hạ tay xuống · tự do di chuyển"
              : "Hạ tay xuống · tự do tạo dáng"}
          </p>
          {/* Cancel button */}
          <button
            onClick={cancelCountdown}
            className="mt-4 flex items-center gap-1.5 text-zinc-400 text-xs px-5 py-2 rounded-full border border-zinc-600 hover:border-zinc-400 hover:text-zinc-200 bg-zinc-900/70 backdrop-blur-sm transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Hủy
          </button>
        </div>
      )}

      {/* ── GESTURE HINT (shown when no countdown, not loading) ────── */}
      {!isLoading && !cameraError && !countdown.active && !snapshotUrl && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-0 hover:opacity-100">
          {/* invisible — just here as a slot */}
        </div>
      )}

      {/* ── LOADING SCREEN ─────────────────────────────────────────── */}
      {isLoading && !cameraError && (
        <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6F61]/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-8">
              <Loader2 className="w-16 h-16 text-[#FF6F61] animate-spin" />
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{loadingProgress}</h2>
            <p className="text-zinc-500 text-sm max-w-md text-center leading-relaxed">
              Đang tải Pose + Hand Detection + Gemini Vision. Lần đầu mất 10–20 giây.
            </p>
            <div className="w-64 h-1.5 bg-zinc-800 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FF6F61] to-amber-400 rounded-full animate-[loading-bar_3s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      )}

      {/* ── CAMERA ERROR ───────────────────────────────────────────── */}
      {cameraError && (
        <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CameraIcon className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Camera Access Required</h2>
            <p className="text-zinc-400 text-sm mb-6">{cameraError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FF6F61] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#fa5c4d] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── TOP LEFT: FPS + STATUS ─────────────────────────────────── */}
      {!isLoading && !cameraError && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <div className="bg-zinc-900/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-zinc-700/50 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${fps >= 24 ? "bg-emerald-400" : fps >= 15 ? "bg-amber-400" : "bg-red-400"
              }`} />
            <span className="text-xs font-mono text-zinc-300">{fps} FPS</span>
          </div>
          <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${poseDetected
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}>
            {poseDetected ? "✓ Pose Detected" : "⟳ Looking for you..."}
          </div>
          {/* Kolors AI status badge */}
          {tryOnState === "generating" && (
            <div className="bg-violet-500/10 border border-violet-500/30 text-violet-400 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Kolors AI...
            </div>
          )}
          {tryOnState === "done" && (
            <div className="bg-violet-500/10 border border-violet-500/30 text-violet-400 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </div>
          )}
        </div>
      )}

      {/* ── TOP RIGHT: CONTROLS ────────────────────────────────────── */}
      {!isLoading && !cameraError && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setIsMirrored((v) => !v)}
            className={`p-2.5 rounded-xl border transition-all ${isMirrored
              ? "bg-white/10 border-white/20 text-white"
              : "bg-zinc-900/80 border-zinc-700/50 text-zinc-400"
              } hover:bg-white/20`}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowOverlay((v) => !v)}
            className={`p-2.5 rounded-xl border transition-all ${showOverlay
              ? "bg-[#FF6F61]/20 border-[#FF6F61]/30 text-[#FF6F61]"
              : "bg-zinc-900/80 border-zinc-700/50 text-zinc-400"
              } hover:bg-[#FF6F61]/30`}
          >
            {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSkeleton((v) => !v)}
            className={`p-2.5 rounded-xl border transition-all ${showSkeleton
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-zinc-900/80 border-zinc-700/50 text-zinc-400"
              } hover:bg-emerald-500/30`}
          >
            <Bug className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── GESTURE GUIDE (always visible when live) ───────────────── */}
      {!isLoading && !cameraError && !countdown.active && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700/50 rounded-full px-4 py-2 flex items-center gap-3 text-xs">
            <HandMetal className="w-3.5 h-3.5 text-[#FF6F61]" />
            <span className="text-zinc-400">
              <span className="text-white font-semibold">✋ 1 tay</span> → AI chụp ảnh
            </span>
            {!isSingleProductMode && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-zinc-400">
                  <span className="text-white font-semibold">🤚 2 tay</span> → đổi áo
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM: GARMENT SELECTOR + SNAPSHOT ───────────────────── */}
      {!isLoading && !cameraError && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-700/50 p-2 flex items-center gap-2 flex-wrap justify-center">

            {/* ── Single-product mode: show product chip ── */}
            {isSingleProductMode ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/10">
                <span className="text-lg">{selectedGarment.emoji}</span>
                <span className="text-sm font-semibold truncate max-w-[180px]">{selectedGarment.name}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6F61] animate-pulse ml-1" />
              </div>
            ) : (
              /* ── Demo mode: full garment carousel ── */
              effectiveGarments.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGarment(g)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${selectedGarment.id === g.id
                    ? "bg-white/15 text-white shadow-lg"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                >
                  <span className="text-lg">{g.emoji}</span>
                  <span className="text-sm font-semibold">{g.name}</span>
                  {selectedGarment.id === g.id && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#FF6F61] rounded-full" />
                  )}
                </button>
              ))
            )}

            <div className="w-px h-8 bg-zinc-700/50 mx-1" />

            <button
              onClick={takeSnapshot}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              <CameraIcon className="w-4 h-4" />
              Manual
            </button>

            <button
              onClick={triggerAISnapshot}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6F61] text-white font-bold text-sm hover:bg-[#fa5c4d] transition-all hover:shadow-lg hover:shadow-[#FF6F61]/20 active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              AI Try-On
            </button>
          </div>

          <p className="text-zinc-600 text-xs font-medium tracking-wide">
            <Shirt className="w-3 h-3 inline mr-1" />
            Đứng 60–90cm · Để vai lộ rõ ·{" "}
            <span className="text-violet-400">Powered by MediaPipe + Kolors AI (HF)</span>
          </p>
        </div>
      )}

      {/* ── SNAPSHOT / AI RESULT MODAL ─────────────────────────────── */}
      {snapshotUrl && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-zinc-900 rounded-2xl border border-zinc-700/80 overflow-hidden max-w-2xl w-full shadow-2xl">

            {/* Close */}
            <button
              onClick={() => {
                setSnapshotUrl(null);
                setTryOnUrl(null);
                setTryOnState("idle");
                setTryOnError("");
                setActiveTab("overlay");
              }}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ── TAB SWITCHER ── */}
            <div className="flex border-b border-zinc-800 bg-zinc-950/50">
              <button
                onClick={() => setActiveTab("overlay")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === "overlay"
                  ? "border-[#FF6F61] text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                <Layers className="w-4 h-4" />
                AR Overlay
              </button>
              <button
                onClick={() => setActiveTab("tryon")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === "tryon"
                  ? "border-violet-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                <ImageIcon className="w-4 h-4" />
                AI Try-On
                {tryOnState === "generating" && (
                  <Loader2 className="w-3 h-3 animate-spin text-violet-400 ml-1" />
                )}
                {tryOnState === "done" && (
                  <span className="ml-1 text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded-full">NEW</span>
                )}
              </button>
            </div>

            {/* ── TAB CONTENT ── */}
            <div className="relative">

              {/* Overlay tab — instant snapshot with math-based clothing overlay */}
              {activeTab === "overlay" && (
                <div className="relative">
                  <img
                    src={snapshotUrl}
                    alt="AR Overlay Snapshot"
                    className="w-full object-contain max-h-[60vh]"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-300" />
                    <span className="text-zinc-300 text-xs font-semibold">AR Overlay (Math-based)</span>
                  </div>
                </div>
              )}

              {/* AI Try-On tab */}
              {activeTab === "tryon" && (
                <div className="relative min-h-[300px] flex items-center justify-center bg-zinc-950">

                  {/* Generating state — skeleton + progress */}
                  {tryOnState === "generating" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                      {/* Pulsing garment preview */}
                      <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rounded-2xl bg-violet-500/10 animate-pulse" />
                        <div className="absolute inset-2 rounded-xl bg-violet-500/5 flex items-center justify-center">
                          <span className="text-5xl">{selectedGarment.emoji}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-base mb-1">Kolors AI đang tạo ảnh...</p>
                        <p className="text-zinc-400 text-sm">AI đang render {selectedGarment.name} lên người bạn</p>
                        <p className="text-zinc-600 text-xs mt-2">⏱ Khoảng 30–90 giây · Chạy trên GPU miễn phí</p>
                      </div>
                      {/* Animated progress bar */}
                      <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-[loading-bar_4s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  )}

                  {/* Done — show result */}
                  {tryOnState === "done" && tryOnUrl && (
                    <div className="relative w-full">
                      <img
                        src={tryOnUrl}
                        alt="AI Virtual Try-On Result"
                        className="w-full object-contain max-h-[60vh]"
                      />
                      <div className="absolute top-3 left-3 bg-violet-600/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span className="text-white text-xs font-bold">Kolors AI · AI Generated</span>
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {tryOnState === "error" && (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">Không thể tạo ảnh AI</p>
                        <p className="text-zinc-400 text-sm max-w-sm">{tryOnError}</p>
                      </div>
                      <button
                        onClick={() => {
                          setTryOnState("generating");
                          setTryOnError("");
                          const b64 = snapshotUrl?.split(",")[1] ?? "";
                          const garmentImg = garmentImgRef.current;
                          const garmentImageBase64 = getGarmentBase64WithWhiteBg(garmentImg) || undefined;
                          fetchVirtualTryOn(b64, selectedGarment, garmentImageBase64).then((result) => {
                            if (result.fallback || !result.resultUrl) {
                              setTryOnState("error");
                              setTryOnError(result.error ?? "Lỗi không xác định.");
                            } else {
                              setTryOnUrl(result.resultUrl);
                              setTryOnState("done");
                            }
                          }).catch(() => {
                            setTryOnState("error");
                            setTryOnError("Kết nối thất bại. Thử lại.");
                          });
                        }}
                        className="flex items-center gap-2 bg-zinc-800 text-zinc-300 text-sm font-semibold py-2 px-4 rounded-xl hover:bg-zinc-700 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Thử lại
                      </button>
                    </div>
                  )}

                  {/* Idle — hasn't started yet */}
                  {tryOnState === "idle" && (
                    <div className="flex flex-col items-center gap-3 p-8 text-center">
                      <ImageIcon className="w-12 h-12 text-zinc-600" />
                      <p className="text-zinc-500 text-sm">Chụp ảnh AI Try-On để xem kết quả</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">
                    {activeTab === "tryon" && tryOnState === "done"
                      ? "✨ AI-Generated Try-On"
                      : "AR Overlay Preview"}
                  </h3>
                  <p className="text-zinc-500 text-xs">
                    {selectedGarment.emoji} {selectedGarment.name} · {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={downloadSnapshot}
                  disabled={activeTab === "tryon" && tryOnState !== "done"}
                  className="flex items-center gap-2 bg-[#FF6F61] text-white font-bold py-2.5 px-5 rounded-xl hover:bg-[#fa5c4d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading-bar {
          0%   { width: 0%; }
          50%  { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}