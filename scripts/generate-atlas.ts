import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const COLS = 24;
const ROWS = 24;
const TILE = 16;
const ATLAS_W = COLS * TILE; // 384
const ATLAS_H = ROWS * TILE; // 384

interface BlockDef {
  id: number;
  file: string;
}

const blocks: BlockDef[] = JSON.parse(
  readFileSync(join(import.meta.dir, "../src/data/blocks.json"), "utf-8")
);

const composites: sharp.OverlayOptions[] = [];

for (const block of blocks) {
  const col = block.id % COLS;
  const row = Math.floor(block.id / COLS);
  const imgPath = join(import.meta.dir, "../public/blocks", block.file);
  composites.push({
    input: imgPath,
    left: col * TILE,
    top: row * TILE,
  });
}

await sharp({
  create: {
    width: ATLAS_W,
    height: ATLAS_H,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .png()
  .toFile(join(import.meta.dir, "../public/atlas.png"));

writeFileSync(
  join(import.meta.dir, "../src/data/atlas.json"),
  JSON.stringify({ cols: COLS, rows: ROWS }, null, 2) + "\n"
);

console.log(`Atlas generated: ${ATLAS_W}×${ATLAS_H}px (${COLS}×${ROWS} tiles, ${blocks.length} blocks)`);
