import { createSlice } from "@reduxjs/toolkit";

const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState: {
    user: null,
    token: null,
  },

  reducers: {
    setSuperAdmin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    clearSuperAdmin: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setSuperAdmin, clearSuperAdmin } =
  superAdminSlice.actions;

export default superAdminSlice.reducer;