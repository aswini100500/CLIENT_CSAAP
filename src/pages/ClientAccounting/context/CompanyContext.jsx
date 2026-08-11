import React from "react";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const {
    user,
    token,
    companyId: authCompanyId,
    companyName: authCompanyName,
  } = useAuth();
  const [companyId, setCompanyId] = useState(authCompanyId || null);
  const [companyName, setcompanyName] = useState(authCompanyName || "");
  const [employees, setEmployees] = useState([]);
  const isFetching = useRef(false);

  useEffect(() => {
    if (authCompanyId) {
      setCompanyId(authCompanyId);
      sessionStorage.setItem("selectedCompanyId", authCompanyId);
    }
    if (authCompanyName) {
      setcompanyName(authCompanyName);
      sessionStorage.setItem("selectedCompanyName", authCompanyName);
    }
  }, [authCompanyId, authCompanyName]);

  const fetchCompanyByEmail = async () => {
    if (isFetching.current) return;

    try {
      const email = user?.email;
      if (!email) return;

      isFetching.current = true;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/getByEmail/${email}`,
          { withCredentials: true },
        );

        if (res.data) {
          const company = res.data;

          const resolvedId = authCompanyId || company.id;
          const resolvedName = authCompanyName || company.name;

          setCompanyId(resolvedId);
          setcompanyName(resolvedName);

          sessionStorage.setItem("selectedCompanyId", resolvedId);
          sessionStorage.setItem("selectedCompanyName", resolvedName);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          try {
            const createRes = await axios.post(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/create`,
              {
                name:
                  authCompanyName ||
                  user?.companyName ||
                  user?.company ||
                  user?.slug ||
                  user?.name ||
                  "",
                email: email,
                slug: user?.slug || "",
                userId: user?.id || 0,
                gstRegistered: "No",
                gstin: "",
              },
              { withCredentials: true },
            );

            if (createRes.data && createRes.data.id) {
              const newCompanyId = authCompanyId || createRes.data.id;
              const newCompanyName =
                authCompanyName ||
                user?.companyName ||
                user?.company ||
                user?.slug ||
                user?.name ||
                "";

              setCompanyId(newCompanyId);
              setcompanyName(newCompanyName);
              sessionStorage.setItem("selectedCompanyId", newCompanyId);
              sessionStorage.setItem("selectedCompanyName", newCompanyName);
            }
          } catch (createError) {
            console.error("Error creating accounting company:", createError);
          }
        } else {
          console.error("Error fetching company:", error);
        }
      } finally {
        isFetching.current = false;
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
      isFetching.current = false;
    }
  };

  const fetchEmployeesList = async (id) => {
    try {
      const res = await axios.get(
        `https://csaapnodeapi.csaap.com/api/tenant/hrms/all-employees`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (res.data && res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    if (user?.email) {
      const savedId =
        sessionStorage.getItem("selectedCompanyId") || authCompanyId;
      const savedName =
        sessionStorage.getItem("selectedCompanyName") || authCompanyName;

      if (savedId && savedName) {
        setCompanyId(Number(savedId));
        setcompanyName(savedName);
        fetchEmployeesList(Number(savedId));
      } else {
        fetchCompanyByEmail().then(() => {
          const id =
            sessionStorage.getItem("selectedCompanyId") || authCompanyId;
          if (id) fetchEmployeesList(Number(id));
        });
      }
    }
  }, [user?.email, token, authCompanyId, authCompanyName]);

  return (
    <CompanyContext.Provider
      value={{
        companyId: companyId || authCompanyId,
        setCompanyId,
        companyName: companyName || authCompanyName,
        setcompanyName,
        employees,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  const auth = useAuth();

  const companyId = auth?.companyId || context?.companyId;
  const companyName = auth?.companyName || context?.companyName;

  return {
    ...context,
    companyId,
    companyName,
    user: auth?.user,
    token: auth?.token,
  };
};
