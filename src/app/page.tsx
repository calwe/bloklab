import blocksJson from "@/data/blocks.json";
import { BlockDef } from "@/types";
import Blockspace from "./_components/blockspace/Blockspace";
import Sidebar from "./_components/Sidebar";
import Image from "next/image";

const blocks = blocksJson as BlockDef[];

export default function Home() {
  return (
    <div className="w-full h-screen flex relative">
      <Blockspace blocks={blocks} />
      <Sidebar blocks={blocks} />
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
