"use client"

import { useCallback, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, useTexture } from "@react-three/drei";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Mesh } from "three";
import Block, { BlockScales, getPosition } from "./Block";
import { RGBReference, OKLCHReference, HSLReference } from "./scales";
import SelectionPopup from "./SelectionPopup";
import BlockInfoPane from "../panes/BlockInfoPane";
import GradientScene from "./GradientScene";
import ColorspaceVolume from "./ColorspaceVolume";
import { BlockDef } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBlock, toggleBlock } from "@/store/blockspaceSlice";
import { setGradientBlockA, setGradientBlockB, setSelectingSlot } from "@/store/gradientSlice";
import atlasJson from "@/data/atlas.json";

function BlocksScene({ blocks, onSelect, meshRegistry }: {
  blocks: BlockDef[];
  onSelect: (id: number, shiftKey: boolean) => void;
  meshRegistry: React.RefObject<Map<number, Mesh>>;
}) {
  const { colorSpace, blockSize, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight, showBlocks, blocksOpacity } = useAppSelector((s) => s.blockspace);
  const scales: BlockScales = { blockSize, x: scaleX, y: scaleY, z: scaleZ, radius: scaleRadius, height: scaleHeight };
  const atlasTexture = useTexture("/atlas.png");

  if (!showBlocks) return null;

  return (
    <>
      {blocks.map((block, i) => (
        <Block key={block.id} block={block} colorSpace={colorSpace} scales={scales}
          onSelect={onSelect} meshRegistry={meshRegistry}
          atlasTexture={atlasTexture} atlasIndex={i}
          atlasCols={atlasJson.cols} atlasRows={atlasJson.rows}
          opacity={blocksOpacity} />
      ))}
      {(colorSpace === "srgb" || colorSpace === "linear_rgb") && <RGBReference scaleX={scaleX} scaleZ={scaleZ} />}
      {colorSpace === "oklch" && <OKLCHReference scaleRadius={scaleRadius} scaleHeight={scaleHeight} />}
      {colorSpace === "hsl"   && <HSLReference scaleRadius={scaleRadius} scaleHeight={scaleHeight} />}
    </>
  );
}

function SelectionPopupScene({ blocks }: { blocks: BlockDef[] }) {
  const { colorSpace, selectedBlockId, blockSize, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight } = useAppSelector((s) => s.blockspace);
  const scales: BlockScales = { blockSize, x: scaleX, y: scaleY, z: scaleZ, radius: scaleRadius, height: scaleHeight };
  const block = selectedBlockId !== null ? (blocks.find((b) => b.id === selectedBlockId) ?? null) : null;
  if (!block) return null;
  return (
    <SelectionPopup position={getPosition(block, colorSpace, scales)}>
      <BlockInfoPane block={block} />
    </SelectionPopup>
  );
}

export default function Blockspace({ blocks }: { blocks: BlockDef[] }) {
  const dispatch = useAppDispatch();
  const selectedBlockId = useAppSelector((s) => s.blockspace.selectedBlockId);
  const showColorspace = useAppSelector((s) => s.blockspace.showColorspace);
  const { selectingSlot, blockAId, blockBId, gradientBlockIds } = useAppSelector((s) => s.gradient);
  const meshRegistry = useRef<Map<number, Mesh>>(new Map());

  const handleSelect = useCallback((id: number, shiftKey: boolean) => {
    if (selectingSlot !== null) {
      dispatch(selectingSlot === 'A' ? setGradientBlockA(id) : setGradientBlockB(id));
      dispatch(setSelectingSlot(null));
      dispatch(selectBlock(null));
    } else if (shiftKey && selectedBlockId !== null && selectedBlockId !== id) {
      dispatch(setGradientBlockA(selectedBlockId));
      dispatch(setGradientBlockB(id));
      dispatch(selectBlock(null));
    } else {
      dispatch(toggleBlock(id));
    }
  }, [dispatch, selectingSlot, selectedBlockId]);

  const selection = useMemo(() => {
    if (selectedBlockId === null) return [];
    if (selectedBlockId === blockAId || selectedBlockId === blockBId) return [];
    if (gradientBlockIds.includes(selectedBlockId)) return [];
    const mesh = meshRegistry.current.get(selectedBlockId);
    return mesh ? [mesh] : [];
  }, [selectedBlockId, blockAId, blockBId, gradientBlockIds]);

  const selectionA = useMemo(() => {
    if (blockAId === null) return [];
    const mesh = meshRegistry.current.get(blockAId);
    return mesh ? [mesh] : [];
  }, [blockAId]);

  const selectionB = useMemo(() => {
    if (blockBId === null) return [];
    const mesh = meshRegistry.current.get(blockBId);
    return mesh ? [mesh] : [];
  }, [blockBId]);

  const gradientSelection = useMemo(() => {
    return gradientBlockIds.flatMap((id) => {
      const mesh = meshRegistry.current.get(id);
      return mesh ? [mesh] : [];
    });
  }, [gradientBlockIds]);


  return (
    <Canvas
      className={`bg-neutral-800 ${selectingSlot ? 'cursor-crosshair' : ''}`}
      onPointerMissed={() => dispatch(selectBlock(null))}
    >
      <color attach="background" args={["#262626"]} />
      <fog attach="fog" args={["#262626", 100, 600]} />
      <CameraControls />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      {showColorspace && <ColorspaceVolume />}
      <BlocksScene blocks={blocks} onSelect={handleSelect} meshRegistry={meshRegistry} />
      <SelectionPopupScene blocks={blocks} />
      <GradientScene blocks={blocks} />
      <EffectComposer autoClear={false}>
        <Outline
          selection={selection}
          selectionLayer={10}
          blendFunction={BlendFunction.SCREEN}
          edgeStrength={5}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0x888888}
          xRay
        />
        <Outline
          selection={selectionA}
          selectionLayer={11}
          blendFunction={BlendFunction.SCREEN}
          edgeStrength={5}
          visibleEdgeColor={0xff3333}
          hiddenEdgeColor={0x881111}
          xRay
        />
        <Outline
          selection={selectionB}
          selectionLayer={12}
          blendFunction={BlendFunction.SCREEN}
          edgeStrength={5}
          visibleEdgeColor={0x3333ff}
          hiddenEdgeColor={0x111188}
          xRay
        />
        <Outline
          selection={gradientSelection}
          selectionLayer={13}
          blendFunction={BlendFunction.SCREEN}
          edgeStrength={5}
          visibleEdgeColor={0xff33ff}
          hiddenEdgeColor={0x881188}
          xRay
        />
      </EffectComposer>
    </Canvas>
  );
}
