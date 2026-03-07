import { configureStore } from "@reduxjs/toolkit";
import blockspaceReducer from "./blockspaceSlice";

export const store = configureStore({
  reducer: {
    blockspace: blockspaceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
