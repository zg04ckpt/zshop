import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
    name: 'loading',
    initialState: false,
    reducers: {
        startLoadingStatus: (state) => {
            return true;
        },
        endLoadingStatus: (state) => {
            return false;
        }
    }
});

export const { startLoadingStatus, endLoadingStatus } = slice.actions;
export const loadingReducer = slice.reducer;