'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Copy, Check } from 'lucide-react';
import { BlockDef } from '@/types';

function toHex({ r, g, b }: { r: number; g: number; b: number }) {
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

interface ColorRowProps {
  label: string;
  value: string;
  isCopied: boolean;
  onCopy: () => void;
}

function ColorRow({ label, value, isCopied, onCopy }: ColorRowProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5">
      <span className="text-neutral-500 w-16 shrink-0">{label}</span>
      <span className="font-mono text-xs flex-1 text-right pr-2">{value}</span>
      <button onClick={onCopy} className="text-neutral-500 hover:text-white cursor-pointer">
        {isCopied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

interface BlockInfoPaneProps {
  block: BlockDef;
}

export default function BlockInfoPane({ block }: BlockInfoPaneProps) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(label: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  const hex = toHex(block.srgb);
  const { L, C, H } = block.oklch;
  const { h, s, l } = block.hsl;
  const { r: sr, g: sg, b: sb } = block.srgb;
  const { r: lr, g: lg, b: lb } = block.linear_rgb;

  const oklchStr = `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${Math.round(H)})`;
  const hslStr = `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
  const srgbStr = `rgb(${Math.round(sr * 255)} ${Math.round(sg * 255)} ${Math.round(sb * 255)})`;
  const linearStr = `${lr.toFixed(3)} ${lg.toFixed(3)} ${lb.toFixed(3)}`;

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-neutral-700">
        <Image
          src={`/blocks/${block.file}`}
          width={24}
          height={24}
          alt=""
          style={{ imageRendering: 'pixelated' }}
        />
        <span style={{ color: `oklch(${Math.max(L, 0.6)} ${C} ${H})` }}>
          {block.name}
        </span>
      </div>
      <ColorRow label="Hex"    value={hex}       isCopied={copied === 'hex'}    onCopy={() => copy('hex', hex)} />
      <ColorRow label="OKLCH"  value={oklchStr}  isCopied={copied === 'oklch'}  onCopy={() => copy('oklch', oklchStr)} />
      <ColorRow label="HSL"    value={hslStr}    isCopied={copied === 'hsl'}    onCopy={() => copy('hsl', hslStr)} />
      <ColorRow label="sRGB"   value={srgbStr}   isCopied={copied === 'srgb'}   onCopy={() => copy('srgb', srgbStr)} />
      <ColorRow label="Linear" value={linearStr} isCopied={copied === 'linear'} onCopy={() => copy('linear', linearStr)} />
    </>
  );
}
