export interface BodyParams {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
}

export const DEFAULT_BODY_PARAMS: BodyParams = {
  height: 175,
  weight: 70,
  chest: 95,
  waist: 82,
  hips: 95,
};

// Reference body used as scale baseline
const REF = { height: 175, weight: 70, chest: 95, waist: 82, hips: 95 };

export function computeBodyScale(
  params: BodyParams,
  baseScale: number,
): { scaleY: number; scaleXZ: number } {
  const scaleY = (params.height / REF.height) * baseScale;
  const shapeFactor =
    (params.chest / REF.chest + params.waist / REF.waist + params.hips / REF.hips) / 3;
  const scaleXZ =
    ((params.weight / REF.weight) * 0.6 + shapeFactor * 0.4) * baseScale;
  return { scaleY, scaleXZ };
}
