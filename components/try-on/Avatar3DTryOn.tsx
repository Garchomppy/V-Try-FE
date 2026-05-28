"use client";

import { useState, useRef, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Float,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { Settings, UserCircle2, Ruler, X } from "lucide-react";
import {
  computeBodyScale,
  DEFAULT_BODY_PARAMS,
  type BodyParams,
} from "@/lib/try-on/math/body-scale";
import { SHARED_AVATAR_BODY } from "@/app/data/try-on-assets";
import type { Product } from "@/app/data/products";

useGLTF.preload(SHARED_AVATAR_BODY.src);

// ─── MANNEQUIN ────────────────────────────────────────────────────────────────

interface MannequinProps {
  bodyParams: BodyParams;
}

function Mannequin({ bodyParams }: MannequinProps) {
  const group = useRef<THREE.Group>(null);
  const { nodes } = useGLTF(SHARED_AVATAR_BODY.src);
  const { scaleY, scaleXZ } = computeBodyScale(bodyParams, SHARED_AVATAR_BODY.baseScale);

  return (
    <group
      ref={group}
      position={[0, 1.2 * (scaleY / SHARED_AVATAR_BODY.baseScale), 0]}
      scale={[scaleXZ, scaleY, scaleXZ]}
      dispose={null}
    >
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {SHARED_AVATAR_BODY.meshNodeNames.map((name) => {
          const mesh = nodes[name] as THREE.Mesh | undefined;
          if (!mesh?.geometry) return null;
          return (
            <mesh key={name} geometry={mesh.geometry}>
              <meshStandardMaterial color="#d4bfae" roughness={0.4} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ─── GARMENT MESH ─────────────────────────────────────────────────────────────

interface GarmentMeshProps {
  src: string;
  baseScale: number;
  positionOffset: [number, number, number];
  bodyParams: BodyParams;
  color: string;
  sizeMultiplier: number;
}

function GarmentMesh({
  src,
  baseScale,
  positionOffset,
  bodyParams,
  color,
  sizeMultiplier,
}: GarmentMeshProps) {
  const { scene } = useGLTF(src);
  const { scaleY, scaleXZ } = computeBodyScale(bodyParams, baseScale);
  const [px, py, pz] = positionOffset;

  // Clone scene once per src; share a single material across all child meshes
  const { clonedScene, mat } = useMemo(() => {
    const clonedScene = scene.clone(true);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide });
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = mat;
    });
    return { clonedScene, mat };
  }, [scene]);

  // Update color in-place without recloning
  mat.color.set(color);

  return (
    <group
      position={[px, py, pz]}
      scale={[
        scaleXZ * 1.2 * sizeMultiplier,
        scaleY * 1.23 * sizeMultiplier,
        scaleXZ * 1.3 * sizeMultiplier,
      ]}
      dispose={null}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

interface Props {
  product: Product;
}

export default function Avatar3DTryOn({ product }: Props) {
  const model3D = product.tryOn?.model3D;
  const colors = product.colors;
  const sizes = product.sizes;

  const [bodyParams, setBodyParams] = useState<BodyParams>(DEFAULT_BODY_PARAMS);
  const [isTryOn, setIsTryOn] = useState(false);
  const [activeTab, setActiveTab] = useState<"standard" | "mybody">("standard");
  const [showBodyPanel, setShowBodyPanel] = useState(true);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.hex ?? "#111827");
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "M");

  function handleParam(field: keyof BodyParams, value: number) {
    setBodyParams((p) => ({ ...p, [field]: value }));
  }

  const effectiveBody = activeTab === "mybody" ? bodyParams : DEFAULT_BODY_PARAMS;

  const sizeMultiplier =
    selectedSize === "S" ? 0.95
      : selectedSize === "L" ? 1.05
        : selectedSize === "XL" ? 1.1
          : selectedSize === "XXL" ? 1.15
            : 1.0;

  return (
    <div className="relative w-full h-full bg-zinc-50 overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 1.5, 4], fov: 45 }}
          gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.6} />
          <hemisphereLight args={["#ffeeb1", "#080820", 0.5]} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          <spotLight position={[0, 8, 0]} intensity={0.4} angle={0.6} penumbra={1} />

          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
            {/* Separate Suspense per mesh so mannequin stays visible while garment loads */}
            <Suspense fallback={null}>
              <Mannequin bodyParams={effectiveBody} />
            </Suspense>
            {isTryOn && model3D && (
              <Suspense fallback={null}>
                <GarmentMesh
                  src={model3D.src}
                  baseScale={model3D.baseScale}
                  positionOffset={model3D.positionOffset ?? [0, 0.83, 0.1]}
                  bodyParams={effectiveBody}
                  color={selectedColor}
                  sizeMultiplier={sizeMultiplier}
                />
              </Suspense>
            )}
          </Float>

          <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={5} blur={2} far={4} />
          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2 + 0.1}
            minDistance={2}
            maxDistance={6}
          />
        </Canvas>
      </div>

      {/* ── RIGHT PANEL: Body Stats ──────────────────────────────────────── */}
      <div
        className={`absolute top-4 right-4 md:top-6 md:right-6 z-20 transition-all duration-500 ease-in-out ${showBodyPanel ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          }`}
      >
        <div className="w-72 relative">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-2 mb-3 relative">
            <button
              onClick={() => setShowBodyPanel(false)}
              className="absolute -top-2 -right-2 p-1.5 bg-white border border-gray-100 shadow-md rounded-xl text-gray-400 hover:text-gray-900 z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex">
              <button
                onClick={() => setActiveTab("standard")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === "standard"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <UserCircle2 className="w-3.5 h-3.5" />
                Chuẩn
              </button>
              <button
                onClick={() => setActiveTab("mybody")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === "mybody"
                    ? "bg-[#FF6F61] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Số đo AI
              </button>
            </div>
          </div>

          {activeTab === "mybody" && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-5">
              <h3 className="text-xs font-bold text-gray-900 mb-4">Điều chỉnh số đo</h3>
              <div className="space-y-4">
                {(
                  [
                    { field: "height", label: "Chiều cao", unit: "cm", min: 150, max: 210 },
                    { field: "weight", label: "Cân nặng", unit: "kg", min: 40, max: 150 },
                    { field: "chest", label: "Vòng ngực", unit: "cm", min: 70, max: 130 },
                    { field: "waist", label: "Vòng eo", unit: "cm", min: 60, max: 120 },
                    { field: "hips", label: "Vòng mông", unit: "cm", min: 70, max: 130 },
                  ] as const
                ).map(({ field, label, unit, min, max }) => (
                  <div key={field}>
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500 mb-1.5 px-1">
                      <span>{label}</span>
                      <span>
                        {bodyParams[field]} {unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={bodyParams[field]}
                      onChange={(e) => handleParam(field, Number(e.target.value))}
                      className="w-full accent-[#FF6F61]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!showBodyPanel && (
        <button
          onClick={() => setShowBodyPanel(true)}
          className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white/20 text-gray-900 hover:bg-white transition-all"
        >
          <Settings className="w-5 h-5 text-[#FF6F61]" />
        </button>
      )}

      {/* ── BOTTOM: Size + Color + Try On ─────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center gap-3">
          {/* Size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Ruler className="w-3 h-3" /> Size
            </span>
            <div className="flex gap-1.5">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all ${selectedSize === size
                      ? "border-[#FF6F61] bg-[#FF6F61]/10 text-[#FF6F61]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 min-w-[80px] text-center">
              {colors.find((c) => c.hex === selectedColor)?.name}
            </span>
            <div className="flex items-center gap-2">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${selectedColor === color.hex
                      ? "border-gray-900 scale-110 shadow-md"
                      : "border-transparent hover:scale-110"
                    }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Chọn ${color.name}`}
                />
              ))}
            </div>
          </div>

          {/* Try On button */}
          {model3D ? (
            <button
              onClick={() => setIsTryOn((v) => !v)}
              className={`px-8 font-bold py-2.5 rounded-xl transition-colors shadow-lg text-sm ${isTryOn
                  ? "bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50"
                  : "bg-[#FF6F61] text-white hover:bg-[#fa5c4d]"
                }`}
            >
              {isTryOn ? "Bỏ áo" : "Thử áo 3D"}
            </button>
          ) : (
            <p className="text-xs text-gray-400 italic">Chưa có model 3D</p>
          )}

          <div className="text-[10px] text-gray-400 font-medium tracking-wide">
            🖱️ KÉO ĐỂ XOAY · CUỘN ĐỂ ZOOM
          </div>
        </div>
      </div>
    </div>
  );
}
