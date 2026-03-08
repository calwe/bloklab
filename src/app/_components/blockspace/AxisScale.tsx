import { useMemo } from "react";
import { Line, Text } from "@react-three/drei";
import { GridHelper, LineBasicMaterial, Vector3 } from "three";
import { CARTESIAN_SCALE } from "./Block";

export interface AxisDef {
  dir: [number, number, number];
  label: string;
  color?: string;
  labelRotation?: [number, number, number];
  flipLabel?: boolean;
  anchorX?: "right";
}

const FAR = 1000;
const LABEL_DIST = 7;
const LABEL_OFFSET = 1;
const WORLD_UP = new Vector3(0, 1, 0);

function AxisLine({ dir, color = "#888888" }: { dir: [number, number, number]; color?: string }) {
  return (
    <Line
      points={[
        [dir[0] * -FAR, dir[1] * -FAR, dir[2] * -FAR],
        [dir[0] *  FAR, dir[1] *  FAR, dir[2] *  FAR],
      ]}
      color={color}
      lineWidth={1}
      renderOrder={1}
    />
  );
}

const GRID_SIZE = FAR * 2;
const GRID_DIVISIONS = Math.round(GRID_SIZE / (CARTESIAN_SCALE / 2));

export function ColorSpaceGrid() {
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

export default function AxisScale({ axes }: { axes: AxisDef[] }) {
  return (
    <>
      {axes.map(({ dir, label, color, labelRotation, flipLabel, anchorX }) => {
        const d = new Vector3(...dir);
        const perp = (Math.abs(d.y) > 0.9
          ? new Vector3(1, 0, 0)
          : d.clone().cross(WORLD_UP).normalize()
        ).multiplyScalar(flipLabel ? -1 : 1);
        const labelPos: [number, number, number] = [
          dir[0] * LABEL_DIST + perp.x * LABEL_OFFSET,
          dir[1] * LABEL_DIST + perp.y * LABEL_OFFSET,
          dir[2] * LABEL_DIST + perp.z * LABEL_OFFSET,
        ];
        return (
          <group key={label}>
            <AxisLine dir={dir} color={color} />
            <Text
              position={labelPos}
              rotation={labelRotation}
              font="/Minecraftia-Regular.ttf"
              color={color}
              fontSize={3}
              anchorX={anchorX ?? "left"}
              anchorY="top"
            >
              {label}
            </Text>
          </group>
        );
      })}
    </>
  );
}
