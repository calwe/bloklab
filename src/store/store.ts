import { configureStore } from "@reduxjs/toolkit";
import blockspaceReducer from "./blockspaceSlice";
import gradientReducer from "./gradientSlice";

export const store = configureStore({
  reducer: {
    blockspace: blockspaceReducer,
    gradient: gradientReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
