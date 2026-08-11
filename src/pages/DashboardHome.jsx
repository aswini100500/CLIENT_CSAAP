import React, { useState, useEffect } from "react";
import { Building2, Users, DollarSign, AlertCircle } from "lucide-react";
import ProjectsTable from "./ProjectsTable";
import useAuth from "../hooks/useAuth";

const StatCard = ({ title, value, icon: Icon, tone, loading }) => {
  const toneClasses = {
    blue: {
      bg: "bg-blue-50/60 border border-blue-100",
      icon: "text-blue-600",
    },
    green: {
      bg: "bg-emerald-50/60 border border-emerald-100",
      icon: "text-emerald-600",
    },
    purple: {
      bg: "bg-purple-50/60 border border-purple-100",
      icon: "text-purple-600",
    },
  };

  const selectedTone = toneClasses[tone] || toneClasses.blue;

  return (
    <div className="app-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-(--text-soft) truncate">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-100 rounded-xl animate-pulse mt-2"></div>
          ) : (
            <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
              {value}
            </div>
          )}
        </div>
        <div
          className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${selectedTone.bg}`}
        >
          <Icon className={`size-5 ${selectedTone.icon}`} />
        </div>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const { user, token, companyId } = useAuth();
  const API_BASE_URL =
    import.meta.env.VITE_CSAAP_URL || "https://csaapnodeapi.csaap.com";
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalEmployees: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!companyId) {
        setError("Company ID not found. Please check your user settings.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const subdomain = user?.slug || user?.company_slug || "";

        const projectsResponse = await fetch(
          `${API_BASE_URL}/api/tenant/clprojects?company_id=${companyId}`,
          { method: "GET", headers },
        );

        const employeesResponse = await fetch(
          `${API_BASE_URL}/api/tenant/hrms/all-employees`,
          { method: "GET", headers },
        );

        let projects = [];
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          projects = projectsData.data || projectsData.projects || [];
        } else if (projectsResponse.status === 401) {
          console.warn("Authentication required for projects API");
        } else {
          console.warn(`Projects API error: ${projectsResponse.status}`);
        }

        let employees = [];
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          employees = Array.isArray(employeesData)
            ? employeesData
            : employeesData.data || employeesData.employees || [];
        } else if (employeesResponse.status === 401) {
          console.warn("Authentication required for employees API");
        } else {
          console.warn(`Employees API error: ${employeesResponse.status}`);
        }

        const activeProjects = projects.filter(
          (p) =>
            p.status?.toLowerCase() !== "completed" &&
            p.status?.toLowerCase() !== "cancelled",
        ).length;

        const totalEmployees = employees.length;

        let totalRevenue = 0;
        projects.forEach((project) => {
          const budget =
            project.budget || project.project_budget || project.cost || "0";
          const numericValue = parseFloat(
            String(budget).replace(/[^0-9.-]+/g, ""),
          );
          if (!isNaN(numericValue)) {
            totalRevenue += numericValue;
          }
        });

        setStats({
          activeProjects: activeProjects || projects.length,
          totalEmployees: totalEmployees,
          totalRevenue:
            totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : "₹0",
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [companyId, token, user]);

  const showError = error && !loading;

  return (
    <div className="erp-root">
      <div className="space-y-6">
        <div>
          <h1 className="app-title text-2xl font-bold max-w-3xl">Superadmin Overview</h1>
          <p className="app-subtitle mt-1">
            {loading
              ? "Loading dashboard data..."
              : "Welcome back! Here's what's happening with your projects."}
          </p>
        </div>

        {showError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="size-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-[14px]">Unable to load statistics</p>
              <p className="text-[13px] mt-1 text-rose-700">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-[12px] font-bold text-rose-800 hover:text-rose-950 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={Building2}
            tone="blue"
            loading={loading}
          />
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            tone="green"
            loading={loading}
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={DollarSign}
            tone="purple"
            loading={loading}
          />
        </div>

        <div className="mt-8">
          <ProjectsTable />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
