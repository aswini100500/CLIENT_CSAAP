


// import { createContext, useContext, useState, useEffect } from "react";

// const CompanyContext = createContext();

// export const CompanyProvider = ({ children }) => {
//   const [companyId, setCompanyId] = useState(null);
//   const [companyName, setcompanyName] = useState("");

//   // 🔥 Restore saved values on page load
//   useEffect(() => {
//     const savedId = sessionStorage.getItem("selectedCompanyId");
//     const savedName = sessionStorage.getItem("selectedCompanyName");

//     if (savedId) setCompanyId(Number(savedId));
//     if (savedName) setcompanyName(savedName);
//   }, []);

//   // 🔥 Save automatically when changed
//   useEffect(() => {
//     if (companyId) sessionStorage.setItem("selectedCompanyId", companyId);
//   }, [companyId]);

//   useEffect(() => {
//     if (companyName) sessionStorage.setItem("selectedCompanyName", companyName);
//   }, [companyName]);

//   return (
//     <CompanyContext.Provider
//       value={{ companyId, setCompanyId, companyName, setcompanyName }}
//     >
//       {children}
//     </CompanyContext.Provider>
//   );
// };

// export const useCompany = () => useContext(CompanyContext);


import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const { user, token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_CSAAP_URL || 'https://csaapnodeapi.csaap.com';
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setcompanyName] = useState("");
  const [employees, setEmployees] = useState([]);
  const isFetching = useRef(false);

  // 🔥 Fetch company using email
  const fetchCompanyByEmail = async () => {
    if (isFetching.current) return;

    try {
      const email = user?.email;
      if (!email) return;

      isFetching.current = true;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/getByEmail/${email}`,
          { withCredentials: true }
        );

        if (res.data) {
          const company = res.data;

          setCompanyId(company.id);
          setcompanyName(company.name);

          // Save in sessionStorage
          sessionStorage.setItem("selectedCompanyId", company.id);
          sessionStorage.setItem("selectedCompanyName", company.name);
        }
      } catch (error) {
        // If company is not found, automatically create it in the accounting DB
        if (error.response && error.response.status === 404) {
          try {
            const createRes = await axios.post(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/create`,
              {
                name: user?.companyName || user?.company || user?.slug || user?.name || "",
                email: email,
                slug: user?.slug || "",
                userId: user?.id || 0,
                gstRegistered: "No",
                gstin: ""
              },
              { withCredentials: true }
            );

            if (createRes.data && createRes.data.id) {
              const newCompanyId = createRes.data.id;
              const newCompanyName = user?.companyName || user?.company || user?.slug || user?.name || "";

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
      const res = await axios.get(`${API_BASE_URL}/api/tenant/hrms/all-employees`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data && res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // 🔥 Fetch company when user is loaded/changed
  useEffect(() => {
    if (user?.email) {
      const savedId = sessionStorage.getItem("selectedCompanyId");
      const savedName = sessionStorage.getItem("selectedCompanyName");

      if (savedId && savedName) {
        setCompanyId(Number(savedId));
        setcompanyName(savedName);
        fetchEmployeesList(Number(savedId));
      } else {
        fetchCompanyByEmail().then(() => {
          const id = sessionStorage.getItem("selectedCompanyId");
          if (id) fetchEmployeesList(Number(id));
        }); // If not in session, call API
      }
    }
  }, [user?.email, token]);

  return (
    <CompanyContext.Provider
      value={{ companyId, setCompanyId, companyName, setcompanyName, employees }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);