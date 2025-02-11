import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../../features/auth/auth.slice";

export const reduxToolkitStore = configureStore({
    reducer: {
        auth: authReducer // for auth state management
    }
});

export type RootState = ReturnType<typeof reduxToolkitStore.getState>;
export type AppDispatch = typeof reduxToolkitStore.dispatch;
