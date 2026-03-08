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

function ColorSpaceGrid() {
  const grids = useMemo(() => {
    const color = 0x3a3a3a;

    const make = (rx = 0, ry = 0, rz = 0) => {
      const g = new GridHelper(GRID_SIZE, GRID_DIVISIONS, color, color);
      const mat = g.material as LineBasicMaterial;
      mat.transparent = true;
      mat.opacity = 0.6;
      mat.depthWrite = false;
      g.rotation.set(rx, ry, rz);
      return g;
    };

    const halfCell = GRID_SIZE / GRID_DIVISIONS / 2;
    const xzGrid = make();
    xzGrid.position.set(halfCell, 0, halfCell);
    return [xzGrid]; // XZ plane (Y = 0)
  }, []);

  return <>{grids.map((g, i) => <primitive key={i} object={g} />)}</>;
}

export function RGBReference() {
  return (
    <>
      <AxisScale axes={RGB_AXES} />
      <ColorSpaceGrid />
    </>
  );
}
