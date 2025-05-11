import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LocalUser } from "../../auth";

interface AuthState {
    user: LocalUser | null;
}

const initialState: AuthState = {
    user: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<LocalUser | null>) => {
            state.user = action.payload;
        },
    }
});

export const authReducer = authSlice.reducer;
export const { setUser } = authSlice.actions;