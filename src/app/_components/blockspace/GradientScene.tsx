import { useEffect, useMemo } from "react";
import { DoubleSide, Quaternion, Vector3 } from "three";
import { Line } from "@react-three/drei";
import { BlockDef } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setGradientBlockIds } from "@/store/gradientSlice";
import { getPosition, BlockScales } from "./Block";

export default function GradientScene({ blocks }: { blocks: BlockDef[] }) {
  const dispatch = useAppDispatch();
  const { blockAId, blockBId, radius, steps } = useAppSelector((s) => s.gradient);
  const { colorSpace, blockSize, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight } = useAppSelector((s) => s.blockspace);

  const scales: BlockScales = { blockSize, x: scaleX, y: scaleY, z: scaleZ, radius: scaleRadius, height: scaleHeight };

  const blockA = blockAId !== null ? blocks.find((b) => b.id === blockAId) ?? null : null;
  const blockB = blockBId !== null ? blocks.find((b) => b.id === blockBId) ?? null : null;

  // Compute gradient block IDs when A, B, radius, steps, colorSpace or scales change
  useEffect(() => {
    if (!blockA || !blockB) {
      dispatch(setGradientBlockIds([]));
      return;
    }

    const posA = new Vector3(...getPosition(blockA, colorSpace, scales));
    const posB = new Vector3(...getPosition(blockB, colorSpace, scales));
    const AB = posB.clone().sub(posA);
    const lenSq = AB.lengthSq();

    if (lenSq === 0) {
      dispatch(setGradientBlockIds([]));
      return;
    }

    const stepCount = Math.max(1, Math.round(steps));

    const candidates = blocks
      .filter((b) => b.id !== blockAId && b.id !== blockBId)
      .map((b) => {
        const P = new Vector3(...getPosition(b, colorSpace, scales));
        const t = Math.max(0, Math.min(1, P.clone().sub(posA).dot(AB) / lenSq));
        const closest = posA.clone().add(AB.clone().multiplyScalar(t));
        const dist = P.distanceTo(closest);
        return { id: b.id, t, dist };
      })
      .filter(({ dist }) => dist <= radius);

    const bins: Array<{ id: number; dist: number } | null> = Array(stepCount).fill(null);
    for (const c of candidates) {
      const bin = Math.min(stepCount - 1, Math.floor(c.t * stepCount));
      const cur = bins[bin];
      if (!cur || c.dist < cur.dist) bins[bin] = c;
    }

    const ids = bins
      .filter((b): b is NonNullable<typeof b> => b !== null)
      .map(({ id }) => id);

    dispatch(setGradientBlockIds(ids));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockAId, blockBId, radius, steps, colorSpace, blockSize, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight]);

  const geometry = useMemo(() => {
    if (!blockA || !blockB) return null;

    const posA = new Vector3(...getPosition(blockA, colorSpace, scales));
    const posB = new Vector3(...getPosition(blockB, colorSpace, scales));
    const dir = posB.clone().sub(posA).normalize();
    const length = posA.distanceTo(posB);
    const mid = posA.clone().add(posB).multiplyScalar(0.5);
    const cylQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir);
    const ringQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), dir);

    return { posA, posB, mid, length, cylQuat, ringQuat };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockAId, blockBId, colorSpace, blockSize, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight]);

  const slicePositions = useMemo(() => {
    if (!geometry) return [];
    const { posA, posB } = geometry;
    const AB = posB.clone().sub(posA);
    const stepCount = Math.max(1, Math.round(steps));
    return Array.from({ length: stepCount + 1 }, (_, k) => {
      const t = k / stepCount;
      return posA.clone().add(AB.clone().multiplyScalar(t));
    });
  }, [geometry, steps]);

  if (!geometry) return null;

  const { posA, posB, mid, length, cylQuat, ringQuat } = geometry;

  return (
    <group>
      <Line
        points={[posA.toArray(), posB.toArray()]}
        color="white"
        lineWidth={1}
        transparent
        opacity={0.6}
      />
      <mesh position={mid.toArray()} quaternion={cylQuat}>
        <cylinderGeometry args={[radius, radius, length, 32, 1, true]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0.07}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {slicePositions.map((pos, k) => (
        <mesh key={k} position={pos.toArray()} quaternion={ringQuat}>
          <torusGeometry args={[radius, 0.1, 6, 32]} />
          <meshBasicMaterial color={0xffffff} transparent opacity={0.25} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
