import React from "react";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Folder,
  FolderOpen,
  IndianRupee,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquare,
  MessageCircle,
  PieChart,
  ReceiptIndianRupee,
  Upload,
  UserPlus,
  HeadphonesIcon,
  Users,
  Wallet,
  Warehouse,
  Wrench,
  HardHat,
  DollarSign,
  FileCheck,
  BarChart,
  Layers,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { usePermission } from "../hooks/usePermission";
import { resetPersistedAuthState } from "../store/authSession";
import { clearUser, updatePermissions } from "../store/slices/userSlice";
import useAuth from "../hooks/useAuth";

const EmployeeSidebar = ({ isCollapsed, toggleSidebar, onItemClick }) => {
  const { user, token, permissions } = useAuth();
  const { hasAccess } = usePermission();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [expandedMenus, setExpandedMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredPos, setHoveredPos] = useState({ top: 0, left: 0 });

  const [companyData, setCompanyData] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const companyId =
    user?.company_id ||
    user?.companyId ||
    user?.master_company_id ||
    user?.masterCompanyId;

  const employeeProfileId = user?.employee_id || user?.employeeId || user?.id;

  const [activePermissions, setActivePermissions] = useState(
    () => permissions || [],
  );

  useEffect(() => {
    if (permissions) {
      setActivePermissions(permissions);
    }
  }, [permissions]);

  const hasPermission = (permissionCode) => {
    if (Array.isArray(permissionCode)) {
      return permissionCode.some((p) => hasAccess(p));
    }
    return hasAccess(permissionCode);
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const tokenVal = token;

        if (!tokenVal || !companyId) {
          setCompanyLoading(false);
          return;
        }

        const response = await axios.get(
          `https://csaapnodeapi.csaap.com/api/builder-companies/${companyId}`,
          {
            headers: { Authorization: `Bearer ${tokenVal}` },
          },
        );

        if (response.data && response.data.success) {
          setCompanyData(response.data.data || response.data.company);
          setLogoError(false);
        } else if (response.data) {
          setCompanyData(response.data);
          setLogoError(false);
        }
      } catch (err) {
        console.warn("Failed to fetch company data:", err.message);
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompanyData();
  }, [token, companyId]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const tokenVal = token;

        if (!tokenVal || !employeeProfileId) return;

        const permResponse = await axios.get(
          `https://csaapnodeapi.csaap.com/api/tenant/permissions/employee-access/${employeeProfileId}`,
          {
            headers: { Authorization: `Bearer ${tokenVal}` },
          },
        );

        let freshPermissions = [];
        if (permResponse.data && permResponse.data.success) {
          freshPermissions = permResponse.data.permissions || [];
        } else if (permResponse.data) {
          freshPermissions = permResponse.data.permissions || [];
        }

        dispatch(updatePermissions(freshPermissions));

        setActivePermissions(freshPermissions);
        window.dispatchEvent(
          new CustomEvent("permissionsUpdated", { detail: freshPermissions }),
        );
      } catch (err) {
        console.warn(
          "Failed to dynamically fetch permissions in sidebar:",
          err.message,
        );
      }
    };

    fetchPermissions();
  }, [token, employeeProfileId, dispatch]);

  const companyName =
    companyData?.master_company_name ||
    companyData?.company_name ||
    companyData?.name ||
    "BuilderERP PRO";

  const companyLogo = companyData?.logo_path
    ? `https://csaapnodeapi.csaap.com/${companyData.logo_path}`
    : companyData?.logo || companyData?.company_logo || companyData?.image_url;

  const companyLogoText = companyName.charAt(0).toUpperCase();

  // console.log("Company Data:", companyData);
  // console.log("Company Logo URL:", companyLogo);

  const toggleMenu = (id) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleItemClick = () => {
    if (onItemClick) onItemClick();
  };

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes Logout",
      confirmButtonColor: "#10b981",
    });

    if (confirm.isConfirmed) {
      dispatch(clearUser());
      await resetPersistedAuthState();

      queryClient.setQueryData(["authUser"], null);
      queryClient.clear();

      if (import.meta.env.VITE_LOCAL_AUTH === "true") {
        localStorage.setItem("explicit_logout", "true");
      }

      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      navigate("/employee/login");
    }
  };

  const sidebarItems = useMemo(() => {
    const rawItems = [
      {
        id: "dashboard",
        permission: "hrms.self_service.dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={20} className="text-green-700" />,
        path: "/employee/dashboard",
        exact: true,
      },
      {
        id: "projects",
        permission: "project",
        label: "Projects",
        icon: <FolderOpen size={20} className="text-green-700" />,
        path: "/employee/projects",
      },
      {
        id: "contractors",
        permission: "contractors",
        label: "Contractors",
        icon: <Users size={20} className="text-green-700" />,
        path: "/employee/contractors",
      },
      {
        id: "brokers",
        permission: "brokers",
        label: "Brokers",
        icon: <Users size={20} className="text-green-700" />,
        path: "/employee/brokers",
      },
      {
        id: "suppliers",
        permission: "suppliers",
        label: "Suppliers",
        icon: <Users size={20} className="text-green-700" />,
        path: "/employee/suppliers",
      },
    ];

    const items = rawItems.filter((item) => hasPermission(item.permission));

    const rawOperationCategories = [
      {
        id: "general",
        label: "Engineering",
        icon: <HardHat size={18} className="text-green-700" />,
        children: [
          {
            id: "projectbudget",
            permission: "operation.engineering.projectbudget",
            label: "Project Budget",
            path: "/employee/project-budget",
            icon: <DollarSign size={16} className="text-green-700" />,
          },
          {
            id: "bill",
            permission: "operation.engineering.billofquantity",
            label: "Bill Of Quantity",
            path: "/employee/bill",
            icon: <FileText size={16} className="text-green-700" />,
          },
          {
            id: "work",
            permission: "operation.engineering.workorder",
            label: "Work Order",
            path: "/employee/work-order",
            icon: <ClipboardList size={16} className="text-green-700" />,
          },
          {
            id: "bill_inward",
            permission: "operation.engineering.billinward",
            label: "Bill Inward",
            path: "/employee/bill-inward",
            icon: <FileCheck size={16} className="text-green-700" />,
          },
          {
            id: "contract",
            permission: "operation.engineering.contract",
            label: "Contractor Management",
            path: "/employee/contractor",
            icon: <FileText size={16} className="text-green-700" />,
          },
          {
            id: "labour",
            permission: "operation.engineering.labourrates",
            label: "Labour Rates & Analysis",
            path: "/employee/labour-rates",
            icon: <Users size={16} className="text-green-700" />,
          },
        ],
      },
      {
        id: "tendering",
        label: "Tendering",
        icon: <FileText size={18} className="text-green-700 " />,
        children: [
          {
            id: "vendor",
            permission: "operation.tendering.vendoronboarding",
            label: "Vendor Onboarding",
            path: "/employee/vendor",
            icon: <Users size={16} className="text-green-700 " />,
          },
          {
            id: "Tendor",
            permission: "operation.tendering.tendor",
            label: "Tendor",
            path: "/employee/tendering",
            icon: <FileText size={16} className="text-green-700" />,
          },
        ],
      },
      {
        id: "Equipment",
        label: "Equipment Management",
        icon: <Truck size={18} className="text-green-700" />,
        children: [
          {
            id: "standard",
            permission: "operation.equipmentmanagement.standardefficiencies",
            label: "Standard Efficiency",
            path: "/employee/equipment-standard",
            icon: <BarChart size={16} className="text-green-700 " />,
          },
        ],
      },
      {
        id: "material",
        label: "Material Management",
        icon: <Layers size={18} className="text-green-700" />,
        children: [
          {
            id: "indent",
            permission: "operation.materialmanagement.indententry",
            label: "Indent Entry",
            path: "/employee/indent-main",
            icon: <ClipboardList size={16} className="text-green-700 " />,
          },
        ],
      },
      {
        id: "work-diary",
        permission: "operation.workdiary",
        label: "Work Diary",
        path: "/employee/work-diary",
        icon: <BookOpen size={18} className="text-green-700" />,
      },
      {
        id: "hindering",
        permission: "operation.hinderingrecord",
        label: "Hindering Record",
        path: "/employee/hindering-report",
        icon: <AlertTriangle size={18} className="text-green-700" />,
      },
    ];

    const filteredOperationChildren = rawOperationCategories
      .map((cat) => {
        if (cat.children) {
          const allowedSubChildren = cat.children.filter((child) =>
            hasPermission(child.permission),
          );
          if (allowedSubChildren.length > 0) {
            return { ...cat, children: allowedSubChildren };
          }
          return null;
        }
        return hasPermission(cat.permission) ? cat : null;
      })
      .filter(Boolean);

    if (filteredOperationChildren.length > 0) {
      items.push({
        id: "operation",
        label: "Operation",
        icon: <Wrench size={20} className="text-green-700" />,
        isMainFolder: true,
        children: filteredOperationChildren,
      });
    }

    const stockChildren = [
      {
        id: "purchase",
        permission: "stockandinventory.purchase",
        label: "Purchase",
        icon: <ShoppingCart size={18} className="text-green-700" />,
        path: "/employee/builder-erp/admin/purchase-main",
      },
      {
        id: "stock-management",
        permission: "stockandinventory.stockmanagement",
        label: "Stock Management",
        icon: <Warehouse size={18} className="text-green-700" />,
        path: "/employee/builder-erp/admin/stock-entry",
      },
      {
        id: "sale",
        permission: "stockandinventory.sale",
        label: "Sale",
        icon: <TrendingUp size={18} className="text-green-700" />,
        path: "/employee/builder-erp/admin/sale-main",
      },
      {
        id: "inv_indent",
        permission: "stockandinventory.indent",
        label: "Indent",
        icon: <FileText size={18} className="text-green-700" />,
        path: "/employee/builder-erp/admin/indent-main",
      },
      {
        id: "supplier-list",
        permission: "stockandinventory.supplierlist",
        label: "Supplier List",
        icon: <Users size={18} className="text-green-700" />,
        path: "/employee/builder-erp/admin/supplier-list",
      },
    ].filter((child) => hasPermission(child.permission));

    if (stockChildren.length > 0) {
      items.push({
        id: "stock-inventory",
        label: "Stock & Inventory",
        icon: <Warehouse size={20} className="text-green-700" />,
        isMainFolder: true,
        children: stockChildren,
      });
    }

    const remainingSelfServiceItems = [
      {
        id: "tasks",
        permission: "hrms.self_service.tasks",
        label: "Task",
        icon: <ListChecks size={20} className="text-green-700" />,
        path: "/employee/tasks",
      },
      {
        id: "attendance",
        permission: [
          "hrms.self_service.attendance",
          "hrms.self_service.timesheet",
          "hrms.self_service.leave",
        ],
        label: "Attendance",
        icon: <Calendar size={20} className="text-green-700" />,
        path: "/employee/attendance",
      },
      {
        id: "work-report",
        permission: "hrms.self_service.work_report",
        label: "Work Report",
        icon: <FileText size={20} className="text-green-700" />,
        path: "/employee/work-report",
      },
      {
        id: "complain",
        permission: "hrms.self_service.complain",
        label: "Complain",
        icon: <MessageSquare size={20} className="text-green-700" />,
        path: "/employee/complain",
      },
      {
        id: "message",
        permission: "hrms.self_service.message",
        label: "Message",
        icon: <MessageSquare size={20} className="text-green-700" />,
        path: "/employee/message",
      },
      {
        id: "documents",
        permission: "hrms.self_service.documents",
        label: "Payslip & HR documents",
        icon: <Folder size={20} className="text-green-700" />,
        path: "/employee/documents",
      },
      {
        id: "calendar_events",
        permission: "hrms.self_service.calendar",
        label: "Calendar & Events",
        icon: <Calendar size={20} className="text-green-700" />,
        path: "/employee/calendar",
      },
    ].filter((item) => hasPermission(item.permission));

    items.push(...remainingSelfServiceItems);

    items.push({
      id: "support",
      label: "Support",
      icon: <HeadphonesIcon size={20} className="text-green-700" />,
      path: "/employee/support",
    });
    items.push({
      id: "meetings",
      label: "Task & Meetings",
      icon: <Calendar size={20} className="text-green-700" />,
      path: "/employee/meetings",
    });
    items.push({
      id: "feedback",
      label: "Feedback",
      icon: <MessageCircle size={20} className="text-green-700" />,
      path: "/employee/feedback",
    });

    const hrmsChildren = [
      {
        id: "hr_dashboard",
        permission: "hrms.dashboard",
        label: "HRMS Dashboard",
        icon: <LayoutDashboard size={18} className="text-green-700" />,
        path: "/employee/hr/dashboard",
      },
      {
        id: "hr_joined_employee",
        permission: "hrms.employee",
        label: "Employee",
        icon: <Users size={18} className="text-green-700" />,
        path: "/employee/hr/joined-employee",
      },
      {
        id: "hr_attendance",
        permission: "hrms.attendance",
        label: "Attendance",
        icon: <FileText size={18} className="text-green-700" />,
        path: "/employee/hr/attendanceuser",
      },
      {
        id: "hr_task",
        permission: "hrms.tasks",
        label: "Task",
        icon: <FileText size={18} className="text-green-700" />,
        path: "/employee/hr/task",
      },
      {
        id: "hr_all_report",
        permission: "hrms.report",
        label: "Report",
        icon: <PieChart size={18} className="text-green-700" />,
        path: "/employee/hr/all-report",
      },
      {
        id: "hr_message",
        permission: "hrms.message",
        label: "Message",
        icon: <MessageSquare size={18} className="text-green-700" />,
        path: "/employee/hr/message-to-employee",
      },
      {
        id: "hr_job",
        permission: "hrms.job",
        label: "Job",
        icon: <Folder size={18} className="text-green-700" />,
        path: "/employee/hr/job-posting",
      },
      {
        id: "hr_payroll",
        permission: "hrms.payroll",
        label: "Payroll",
        icon: <IndianRupee size={18} className="text-green-700" />,
        path: "/employee/hr/payroll",
      },
      {
        id: "hr_calendar",
        permission: "hrms.calendar",
        label: "Calendar",
        icon: <Calendar size={18} className="text-green-700" />,
        path: "/employee/hr/calendar",
      },
    ];

    const filteredHrmsChildren = hrmsChildren.filter((child) =>
      hasPermission(child.permission),
    );

    if (filteredHrmsChildren.length > 0) {
      items.push({
        id: "hrms",
        label: "HRMS",
        icon: <Users size={20} className="text-green-700" />,
        isMainFolder: true,
        children: filteredHrmsChildren,
      });
    }

    const accountingChildren = [
      {
        id: "client-dashboard",
        permission: "accounting.dashboard",
        label: "Dashboard",
        path: "/employee/hr/accounting/client/dashboard",
        icon: <LayoutDashboard size={16} className="text-green-700 " />,
      },

      {
        id: "client-gst",
        permission: "accounting.dashboard",
        label: "Company Details",
        path: "/employee/hr/accounting/client/gst-details",
        icon: <LayoutDashboard size={16} className="text-green-700 " />,
      },

      {
        id: "client-list-groups",
        permission: "accounting.company",
        label: "Groups",
        path: "/employee/hr/accounting/client/listOfGroups",
        icon: <Folder size={16} className="text-green-700 " />,
      },
      {
        id: "client-list-ledgers",
        permission: "accounting.masters",
        label: "Ledger",
        path: "/employee/hr/accounting/client/listOfLedgers",
        icon: <BookOpen size={16} className="text-green-700 " />,
      },
      {
        id: "client-statutory",
        permission: "accounting.reports",
        label: "Statutory Reports",
        path: "/employee/hr/accounting/client/statutoryReports",
        icon: <FileText size={16} className="text-green-700 " />,
      },

      {
        id: "client-vouchers",
        permission: "accounting.vouchers",
        label: "Vouchers",
        icon: <FileText size={16} className="text-green-700 " />,
        children: [
          {
            id: "client-contra",
            label: "Contra Voucher",
            path: "/employee/hr/accounting/client/listOfContraVoucher",
          },
          {
            id: "client-payment",
            label: "Payment Voucher",
            path: "/employee/hr/accounting/client/listOfPaymentVoucher",
          },
          {
            id: "client-receipt",
            label: "Receipt Voucher",
            path: "/employee/hr/accounting/client/listOfReciptVoucher",
          },
          {
            id: "client-journal",
            label: "Journal Voucher",
            path: "/employee/hr/accounting/client/listOfJournalVoucher",
          },
          {
            id: "client-manufacturing",
            label: "Manufacturing",
            path: "/employee/hr/accounting/client/manfacturinglist",
          },
          {
            id: "client-sale",
            label: "Sales Voucher",
            path: "/employee/hr/accounting/client/listOfSaleVoucher",
          },
          {
            id: "client-purchase",
            label: "Purchase Voucher",
            path: "/employee/hr/accounting/client/listOfPurchaseVoucher",
          },
          {
            id: "client-debit",
            label: "Debit Note",
            path: "/employee/hr/accounting/client/debitNotesList",
          },
          {
            id: "client-credit",
            label: "Credit Note",
            path: "/employee/hr/accounting/client/creditNotesList",
          },
        ],
      },

      {
        id: "client-banking",
        permission: "accounting.banking",
        label: "Banking",
        icon: <Wallet size={16} className="text-green-700" />,
        children: [
          {
            id: "client-bank-activities",
            label: "Bank Activities",
            path: "/employee/hr/accounting/client/bank-activities",
          },
          {
            id: "client-cheque",
            label: "Cheque",
            path: "/employee/hr/accounting/client/cheque",
          },
          {
            id: "client-cheque-register",
            label: "Cheque Register",
            path: "/employee/hr/accounting/client/cheque-register",
          },
        ],
      },

      {
        id: "client-trial-balance",
        permission: "accounting.reports",
        label: "Trial Balance",
        path: "/employee/hr/accounting/client/trialBalance",
        icon: <FileText size={16} className="text-green-700" />,
      },
      {
        id: "client-reports",
        permission: "accounting.reports",
        label: "Reports",
        path: "/employee/hr/accounting/client/reports",
        icon: <PieChart size={16} className="text-green-700 " />,
      },
      {
        id: "client-daybook",
        permission: "accounting.books",
        label: "Day Book",
        path: "/employee/hr/accounting/client/dayBook",
        icon: <Wallet size={16} className="text-green-700 " />,
      },
      {
        id: "client-transaction-summary",
        permission: "accounting.reports",
        label: "Transactions Summary",
        path: "/employee/hr/accounting/client/transactionSummary",
        icon: <FileText size={16} className="text-green-700 " />,
      },

      {
        id: "client-inventory",
        permission: "accounting.inventory",
        label: "Inventory Book",
        icon: <Warehouse size={16} className="text-green-700" />,
        children: [
          {
            id: "client-stock-group",
            label: "Stock Summary",
            path: "/employee/hr/accounting/client/stockGroupSummery",
          },
          {
            id: "client-gst-summary",
            label: "GST Summary",
            path: "/employee/hr/accounting/client/gst-summary",
          },
        ],
      },
    ].filter((child) => hasPermission(child.permission));

    if (accountingChildren.length > 0) {
      items.push({
        id: "accounting",
        label: "Accounting",
        icon: <ReceiptIndianRupee size={20} className="text-green-700" />,
        isMainFolder: true,
        children: accountingChildren,
      });
    }

    const crmChildren = [
      {
        id: "crm_upload",
        permission: "crm.upload",
        label: "Lead Upload",
        icon: <Upload size={18} className="text-green-700" />,
        path: "/employee/crm/csv-upload-tab",
      },
      {
        id: "crm_management",
        permission: "crm.leads",
        label: "Lead Management",
        icon: <UserPlus size={18} className="text-green-700" />,
        path: "/employee/crm/lead-management",
      },
      {
        id: "crm_quotation",
        permission: "crm.quotation",
        label: "Create Quotation",
        icon: <FileText size={18} className="text-green-700" />,
        path: "/employee/crm/quotation-form",
      },
      {
        id: "crm_customers",
        permission: "crm.customers",
        label: "Customer List",
        icon: <Users size={18} className="text-green-700" />,
        path: "/employee/crm/customerlist",
      },
      {
        id: "crm_escalation",
        permission: "crm.escalation",
        label: "Escalation Path",
        icon: <TrendingUp size={18} className="text-green-700" />,
        path: "/employee/crm/escalation-path",
      },
      {
        id: "crm_payment",
        permission: "crm.payment",
        label: "Payment",
        icon: <CreditCard size={18} className="text-green-700" />,
        path: "/employee/crm/payment",
      },
    ].filter((child) => hasPermission(child.permission));

    if (crmChildren.length > 0) {
      items.push({
        id: "crm",
        label: "CRM",
        icon: <BookOpen size={20} className="text-green-700" />,
        isMainFolder: true,
        children: crmChildren,
      });
    }

    return items;
  }, [activePermissions]);

  const renderItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.id];

    const paddingLeft = level === 0 ? "px-3" : "px-2";
    const textSize = level === 0 ? "text-[13px]" : "text-[12.5px]";
    const iconSize = level === 0 ? 19 : 17;

    if (isCollapsed) {
      const isInactiveFolder = hasChildren && !isExpanded;
      return (
        <div
          key={`${item.id}-col`}
          className={`flex flex-col items-center w-full ${isInactiveFolder ? "mb-2.5" : "mb-0.5"
            }`}
        >
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
            className={`flex items-center justify-center ${level > 0 ? "p-2" : "p-2.5"
              } rounded-lg transition-all duration-200 group w-full relative`}
          >
            {({ isActive }) => {
              const isFolderExpanded = hasChildren && isExpanded;
              const isItemActive = isActive && item.path && item.path !== "#";
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
                      ? "text-white [&_svg]:text-white!"
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
                        className={`flex items-center justify-center font-bold uppercase ${level > 0
                          ? "w-5 h-5 text-[11px]"
                          : "size-6  text-[13px]"
                          }`}
                      >
                        {item.label.charAt(0)}
                      </div>
                    )}
                  </span>
                </>
              );
            }}
          </NavLink>

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
                    className={`mr-3 transition-colors duration-200 shrink-0 ${isExpanded
                      ? "text-green-600"
                      : "text-slate-400 group-hover:text-green-600"
                      }`}
                  >
                    {React.cloneElement(item.icon, {
                      size: iconSize,
                      className: isExpanded ? "!text-green-600" : "",
                    })}
                  </span>
                )}
                <span
                  className={`truncate text-left ${item.isMainFolder ? "tracking-tight" : ""
                    }`}
                >
                  {item.label}
                </span>
              </div>
              <ChevronRight
                size={14}
                className={`transition-transform duration-300 ${isExpanded ? "rotate-90 text-green-600" : "text-slate-300"
                  }`}
              />
            </button>

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
                      className={`mr-3 transition-colors duration-200 shrink-0 ${isItemActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-green-600"
                        }`}
                    >
                      {React.cloneElement(item.icon, {
                        size: iconSize,
                        className: isItemActive ? "!text-white" : "",
                      })}
                    </span>
                  )}
                  <span className="truncate text-left">{item.label}</span>
                </>
              );
            }}
          </NavLink>
        )}
      </div>
    );
  };

  if (companyLoading) {
    return (
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} bg-white text-slate-900 flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 border-r border-slate-100`}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-8 h-8 bg-slate-200 rounded-full mb-2"></div>
            <div className="w-16 h-4 bg-slate-200 rounded"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"} bg-white text-slate-900 flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 border-r border-slate-100`}
    >
      <style>
        {`
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
      `}
      </style>

      {isCollapsed ? (
        <div className="h-16 flex flex-col items-center justify-center border-b border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-500 hover:text-green-600 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
            title="Expand Sidebar"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className="h-16 flex items-center border-b border-slate-100 px-4 shrink-0 bg-white gap-3">
          <NavLink
            to="/employee/dashboard"
            onClick={handleItemClick}
            className="flex-1 flex items-center min-w-0 gap-3"
          >
            {companyLogo && !logoError ? (
              <img
                src={companyLogo}
                alt={companyName}
                crossOrigin="anonymous"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                onError={() => {
                  console.error("Logo failed to load in expanded mode");
                  setLogoError(true);
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-sm shrink-0">
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

      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        <nav className="space-y-1">
          {sidebarItems.map((item) => renderItem(item))}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-3 shrink-0">
        {isCollapsed ? (
          <button
            type="button"
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
          <div className="absolute -left-1.75 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-l border-b border-slate-200 rotate-45 rounded-sm" />
        </div>
      )}
    </aside>
  );
};

export default EmployeeSidebar;
