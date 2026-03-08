'use client';

import Image from 'next/image';
import { BlockDef } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setGradientBlockA,
  setGradientBlockB,
  setSelectingSlot,
  setGradientRadius,
  setGradientSteps,
} from '@/store/gradientSlice';
import Slider from '../ui/Slider';
import Button from '../ui/Button';

interface GradientPaneProps {
  blocks: BlockDef[];
  className?: string;
}

export default function GradientPane({ blocks, className }: GradientPaneProps) {
  const dispatch = useAppDispatch();
  const { blockAId, blockBId, selectingSlot, radius, steps, gradientBlockIds } = useAppSelector((s) => s.gradient);

  const blockA = blockAId !== null ? blocks.find((b) => b.id === blockAId) ?? null : null;
  const blockB = blockBId !== null ? blocks.find((b) => b.id === blockBId) ?? null : null;
  const gradientBlocks = gradientBlockIds.map((id) => blocks.find((b) => b.id === id)).filter(Boolean) as BlockDef[];
  const displayBlocks: BlockDef[] = [
    ...(blockA ? [blockA] : []),
    ...gradientBlocks,
    ...(blockB ? [blockB] : []),
  ];

  function handleSlotClick(slot: 'A' | 'B') {
    if (selectingSlot === slot) {
      dispatch(setSelectingSlot(null));
    } else {
      dispatch(setSelectingSlot(slot));
    }
  }

  const aActive = selectingSlot === 'A';
  const bActive = selectingSlot === 'B';

  return (
    <div className={`flex flex-col gap-4 ${className ?? "bg-neutral-900 border-l-2 border-t-2 border-b-2 border-neutral-600 pt-2 p-4"}`} style={className ? undefined : { width: '24rem' }}>
      <div className="flex justify-between">
        <h2>Gradient</h2>
        <Button onClick={() => {
          dispatch(setGradientBlockA(null));
          dispatch(setGradientBlockB(null));
        }}>R</Button>
      </div>

      {/* Block A picker */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSlotClick('A')}
          className={`px-1.5 py-0.5 text-xs font-bold border ${
            aActive
              ? 'border-red-500 animate-pulse'
              : 'border-neutral-500'
          }`}
        >
          A
        </button>
        {blockA ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Image
              src={`/blocks/${blockA.file}`}
              width={16}
              height={16}
              alt=""
              style={{ imageRendering: 'pixelated', flexShrink: 0 }}
            />
            <span className="text-sm truncate">{blockA.name}</span>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">Select block</span>
        )}
        {blockA && (
          <button
            className="ml-auto text-neutral-500 hover:text-white text-xs shrink-0"
            onClick={() => dispatch(setGradientBlockA(null))}
          >
            ×
          </button>
        )}
      </div>

      {/* Block B picker */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSlotClick('B')}
          className={`px-1.5 py-0.5 text-xs font-bold border ${
            bActive
              ? 'border-blue-500 animate-pulse'
              : 'border-neutral-500'
          }`}
        >
          B
        </button>
        {blockB ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Image
              src={`/blocks/${blockB.file}`}
              width={16}
              height={16}
              alt=""
              style={{ imageRendering: 'pixelated', flexShrink: 0 }}
            />
            <span className="text-sm truncate">{blockB.name}</span>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">Select block</span>
        )}
        {blockB && (
          <button
            className="ml-auto text-neutral-500 hover:text-white text-xs shrink-0"
            onClick={() => dispatch(setGradientBlockB(null))}
          >
            ×
          </button>
        )}
      </div>

      <div className="border-t border-neutral-700" />

      <Slider
        label="Radius"
        min={0}
        max={50}
        step={0.1}
        value={radius}
        onChange={(v) => dispatch(setGradientRadius(v))}
      />

      <Slider
        label="Steps"
        min={1}
        max={20}
        step={1}
        value={steps}
        onChange={(v) => dispatch(setGradientSteps(v))}
      />

      <div className="border-t border-neutral-700" />

      {/* Gradient icon row */}
      <div>
        <div className="flex overflow-x-auto pb-1">
          {displayBlocks.map((block, index) => {
            const t = displayBlocks.length > 1 ? index / (displayBlocks.length - 1) : 0.5;
            const r = Math.round(255 * Math.min(1, 2 * (1 - t)));
            const b = Math.round(255 * Math.min(1, 2 * t));
            return (
              <div key={block.id} style={{ flexShrink: 0, borderBottom: `2px solid rgb(${r},0,${b})` }}>
                <Image
                  src={`/blocks/${block.file}`}
                  width={32}
                  height={32}
                  alt={block.name}
                  title={block.name}
                  style={{ imageRendering: 'pixelated', display: 'block' }}
                />
              </div>
            );
          })}
        </div>
        <span className="text-neutral-500 text-xs">{gradientBlockIds.length + (gradientBlockIds.length ? 2 : 0)} blocks</span>
      </div>
    </div>
  );
}
