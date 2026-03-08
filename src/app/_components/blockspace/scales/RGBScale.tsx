import { useMemo } from "react";
import { GridHelper, LineBasicMaterial } from "three";
import { CARTESIAN_SCALE } from "../Block";
import { AxisDef, AxisScale, FAR } from "./shared";

const GRID_SIZE = FAR * 2;
const GRID_DIVISIONS = Math.round(GRID_SIZE / (CARTESIAN_SCALE / 2));

const RGB_AXES: AxisDef[] = [
  { dir: [1, 0, 0], label: "Red",   color: "#ff3333", labelRotation: [Math.PI / 2, Math.PI, 0],            flipLabel: true, anchorX: "right" },
  { dir: [0, 1, 0], label: "Green", color: "#33dd33", labelRotation: [0, Math.PI, Math.PI / 2],            flipLabel: true },
  { dir: [0, 0, 1], label: "Blue",  color: "#4488ff", labelRotation: [Math.PI / 2, Math.PI, Math.PI / 2] },
];

function ColorSpaceGrid({ scaleX, scaleZ }: { scaleX: number; scaleZ: number }) {
  const grid = useMemo(() => {
    const color = 0x3a3a3a;
    const g = new GridHelper(GRID_SIZE, GRID_DIVISIONS, color, color);
    const mat = g.material as LineBasicMaterial;
    mat.transparent = true;
    mat.opacity = 0.6;
    mat.depthWrite = false;
    return g;
  }, []);

  // halfCell is applied inside the scaled group so the x=0 line stays anchored at world origin:
  // world_x = scaleX * (halfCell + local_x)  →  line at local_x = -halfCell maps to world 0
  const halfCell = GRID_SIZE / GRID_DIVISIONS / 2;
  return (
    <group scale={[scaleX, 1, scaleZ]}>
      <primitive object={grid} position={[halfCell, 0, halfCell]} />
    </group>
  );
}

export function RGBReference({ scaleX, scaleZ }: { scaleX: number; scaleZ: number }) {
  return (
    <>
      <AxisScale axes={RGB_AXES} />
      <ColorSpaceGrid scaleX={scaleX} scaleZ={scaleZ} />
    </>
  );
}
