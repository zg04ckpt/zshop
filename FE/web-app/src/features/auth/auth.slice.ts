import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LocalUser } from "./auth.model";
import { AuthService } from "./auth.service";

interface AuthState {
    user: LocalUser|null;
}

const initialState: AuthState = {
    user: null
}

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateUser: (state) => {
            state.user = new AuthService().getLocalUser();
        }
    }
});

export const { updateUser } = slice.actions;
export const authReducer = slice.reducer;