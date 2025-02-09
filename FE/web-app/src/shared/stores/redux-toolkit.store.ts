import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../../features/auth";

export const reduxToolkitStore = configureStore({
    reducer: {
        auth: authReducer
    }
});

export type RootState = ReturnType<typeof reduxToolkitStore.getState>;
export type AppDispatch = typeof reduxToolkitStore.dispatch;
