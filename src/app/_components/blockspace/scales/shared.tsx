import { useEffect, useMemo, useRef } from "react";
import { Line, Text } from "@react-three/drei";
import { Vector3 } from "three";
import type { Line2 } from "three-stdlib";

export interface AxisDef {
  dir: [number, number, number];
  label: string;
  color?: string;
  labelRotation?: [number, number, number];
  flipLabel?: boolean;
  anchorX?: "right";
}

export const FAR = 1000;
const LABEL_DIST = 7;
const LABEL_OFFSET = 1;
const WORLD_UP = new Vector3(0, 1, 0);

// Drei's Line uses LineMaterial (a ShaderMaterial) with fog disabled by default.
// This wrapper enables fog after mount so the renderer injects scene fog uniforms.
export function FogLine(props: React.ComponentProps<typeof Line>) {
  const ref = useRef<Line2>(null);
  useEffect(() => { if (ref.current?.material) ref.current.material.fog = true; }, []);
  return <Line ref={ref} {...props} />;
}

function AxisLine({ dir, color = "#888888" }: { dir: [number, number, number]; color?: string }) {
  return (
    <FogLine
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

const RING_SEGMENTS = 128;

export function RingLine({ radius, y, color = "#888888", opacity = 0.4 }: {
  radius: number;
  y: number;
  color?: string;
  opacity?: number;
}) {
  const ref = useRef<Line2>(null);
  useEffect(() => {
    if (ref.current?.material) {
      ref.current.material.depthWrite = false;
      ref.current.material.fog = true;
    }
  }, []);

  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= RING_SEGMENTS; i++) {
      const angle = (i / RING_SEGMENTS) * Math.PI * 2;
      pts.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    }
    return pts;
  }, [radius, y]);

  return (
    <Line
      ref={ref}
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
      renderOrder={0}
    />
  );
}

export function AxisScale({ axes }: { axes: AxisDef[] }) {
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
