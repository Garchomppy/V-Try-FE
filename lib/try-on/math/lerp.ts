export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface SmoothedPoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export function lerpPoint(
  prev: SmoothedPoint,
  next: { x: number; y: number; z: number; visibility?: number },
  t: number,
): SmoothedPoint {
  return {
    x: lerp(prev.x, next.x, t),
    y: lerp(prev.y, next.y, t),
    z: lerp(prev.z, next.z, t),
    visibility: lerp(prev.visibility, next.visibility ?? 0, t),
  };
}
