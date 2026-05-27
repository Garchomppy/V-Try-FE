import type { SmoothedPoint } from "./lerp";

export interface GarmentOverlayParams {
  centerX: number;
  centerY: number;
  clothingWidth: number;
  clothingHeight: number;
  angle: number;
  verticalOffset: number;
}

export interface GarmentConfig {
  widthMultiplier: number;
  aspectRatio: number;
  verticalOffsetRatio: number;
}

export const DEFAULT_GARMENT_CONFIG: GarmentConfig = {
  widthMultiplier: 2.0,
  aspectRatio: 1.2,
  verticalOffsetRatio: 0,
};

// MediaPipe Pose landmark indices
export const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const;

export function computeOverlayParams(
  landmarks: SmoothedPoint[],
  canvasWidth: number,
  canvasHeight: number,
  config: GarmentConfig,
  mirrored: boolean,
): GarmentOverlayParams | null {
  const ls = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const lh = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rh = landmarks[POSE_LANDMARKS.RIGHT_HIP];

  if (Math.min(ls.visibility, rs.visibility) < 0.3) return null;

  const toX = (norm: number) =>
    mirrored ? canvasWidth - norm * canvasWidth : norm * canvasWidth;
  const toY = (norm: number) => norm * canvasHeight;

  const lsX = toX(ls.x);
  const lsY = toY(ls.y);
  const rsX = toX(rs.x);
  const rsY = toY(rs.y);
  const lhX = toX(lh.x);
  const lhY = toY(lh.y);
  const rhX = toX(rh.x);
  const rhY = toY(rh.y);

  const shoulderDist = Math.hypot(rsX - lsX, rsY - lsY);
  const centerX = (lsX + rsX) / 2;
  const centerY = (lsY + rsY) / 2;
  const angle = Math.atan2(rsY - lsY, rsX - lsX);

  const hipCenterX = (lhX + rhX) / 2;
  const hipCenterY = (lhY + rhY) / 2;
  const torsoLength = Math.hypot(hipCenterX - centerX, hipCenterY - centerY);

  const clothingWidth = shoulderDist * config.widthMultiplier;
  const clothingHeight = Math.max(
    clothingWidth * config.aspectRatio,
    torsoLength * 1.3,
  );
  const verticalOffset = torsoLength * config.verticalOffsetRatio;

  return { centerX, centerY, clothingWidth, clothingHeight, angle, verticalOffset };
}
