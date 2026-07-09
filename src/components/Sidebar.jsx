import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { setCompanyApiData } from "../store/slices/companyApiSlice";
import useAuth from "../hooks/useAuth";

import {
  AlertTriangle,
  BarChart,
  BarChart2,
  BarChart4,
  BookOpen,
  BookText,
  Briefcase,
  Building,
  Calendar,
  CalendarArrowUp,
  ChevronRight,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileBarChart,
  FileCheck,
  FileSearch,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  HardHat,
  HeadphonesIcon,
  Home,
  Layers,
  Layers3,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MessageSquare,
  MapPin,
  Phone,
  Shield,
  ShoppingCart,
  Target,
  TrendingUp,
  Truck,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  Wrench
} from "lucide-react";
import { clearUser as clearActiveUser } from "../store/slices/userSlice";
import { resetPersistedAuthState } from "../store/authSession";

import { useQueryClient } from "@tanstack/react-query";
import { FaAddressBook } from "react-icons/fa";

const Sidebar = ({ isCollapsed, onItemClick, onToggleCollapse }) => {
  const { user } = useAuth();
  const tenantId = user?.tenant_id || user?.company_id || user?.id;
  // State to track expanded menus. Using an object allows multiple menus to be open.
  const [expandedMenus, setExpandedMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredPos, setHoveredPos] = useState({ top: 0, left: 0 });
  const [logoError, setLogoError] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const companyData = useSelector((state) => state.companyApi.data);
  const queryClient = useQueryClient();

  // Compute company name and logo from Redux state
  const companyName =
    companyData?.master_company_name ||
    companyData?.company_name ||
    "BuilderERP PRO";
  const companyLogoText = companyName.charAt(0).toUpperCase();

  // Construct logo URL
  const logoUrl = companyData?.logo_path
    ? `https://csaapnodeapi.csaap.com/${companyData.logo_path}`
    : null;

  const toggleMenu = (id) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleItemClick = () => {
    if (onItemClick) onItemClick();
  };

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    // 1. Call Backend API to clear HttpOnly session cookies
    try {
      await fetch(
        "https://csaapnodeapi.csaap.com/api/builder-companies/logout",
        {
          method: "POST",
          credentials: "include",
        },
      );
    } catch (error) {
      console.error("API Logout failed:", error);
    }

    dispatch(clearActiveUser());
    await resetPersistedAuthState();

    queryClient.setQueryData(["authUser"], null);
    queryClient.clear();

    localStorage.removeItem("viewingCompany");
    if (import.meta.env.VITE_LOCAL_AUTH === "true") {
      localStorage.setItem("explicit_logout", "true");
    }

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    navigate("/admin/login");
  };

  // --- EFFECT: FETCH COMPANY DETAILS USING AXIOS ---
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        if (tenantId) {
          const response = await axios.get(
            `https://csaapnodeapi.csaap.com/api/builder-companies/${tenantId}`,
          );
          const result = response.data;

          if (result.success && result.data) {
            dispatch(setCompanyApiData(result.data));
          } else {
            dispatch(setCompanyApiData({}));
          }
        } else {
          dispatch(setCompanyApiData({}));
        }
      } catch (error) {
        console.error("Failed to fetch company details for sidebar:", error);
        dispatch(setCompanyApiData({}));
      }
    };

    fetchCompanyData();
  }, [dispatch, tenantId]);

  // --- DATA STRUCTURE (Normalized to use 'children' everywhere) ---
  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} className="text-green-700 " />,
      path: "/dashboard",
      exact: true,
    },
    {
      id: "projects",
      label: "Projects",
      icon: <Home size={20} className="text-green-700" />,
      path: "/projects",
    },

    // ... USER MANAGEMENT ...
    {
      id: "users",
      label: "User Management",
      icon: <Users size={20} className="text-green-700" />,
      isMainFolder: true,
      children: [
        {
          id: "u_dept_role",
          label: "Department & Roles",
          path: "/users/department-role-manager",
          icon: <Building size={18} className="text-green-700" />,
        },
        {
          id: "u_permissions",
          label: "Access & Permissions",
          path: "/users/permission-manager",
          icon: <Shield size={18} className="text-green-700" />,
        },
        {
          id: "u_project_assign",
          label: "Project Assignment",
          path: "/users/project-assignment",
          icon: <Target size={18} className="text-green-700" />,
        },
        // {
        //   id: "u_subscription",
        //   label: "Subscription",
        //   path: "/users/plans",
        //   icon: <Wallet size={18} className="text-green-700" />,
        // },

        {
          id: "u_user_list",
          label: "UserDetails",
          path: "/users/user-plan-details",
          icon: <Users size={18} className="text-green-700" />,
        },
        {
          id: "u_booking_cancellation",
          label: "Cancel Booking",
          path: "/users/booking-cancellations",
          icon: <AlertTriangle size={18} className="text-green-700" />,
        },
        // { id: 'u_plan_details', label: 'User Plan Details', path: '/users/user-plan-details', icon: <FileText size={18} className="text-green-700" /> },
      ],
    },



    // ... HRMS & PAYROLL ...
    {
      id: "hrms",
      label: "HRMS ",
      icon: <UserPlus size={20} className="text-green-700" />,
      isMainFolder: true,
      children: [
        {
          id: "employee",
          label: "Employee Management",
          icon: <Users size={18} className="text-green-700" />,
          path: "/hrms/joined-employee",
        },
        {
          id: "attendance",
          label: "Attendance",
          icon: <Calendar size={18} className="text-green-700" />,
          path: "/hrms/attendance",
        },
        {
          id: "task",
          label: "Task Management",
          icon: <ClipboardList size={18} className="text-green-700" />,
          path: "/hrms/tasks",
        },
        {
          id: "report",
          label: "Report",
          icon: <BarChart size={18} className="text-green-700" />,
          path: "/hrms/all-report",
        },
        {
          id: "payroll",
          label: "Payroll",
          icon: <DollarSign size={18} className="text-green-700" />,
          path: "/hrms/payroll",
        },

        {
          id: "job",
          label: "Job",
          icon: <Briefcase size={18} className="text-green-700" />,
          path: "/hrms/job",
        },
        {
          id: "message",
          label: "Message",
          icon: <MessageCircle size={18} className="text-green-700" />,
          path: "/hrms/message",
        },

        {
          id: "calendar",
          label: "Calendar",
          icon: <CalendarArrowUp size={18} className="text-green-700" />,
          path: "/hrms/calendar",
        },
      ],
    },
    // ... CRM ...

    {
      id: "crm",
      label: "CRM System",
      icon: <FaAddressBook size={20} className="text-green-700" />,
      isMainFolder: true,
      children: [
        {
          id: "Customer List",
          icon: <Users size={18} className="text-green-700" />,
          label: "Customer List",
          path: "/crm/customers",
        },
        {
          id: "Lead upload",
          label: "Lead upload",
          icon: <FileText size={18} className="text-green-700" />,
          path: "/crm/upload-leads",
        },
        {
          id: "Lead List",
          icon: <Phone size={18} className="text-green-700" />,
          label: "Lead List",
          path: "/crm/lead-list",
        },

        {
          id: "crm-brokers",
          label: "Brokers",
          icon: <Users size={18} className="text-green-700" />,
          path: "/crm/brokers",
        },
        {
          id: "crm-quotation",
          label: "Create Quotation",
          icon: <FileText size={18} className="text-green-700" />,
          path: "/crm/quotation-form",
        },
        {
          id: "Support List",
          icon: <HeadphonesIcon size={18} className="text-green-700" />,
          label: "Support List",
          path: "",
        },
        {
          id: "Payment",
          icon: <CreditCard size={18} className="text-green-700" />,
          label: "Payment",
          path: "",
        },
      ],
    },

    // ... ACCOUNTING ...
    {
      id: "client-accounting",
      label: "Accounting",
      icon: <Building size={18} className="text-green-700" />,
      isMainFolder: true,
      children: [
        {
          id: "client-dashboard",
          label: "Dashboard",
          path: "/accounting/client/dashboard",
          icon: <LayoutDashboard size={16} className="text-green-700 " />,
        },
        {
          id: "customer-management-accounting",
          label: "Customer Payments",
          path: "/accounting/client/customer-management",
          icon: <Users size={16} className="text-green-700 " />,
        },
        {
          id: "gst details",
          label: "Company Details",
          path: "/superadmin/accounting/superadmin/gst-details",
          icon: <FileSearch size={16} className="text-green-700 " />,
        },
        {
          id: "superadmin-activity",
          label: "Employee Activity",
          path: "/superadmin/accounting/superadmin/activity",
          icon: <FileSearch size={16} className="text-green-700 " />,
        },
        {
          id: "client-group-creation",
          label: "Group Creation",
          path: "/accounting/client/groupCreation",
          icon: <Layers3 size={16} className="text-green-700 " />,
        },
        {
          id: "client-list-groups",
          label: "List Of Groups",
          path: "/accounting/client/listOfGroups",
          icon: <FolderKanban size={16} className="text-green-700 " />,
        },
        {
          id: "client-ledger",
          label: "Ledger",
          path: "/accounting/client/ledger",
          icon: <BookText size={16} className="text-green-700 " />,
        },
        {
          id: "client-list-ledgers",
          label: "List of Ledger",
          path: "/accounting/client/listOfLedgers",
          icon: <FileSpreadsheet size={16} className="text-green-700 " />,
        },
        {
          id: "client-statutory",
          label: "Statutory Reports",
          path: "/accounting/client/statutoryReports",
          icon: <FileText size={16} className="text-green-700 " />,
        },

        // Voucher submenu
        {
          id: "client-vouchers",
          label: "Vouchers",
          icon: <FileText size={16} className="text-green-700 " />,
          children: [
            {
              id: "client-contra",
              label: "Contra Voucher",
              path: "/accounting/client/contravoucher",
            },
            {
              id: "client-contra-list",
              label: "List Of Contra Voucher",
              path: "/accounting/client/listOfContraVoucher",
            },
            {
              id: "client-payment",
              label: "Payment Voucher",
              path: "/accounting/client/paymentVoucher",
            },
            {
              id: "client-payment-list",
              label: "List Of Payment Voucher",
              path: "/accounting/client/listOfPaymentVoucher",
            },
            {
              id: "client-receipt",
              label: "Receipt Voucher",
              path: "/accounting/client/receptVoucher",
            },
            {
              id: "client-receipt-list",
              label: "List Of Receipt Voucher",
              path: "/accounting/client/listOfReciptVoucher",
            },
            {
              id: "client-journal",
              label: "Journal Voucher",
              path: "/accounting/client/journalvoucher",
            },
            {
              id: "client-journal-list",
              label: "List Of Journal Voucher",
              path: "/accounting/client/listOfJournalVoucher",
            },
            {
              id: "client-manufacturing",
              label: "Manufacturing",
              path: "/accounting/client/manfacturing",
            },
            {
              id: "client-manufacturing-list",
              label: "Manufacturing List",
              path: "/accounting/client/manfacturinglist",
            },
            {
              id: "client-sale",
              label: "Sale Voucher",
              path: "/accounting/client/salevoucher",
            },
            {
              id: "client-sale-list",
              label: "List Of Sale Voucher",
              path: "/accounting/client/listOfSaleVoucher",
            },
            {
              id: "client-purchase",
              label: "Purchase Voucher",
              path: "/accounting/client/purchasevoucher",
            },
            {
              id: "client-purchase-list",
              label: "List Of Purchase Voucher",
              path: "/accounting/client/listOfPurchaseVoucher",
            },
            {
              id: "client-debit",
              label: "Debit Note",
              path: "/accounting/client/debitNote",
            },
            {
              id: "client-debit-list",
              label: "Debit Note List",
              path: "/accounting/client/debitNotesList",
            },
            {
              id: "client-credit",
              label: "Credit Note",
              path: "/accounting/client/creditNote",
            },
            {
              id: "client-credit-list",
              label: "Credit Note List",
              path: "/accounting/client/creditNotesList",
            },
          ],
        },

        // Banking submenu
        {
          id: "client-banking",
          label: "Banking",
          icon: <Wallet size={16} className="text-green-700" />,
          children: [
            {
              id: "client-bank-activities",
              label: "Bank Activities",
              path: "/accounting/client/bank-activities",
            },
            {
              id: "client-cash",
              label: "Cash",
              path: "/accounting/client/cash",
            },

          ],
        },

        {
          id: "client-trial-balance",
          label: "Trial Balance",
          path: "/accounting/client/trialBalance",
          icon: <FileBarChart size={16} className="text-green-700" />,
        },
        {
          id: "client-reports",
          label: "Reports",
          path: "/accounting/client/reports",
          icon: <BarChart2 size={16} className="text-green-700 " />,
        },
        {
          id: "client-daybook",
          label: "Day Book",
          path: "/accounting/client/dayBook",
          icon: <Wallet size={16} className="text-green-700 " />,
        },
        {
          id: "client-transaction-summary",
          label: "Transactions Summary",
          path: "/accounting/client/transactionSummary",
          icon: <BarChart4 size={16} className="text-green-700 " />,
        },

        // Inventory submenu
        {
          id: "client-inventory",
          label: "Inventory Book",
          icon: <Warehouse size={16} className="text-green-700" />,
          children: [
            {
              id: "client-stock-item",
              label: "Stock Item Creation",
              path: "/accounting/client/stockItemCreation",
            },
            {
              id: "client-stock-group",
              label: "Stock Group Summary",
              path: "/accounting/client/stockGroupSummery",
            },
            {
              id: "client-stock-list",
              label: "All Stocks",
              path: "/accounting/client/stocklist",
            },
            {
              id: "client-hsn-summery",
              label: "HSN Summery",
              path: "/accounting/client/hsnsummery",
            },
            {
              id: "client-gst-summary",
              label: "GST Summary",
              path: "/accounting/client/gst-summary",
            },
          ],
        },
      ],
    },
    {
      id: "contact-us",
      label: "Contact Us",
      icon: <Phone size={20} className="text-green-700" />,
      path: "/contact-us",
    },
  ];

  // --- RECURSIVE RENDERER ---
  const renderItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;

    // Skip rendering leaf nodes that don't have a path
    if (!hasChildren && (!item.path || item.path === "")) {
      return null;
    }

    const isExpanded = expandedMenus[item.id];

    // Dynamic styles based on depth
    const paddingLeft = level === 0 ? "px-3" : "px-2";
    const textSize = level === 0 ? "text-[13px]" : "text-[12.5px]";
    const iconSize = level === 0 ? 19 : 17;

    // 1. COLLAPSED VIEW
    if (isCollapsed) {
      const isInactiveFolder = hasChildren && !isExpanded;
      return (
        <div
          key={`${item.id}-col`}
          className={`flex flex-col items-center w-full ${isInactiveFolder ? "mb-2.5" : "mb-0.5"}`}
        >
          {/* Main Icon Button */}
          <NavLink
            to={item.path || "#"}
            end={item.exact}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleMenu(item.id);
              } else {
                if (!item.path || item.path === "#") e.preventDefault();
                handleItemClick();
              }
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem(item);
              setHoveredPos({
                top: rect.top + rect.height / 2 - 1,
                left: rect.right + 12,
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center justify-center ${level > 0 ? "p-2" : "p-2.5"} rounded-lg transition-all duration-200 group w-full relative`}
          >
            {({ isActive }) => {
              const isFolderExpanded = hasChildren && isExpanded;
              const isItemActive = isActive && item.path && item.path !== "#";
              // Stacked card shadow for inactive folders
              const stackShadow = isInactiveFolder
                ? {
                  boxShadow:
                    "0 3px 0 -1px #fff, 0 3px 0 0 #e2e8f0, 0 6px 0 -1px #f8fafc, 0 6px 0 0 #e2e8f080",
                }
                : {};
              return (
                <>
                  <div
                    className={`absolute inset-0 rounded-lg transition-all duration-200 ${isItemActive && !hasChildren
                      ? "bg-linear-to-r from-green-600 to-emerald-500 shadow-md shadow-green-100"
                      : isFolderExpanded
                        ? "bg-white shadow-sm ring-1 ring-slate-200"
                        : isInactiveFolder
                          ? "bg-white border border-slate-200"
                          : "bg-transparent group-hover:bg-slate-50"
                      }`}
                    style={stackShadow}
                  />
                  <span
                    className={`relative z-10 transition-colors duration-200 ${isItemActive && !hasChildren
                      ? "[&_svg]:text-white!"
                      : isFolderExpanded
                        ? "[&_svg]:text-green-600!"
                        : "text-slate-500 group-hover:text-green-600"
                      }`}
                  >
                    {item.icon ? (
                      React.cloneElement(item.icon, {
                        size: level > 0 ? 16 : 19,
                      })
                    ) : (
                      <div
                        className={`flex items-center justify-center font-bold uppercase ${level > 0 ? "w-4 h-4 text-[9px]" : "w-5 h-5 text-[10px]"}`}
                      >
                        {item.label.charAt(0)}
                      </div>
                    )}
                  </span>
                </>
              );
            }}
          </NavLink>

          {/* Expanded Children Group */}
          {hasChildren && isExpanded && (
            <div className="w-full flex flex-col items-center py-1.5 px-0.5 mb-1 mt-0.5 relative animate-sub-menu bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="w-full flex flex-col items-center space-y-0.5">
                {item.children.map((child) => renderItem(child, level + 1))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 2. EXPANDED VIEW
    return (
      <div key={`${item.id}-exp`} className="mb-1.5">
        {hasChildren ? (
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu(item.id)}
              className={`w-full flex items-center justify-between transition-all duration-200 py-2 outline-none rounded-lg border border-transparent ${paddingLeft} ${textSize} ${isExpanded
                ? "bg-slate-100 text-slate-900 font-semibold shadow-sm border-slate-100"
                : "text-slate-600 hover:bg-slate-50 hover:text-green-600 hover:border-slate-100"
                }`}
            >
              <div className="flex items-center min-w-0">
                {item.icon && (
                  <span
                    className={`mr-3 transition-colors duration-200 shrink-0 ${isExpanded ? "text-green-600" : "text-slate-400 group-hover:text-green-600"}`}
                  >
                    {React.cloneElement(item.icon, {
                      size: iconSize,
                      className: isExpanded ? "!text-green-600" : "",
                    })}
                  </span>
                )}
                <span
                  className={`truncate text-left ${item.isMainFolder ? "tracking-tight" : ""}`}
                >
                  {item.label}
                </span>
              </div>
              <ChevronRight
                size={14}
                className={`transition-transform duration-300 ${isExpanded ? "rotate-90 text-green-600" : "text-slate-300"}`}
              />
            </button>

            {/* Sub-items with a vertical connector line */}
            <div
              className={`transition-all duration-300 ease-out overflow-hidden ${isExpanded
                ? "max-h-500 opacity-100 mt-1 mb-2 bg-slate-50/50 rounded-lg p-0.5"
                : "max-h-0 opacity-0"
                }`}
            >
              <div className="ml-3.5 border-l border-slate-100 pl-1 py-1 space-y-1">
                {item.children.map((child) => renderItem(child, level + 1))}
              </div>
            </div>
          </div>
        ) : (
          <NavLink
            to={item.path || "#"}
            end={item.exact}
            onClick={(e) => {
              if (!item.path || item.path === "#") e.preventDefault();
              handleItemClick();
            }}
            className={({ isActive }) => {
              const isItemActive = isActive && item.path && item.path !== "#";
              return `flex items-center rounded-lg transition-all duration-200 py-2 group border border-transparent ${paddingLeft} ${textSize} ${isItemActive
                ? "bg-linear-to-r from-green-600 to-emerald-500 text-white font-medium shadow-md shadow-green-100 border-green-500/50"
                : "text-slate-600 hover:bg-slate-50 hover:text-green-600 hover:translate-x-1 hover:border-slate-100"
                }`;
            }}
          >
            {({ isActive }) => {
              const isItemActive = isActive && item.path && item.path !== "#";
              return (
                <>
                  {item.icon && (
                    <span
                      className={`mr-3 transition-colors duration-200 shrink-0 ${isItemActive ? "text-white" : "text-slate-400 group-hover:text-green-600"}`}
                    >
                      {React.cloneElement(item.icon, {
                        size: iconSize,
                        className: isItemActive ? "!text-white" : "",
                      })}
                    </span>
                  )}
                  <span className="truncate text-left">{item.label}</span>
                </>
              )
            }}
          </NavLink>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"} bg-white text-slate-900 flex flex-col h-screen sticky top-0 transition-all duration-300 z-50 border-r border-slate-100`}
    >
      <style>{`

        
        @keyframes tooltipAppear {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-55%);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(-50%);
          }
        }
        .animate-sidebar-tooltip-in {
          animation: tooltipAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes subMenuAppear {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-sub-menu {
          animation: subMenuAppear 0.3s ease-out forwards;
        }
      `}</style>

      {/* Header */}
      {isCollapsed ? (
        <div className="h-16 flex flex-col items-center justify-center border-b border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-500 hover:text-green-600 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
            title="Expand Sidebar"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className="h-16 flex items-center border-b border-slate-100 px-4 shrink-0 bg-white gap-3">
          <NavLink
            to="/dashboard"
            onClick={handleItemClick}
            className="flex-1 flex items-center min-w-0 gap-3"
          >
            {/* Logo Image */}
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt={companyName}
                crossOrigin="anonymous"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                onError={() => {
                  console.error('Logo failed to load in expanded mode');
                  setLogoError(true);
                }}
                onLoad={() => console.log('Logo loaded successfully in expanded mode')}
              />
            ) : (
              /* Fallback text logo */
              <div
                className="w-10 h-10 rounded-lg bg-linear-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-sm shrink-0"
              >
                {companyLogoText}
              </div>
            )}

            <span
              className="text-[19px] font-extrabold text-slate-800 truncate block tracking-[-0.03em] select-none leading-tight"
              style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
              title={companyName}
            >
              {companyName}
            </span>
          </NavLink>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        <nav className="space-y-1">
          {/* Start the Recursive Render Loop */}
          {sidebarItems.map((item) => renderItem(item))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="border-t border-slate-100 p-3 shrink-0">
        {isCollapsed ? (
          <button
            onClick={handleLogout}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({ label: "Logout" });
              setHoveredPos({
                top: rect.top + rect.height / 2 - 1,
                left: rect.right + 12,
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 group relative bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50"
          >
            <LogOut
              size={19}
              className="text-slate-500 group-hover:text-red-600 transition-colors"
            />
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-red-50 hover:border-red-200 border border-transparent"
          >
            <LogOut
              size={18}
              className="text-slate-500 group-hover:text-red-600 transition-colors"
            />
            <span className="text-[13px] font-medium text-slate-700 group-hover:text-red-700 transition-colors">
              Logout
            </span>
          </button>
        )}
      </div>

      {/* Premium White Popover Tooltip for Collapsed Mode */}
      {isCollapsed && hoveredItem && (
        <div
          className="fixed bg-white text-slate-800 text-[12px] font-semibold px-4 py-2.5 rounded-xl z-9999 pointer-events-none shadow-2xl border border-slate-200 animate-sidebar-tooltip-in whitespace-nowrap"
          style={{
            top: hoveredPos.top,
            left: hoveredPos.left,
            transformOrigin: "left center",
          }}
        >
          {hoveredItem.label}
          {/* Precise Tooltip Arrow */}
          <div className="absolute -left-1.75 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-l border-b border-slate-200 rotate-45 rounded-sm" />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
