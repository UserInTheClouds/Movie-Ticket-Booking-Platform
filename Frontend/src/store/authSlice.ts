import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAuthReady: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthState['user']; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setAuthReady: (state, action: PayloadAction<boolean>) => {
      state.isAuthReady = action.payload;
    },
  },
});

export const { setCredentials, logOut, setAuthReady } = authSlice.actions;
export default authSlice.reducer;
