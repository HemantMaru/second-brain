import { configureStore } from "@reduxjs/toolkit";
import savedItems from "../Features/SaveItem/save.slice.js";
import authReducer from "../Features/SaveItem/auth.slices.js";
export const store = configureStore({
  reducer: {
    save: savedItems,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Bhai, 'embedding' field ko check karne se mana kar do taaki speed badh jaye
        ignoredActions: ["save/setSaveItems", "save/addSaveItem"],
        ignoredPaths: ["save.saveItem"],
      },
    }),
});
