"use client";

import { useEffect, useRef } from "react";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { computeOverlayParams, DEFAULT_GARMENT_CONFIG } from "@/lib/try-on/math/pose-geometry";
import type { GarmentConfig } from "@/lib/try-on/math/pose-geometry";
import type { SmoothedPoint } from "@/lib/try-on/math/lerp";

interface Options {
  mirrored: boolean;
  showOverlay: boolean;
  config?: Partial<GarmentConfig>;
  showSkeleton?: boolean;
}

export function useGarmentOverlay(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  garmentSrc: string | null,
) {
  const garmentImgRef = useRef<HTMLImageElement | null>(null);

  // Preload garment image when src changes
  useEffect(() => {
    if (!garmentSrc) { garmentImgRef.current = null; return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = garmentSrc;
    img.onload = () => { garmentImgRef.current = img; };
    img.onerror = () => { garmentImgRef.current = null; };
  }, [garmentSrc]);

  function draw(
    videoFrame: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    smoothed: SmoothedPoint[],
    opts: Options,
  ) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const asVideo = videoFrame as HTMLVideoElement;
    const asImg = videoFrame as HTMLImageElement;
    const asCanvas = videoFrame as HTMLCanvasElement;
    canvas.width = asVideo.videoWidth || asImg.width || asCanvas.width || 1280;
    canvas.height = asVideo.videoHeight || asImg.height || asCanvas.height || 720;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (opts.mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoFrame, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const mergedConfig: GarmentConfig = {
      ...DEFAULT_GARMENT_CONFIG,
      ...opts.config,
    };

    const params = computeOverlayParams(
      smoothed,
      canvas.width,
      canvas.height,
      mergedConfig,
      opts.mirrored,
    );

    if (params && opts.showOverlay && garmentImgRef.current) {
      const { centerX, centerY, clothingWidth, clothingHeight, angle, verticalOffset } = params;
      ctx.save();
      ctx.translate(centerX, centerY + verticalOffset);
      ctx.rotate(angle);
      ctx.globalAlpha = 0.92;
      ctx.drawImage(
        garmentImgRef.current,
        -clothingWidth / 2,
        -clothingHeight * 0.25,
        clothingWidth,
        clothingHeight,
      );
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Debug skeleton overlay
    if (opts.showSkeleton && smoothed.length > 0) {
      const displayLandmarks = smoothed.map((lm) => ({
        ...lm,
        x: opts.mirrored ? 1 - lm.x : lm.x,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      drawConnectors(ctx, displayLandmarks as any, POSE_CONNECTIONS, {
        color: "#00FF8840",
        lineWidth: 2,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      drawLandmarks(ctx, displayLandmarks as any, {
        color: "#FF006640",
        lineWidth: 1,
        radius: 3,
      });

      // Highlight shoulder + shoulder-midpoint reference points
      if (smoothed.length > 24) {
        const toX = (x: number) =>
          opts.mirrored ? canvas.width - x * canvas.width : x * canvas.width;
        const toY = (y: number) => y * canvas.height;

        const lsX = toX(smoothed[11].x), lsY = toY(smoothed[11].y);
        const rsX = toX(smoothed[12].x), rsY = toY(smoothed[12].y);
        const cx = (lsX + rsX) / 2, cy = (lsY + rsY) / 2;

        ctx.fillStyle = "#00FFD1";
        for (const [x, y] of [[lsX, lsY], [rsX, rsY]] as [number, number][]) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#FF6B6B";
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  return { draw, garmentImgRef };
}
