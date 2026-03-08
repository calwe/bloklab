'use client';

import { useState } from 'react';
import blocksJson from "@/data/blocks.json";
import { BlockDef } from "@/types";
import Blockspace from "./_components/blockspace/Blockspace";
import Sidebar from "./_components/Sidebar";
import MobileBlockInfo from "./_components/MobileBlockInfo";
import OptionsPane from "./_components/panes/OptionsPane";
import GradientPane from "./_components/panes/GradientPane";
import Image from "next/image";
import { Menu, Spline } from 'lucide-react';

const blocks = blocksJson as BlockDef[];

type MobilePane = 'options' | 'gradient' | null;

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>(null);

  function handleMobilePaneChange(pane: 'options' | 'gradient') {
    setMobilePane((prev) => (prev === pane ? null : pane));
  }

  return (
    <div className="w-full h-dvh flex relative">
      {/* Left column: canvas + mobile pane below */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0">
          <Blockspace blocks={blocks} />
        </div>
        {mobilePane !== null && (
          <div className="lg:hidden border-t-2 border-neutral-600 bg-neutral-900 p-4">
            {mobilePane === 'options' && <OptionsPane className="w-full" />}
            {mobilePane === 'gradient' && <GradientPane className="w-full" blocks={blocks} />}
          </div>
        )}
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        blocks={blocks}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <MobileBlockInfo blocks={blocks} />

      {/* Mobile toolbar — options, gradient, hamburger */}
      <div className="lg:hidden fixed top-4 right-4 z-40 flex gap-2">
        <button
          onClick={() => handleMobilePaneChange('options')}
          className={`p-2 bg-neutral-900 border-2 text-white ${mobilePane === 'options' ? 'border-white' : 'border-neutral-600'}`}
        >
          <Menu size={18} />
        </button>
        <button
          onClick={() => handleMobilePaneChange('gradient')}
          className={`p-2 bg-neutral-900 border-2 text-white ${mobilePane === 'gradient' ? 'border-white' : 'border-neutral-600'}`}
        >
          <Spline size={18} />
        </button>
        <button
          className="p-2 bg-neutral-900 border-2 border-neutral-600 text-white"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 text-white pointer-events-none flex items-center gap-2">
        <span>Made with</span>
        <Image src="/heart.png" alt="love" width={16} height={16} style={{ imageRendering: 'pixelated' }} />
        <span>by</span>
        <div className="pointer-events-auto border-b border-white">
          <a href="https://github.com/calwe" target="_blank" rel="noopener noreferrer">calwe</a>
        </div>
      </div>
    </div>
  );
}
