import { createSlice } from "@reduxjs/toolkit";

const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    user: null,
    token: null,
  },

  reducers: {
    setEmployee: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    clearEmployee: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setEmployee, clearEmployee } = employeeSlice.actions;

export default employeeSlice.reducer;
