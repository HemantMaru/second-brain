import { createSlice } from "@reduxjs/toolkit";

// Refresh hone par localstorage se user uthao
const storedUser = JSON.parse(localStorage.getItem("nv_user"));

const initialState = {
  user: storedUser || null,
  isAuthenticated: !!storedUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;

      // Persistence: Browser mein save karo
      localStorage.setItem("nv_user", JSON.stringify(action.payload.user));
      localStorage.setItem("nv_token", action.payload.token);
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("nv_user");
      localStorage.removeItem("nv_token");
    },
  },
});

export const { authStart, authSuccess, authFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
