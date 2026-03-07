import blocksJson from "@/data/blocks.json";
import { BlockDef } from "@/types";
import Blockspace from "./_components/blockspace/Blockspace";
import Sidebar from "./_components/Sidebar";

const blocks = blocksJson as BlockDef[];

export default function Home() {
  return (
    <div className="w-full h-screen flex">
      <Blockspace blocks={blocks} />
      <Sidebar blocks={blocks} />
    </div>
  );
}
