import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import Header from "../submodules/hrms/Employee dashboard/components/Header";

const EmployeeLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">

      <EmployeeSidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />


      <div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300">

        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />


        <main className="crm-module-root flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
