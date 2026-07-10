import {
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardClock,
  Clock,
  FileCheck,
  Folder,
  Gift,
  IndianRupee,
  LayoutDashboard,
  ListChecks,
  LucideLogOut,
  MessageSquare,
  MessageSquareWarning,
  PieChart,
  Settings,
  FileText,
  UserCheck,
  UserPlus,
  Users,
  User,
  CalendarDays,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { resetPersistedAuthState } from "../../../store/authSession";

const SideBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openEmployeeDropdown, setOpenEmployeeDropdown] = useState(false);
  const [openTaskDropdown, setOpenTaskDropdown] = useState(false);
  const [openMessageDropdown, setOpenMessageDropdown] = useState(false);
  const [openTimesheetDropdown, setOpenTimesheetDropdown] = useState(false);
  const [openLeaveDropdown, setOpenLeaveDropdown] = useState(false);
  const [openComplainDropdown, setOpenComplainDropdown] = useState(false);
  const [openTourExpensesDropdown, setOpenTourExpensesDropdown] =
    useState(false);
  const [openServiceRequestDropdown, setOpenServiceRequestDropdown] =
    useState(false);
  const [openReportsDropdown, setOpenReportsDropdown] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes Logout",
    });

    if (confirm.isConfirmed) {
      await resetPersistedAuthState();
      if (import.meta.env.VITE_LOCAL_AUTH === "true") {
        localStorage.setItem("explicit_logout", "true");
      }
      navigate("/");
    }
  };
  const { user } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/hrms/dashboard",
      icon: <LayoutDashboard size={20} />,
    },

    {
      name: "Employee",
      path: "/hrms/joined-employee",
      icon: <Users size={20} />,
    },

    {
      name: "Employee Hub",
      icon: <UserPlus size={20} />,
      hasSubMenu: true,
      subMenuItems: [
        {
          name: "Employee Attendance",
          path: "/hrms/attendance",
          icon: <FileText size={18} />,
        },
        {
          name: "Task",
          path: "/hrms/tasks",
          icon: <ListChecks size={18} />,
        },
      ],
    },

    {
      name: "Job",
      path: "/hrms/job",
      icon: <Folder size={20} />,
    },

    {
      name: "Payroll",
      path: "/hrms/payroll",
      icon: <IndianRupee size={20} />,
    },

    {
      name: "All Report",
      path: "/hrms/all-report",
      icon: <PieChart size={20} />,
    },

    {
      name: "Attendance",
      path: "/hrms/attendance-cloudsat",
      icon: <CalendarCheck size={20} />,
    },

    {
      name: "Calendar",
      icon: <Calendar size={20} />,
      hasSubMenu: true,
      subMenuItems: [
        {
          name: "Calendar",
          path: "/hrms/calendar",
          icon: <CalendarDays size={18} />,
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`bg-[#032c50] text-white ${
          isSidebarOpen ? "w-70" : "w-20"
        } shrink-0 duration-300 relative flex flex-col h-full`}
      >
        <div
          className={`shrink-0 flex items-center p-5 border-b border-gray-700 ${
            isSidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          <h1
            className={`text-xl font-bold duration-300 ${
              !isSidebarOpen && "hidden"
            }`}
          >
            HRMS
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-300 cursor-pointer"
          >
            {isSidebarOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto p-4 space-y-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.hasSubMenu ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === index ? null : index)
                      }
                      className={`w-full flex items-center gap-x-4 rounded-md p-2 text-sm cursor-pointer transition-all
                      ${
                        openDropdown === index
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }
                      ${!isSidebarOpen ? "justify-center" : ""}`}
                      title={!isSidebarOpen ? item.name : undefined}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {isSidebarOpen && (
                        <>
                          <span className="flex-1 text-left whitespace-nowrap">
                            {item.name}
                          </span>
                          <span className="shrink-0">
                            {openDropdown === index ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </span>
                        </>
                      )}
                    </button>

                    {openDropdown === index && isSidebarOpen && (
                      <ul className="ml-8 mt-1 space-y-1 border-l border-gray-700 pl-2">
                        {item.subMenuItems.map((sub, subIndex) => (
                          <li key={subIndex}>
                            <NavLink
                              to={sub.path}
                              className={({ isActive }) =>
                                `flex items-center gap-x-3 p-2 rounded-md text-sm transition-all ${
                                  isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                }`
                              }
                            >
                              <span className="shrink-0">{sub.icon}</span>
                              <span className="whitespace-nowrap">
                                {sub.name}
                              </span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    title={!isSidebarOpen ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex rounded-md p-2 cursor-pointer text-sm items-center gap-x-4 ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      } ${!isSidebarOpen ? "justify-center" : ""}`
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {isSidebarOpen && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-gray-700 p-5">
          <div
            className={`mb-4 flex items-center ${
              !isSidebarOpen ? "justify-center" : ""
            }`}
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            {isSidebarOpen && (
              <div className="pl-3 overflow-hidden">
                <p className="font-semibold truncate">Cloudsat</p>
                <p className="text-xs text-gray-400 truncate">Admin</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={!isSidebarOpen ? "Logout" : undefined}
            className={`flex w-full rounded-md p-2 cursor-pointer text-sm items-center gap-x-4 text-gray-300 hover:bg-gray-700 hover:text-white ${
              !isSidebarOpen ? "justify-center" : ""
            }`}
          >
            <LucideLogOut size={20} />
            {isSidebarOpen && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
