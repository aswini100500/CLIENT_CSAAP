import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      <div className="hidden md:flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>


      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMobileSidebar}
          />

          <div className="fixed inset-y-0 left-0 w-64 z-50">
            <Sidebar
              isCollapsed={false}
              onItemClick={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}


      <div className="flex-1 flex flex-col overflow-hidden">

        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
          showCollapseIcon={true}
        />


        <main className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
