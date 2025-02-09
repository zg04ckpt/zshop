import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../../features/auth";
import { confirmDialogReducer } from "../components/confirm-dialog/confirm-dialog.slice";

export const reduxToolkitStore = configureStore({
    reducer: {
        auth: authReducer,
        confirmDialog: confirmDialogReducer
    }
});

export type RootState = ReturnType<typeof reduxToolkitStore.getState>;
export type AppDispatch = typeof reduxToolkitStore.dispatch;
