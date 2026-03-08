"use client";

import { useRef, useCallback } from "react";
import Button from "./Button";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onReset?: () => void;
}

export default function Slider({ label, value, min, max, step, onChange, onReset }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const percent = (value - min) / (max - min);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const raw = (clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, raw));
    const rawValue = min + clamped * (max - min);
    const stepped = Math.round(rawValue / step) * step;
    onChange(parseFloat(Math.max(min, Math.min(max, stepped)).toFixed(10)));
  }, [min, max, step, onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  }, [updateFromClientX]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    updateFromClientX(e.clientX);
  }, [updateFromClientX]);

  // Thumb width matches w-2 (0.5rem)
  const thumbWidth = "0.5rem";

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="block text-sm text-neutral-400">{label}</span>
        <span className="text-sm text-neutral-400">×{value.toFixed(2)}</span>
      </div>
      <div className="flex gap-1 items-stretch">
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="relative flex-1 h-10 lg:h-6 cursor-pointer select-none
            border-t-2 border-l-2 border-b-2 border-r-2
            border-neutral-800 border-b-neutral-500 border-r-neutral-500
            bg-neutral-700"
        >
          <div
            className="absolute top-0 bottom-0 w-2
              border-t-2 border-l-2 border-b-2 border-r-2
              border-neutral-500 border-b-neutral-800 border-r-neutral-800
              bg-neutral-600 pointer-events-none"
            style={{ left: `calc(${percent} * (100% - ${thumbWidth}))` }}
          />
        </div>
        {onReset && <Button onClick={onReset}>1x</Button>}
      </div>
    </div>
  );
}
