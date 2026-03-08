'use client';

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  cartesian, cylindrical,
  CARTESIAN_SCALE, CYLINDRICAL_RADIUS_SCALE, CYLINDRICAL_HEIGHT_SCALE,
  OKLAB_SCALE, OK_HEIGHT_SCALE,
  BlockScales,
} from "./Block";

// --- Color conversions ---

function hslToSRGB(H: number, S: number, L: number): [number, number, number] {
  const C = (1 - Math.abs(2 * L - 1)) * S;
  const Hp = H / 60;
  const X = C * (1 - Math.abs(Hp % 2 - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (Hp < 1)      { r1 = C; g1 = X; }
  else if (Hp < 2) { r1 = X; g1 = C; }
  else if (Hp < 3) { g1 = C; b1 = X; }
  else if (Hp < 4) { g1 = X; b1 = C; }
  else if (Hp < 5) { r1 = X; b1 = C; }
  else             { r1 = C; b1 = X; }
  const m = L - C / 2;
  return [r1 + m, g1 + m, b1 + m];
}

function linearToSRGB(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

// Returns null if out of gamut
function oklchToSRGB(L: number, C: number, H: number): [number, number, number] | null {
  const hRad = H * (Math.PI / 180);
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const lp = L + 0.3963377774 * a + 0.2158037573 * b;
  const mp = L - 0.1055613458 * a - 0.0638541728 * b;
  const sp = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = lp * lp * lp;
  const m = mp * mp * mp;
  const s = sp * sp * sp;

  const rLin =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  if (rLin < -0.005 || rLin > 1.005 || gLin < -0.005 || gLin > 1.005 || bLin < -0.005 || bLin > 1.005) {
    return null;
  }

  return [
    Math.max(0, Math.min(1, linearToSRGB(rLin))),
    Math.max(0, Math.min(1, linearToSRGB(gLin))),
    Math.max(0, Math.min(1, linearToSRGB(bLin))),
  ];
}

// --- Point cloud sampling ---

function sampleColorspace(colorSpace: string, scales: BlockScales, density: number): { positions: Float32Array; colors: Float32Array } {
  const pts: number[] = [];
  const cols: number[] = [];

  function push(pos: [number, number, number], r: number, g: number, b: number) {
    pts.push(pos[0], pos[1], pos[2]);
    cols.push(r, g, b);
  }

  if (colorSpace === "srgb") {
    const N = Math.max(2, Math.round(20 * density));
    for (let ri = 0; ri <= N; ri++) {
      const r = ri / N;
      for (let gi = 0; gi <= N; gi++) {
        const g = gi / N;
        for (let bi = 0; bi <= N; bi++) {
          const b = bi / N;
          const [px, py, pz] = cartesian(r, g, b, CARTESIAN_SCALE);
          push([px * scales.x, py * scales.y, pz * scales.z], r, g, b);
        }
      }
    }
  } else if (colorSpace === "linear_rgb") {
    const N = Math.max(2, Math.round(20 * density));
    for (let ri = 0; ri <= N; ri++) {
      const rLin = ri / N;
      for (let gi = 0; gi <= N; gi++) {
        const gLin = gi / N;
        for (let bi = 0; bi <= N; bi++) {
          const bLin = bi / N;
          const [px, py, pz] = cartesian(rLin, gLin, bLin, CARTESIAN_SCALE);
          const r = Math.max(0, Math.min(1, linearToSRGB(rLin)));
          const g = Math.max(0, Math.min(1, linearToSRGB(gLin)));
          const b = Math.max(0, Math.min(1, linearToSRGB(bLin)));
          push([px * scales.x, py * scales.y, pz * scales.z], r, g, b);
        }
      }
    }
  } else if (colorSpace === "hsl") {
    const NH = Math.max(2, Math.round(36 * density)), NS = Math.max(2, Math.round(20 * density)), NL = Math.max(2, Math.round(20 * density));
    for (let hi = 0; hi < NH; hi++) {
      const H = (hi / NH) * 360;
      for (let si = 0; si <= NS; si++) {
        const S = si / NS;
        for (let li = 0; li <= NL; li++) {
          const Lv = li / NL;
          const [px, py, pz] = cylindrical(H, S, Lv, CYLINDRICAL_RADIUS_SCALE, CYLINDRICAL_HEIGHT_SCALE);
          const [r, g, b] = hslToSRGB(H, S, Lv);
          push([px * scales.radius, py * scales.height, pz * scales.radius], r, g, b);
        }
      }
    }
  } else if (colorSpace === "oklch") {
    const NH = Math.max(2, Math.round(36 * density)), NC = Math.max(2, Math.round(20 * density)), NL = Math.max(2, Math.round(20 * density));
    for (let hi = 0; hi < NH; hi++) {
      const H = (hi / NH) * 360;
      for (let ci = 0; ci <= NC; ci++) {
        const C = (ci / NC) * 0.3;
        for (let li = 0; li <= NL; li++) {
          const Lv = li / NL;
          const rgb = oklchToSRGB(Lv, C, H);
          if (!rgb) continue;
          const [px, py, pz] = cylindrical(H, C, Lv, OKLAB_SCALE, OK_HEIGHT_SCALE);
          push([px * scales.radius, py * scales.height, pz * scales.radius], rgb[0], rgb[1], rgb[2]);
        }
      }
    }
  }

  return {
    positions: new Float32Array(pts),
    colors: new Float32Array(cols),
  };
}

export default function ColorspaceVolume() {
  const { colorSpace, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight, blockSize, colorspaceOpacity, colorspacePointSize, colorspacePointDensity } = useAppSelector((s) => s.blockspace);
  const scales: BlockScales = { blockSize, x: scaleX, y: scaleY, z: scaleZ, radius: scaleRadius, height: scaleHeight };

  const { positions, colors } = useMemo(
    () => sampleColorspace(colorSpace, scales, colorspacePointDensity),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colorSpace, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight, colorspacePointDensity]
  );

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        sizeAttenuation={false}
        size={colorspacePointSize}
        transparent
        opacity={colorspaceOpacity}
        depthWrite={false}
      />
    </points>
  );
}
