import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
  isAuthenticated: false,
  permissions: [],
};

export const normalizeUserPayload = (payload = {}) => ({
  id: payload.user_id ?? payload.id ?? null,
  user_id: payload.user_id ?? payload.id ?? null,
  employee_id: payload.employee_id ?? payload.employeeProfileId ?? null,
  employeeProfileId: payload.employee_id ?? payload.employeeProfileId ?? null,
  name: payload.name || "",
  email: payload.email || "",
  token: payload.token || "",
  csaapToken: payload.csaapToken || payload.token || "",
  companyName:
    payload.companyName ||
    payload.subdomain ||
    payload.company ||
    payload.slug ||
    "",
  slug: payload.slug || payload.subdomain || payload.company || "",
  role: payload.role || "",
  company_id: payload.company_id ?? payload.tenant_id ?? null,
  isEmployee: Boolean(payload.isEmployee),
});

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    setUser: (state, action) => {
      const normalizedUser = normalizeUserPayload(action.payload);

      Object.assign(state, {
        ...normalizedUser,
        isAuthenticated: true,
        permissions: action.payload.permissions || state.permissions || [],
      });
    },
    updatePermissions: (state, action) => {
      state.permissions = action.payload || [];
    },
    clearUser: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setUser, clearUser, updatePermissions } = userSlice.actions;
export default userSlice.reducer;
