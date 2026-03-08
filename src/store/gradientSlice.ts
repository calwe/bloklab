import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GradientState {
  blockAId: number | null;
  blockBId: number | null;
  selectingSlot: 'A' | 'B' | null;
  radius: number;
  steps: number;
  gradientBlockIds: number[];
}

const initialState: GradientState = {
  blockAId: null,
  blockBId: null,
  selectingSlot: null,
  radius: 10,
  steps: 8,
  gradientBlockIds: [],
};

const gradientSlice = createSlice({
  name: "gradient",
  initialState,
  reducers: {
    setGradientBlockA(state, action: PayloadAction<number | null>) {
      state.blockAId = action.payload;
    },
    setGradientBlockB(state, action: PayloadAction<number | null>) {
      state.blockBId = action.payload;
    },
    setSelectingSlot(state, action: PayloadAction<'A' | 'B' | null>) {
      state.selectingSlot = action.payload;
    },
    setGradientRadius(state, action: PayloadAction<number>) {
      state.radius = action.payload;
    },
    setGradientSteps(state, action: PayloadAction<number>) {
      state.steps = action.payload;
    },
    setGradientBlockIds(state, action: PayloadAction<number[]>) {
      state.gradientBlockIds = action.payload;
    },
  },
});

export const {
  setGradientBlockA,
  setGradientBlockB,
  setSelectingSlot,
  setGradientRadius,
  setGradientSteps,
  setGradientBlockIds,
} = gradientSlice.actions;
export default gradientSlice.reducer;
