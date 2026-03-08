"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBlockSize, setScaleX, setScaleY, setScaleZ, setScaleRadius, setScaleHeight, setShowColorspace, setColorspaceOpacity, setColorspacePointSize, setColorspacePointDensity, setShowBlocks, setBlocksOpacity } from "@/store/blockspaceSlice";
import Slider from "../ui/Slider";

const pctFormat = (v: number) => `${Math.round(v * 100)}%`;

export default function OptionsPane({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const { colorSpace, blockSize, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight, showColorspace, colorspaceOpacity, colorspacePointSize, colorspacePointDensity, showBlocks, blocksOpacity } = useAppSelector((s) => s.blockspace);

  const isCartesian = colorSpace === "srgb" || colorSpace === "linear_rgb";

  return (
    <div className={`flex flex-col gap-4 ${className ?? "bg-neutral-900 border-l-2 border-t-2 border-b-2 border-neutral-600 pt-2 p-4 w-56"}`}>
      <h2>Options</h2>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Blocks</span>
          <button
            onClick={() => dispatch(setShowBlocks(!showBlocks))}
            className={`text-xs px-2 py-0.5 border ${showBlocks ? "border-white text-white" : "border-neutral-600 text-neutral-500"}`}
          >
            {showBlocks ? "ON" : "OFF"}
          </button>
        </div>
        {showBlocks && (
          <Slider label="Opacity" min={0} max={1} step={0.01} value={blocksOpacity} onChange={(v) => dispatch(setBlocksOpacity(v))} format={pctFormat} />
        )}
      </div>
      <div className="flex flex-col gap-3 border-t border-neutral-700 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Colorspace</span>
          <button
            onClick={() => dispatch(setShowColorspace(!showColorspace))}
            className={`text-xs px-2 py-0.5 border ${showColorspace ? "border-white text-white" : "border-neutral-600 text-neutral-500"}`}
          >
            {showColorspace ? "ON" : "OFF"}
          </button>
        </div>
        {showColorspace && (
          <>
            <Slider label="Opacity" min={0} max={1} step={0.01} value={colorspaceOpacity} onChange={(v) => dispatch(setColorspaceOpacity(v))} format={pctFormat} />
            <Slider label="Point Size" min={1} max={10} step={0.5} value={colorspacePointSize} onChange={(v) => dispatch(setColorspacePointSize(v))} onReset={() => dispatch(setColorspacePointSize(3))} format={(v) => `${v}px`} />
            <Slider label="Density" min={0.25} max={3} step={0.05} value={colorspacePointDensity} onChange={(v) => dispatch(setColorspacePointDensity(v))} onReset={() => dispatch(setColorspacePointDensity(1))} />
          </>
        )}
      </div>
      <div className="border-t border-neutral-700 pt-4 flex flex-col gap-4">
      <Slider label="Block Size" min={0.25} max={4} step={0.05} value={blockSize} onChange={(v) => dispatch(setBlockSize(v))} onReset={() => dispatch(setBlockSize(1))} />
      {isCartesian ? (
        <>
          <Slider label="X Scale" min={0.25} max={4} step={0.05} value={scaleX} onChange={(v) => dispatch(setScaleX(v))} onReset={() => dispatch(setScaleX(1))} />
          <Slider label="Y Scale" min={0.25} max={4} step={0.05} value={scaleY} onChange={(v) => dispatch(setScaleY(v))} onReset={() => dispatch(setScaleY(1))} />
          <Slider label="Z Scale" min={0.25} max={4} step={0.05} value={scaleZ} onChange={(v) => dispatch(setScaleZ(v))} onReset={() => dispatch(setScaleZ(1))} />
        </>
      ) : (
        <>
          <Slider label="Radius Scale" min={0.25} max={4} step={0.05} value={scaleRadius} onChange={(v) => dispatch(setScaleRadius(v))} onReset={() => dispatch(setScaleRadius(1))} />
          <Slider label="Height Scale" min={0.25} max={4} step={0.05} value={scaleHeight} onChange={(v) => dispatch(setScaleHeight(v))} onReset={() => dispatch(setScaleHeight(1))} />
        </>
      )}
      </div>
    </div>
  );
}
