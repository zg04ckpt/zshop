import { createSlice } from "@reduxjs/toolkit";

export interface ShowLoginDialogState {
    show: boolean;
}

export const initialState: ShowLoginDialogState = {
    show: false
}

export const showLoginDialogSlice = createSlice({
    name: 'showLoginDialog',
    initialState: initialState,
    reducers: {
        show: state => { state.show = true; },
        hide: state => { state.show = false }
    }
});

export const { show, hide } = showLoginDialogSlice.actions;
export default showLoginDialogSlice.reducer;