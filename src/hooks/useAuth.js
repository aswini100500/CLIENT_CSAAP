import { useSelector } from "react-redux";


export const useAuth = () => {
  const auth = useSelector((state) => state.user);

  return {
    user: auth,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    role: auth.role,
    isAdmin: auth.role === "admin" || auth.role === "superadmin",
    isEmployee: auth.isEmployee,
    companyId: auth.company_id,
    companyName: auth.companyName,
    slug: auth.slug,
    permissions: auth.permissions || [],
  };
};

export default useAuth;
