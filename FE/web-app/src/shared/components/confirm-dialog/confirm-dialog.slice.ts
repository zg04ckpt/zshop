import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ConfirmDialogState {
    show: boolean;
    message: string;
    onConfirm: () => void;
    onReject: () => void;
}

const initialState: ConfirmDialogState = {
    show: false,
    message: '',
    onConfirm: () => {},
    onReject: () => {}
}

type ConfirmData = Omit<ConfirmDialogState, 'show'>

const slice = createSlice({
    name: 'confirm-dialog',
    initialState,
    reducers: {
        showConfirm: (state, action: PayloadAction<ConfirmData>) => {
            state.message = action.payload.message;
            state.onConfirm = action.payload.onConfirm;
            state.onReject = action.payload.onReject;
            state.show = true;
        },
        hideConfirm: (state) => {
            state.show = false
        }
    }
});

export const { showConfirm, hideConfirm } = slice.actions;
export const confirmDialogReducer = slice.reducer;