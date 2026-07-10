import axios from "axios";
import { getAuthToken } from "../../../store/authSession";

const API_BASE_URL = import.meta.env.VITE_ACCOUNTING_URL;

const getAuthHeaders = () => {
  const token = getAuthToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchSuperAdminAccountingActivity = async (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

  const response = await axios.get(
    `${API_BASE_URL}/api/v1/superadmin-accounting/activity`,
    {
      params,
      withCredentials: true,
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};
