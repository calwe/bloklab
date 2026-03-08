import { Text } from "@react-three/drei";
import { CYLINDRICAL_RADIUS_SCALE, CYLINDRICAL_HEIGHT_SCALE } from "../Block";
import { AxisDef, AxisScale, RingLine, FogLine, FAR } from "./shared";

const RADIUS = CYLINDRICAL_RADIUS_SCALE;          // 30
const HALF_HEIGHT = CYLINDRICAL_HEIGHT_SCALE / 2;  // 30
const RING_STEP = RADIUS / 4;                      // 7.5
const RING_RADII = Array.from(
  { length: Math.ceil(1200 / RING_STEP) },
  (_, i) => (i + 1) * RING_STEP,
);
const DIAMETER_FAR = FAR * 10;

const L_AXIS: AxisDef[] = [
  { dir: [0, 1, 0], label: "L", color: "#888888", labelRotation: [0, Math.PI, Math.PI / 2] },
];

const HUE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const HUE_LABELS = ["0°", "45°", "90°", "135°", "180°", "225°", "270°", "315°"];

interface CylindricalScaleProps {
  radialLabel: string; // "S" for HSL, "C" for OKLCH
}

export function CylindricalScale({ radialLabel }: CylindricalScaleProps) {
  return (
    <>
      <AxisScale axes={L_AXIS} />

      {/* Concentric horizontal rings — brightest at RADIUS, fading inward and outward */}
      {RING_RADII.map((r) => {
        const opacity = 0.07 + 0.5 * Math.exp(-6 * Math.abs(r - RADIUS) / RADIUS);
        return <RingLine key={r} radius={r} y={0} opacity={opacity} />;
      })}

      {/* Radius lines from center outward, one per hue direction */}
      {HUE_ANGLES.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <FogLine
            key={`r${deg}`}
            points={[[0, 0, 0], [Math.cos(rad) * DIAMETER_FAR, 0, Math.sin(rad) * DIAMETER_FAR]]}
            color={`hsl(${deg}, 90%, 60%)`}
            lineWidth={1}
            renderOrder={1}
          />
        );
      })}

      {/* Hue direction labels — flat in XZ plane, offset perpendicular to radius lines */}
      {HUE_ANGLES.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const offset = 3;
        return (
          <Text
            key={deg}
            position={[Math.cos(rad) * (RADIUS + 2) + Math.sin(rad) * offset, 0, Math.sin(rad) * (RADIUS + 2) - Math.cos(rad) * offset]}
            rotation={[-Math.PI / 2, 0, Math.PI - rad]}
            font="/Minecraftia-Regular.ttf"
            color={`hsl(${deg}, 65%, 60%)`}
            fontSize={3}
            anchorX="right"
            anchorY="middle"
          >
            {HUE_LABELS[i]}
          </Text>
        );
      })}

      {/* Radial increase indicator — positioned between 180° and 135° */}
      {(() => {
        const deg = 157.5;
        const rad = (deg * Math.PI) / 180;
        const r = 20;
        return (
          <Text
            position={[Math.cos(rad) * r, 0, Math.sin(rad) * r]}
            rotation={[-Math.PI / 2, 0, -rad + Math.PI]}
            font="/Minecraftia-Regular.ttf"
            color="#888888"
            fontSize={3}
            anchorX="right"
            anchorY="middle"
          >
            {`← ${radialLabel}+`}
          </Text>
        );
      })()}

      {/* L=0 / L=1 labels */}
      <Text
        position={[1, -HALF_HEIGHT, 0]}
        font="/Minecraftia-Regular.ttf"
        color="#888888"
        fontSize={3}
        anchorX="left"
        anchorY="top"
      >
        L=0
      </Text>
      <Text
        position={[1, +HALF_HEIGHT, 0]}
        font="/Minecraftia-Regular.ttf"
        color="#888888"
        fontSize={3}
        anchorX="left"
        anchorY="bottom"
      >
        L=1
      </Text>
    </>
  );
}
