import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { clearUser as clearActiveUser } from '../store/slices/userSlice';
import { resetPersistedAuthState } from '../store/authSession';
import { Menu, Bell, Search, User, LogOut, ChevronLeft } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Header = ({ 
  isSidebarCollapsed, 
  toggleSidebar, 
  toggleMobileSidebar, 
  isMobileSidebarOpen 
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // States for user data and dropdown toggle
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ref for closing dropdown when clicking outside
  const dropdownRef = useRef(null);

  const userData = useMemo(() => {
    const name = user?.name || user?.email?.split('@')[0] || 'User';
    const role = user?.role || 'User';
    const initials = name.substring(0, 2).toUpperCase();
    return { name, role, initials };
  }, [user]);

  // 2. Handle closing the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Robust Logout functionality
  const handleLogout = async () => {
    // 1. Call Backend API to clear HttpOnly session cookies
    try {
      await fetch('https://csaapnodeapi.csaap.com/api/builder-companies/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error("API Logout failed:", error);
    }

    dispatch(clearActiveUser());
    await resetPersistedAuthState();

    queryClient.setQueryData(["authUser"], null);
    queryClient.clear();

    localStorage.removeItem('viewingCompany');
    if (import.meta.env.VITE_LOCAL_AUTH === "true") {
      localStorage.setItem('explicit_logout', 'true');
    }

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    navigate('/admin/login'); 
  };

  return (
    <header
      className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-30 transition-all duration-300 shrink-0"
      style={{ fontFamily: "'Manrope', 'Inter', 'Segoe UI', sans-serif" }}
    >
      
      {/* Left Section: Collapse + Separator + Search */}
      <div className="flex items-center gap-3">
        
        {/* MOBILE Toggle Button */}
        <button 
          onClick={toggleMobileSidebar}
          className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 md:hidden transition-colors duration-200"
        >
          <Menu size={22} />
        </button>

        {/* Desktop Collapse Button — only when sidebar is expanded */}
        {!isSidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:flex w-9 h-9 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-500 hover:text-green-600 items-center justify-center transition-all duration-200 cursor-pointer shadow-sm shrink-0"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
        )}



        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-300 focus:bg-white outline-none w-56 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Section: Notifications + Separator + Profile */}
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 relative flex items-center justify-center transition-colors duration-200">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        
        <div className="w-px h-7 bg-slate-200 mx-1 shrink-0" />

        {/* PROFILE SECTION WITH DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-xl hover:bg-slate-50 transition-colors duration-200"
          >
            {/* Dynamic Initials */}
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-green-200">
              {userData.initials}
            </div>
            
            {/* Dynamic Name & Role */}
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-slate-700 capitalize leading-tight">
                {userData.name}
              </p>
              <p className="text-[11px] font-medium text-slate-400 capitalize leading-tight">
                {userData.role}
              </p>
            </div>
          </div>

          {/* DROPDOWN MENU */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
              {/* Optional Profile Link */}
              <button 
              onClick={() => {navigate('/profile'); setIsDropdownOpen(false);}}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors duration-150">
                <User size={15} />
                <span>My Profile</span>
              </button>
              
              <div className="h-px bg-slate-100 mx-3 my-1" />
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
