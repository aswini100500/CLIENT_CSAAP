import React from "react";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CommandPaletteModal from "./CommandPaletteModal";

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () =>
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const toggleFocusMode = () => setIsFocusMode((prev) => !prev);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCmdOrCtrl && key === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.shiftKey && key === "f") {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {!isFocusMode && (
        <div className="hidden md:flex">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>
      )}

      {!isFocusMode && isMobileSidebarOpen && (
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

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {!isFocusMode && (
          <Header
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            isMobileSidebarOpen={isMobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
            showCollapseIcon={true}
            onOpenPalette={() => setIsPaletteOpen(true)}
          />
        )}

        <main
          className={`flex-1 overflow-y-auto bg-gray-50 relative ${isFocusMode ? "p-4 md:p-6" : "p-3 md:p-4"}`}
        >
          <Outlet />
        </main>
      </div>

      <CommandPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
