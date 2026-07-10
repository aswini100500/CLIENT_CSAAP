import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage/session";

import companyApiReducer from "./slices/companyApiSlice";
import userReducer from "./slices/userSlice";
import superAdminReducer from "../submodules/hrms/redux/slices/superAdminSlice";
import employeeReducer from "../submodules/hrms/redux/slices/employeeSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "superAdmin", "employee"],
};

const rootReducer = combineReducers({
  user: userReducer,
  companyApi: companyApiReducer,
  superAdmin: superAdminReducer,
  employee: employeeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
