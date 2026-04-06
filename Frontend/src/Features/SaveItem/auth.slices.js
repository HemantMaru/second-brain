import { createSlice } from "@reduxjs/toolkit";

// 🔥 localStorage se user uthao
const storedUser = JSON.parse(localStorage.getItem("nv_user"));

const initialState = {
  user: storedUser || null,
  isAuthenticated: !!storedUser,
  loading: true, // 🔥 sabse important
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

      // 🔥 save in localStorage
      localStorage.setItem("nv_user", JSON.stringify(action.payload.user));
    },

    authFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem("nv_user");
    },
  },
});

export const { authStart, authSuccess, authFailure, logout } =
  authSlice.actions;

export default authSlice.reducer;
