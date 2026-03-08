'use client';

import { useAppSelector } from '@/store/hooks';
import { BlockDef } from '@/types';
import BlockInfoPane from './panes/BlockInfoPane';

interface MobileBlockInfoProps {
  blocks: BlockDef[];
}

export default function MobileBlockInfo({ blocks }: MobileBlockInfoProps) {
  const selectedBlockId = useAppSelector((s) => s.blockspace.selectedBlockId);

  if (selectedBlockId === null) return null;

  const block = blocks.find((b) => b.id === selectedBlockId);
  if (!block) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-neutral-900 border-t-2 border-neutral-600 lg:hidden">
      <BlockInfoPane block={block} />
    </div>
  );
}
