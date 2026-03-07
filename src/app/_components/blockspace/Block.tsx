import { useTexture } from "@react-three/drei";
import { memo } from "react";
import { Mesh, NearestFilter } from "three";
import { BlockDef, ColorSpace } from "@/types";

export interface BlockProps {
  block: BlockDef;
  colorSpace: ColorSpace;
  onSelect?: (id: number) => void;
  meshRegistry?: React.RefObject<Map<number, Mesh>>;
}

const DEG_TO_RAD = Math.PI / 180;

// Base scales for the two space geometries
const CARTESIAN_SCALE = 30;
const CYLINDRICAL_RADIUS_SCALE = 30;
const CYLINDRICAL_HEIGHT_SCALE = 60;

// OKLab a,b and OKLCH chroma have a smaller range (~0–0.3 vs 0–1),
// so scale them up proportionally. Lightness (L) is still 0–1,
// so height keeps the base scale.
const OK_RANGE_FACTOR = 1 / 0.3;
const OKLAB_SCALE = CARTESIAN_SCALE * OK_RANGE_FACTOR;
const OK_HEIGHT_SCALE = CYLINDRICAL_HEIGHT_SCALE;

// Center a 0–1 value around the origin
function center(value: number): number {
  return value - 0.5;
}

// Map a cylindrical color space (angle + radius + height) to XYZ.
// Angle drives the direction in XZ, radius the distance, height the Y axis.
function cylindrical(angle: number, radius: number, height: number, radiusScale: number, heightScale: number): [number, number, number] {
  const rad = angle * DEG_TO_RAD;
  return [
    radius * Math.cos(rad) * radiusScale,
    center(height) * heightScale,
    radius * Math.sin(rad) * radiusScale,
  ];
}

// Map a cartesian color space (3 independent axes) to XYZ, centered at origin.
function cartesian(x: number, y: number, z: number, scale: number): [number, number, number] {
  return [
    center(x) * scale,
    center(y) * scale,
    center(z) * scale,
  ];
}

function getPosition(block: BlockDef, space: ColorSpace): [number, number, number] {
  switch (space) {
    // Cylindrical spaces: hue → angle, saturation → radius, lightness → height
    case "hsl":
      return cylindrical(block.hsl.h, block.hsl.s, block.hsl.l, CYLINDRICAL_RADIUS_SCALE, CYLINDRICAL_HEIGHT_SCALE);

    // Cartesian spaces: each component maps to one axis
    case "oklab": {
      const { L, a, b } = block.oklab;
      // a,b range ~[-0.3, 0.3] so no centering needed; L is 0–1 so center it
      return [a * OKLAB_SCALE, center(L) * OK_HEIGHT_SCALE, b * OKLAB_SCALE];
    }
    case "srgb":
      return cartesian(block.srgb.r, block.srgb.g, block.srgb.b, CARTESIAN_SCALE);
    case "linear_rgb":
      return cartesian(block.linear_rgb.r, block.linear_rgb.g, block.linear_rgb.b, CARTESIAN_SCALE);
  }
}

const Block = memo(function Block({ block, colorSpace, onSelect, meshRegistry }: BlockProps) {
  const texture = useTexture(`/blocks/${block.file}`, (texture) => texture.magFilter = NearestFilter);

  return (
    <mesh
      ref={(mesh) => {
        if (mesh) meshRegistry?.current?.set(block.id, mesh);
        else meshRegistry?.current?.delete(block.id);
      }}
      position={getPosition(block, colorSpace)}
      onClick={(e) => { e.stopPropagation(); onSelect?.(block.id); }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial transparent={block.transparent} map={texture} />
    </mesh>
  );
});

export default Block;
