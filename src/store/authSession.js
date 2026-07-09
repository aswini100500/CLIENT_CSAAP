import { clearEmployee } from "../submodules/hrms/redux/slices/employeeSlice";
import { clearSuperAdmin } from "../submodules/hrms/redux/slices/superAdminSlice";
import { persistor, store } from "./store";
import { clearUser } from "./slices/userSlice";

const LEGACY_AUTH_SESSION_KEYS = [
  "token",
  "adminToken",
  "csaapToken",
  "hrmsUserToken",
  "employeeToken",
  "user",
  "adminUser",
  "employeeUser",
  "hrmsUserData",
  "adminName",
  "com_id",
  "company_id",
  "permissions",
];

const LOGOUT_SESSION_KEYS = [
  ...LEGACY_AUTH_SESSION_KEYS,
  "selectedCompanyId",
  "selectedCompanyName",
  "viewingCompany",
];

const removeSessionKeys = (keys) => {
  if (typeof window === "undefined") {
    return;
  }

  keys.forEach((key) => {
    sessionStorage.removeItem(key);
  });
};

export const getAuthState = () => store.getState().user || {};

export const getAuthUser = () => {
  const authState = getAuthState();
  return authState?.isAuthenticated ? authState : null;
};

export const getAuthToken = () => getAuthState().token || "";

export const getAuthCompanyId = () => getAuthUser()?.company_id ?? null;

export const getAuthSlug = () => getAuthUser()?.slug || "";

export const clearLegacyAuthSessionStorage = () => {
  removeSessionKeys(LEGACY_AUTH_SESSION_KEYS);
};

export const clearLogoutSessionStorage = () => {
  removeSessionKeys(LOGOUT_SESSION_KEYS);
};

export const resetPersistedAuthState = async () => {
  store.dispatch(clearUser());
  store.dispatch(clearSuperAdmin());
  store.dispatch(clearEmployee());
  clearLogoutSessionStorage();
  await persistor.purge();
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("persist:root");
  }
};
