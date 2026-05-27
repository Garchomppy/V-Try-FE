"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface GltfModel {
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
}

export function useGltfModel(src: string): GltfModel {
  const { nodes, materials } = useGLTF(src);
  return { nodes, materials };
}

export function preloadGltfModel(src: string) {
  useGLTF.preload(src);
}
