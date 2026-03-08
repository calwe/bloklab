import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ColorSpace } from "@/types";

interface BlockspaceState {
  colorSpace: ColorSpace;
  selectedBlockId: number | null;
}

const initialState: BlockspaceState = {
  colorSpace: "oklch",
  selectedBlockId: null,
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
  },
});

export const { setColorSpace, selectBlock, toggleBlock } = blockspaceSlice.actions;
export default blockspaceSlice.reducer;
