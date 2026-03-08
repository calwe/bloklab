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
  },
});

export const { setColorSpace, selectBlock, toggleBlock, setBlockSize, setScaleX, setScaleY, setScaleZ, setScaleRadius, setScaleHeight } = blockspaceSlice.actions;
export default blockspaceSlice.reducer;
