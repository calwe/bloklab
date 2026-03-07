import { memo, useCallback } from "react";
import Image from "next/image";
import { BlockDef } from "@/types";

interface SidebarBlockProps {
  block: BlockDef;
  isSelected: boolean;
  onToggle: (id: number) => void;
  style?: React.CSSProperties;
}

const SidebarBlock = memo(function SidebarBlock({ block, isSelected, onToggle, style }: SidebarBlockProps) {
  const color = `oklch(${Math.max(block.oklch.L, 0.6)} ${block.oklch.C} ${block.oklch.H})`;
  const handleClick = useCallback(() => onToggle(block.id), [onToggle, block.id]);

  return (
    <h2
      style={{ ...style, color }}
      onClick={handleClick}
      className={`cursor-pointer flex items-center gap-2 px-2 py-1 border-l-4 ${
        isSelected
          ? "bg-neutral-700 border-l-neutral-500"
          : "border-l-transparent hover:bg-neutral-800"
      }`}
    >
      <Image
        src={`/blocks/${block.file}`}
        alt=""
        width={24}
        height={24}
        className="shrink-0"
        style={{ imageRendering: "pixelated" }}
      />
      {block.name}
    </h2>
  );
});

export default SidebarBlock;
