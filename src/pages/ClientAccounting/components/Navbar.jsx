


import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Building2,
  User,
  ChevronDown,
  X,
  Check,
  Menu,
  LogOut,
} from "lucide-react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";



const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companies, setCompanies] = useState([]);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const { setCompanyId } = useCompany();
  const { setcompanyName } = useCompany()
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {

    const saved = sessionStorage.getItem("selectedCompanyId");
    return saved ? parseInt(saved, 10) : null;
  });
  const { userId, user, setUserId, setUser, logout } = useUser();
  const [selectedCompanyName, setSelectedCompanyName] = useState()


  const handleLogout = async () => {
    await logout();


    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("selectedCompanyId");

    setCompanyId(null);
    setShowUserMenu(false);


    navigate("/login");
  };

  const getCompanies = async () => {
    try {

      const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/${userId}`);


      console.log('API Response:', res);


      const companies = res.data;
      console.log('Companies Data:', companies);


      setCompanies(companies);
    } catch (err) {
      console.log(err);
      console.error('Error fetching companies:', err);
    }
  };

  useEffect(() => {
    getCompanies();
  }, []);


  useEffect(() => {
    console.log(selectedCompany);

    if (selectedCompanyId) {
      sessionStorage.setItem("selectedCompanyId", selectedCompanyId.toString());
      setCompanyId(selectedCompanyId);
      setcompanyName(selectedCompany);
      setSelectedCompanyName(selectedCompany)
    } else {
      sessionStorage.removeItem("selectedCompanyId");
    }
  }, [selectedCompanyId, setCompanyId]);


  const selectedCompany = selectedCompanyId
    ? companies.find((c) => c.id === selectedCompanyId)?.name || ""
    : "";






















  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies([]);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = companies.filter((c) =>
        (c.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (c.gst?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (c.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (c.admin_phone?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, companies]);



  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setShowCompanyDropdown(false);
      }
      if (!searchRef.current?.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (!userMenuRef.current?.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  console.log(companies);


  const handleCompanySelect = (company) => {

    setSelectedCompanyId(company.id);

    setSearchQuery("");
    setShowCompanyDropdown(false);
    setFilteredCompanies([]);
  };

  const selectedCompanyData = companies.find(
    (c) => c.id === selectedCompanyId
  );

  return (
    <div className="navbar no-print w-full lg:w-[82vw] ml-auto bg-linear-to-r from-blue-800 to-blue-900 text-white shadow-lg rounded-bl-xl sticky top-0 z-50">


      <div className="lg:hidden flex justify-between items-center px-4 py-3">
        <h1 className="text-lg font-bold truncate">Cloudsat Pvt Ltd</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white/10 rounded-md"
        >
          <Menu size={22} />
        </button>
      </div>


      <div
        className={`px-4 py-3 space-y-4 lg:space-y-0 
        ${mobileMenuOpen ? "block" : "hidden lg:flex lg:items-center lg:justify-between"}`}
      >

        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl">
            <Building2 size={30} className="text-blue-200" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold">{selectedCompany}</h1>
            <p className="text-blue-200 text-xs md:text-sm">
              Business Management Suite
            </p>
          </div>
        </div>


        <div className="relative max-w-full sm:max-w-xs w-full" ref={dropdownRef}>
          <div
            onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl 
            cursor-pointer hover:bg-white/20 transition"
          >
            <User size={20} className="text-blue-200" />

            <div className="flex-1 min-w-0">
              {selectedCompany ? (
                <>
                  <p className="font-semibold truncate">{selectedCompany}</p>
                  <p className="text-blue-200 text-xs truncate">
                    {selectedCompanyData?.gst}
                  </p>
                </>
              ) : (
                <p className="text-blue-200">Select Company</p>
              )}
            </div>

            <ChevronDown
              size={20}
              className={`transition-transform duration-300 ${showCompanyDropdown ? "rotate-180" : ""
                }`}
            />
          </div>

          {showCompanyDropdown && (
            <div className="absolute text-blue-600 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border z-50
            max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
              {companies.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleCompanySelect(c)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 flex justify-between items-center 
                  ${selectedCompany === c.name ? "bg-blue-50 border-l-4 border-blue-600" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.gst}</p>
                  </div>

                  {selectedCompany === c.name && (
                    <Check size={18} className="text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>


        <div className="relative max-w-full sm:max-w-xs w-full" ref={searchRef}>
          <Search size={18} className="absolute left-3 top-3 text-blue-300" />

          <input
            type="text"
            placeholder="Search company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full bg-white/10 border border-blue-300/40 text-white 
            rounded-xl pl-10 pr-10 py-2 focus:ring-2 focus:ring-blue-400
            placeholder-blue-300"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-blue-300 hover:text-white"
            >
              <X size={18} />
            </button>
          )}

          {isSearchFocused && filteredCompanies.length > 0 && (
            <div className="absolute text-blue-800 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border 
            max-h-72 overflow-y-auto z-50 scrollbar-thin scrollbar-thumb-gray-300">
              {filteredCompanies.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleCompanySelect(c)}
                  className="p-3 flex items-center gap-3 hover:bg-gray-100 cursor-pointer"
                >
                  <Building2 size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.gst}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        <div className="relative" ref={userMenuRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 cursor-pointer hover:bg-white/10 rounded-xl px-3 py-2 transition"
          >
            <div className="text-right">
              <p className="font-medium text-sm md:text-base">
                {user?.name || "User"}
              </p>
              <p className="text-blue-200 text-xs">
                {user?.email || "user@example.com"}
              </p>
            </div>

            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>

            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""
                }`}
            />
          </div>


          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
              <div className="p-4 bg-linear-to-r from-blue-600 to-purple-600 text-white">
                <p className="font-semibold">{user?.name || "User"}</p>
                <p className="text-xs text-blue-100 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>


      {selectedCompany && (
        <div className="bg-green-700/20 border-t border-green-600/40 px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-300" />
              <span>Active Company: {selectedCompany}</span>
            </div>

            <button
              onClick={() => setSelectedCompanyId(null)}
              className="text-green-200 text-xs hover:underline"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;








