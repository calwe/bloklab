"use client"

import { useCallback, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, useTexture } from "@react-three/drei";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Mesh } from "three";
import Block, { BlockScales } from "./Block";
import { RGBReference, OKLCHReference, HSLReference } from "./scales";
import { BlockDef } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBlock, toggleBlock } from "@/store/blockspaceSlice";
import atlasJson from "@/data/atlas.json";

function BlocksScene({ blocks, onSelect, meshRegistry }: {
  blocks: BlockDef[];
  onSelect: (id: number) => void;
  meshRegistry: React.RefObject<Map<number, Mesh>>;
}) {
  const { colorSpace, blockSize, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight } = useAppSelector((s) => s.blockspace);
  const scales: BlockScales = { blockSize, x: scaleX, y: scaleY, z: scaleZ, radius: scaleRadius, height: scaleHeight };
  const atlasTexture = useTexture("/atlas.png");

  return (
    <>
      {blocks.map((block, i) => (
        <Block key={block.id} block={block} colorSpace={colorSpace} scales={scales}
          onSelect={onSelect} meshRegistry={meshRegistry}
          atlasTexture={atlasTexture} atlasIndex={i}
          atlasCols={atlasJson.cols} atlasRows={atlasJson.rows} />
      ))}
      {(colorSpace === "srgb" || colorSpace === "linear_rgb") && <RGBReference scaleX={scaleX} scaleZ={scaleZ} />}
      {colorSpace === "oklch" && <OKLCHReference scaleRadius={scaleRadius} scaleHeight={scaleHeight} />}
      {colorSpace === "hsl"   && <HSLReference scaleRadius={scaleRadius} scaleHeight={scaleHeight} />}
    </>
  );
}

export default function Blockspace({ blocks }: { blocks: BlockDef[] }) {
  const dispatch = useAppDispatch();
  const selectedBlockId = useAppSelector((s) => s.blockspace.selectedBlockId);
  const meshRegistry = useRef<Map<number, Mesh>>(new Map());

  const handleSelect = useCallback((id: number) => {
    dispatch(toggleBlock(id));
  }, [dispatch]);

  const selection = useMemo(() => {
    if (selectedBlockId === null) return [];
    const mesh = meshRegistry.current.get(selectedBlockId);
    return mesh ? [mesh] : [];
  }, [selectedBlockId]);

  return (
    <Canvas className="bg-neutral-800" onPointerMissed={() => dispatch(selectBlock(null))}>
      <color attach="background" args={["#262626"]} />
      <fog attach="fog" args={["#262626", 100, 600]} />
      <CameraControls />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <BlocksScene blocks={blocks} onSelect={handleSelect} meshRegistry={meshRegistry} />
      <EffectComposer autoClear={false}>
        <Outline
          selection={selection}
          blendFunction={BlendFunction.SCREEN}
          edgeStrength={5}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0x888888}
          xRay
        />
      </EffectComposer>
    </Canvas>
  );
}
