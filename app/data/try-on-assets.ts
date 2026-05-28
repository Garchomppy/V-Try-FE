/**
 * Per-product asset & runtime tuning for AI Try-On features.
 *
 * IMPORTANT for GLB authors: when exporting GLB files, take note of the
 * mesh node names inside the file (e.g. via `useGLTF` console.log of
 * `nodes`). Then add them to the product's `tryOn.model3D.meshNodeNames`
 * array in `app/data/products.ts`. The 3D component iterates over that
 * array to render each mesh — without correct names the avatar renders
 * blank.
 *
 * Asset paths follow:
 *   PNG overlays:  /public/try-on/overlays/<productId>-<slug>.png
 *   GLB models:    /public/try-on/models/<productId>-<slug>.glb
 */

import type { TryOnConfig } from "./products";

export interface TryOnFeatures {
  ar: boolean;
  avatar3d: boolean;
  sizeSuggestion: boolean;
}

export function availableFeatures(tryOn: TryOnConfig | undefined): TryOnFeatures {
  return {
    ar: Boolean(tryOn?.arOverlay?.src),
    avatar3d: Boolean(tryOn?.model3D?.src),
    sizeSuggestion: Boolean(tryOn?.sizing?.sizeChart?.length),
  };
}

export const SHARED_AVATAR_BODY = {
  src: "/try-on/models/male-body-base.glb",
  meshNodeNames: ["Object_2", "Object_3", "Object_4", "Object_5", "Object_6"],
  baseScale: 0.4,
} as const;
