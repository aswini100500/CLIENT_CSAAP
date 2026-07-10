import React, { createContext, useContext, useState } from "react";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companyId, setCompanyId] = useState(null);

  return (
    <CompanyContext.Provider value={{ companyId, setCompanyId }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
