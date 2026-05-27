"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SmoothedPoint } from "@/lib/try-on/math/lerp";
import { lerpPoint } from "@/lib/try-on/math/lerp";

const LERP_FACTOR = 0.35;

export interface PoseResults {
  poseLandmarks?: Array<{ x: number; y: number; z: number; visibility?: number }>;
  // MediaPipe image can be video, image, or canvas (GpuBuffer includes HTMLCanvasElement)
  image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
}

export interface UsePosePoseOptions {
  enabled?: boolean;
  onResults: (results: PoseResults, smoothed: SmoothedPoint[]) => void;
}

export interface PoseState {
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  fps: number;
  poseDetected: boolean;
}

export function useMediaPipePose(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: UsePosePoseOptions,
) {
  const [state, setState] = useState<PoseState>({
    isLoading: true,
    loadingStep: "Initializing...",
    error: null,
    fps: 0,
    poseDetected: false,
  });

  const smoothedRef = useRef<SmoothedPoint[] | null>(null);
  const fpsRef = useRef({ count: 0, lastTime: performance.now(), fps: 0 });
  const cameraRef = useRef<{ stop: () => void } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poseRef = useRef<any>(null);
  const onResultsRef = useRef(options.onResults);

  useEffect(() => {
    onResultsRef.current = options.onResults;
  }, [options.onResults]);

  const handleResults = useCallback((results: PoseResults) => {
    // FPS tracking
    const now = performance.now();
    fpsRef.current.count++;
    if (now - fpsRef.current.lastTime >= 1000) {
      fpsRef.current.fps = fpsRef.current.count;
      fpsRef.current.count = 0;
      fpsRef.current.lastTime = now;
      setState((s) => ({ ...s, fps: fpsRef.current.fps }));
    }

    const raw = results.poseLandmarks;
    if (!raw || raw.length === 0) {
      setState((s) => (s.poseDetected ? { ...s, poseDetected: false } : s));
      return;
    }

    setState((s) => (s.poseDetected ? s : { ...s, poseDetected: true }));

    // Lerp smooth landmarks
    let smoothed: SmoothedPoint[];
    if (smoothedRef.current) {
      smoothed = raw.map((lm, i) =>
        lerpPoint(smoothedRef.current![i], lm, LERP_FACTOR),
      );
    } else {
      smoothed = raw.map((lm) => ({
        x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility ?? 0,
      }));
    }
    smoothedRef.current = smoothed;

    onResultsRef.current(results, smoothed);
  }, []);

  useEffect(() => {
    if (options.enabled === false) return;
    let isMounted = true;

    async function init() {
      try {
        setState((s) => ({ ...s, loadingStep: "Loading AI Pose Model..." }));

        // Dynamic import to avoid SSR crash — these packages need browser globals
        const { Pose } = await import("@mediapipe/pose");
        const { Camera } = await import("@mediapipe/camera_utils");

        const pose = new Pose({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pose.onResults((r: any) => {
          if (isMounted) handleResults(r as PoseResults);
        });

        poseRef.current = pose;

        setState((s) => ({ ...s, loadingStep: "Starting camera..." }));

        await new Promise<void>((resolve, reject) => {
          let retries = 0;
          const check = () => {
            const video = videoRef.current;
            if (video && video.readyState >= 2) { resolve(); return; }
            if (retries++ > 50) { reject(new Error("Webcam timeout")); return; }
            setTimeout(check, 200);
          };
          check();
        });

        const video = videoRef.current!;
        const camera = new Camera(video, {
          onFrame: async () => {
            if (poseRef.current) await poseRef.current.send({ image: video });
          },
          width: 1280,
          height: 720,
        });

        cameraRef.current = camera;
        await camera.start();

        if (isMounted) setState((s) => ({ ...s, isLoading: false }));
      } catch (err) {
        if (!isMounted) return;
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err instanceof Error ? err.message : "Camera initialization failed",
        }));
      }
    }

    init();

    return () => {
      isMounted = false;
      cameraRef.current?.stop();
      poseRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.enabled]);

  return state;
}
