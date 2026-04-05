import { createSlice } from "@reduxjs/toolkit";
const saveItem = createSlice({
  name: "save",
  initialState: {
    loading: false,
    error: null,
    saveItem: [],
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setsaveItem: (state, action) => {
      state.saveItem = action.payload;
    },
  },
});
export const { setLoading, setError, setsaveItem } = saveItem.actions;
export default saveItem.reducer;
