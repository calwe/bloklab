import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ColorSpace } from "@/types";

interface BlockspaceState {
  colorSpace: ColorSpace;
  selectedBlockId: number | null;
  blockSize: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  scaleRadius: number;
  scaleHeight: number;
  showColorspace: boolean;
  colorspaceOpacity: number;
  colorspacePointSize: number;
  colorspacePointDensity: number;
  showBlocks: boolean;
  blocksOpacity: number;
}

const initialState: BlockspaceState = {
  colorSpace: "oklch",
  selectedBlockId: null,
  blockSize: 1,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  scaleRadius: 1,
  scaleHeight: 1,
  showColorspace: false,
  colorspaceOpacity: 0.6,
  colorspacePointSize: 3,
  colorspacePointDensity: 1,
  showBlocks: true,
  blocksOpacity: 1.0,
};

const blockspaceSlice = createSlice({
  name: "blockspace",
  initialState,
  reducers: {
    setColorSpace(state, action: PayloadAction<ColorSpace>) {
      state.colorSpace = action.payload;
    },
    selectBlock(state, action: PayloadAction<number | null>) {
      state.selectedBlockId = action.payload;
    },
    toggleBlock(state, action: PayloadAction<number>) {
      state.selectedBlockId =
        state.selectedBlockId === action.payload ? null : action.payload;
    },
    setBlockSize(state, action: PayloadAction<number>) {
      state.blockSize = action.payload;
    },
    setScaleX(state, action: PayloadAction<number>) {
      state.scaleX = action.payload;
    },
    setScaleY(state, action: PayloadAction<number>) {
      state.scaleY = action.payload;
    },
    setScaleZ(state, action: PayloadAction<number>) {
      state.scaleZ = action.payload;
    },
    setScaleRadius(state, action: PayloadAction<number>) {
      state.scaleRadius = action.payload;
    },
    setScaleHeight(state, action: PayloadAction<number>) {
      state.scaleHeight = action.payload;
    },
    setShowColorspace(state, action: PayloadAction<boolean>) {
      state.showColorspace = action.payload;
    },
    setColorspaceOpacity(state, action: PayloadAction<number>) {
      state.colorspaceOpacity = action.payload;
    },
    setShowBlocks(state, action: PayloadAction<boolean>) {
      state.showBlocks = action.payload;
    },
    setBlocksOpacity(state, action: PayloadAction<number>) {
      state.blocksOpacity = action.payload;
    },
    setColorspacePointSize(state, action: PayloadAction<number>) {
      state.colorspacePointSize = action.payload;
    },
    setColorspacePointDensity(state, action: PayloadAction<number>) {
      state.colorspacePointDensity = action.payload;
    },
  },
});

export const { setColorSpace, selectBlock, toggleBlock, setBlockSize, setScaleX, setScaleY, setScaleZ, setScaleRadius, setScaleHeight, setShowColorspace, setColorspaceOpacity, setColorspacePointSize, setColorspacePointDensity, setShowBlocks, setBlocksOpacity } = blockspaceSlice.actions;
export default blockspaceSlice.reducer;
