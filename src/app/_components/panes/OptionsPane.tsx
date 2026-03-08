"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBlockSize, setScaleX, setScaleY, setScaleZ, setScaleRadius, setScaleHeight } from "@/store/blockspaceSlice";
import Slider from "../ui/Slider";

export default function OptionsPane({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const { colorSpace, blockSize, scaleX, scaleY, scaleZ, scaleRadius, scaleHeight } = useAppSelector((s) => s.blockspace);

  const isCartesian = colorSpace === "srgb" || colorSpace === "linear_rgb";

  return (
    <div className={`flex flex-col gap-4 ${className ?? "bg-neutral-900 border-l-2 border-t-2 border-b-2 border-neutral-600 pt-2 p-4 w-56"}`}>
      <h2>Options</h2>
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
  );
}
