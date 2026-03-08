"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { List, RowComponentProps, useListRef } from "react-window";
import { BlockDef, ColorSpace } from "@/types";
import { Menu, Spline } from "lucide-react";
import Select from "./ui/Select";
import SearchBar from "./ui/SearchBar";
import SidebarBlock from "./SidebarBlock";
import SidebarPane from "./SidebarPane";
import OptionsPane from "./panes/OptionsPane";
import GradientPane from "./panes/GradientPane";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setColorSpace, toggleBlock } from "@/store/blockspaceSlice";

const ITEM_HEIGHT = 34;

const COLOR_SPACE_LABELS: Record<ColorSpace, string> = {
  oklch: "OKLCH",
  srgb: "sRGB",
  linear_rgb: "Linear RGB",
  hsl: "HSL",
};

type RowProps = {
  filteredBlocks: BlockDef[];
  selectedBlockId: number | null;
  onToggle: (id: number) => void;
};

function Row({ index, style, filteredBlocks, selectedBlockId, onToggle }: RowComponentProps<RowProps>) {
  const block = filteredBlocks[index];
  return (
    <SidebarBlock
      block={block}
      isSelected={block.id === selectedBlockId}
      onToggle={onToggle}
      style={style}
    />
  );
}

export default function Sidebar({ blocks }: { blocks: BlockDef[] }) {
  const dispatch = useAppDispatch();
  const colorSpace = useAppSelector((s) => s.blockspace.colorSpace);
  const selectedBlockId = useAppSelector((s) => s.blockspace.selectedBlockId);

  const [search, setSearch] = useState("");
  const listRef = useListRef(null);

  const filteredBlocks = useMemo(() => {
    const query = search.toLowerCase();
    return query ? blocks.filter((b) => b.name.toLowerCase().includes(query)) : blocks;
  }, [blocks, search]);

  const handleToggle = useCallback((id: number) => dispatch(toggleBlock(id)), [dispatch]);

  useEffect(() => {
    if (selectedBlockId === null) return;
    const index = filteredBlocks.findIndex((b) => b.id === selectedBlockId);
    if (index !== -1) listRef.current?.scrollToRow({ index, align: "smart" });
  }, [selectedBlockId, filteredBlocks, listRef]);

  const rowProps = useMemo<RowProps>(
    () => ({ filteredBlocks, selectedBlockId, onToggle: handleToggle }),
    [filteredBlocks, selectedBlockId, handleToggle]
  );

  return (
    <div className="relative z-10 w-lg flex flex-col bg-neutral-900 border-l-2 border-neutral-600">
      <div className="absolute top-4 right-full flex flex-col items-end gap-2" style={{ zIndex: -1 }}>
        <SidebarPane icon={<Menu size={14} />} shortcut="o" width="14rem">
          <OptionsPane />
        </SidebarPane>
        <SidebarPane icon={<Spline size={14} />} shortcut="g" width="16rem">
          <GradientPane blocks={blocks} />
        </SidebarPane>
      </div>

      {/* Non-positioned wrapper — paints at stacking step 3 (above step 2 z:-1 pane),
          so bg-neutral-900 covers the pane content when the pane is slid behind the sidebar. */}
      <div className="flex-1 flex flex-col min-h-0 bg-neutral-900">
        <div className="p-5 pb-0">
          <h1 className="mb-5 text-2xl">Blok-LAB</h1>

          <div className="mb-3">
            <Select
              label="Color Space"
              value={colorSpace}
              options={(Object.keys(COLOR_SPACE_LABELS) as ColorSpace[]).map((space) => ({
                value: space,
                label: COLOR_SPACE_LABELS[space],
              }))}
              onChange={(space) => dispatch(setColorSpace(space))}
            />
          </div>

          <div className="mb-5">
            <SearchBar
              label="Search"
              value={search}
              onChange={setSearch}
              placeholder="Block name..."
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <List
            listRef={listRef}
            className="h-full"
            rowCount={filteredBlocks.length}
            rowHeight={ITEM_HEIGHT}
            rowComponent={Row}
            rowProps={rowProps}
          />
        </div>
      </div>
    </div>
  );
}
