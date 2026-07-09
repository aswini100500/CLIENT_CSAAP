import { createSlice } from '@reduxjs/toolkit';

const companyApiSlice = createSlice({
  name: 'companyApiData',

  initialState: {
    data: {}
  },

  reducers: {
    setCompanyApiData: (state, action) => {
      state.data = action.payload;
    }
  }
});

export const { setCompanyApiData } = companyApiSlice.actions;

export default companyApiSlice.reducer;
