import { memo, useMemo } from "react";
import { Mesh, NearestFilter, Texture } from "three";
import { BlockDef, ColorSpace } from "@/types";

export interface BlockScales {
  blockSize: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  height: number;
}

export interface BlockProps {
  block: BlockDef;
  colorSpace: ColorSpace;
  scales: BlockScales;
  onSelect?: (id: number, shiftKey: boolean) => void;
  meshRegistry?: React.RefObject<Map<number, Mesh>>;
  atlasTexture: Texture;
  atlasIndex: number;
  atlasCols: number;
  atlasRows: number;
  opacity?: number;
}

const DEG_TO_RAD = Math.PI / 180;

// Base scales for the two space geometries
export const CARTESIAN_SCALE = 30;
export const CYLINDRICAL_RADIUS_SCALE = 30;
export const CYLINDRICAL_HEIGHT_SCALE = 60;

// OKLab a,b and OKLCH chroma have a smaller range (~0–0.3 vs 0–1),
// so scale them up proportionally. Lightness (L) is still 0–1,
// so height keeps the base scale.
const OK_RANGE_FACTOR = 1 / 0.3;
export const OKLAB_SCALE = CARTESIAN_SCALE * OK_RANGE_FACTOR;
export const OK_HEIGHT_SCALE = CYLINDRICAL_HEIGHT_SCALE;

// Center a 0–1 value around the origin
function center(value: number): number {
  return value - 0.5;
}

// Map a cylindrical color space (angle + radius + height) to XYZ.
// Angle drives the direction in XZ, radius the distance, height the Y axis.
export function cylindrical(angle: number, radius: number, height: number, radiusScale: number, heightScale: number): [number, number, number] {
  const rad = angle * DEG_TO_RAD;
  return [
    radius * Math.cos(rad) * radiusScale,
    center(height) * heightScale,
    radius * Math.sin(rad) * radiusScale,
  ];
}

// Map a cartesian color space (3 independent axes) to XYZ, centered at origin.
export function cartesian(x: number, y: number, z: number, scale: number): [number, number, number] {
  return [
    x * scale,
    y * scale,
    z * scale,
  ];
}

export function getPosition(block: BlockDef, space: ColorSpace, scales: BlockScales): [number, number, number] {
  switch (space) {
    // Cylindrical spaces: hue → angle, saturation → radius, lightness → height
    case "hsl": {
      const [px, py, pz] = cylindrical(block.hsl.h, block.hsl.s, block.hsl.l, CYLINDRICAL_RADIUS_SCALE, CYLINDRICAL_HEIGHT_SCALE);
      return [px * scales.radius, py * scales.height, pz * scales.radius];
    }
    // Cylindrical OKLCH: hue → angle, chroma → radius, lightness → height
    case "oklch": {
      const { L, C, H } = block.oklch;
      const [px, py, pz] = cylindrical(H, C, L, OKLAB_SCALE, OK_HEIGHT_SCALE);
      return [px * scales.radius, py * scales.height, pz * scales.radius];
    }
    case "srgb": {
      const { r, g, b } = block.srgb;
      const [px, py, pz] = cartesian(r, g, b, CARTESIAN_SCALE);
      return [px * scales.x, py * scales.y, pz * scales.z];
    }
    case "linear_rgb": {
      const { r, g, b } = block.linear_rgb;
      const [px, py, pz] = cartesian(r, g, b, CARTESIAN_SCALE);
      return [px * scales.x, py * scales.y, pz * scales.z];
    }
  }
}

const Block = memo(function Block({ block, colorSpace, scales, onSelect, meshRegistry, atlasTexture, atlasIndex, atlasCols, atlasRows, opacity = 1 }: BlockProps) {
  const texture = useMemo(() => {
    const col = atlasIndex % atlasCols;
    const row = Math.floor(atlasIndex / atlasCols);
    const t = atlasTexture.clone();
    t.repeat.set(1 / atlasCols, 1 / atlasRows);
    t.offset.set(col / atlasCols, (atlasRows - row - 1) / atlasRows);
    t.magFilter = NearestFilter;
    return t;
  }, [atlasTexture, atlasIndex, atlasCols, atlasRows]);

  return (
    <mesh
      ref={(mesh) => {
        if (mesh) meshRegistry?.current?.set(block.id, mesh);
        else meshRegistry?.current?.delete(block.id);
      }}
      scale={[scales.blockSize, scales.blockSize, scales.blockSize]}
      position={getPosition(block, colorSpace, scales)}
      onClick={(e) => { e.stopPropagation(); onSelect?.(block.id, e.shiftKey); }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial transparent={block.transparent || opacity < 1} opacity={opacity} map={texture} />
    </mesh>
  );
});

export default Block;
