import React from "react";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import Header from "../submodules/hrms/Employee dashboard/components/Header";

const EmployeeLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleFocusMode = () => {
    setIsFocusMode((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCmdOrCtrl && e.shiftKey && key === "f") {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden relative">
      {!isFocusMode && (
        <EmployeeSidebar
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300">
        {!isFocusMode && (
          <Header
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
        )}

        <main
          className={`erp-root flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 ${isFocusMode ? "p-4 md:p-6" : "p-4 md:p-6"}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
