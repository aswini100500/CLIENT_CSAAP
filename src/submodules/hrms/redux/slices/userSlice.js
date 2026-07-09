import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    id: null,
    user_id: null,
    employee_id: null,
    employeeProfileId: null,
    name: "",
    email: "",
    token: "",
    csaapToken: "",
    companyName: "",
    slug: "",
    role: "",
    company_id: null,
    isEmployee: false,
  },

  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.user_id ?? action.payload.id ?? null;
      state.user_id = action.payload.user_id ?? action.payload.id ?? null;
      state.employee_id =
        action.payload.employee_id ??
        action.payload.employeeProfileId ??
        null;
      state.employeeProfileId =
        action.payload.employee_id ??
        action.payload.employeeProfileId ??
        null;
      state.name = action.payload.name || "";
      state.email = action.payload.email || "";
      state.token = action.payload.token || "";
      state.csaapToken = action.payload.csaapToken || state.csaapToken || "";
      state.companyName =
        action.payload.companyName ||
        action.payload.subdomain ||
        action.payload.slug ||
        "";
      state.slug = action.payload.slug || action.payload.subdomain || "";
      state.role = action.payload.role || "";
      state.company_id = action.payload.company_id ?? action.payload.tenant_id ?? null;
      state.isEmployee = Boolean(action.payload.isEmployee);
    },
    clearUser: (state) => {
      state.id = null;
      state.user_id = null;
      state.employee_id = null;
      state.employeeProfileId = null;
      state.name = "";
      state.email = "";
      state.token = "";
      state.csaapToken = "";
      state.companyName = "";
      state.slug = "";
      state.role = "";
      state.company_id = null;
      state.isEmployee = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
