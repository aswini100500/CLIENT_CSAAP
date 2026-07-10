import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";

import {
  normalizeUserPayload,
  setUser as setActiveUser,
} from "../store/slices/userSlice";
import { clearLegacyAuthSessionStorage } from "../store/authSession";
import { setEmployee } from "../submodules/hrms/redux/slices/employeeSlice";
import { setSuperAdmin } from "../submodules/hrms/redux/slices/superAdminSlice";
import { useCompany } from "./ClientAccounting/context/CompanyContext";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { setCompanyId, setcompanyName } = useCompany();
  const API_BASE_URL =
    import.meta.env.VITE_CSAAP_URL || "https://csaapnodeapi.csaap.com";

  const { user, token, isAuthenticated, isEmployee } = useAuth();
  const isEmployeeLogin = location.pathname.startsWith("/employee");

  const theme = isEmployeeLogin
    ? {
        primary: "green",
        textPrimary: "text-green-600",
        textPrimaryDark: "text-green-700",
        bgLight: "bg-green-50",
        borderLight: "border-green-100/50",
        focusBorder: "focus:border-green-600",
        focusRing: "focus:ring-green-600/10",
        buttonBg: "bg-linear-to-r from-green-600 to-emerald-500",
        buttonHoverBg: "hover:from-green-700 hover:to-emerald-600",
        buttonShadow: "shadow-[0_12px_24px_-4px_rgba(16,185,129,0.2)]",
        buttonHoverShadow:
          "hover:shadow-[0_12px_32px_-4px_rgba(16,185,129,0.3)]",
        pingBorder: "border-green-600/10",

        ambientOrb1:
          "bg-linear-to-br from-green-500/20 via-emerald-400/15 to-white/10 blur-[130px]",
        ambientOrb2:
          "bg-linear-to-tr from-emerald-400/15 via-green-300/15 to-white/10 blur-[120px]",
        driftOrb1:
          "bg-linear-to-br from-green-400/15 via-emerald-300/15 to-white/10 blur-[130px]",
        driftOrb2:
          "bg-linear-to-tr from-emerald-300/10 via-green-200/15 to-white/10 blur-[130px]",
        cardShadow:
          "shadow-[0_24px_60px_rgba(0,0,0,0.035),0_12px_24px_rgba(16,185,129,0.01)]",

        morphBlob1:
          "bg-linear-to-br from-green-500/60 via-emerald-400/50 to-white/40 blur-[60px]",
        morphBlob2:
          "bg-linear-to-tr from-emerald-400/50 via-green-300/40 to-white/30 blur-[50px]",
        ambientLightGlow: "bg-green-500/10",
        logoBg:
          "bg-linear-to-br from-green-600 to-emerald-500 shadow-green-500/10",
        plate1RingBorderBg: "border-green-400/20 bg-green-500/5",
        plate1DashedRing: "border-green-500/15",
        plate1Dot: "bg-green-500/10 border-green-500/30",
        plate1Scale: "bg-green-400",
        plate1Coord: "text-green-400/40",
        plate1Axis1: "from-green-400/20",
        plate1Axis2: "from-green-400/15",
        plate2Telemetry: "text-green-600/70",
        plate2DialBg: "stroke-green-500/10",
        plate2DialProgress: "stroke-green-500/60",
        plate2DialText: "text-green-600",
        plate2NodeBg: "bg-green-500/60",
        plate2Spline: "from-green-500/60 via-emerald-400/40",
        plate2SplineNode: "border-green-400/50",
        plate2SplineNode2: "bg-green-400/40",
        plate2Equalizer: "from-green-500/35 via-emerald-400/25",
        plate2EqualizerTop: "border-green-500/40",
        eyeHover: "hover:text-green-600",
      }
    : {
        primary: "blue",
        textPrimary: "text-blue-600",
        textPrimaryDark: "text-blue-700",
        bgLight: "bg-blue-50",
        borderLight: "border-blue-100/50",
        focusBorder: "focus:border-blue-600",
        focusRing: "focus:ring-blue-600/10",
        buttonBg: "bg-linear-to-r from-blue-600 to-blue-500",
        buttonHoverBg: "hover:from-blue-700 hover:to-blue-600",
        buttonShadow: "shadow-[0_12px_24px_-4px_rgba(37,99,235,0.2)]",
        buttonHoverShadow:
          "hover:shadow-[0_12px_32px_-4px_rgba(37,99,235,0.3)]",
        pingBorder: "border-blue-600/10",

        ambientOrb1:
          "bg-linear-to-br from-blue-500/20 via-blue-400/15 to-white/10 blur-[130px]",
        ambientOrb2:
          "bg-linear-to-tr from-blue-400/15 via-blue-300/15 to-white/10 blur-[120px]",
        driftOrb1:
          "bg-linear-to-br from-blue-400/15 via-blue-300/15 to-white/10 blur-[130px]",
        driftOrb2:
          "bg-linear-to-tr from-blue-300/10 via-blue-200/15 to-white/10 blur-[130px]",
        cardShadow:
          "shadow-[0_24px_60px_rgba(0,0,0,0.035),0_12px_24px_rgba(37,99,235,0.01)]",

        morphBlob1:
          "bg-linear-to-br from-blue-500/60 via-blue-400/50 to-white/40 blur-[60px]",
        morphBlob2:
          "bg-linear-to-tr from-blue-400/50 via-blue-300/40 to-white/30 blur-[50px]",
        ambientLightGlow: "bg-blue-500/10",
        logoBg: "bg-linear-to-br from-blue-600 to-blue-500 shadow-blue-500/10",
        plate1RingBorderBg: "border-blue-400/20 bg-blue-500/5",
        plate1DashedRing: "border-blue-500/15",
        plate1Dot: "bg-blue-500/10 border-blue-500/30",
        plate1Scale: "bg-blue-400",
        plate1Coord: "text-blue-400/40",
        plate1Axis1: "from-blue-400/20",
        plate1Axis2: "from-blue-400/15",
        plate2Telemetry: "text-blue-600/70",
        plate2DialBg: "stroke-blue-500/10",
        plate2DialProgress: "stroke-blue-500/60",
        plate2DialText: "text-blue-600",
        plate2NodeBg: "bg-blue-500/60",
        plate2Spline: "from-blue-500/60 via-blue-400/40",
        plate2SplineNode: "border-blue-400/50",
        plate2SplineNode2: "bg-blue-400/40",
        plate2Equalizer: "from-blue-500/35 via-blue-400/25",
        plate2EqualizerTop: "border-blue-500/40",
        eyeHover: "hover:text-blue-600",
      };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState("");

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveredCard, setIsHoveredCard] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const currentSlug = window.location.hostname.split(".")[0];
  const companyName =
    currentSlug.toLowerCase() === "localhost"
      ? "BuilderERP"
      : currentSlug.toUpperCase();

  useEffect(() => {
    if (isEmployeeLogin) {
      const hasEmployeeSession = Boolean(token && isEmployee);

      if (hasEmployeeSession) {
        const from = location.state?.from?.pathname || "/employee/dashboard";
        const search = location.state?.from?.search || "";
        navigate(from + search, { replace: true });
      }

      return;
    }

    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [
    token,
    isEmployee,
    isAuthenticated,
    isEmployeeLogin,
    location.state,
    navigate,
  ]);

  const handleAdminLogin = async () => {
    const response = await fetch(`${API_BASE_URL}/api/tenant/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Invalid email or password.");
    }

    const cloudsatToken = data.token;
    const resolvedSlug = data.user?.slug || data.user?.company || currentSlug;

    axios
      .post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/v1/auth/sync`,
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || email,
          subdomain: resolvedSlug,
          role: data.user.role || "admin",
        },
        {
          headers: { Authorization: `Bearer ${cloudsatToken}` },
        },
      )
      .then(() => {})
      .catch((syncErr) => {
        console.warn("HRMS auth sync failed (non-fatal):", syncErr.message);
      });

    axios
      .post(
        `${import.meta.env.VITE_CRM_BASE_URL}/api/users/sync`,
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || email,
          company_id: data.user.company_id || null,
          company_slug: resolvedSlug,
          role: data.user.role || "admin",
          mobile_number: data.user.mobile_number || null,
        },
        {
          headers: { Authorization: `Bearer ${cloudsatToken}` },
        },
      )
      .then(() => {})
      .catch((syncCrmErr) => {
        console.warn("CRM auth sync failed (non-fatal):", syncCrmErr.message);
      });

    const normalizedUser = normalizeUserPayload({
      ...data.user,
      id: data.user.user_id ?? data.user.id ?? null,
      user_id: data.user.user_id ?? data.user.id ?? null,
      token: cloudsatToken,
      csaapToken: cloudsatToken,
      slug: resolvedSlug,
      subdomain: resolvedSlug,
      companyName: resolvedSlug,
      company_id: data.user.tenant_id ?? data.user.company_id ?? null,
      role: data.user.role || "admin",
      isEmployee: false,
    });

    clearLegacyAuthSessionStorage();
    if (normalizedUser.company_id) {
      sessionStorage.setItem(
        "selectedCompanyId",
        String(normalizedUser.company_id),
      );
      sessionStorage.setItem("selectedCompanyName", resolvedSlug);
    }

    dispatch(setActiveUser(normalizedUser));
    dispatch(setSuperAdmin({ user: normalizedUser, token: cloudsatToken }));

    queryClient.setQueryData(["authUser"], {
      user: normalizedUser,
      isAuthenticated: true,
    });

    if (import.meta.env.VITE_LOCAL_AUTH === "true") {
      localStorage.removeItem("explicit_logout");
    }
    navigate("/", { replace: true });
  };

  const handleEmployeeLogin = async () => {
    const externalLoginUrl =
      import.meta.env.VITE_EMPLOYEE_LOGIN_URL ||
      `${API_BASE_URL}/api/tenant/hrms/login`;

    let data;
    try {
      const payload = {
        email,
        password,
        slug,
      };
      const response = await axios.post(externalLoginUrl, payload);
      data = response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Invalid credentials");
      }
      throw new Error("System unavailable. Try again.");
    }

    if (!data?.success || !data?.token || !data?.user) {
      throw new Error("Invalid response from authentication server.");
    }

    const employee = data.user;
    const token = data.token;
    const employeeProfileId =
      employee.employee_id || employee.employeeId || null;
    const resolvedCompanyId =
      employee.company_id ??
      employee.companyId ??
      employee.tenant_id ??
      employee.master_company_id ??
      null;
    const resolvedSlug =
      employee.company_slug ||
      employee.companySlug ||
      employee.slug ||
      employee.subdomain ||
      "";

    if (!resolvedCompanyId || !resolvedSlug) {
      throw new Error(
        "Your account is missing company information. Please contact your administrator.",
      );
    }

    let permissions = [];
    if (employeeProfileId) {
      try {
        const permissionResponse = await axios.get(
          `${API_BASE_URL}/api/tenant/permissions/employee-access/${encodeURIComponent(employeeProfileId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        permissions = permissionResponse.data?.permissions || [];
      } catch (permissionError) {
        console.warn(
          "Employee permission prefetch failed; continuing login:",
          permissionError.message,
        );
      }
    }

    clearLegacyAuthSessionStorage();
    if (resolvedCompanyId) {
      sessionStorage.setItem("selectedCompanyId", String(resolvedCompanyId));
      sessionStorage.setItem("selectedCompanyName", resolvedSlug);
      setCompanyId(resolvedCompanyId);
      setcompanyName(resolvedSlug);
    }

    const userData = {
      ...normalizeUserPayload({
        id: resolvedCompanyId,
        user_id: employee.id,
        employee_id: employeeProfileId,
        employeeProfileId: employeeProfileId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        slug: resolvedSlug,
        companyName: resolvedSlug,
        company_id: resolvedCompanyId,
        isEmployee: true,
        token,
        csaapToken: token,
      }),
      permissions,
    };

    dispatch(setActiveUser(userData));
    dispatch(setEmployee({ user: userData, token }));
    if (import.meta.env.VITE_LOCAL_AUTH === "true") {
      localStorage.removeItem("explicit_logout");
    }

    queryClient.setQueryData(["authUser"], {
      user: userData,
      isAuthenticated: true,
    });

    const from = location.state?.from?.pathname || "/employee/dashboard";
    const search = location.state?.from?.search || "";
    navigate(from + search, { replace: true });
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isEmployeeLogin) {
        await handleEmployeeLogin();
      } else {
        await handleAdminLogin();
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "A network error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/employees/reset-password`,
        {
          email: resetEmail,
          newPassword: resetPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      alert(res.data.message || "Password reset successful");
      setIsForgotMode(false);
      setResetPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  const showLoader =
    (!isEmployeeLogin && isAuthenticated) ||
    (isEmployeeLogin && token && isEmployee);

  if (showLoader) {
    return (
      <div className="login-page-wrapper bg-[#eaeef3] min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden font-body">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute top-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full ${theme.ambientOrb1} pointer-events-none`}
        />
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 30, -40, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] rounded-full ${theme.ambientOrb2} pointer-events-none`}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-105 p-10 rounded-xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.05)] border border-slate-100 text-center"
        >
          <div className="relative mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
            <ShieldCheck
              className={`h-8 w-8 ${theme.textPrimary} stroke-[1.8]`}
            />
            <div
              className={`absolute -inset-2 rounded-2xl border ${theme.pingBorder} animate-ping opacity-60 [animation-duration:2.5s]`}
            ></div>
          </div>

          <h2 className="font-display text-xl font-bold tracking-tight text-slate-800 mb-2">
            Verifying Workspace
          </h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
            Establishing secure connection and loading ERP modules.
          </p>

          <div className="flex items-center justify-center gap-2.5 py-3 rounded-lg bg-slate-50 border border-slate-100/60 max-w-60 mx-auto">
            <Loader2
              className={`h-4 w-4 animate-spin ${theme.textPrimary} stroke-[2.5]`}
            />
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              Loading Session...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  const formContainerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 15 },
    },
  };

  return (
    <div className="login-page-wrapper bg-[#eaeef3] min-h-screen w-full flex items-center justify-center p-4 md:p-8 lg:p-0 relative overflow-hidden font-body">
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 50, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full ${theme.driftOrb1} pointer-events-none z-0`}
      />
      <motion.div
        animate={{
          x: [0, -90, 60, 0],
          y: [0, 80, -50, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full ${theme.driftOrb2} pointer-events-none z-0`}
      />

      <div
        className={`relative z-10 w-full max-w-230 min-h-145 grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-white p-3 border border-slate-100/60 gap-5 ${theme.cardShadow}`}
      >
        <div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHoveredCard(true)}
          onMouseLeave={() => {
            setIsHoveredCard(false);
            setMousePos({ x: 0, y: 0 });
          }}
          className="relative hidden lg:flex lg:col-span-5 rounded-xl bg-slate-50 border border-slate-100/60 overflow-hidden flex-col justify-between p-8 group select-none"
        >
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                borderRadius: [
                  "42% 58% 70% 30% / 45% 45% 55% 55%",
                  "70% 30% 52% 48% / 60% 40% 60% 40%",
                  "42% 58% 70% 30% / 45% 45% 55% 55%",
                ],
                x: [0, 15, -10, 0],
                y: [0, -20, 15, 0],
                rotate: [0, 120, 240, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className={`absolute top-[-20%] right-[-20%] w-[140%] h-[120%] opacity-85 ${theme.morphBlob1}`}
            />

            <motion.div
              animate={{
                borderRadius: [
                  "50% 50% 30% 70% / 50% 60% 40% 50%",
                  "30% 70% 70% 30% / 50% 30% 70% 50%",
                  "50% 50% 30% 70% / 50% 60% 40% 50%",
                ],
                x: [0, -25, 20, 0],
                y: [0, 15, -25, 0],
                rotate: [360, 240, 120, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className={`absolute bottom-[-30%] left-[-30%] w-[130%] h-[110%] opacity-75 ${theme.morphBlob2}`}
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-white/10 blur-2xl" />

            <div className="absolute inset-0 bg-white/3 backdrop-blur-[1px]" />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_at_center,transparent_20%,black_80%)]" />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ${theme.logoBg}`}
            >
              <Building2 className="h-5 w-5 text-white stroke-2" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-sm font-extrabold tracking-wider text-slate-800 uppercase leading-none mb-1">
                {companyName}
              </span>
              <span
                className={`text-[8px] font-bold tracking-[0.2em] uppercase leading-none ${theme.textPrimary}`}
              >
                {isEmployeeLogin ? "Employee Workspace" : "Enterprise Portal"}
              </span>
            </div>
          </div>

          <div
            style={{ perspective: 1000 }}
            className="relative z-10 my-auto w-full h-56 flex items-center justify-center pointer-events-none"
          >
            <div
              className={`absolute w-48 h-48 rounded-full blur-3xl ${theme.ambientLightGlow}`}
            />

            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotateX: 4 + mousePos.y * -3,
                rotateY: -5 + mousePos.x * 3,
                rotateZ: -2,
                x: mousePos.x * -6 - 8,
              }}
              style={{ transformStyle: "preserve-3d" }}
              transition={{
                y: {
                  duration: 16,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                default: {
                  type: "spring",
                  stiffness: 75,
                  damping: 18,
                },
              }}
              className="absolute w-60 h-36 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/15 shadow-[0_8px_32px_rgba(37,99,235,0.02)] -translate-y-4"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[12px_12px] rounded-2xl" />

              <div
                className={`absolute top-4 left-4 w-16 h-16 rounded-full border flex items-center justify-center ${theme.plate1RingBorderBg}`}
              >
                <div
                  className={`w-10 h-10 rounded-full border border-dashed flex items-center justify-center ${theme.plate1DashedRing}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border ${theme.plate1Dot}`}
                  />
                </div>
              </div>

              <div className="absolute top-4 right-4 flex gap-1 items-start opacity-40">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-px ${theme.plate1Scale} ${i % 4 === 0 ? "h-2" : "h-1"}`}
                  />
                ))}
              </div>

              <div
                className={`absolute bottom-4 left-4 flex flex-col gap-0.5 font-mono text-[6px] uppercase tracking-widest font-bold ${theme.plate1Coord}`}
              >
                <span>COORD // X-84.9</span>
                <span>MESH // SYS-29</span>
              </div>

              <div
                className={`absolute right-4 bottom-4 w-20 h-px transform -rotate-12 bg-linear-to-r ${theme.plate1Axis1} to-transparent`}
              />
              <div
                className={`absolute right-8 bottom-6 w-16 h-px transform -rotate-12 bg-linear-to-r ${theme.plate1Axis2} to-transparent`}
              />
            </motion.div>

            <motion.div
              animate={{
                y: [6, -6, 6],
                rotateX: 3 + mousePos.y * -5,
                rotateY: -3 + mousePos.x * 5,
                rotateZ: 2,
                x: mousePos.x * 10 + 8,
              }}
              style={{ transformStyle: "preserve-3d" }}
              transition={{
                y: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                default: {
                  type: "spring",
                  stiffness: 75,
                  damping: 18,
                },
              }}
              className="absolute w-52 h-32 rounded-2xl bg-white/15 backdrop-blur-[14px] border border-white/25 shadow-[0_20px_45px_rgba(37,99,235,0.05)] translate-y-4"
            >
              <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/25 rounded-2xl pointer-events-none" />
              <div className="absolute inset-0 border border-white/10 rounded-2xl" />

              <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between">
                <div
                  className={`flex flex-col gap-0.5 font-mono text-[7px] uppercase tracking-wider font-extrabold ${theme.plate2Telemetry}`}
                >
                  <span>SYSTEM TELEMETRY</span>
                  <span className="text-[6px] text-slate-400 font-medium">
                    FLOW STATE: ACTIVE
                  </span>
                </div>

                <div className="relative h-6 w-6 flex items-center justify-center">
                  <svg className="absolute w-6 h-6 transform -rotate-90">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      className={`fill-none stroke-2 ${theme.plate2DialBg}`}
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      className={`fill-none stroke-2 [stroke-dasharray:56] [stroke-dashoffset:20] ${theme.plate2DialProgress}`}
                    />
                  </svg>
                  <span
                    className={`font-mono text-[6px] font-black ${theme.plate2DialText}`}
                  >
                    82
                  </span>
                </div>
              </div>

              <div className="absolute top-12 left-4 right-4 flex items-center gap-1 opacity-60">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${theme.plate2NodeBg}`}
                />
                <div
                  className={`h-px flex-1 bg-linear-to-r ${theme.plate2Spline} to-transparent`}
                />
                <div
                  className={`w-1 h-1 rounded-full border ${theme.plate2SplineNode}`}
                />
                <div className="h-px w-10 bg-slate-200/20" />
                <div
                  className={`w-1 h-1 rounded-full ${theme.plate2SplineNode2}`}
                />
              </div>

              <div className="absolute bottom-3.5 left-4 right-4 flex items-end gap-0.5 h-10">
                {[
                  30, 55, 40, 75, 90, 60, 45, 80, 95, 70, 50, 65, 85, 40, 60,
                ].map((val, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${val}%` }}
                    className={`flex-1 rounded-[1px] bg-linear-to-t ${theme.plate2Equalizer} to-transparent border-t ${theme.plate2EqualizerTop}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 max-w-xs mt-auto">
            <span
              className={`font-extrabold text-[10px] uppercase tracking-[0.2em] block mb-2 ${theme.textPrimaryDark}`}
            >
              Enterprise Resource Planning
            </span>
            <h2 className="font-display text-[25px] font-extrabold text-slate-900 tracking-tight leading-tight">
              {isEmployeeLogin
                ? "Access your employee portal, timesheets, and daily tasks."
                : "Manage your business operations and assets with precision."}
            </h2>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-between p-5 md:p-6 lg:py-7 lg:px-9">
          <div className="my-auto max-w-97.5 w-full mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${isEmployeeLogin ? "bg-green-50 text-green-700 border-green-200/50" : "bg-blue-50 text-blue-700 border-blue-200/50"}`}
              >
                {isEmployeeLogin ? "Employee Access" : "Admin Access"}
              </span>
            </div>

            <div
              className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border ${theme.bgLight} ${theme.borderLight}`}
            >
              {isEmployeeLogin ? (
                <Users
                  className={`h-4.5 w-4.5 ${theme.textPrimary} stroke-[1.8]`}
                />
              ) : (
                <Lock
                  className={`h-4.5 w-4.5 ${theme.textPrimary} stroke-[1.8]`}
                />
              )}
            </div>

            <div className="mb-5">
              <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                {isEmployeeLogin
                  ? isForgotMode
                    ? "Reset Password"
                    : "Employee Portal"
                  : "Administrator Login"}
              </h2>
              <p className="mt-1.5 text-slate-400 text-[13px] font-medium leading-relaxed">
                {isEmployeeLogin
                  ? isForgotMode
                    ? "Enter your registered email address to set a new password."
                    : "Sign in to manage your tasks, timesheets, and ERP dashboard."
                  : "Provide your credentials to access the central ERP control panel."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-xs font-semibold text-rose-800"
                >
                  <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={
                isEmployeeLogin && isForgotMode
                  ? handleResetPassword
                  : handleManualLogin
              }
              className="space-y-4"
            >
              <motion.div
                variants={formContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4.5"
              >
                {isEmployeeLogin && !isForgotMode && (
                  <motion.div variants={itemVariants} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block ml-0.5">
                      Company Slug
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className={`w-full rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder-slate-400 ${theme.focusBorder} focus:ring-4 ${theme.focusRing}`}
                        placeholder="company"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block ml-0.5">
                    {isEmployeeLogin ? "Your email" : "Email Address"}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={
                        isEmployeeLogin && isForgotMode ? resetEmail : email
                      }
                      onChange={(e) =>
                        isEmployeeLogin && isForgotMode
                          ? setResetEmail(e.target.value)
                          : setEmail(e.target.value)
                      }
                      className={`w-full rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder-slate-400 ${theme.focusBorder} focus:ring-4 ${theme.focusRing}`}
                      placeholder={
                        isEmployeeLogin
                          ? "employee@company.com"
                          : "admin@company.com"
                      }
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <div className="flex justify-between items-center px-0.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      {isEmployeeLogin && isForgotMode
                        ? "Create password"
                        : "Password"}
                    </label>

                    {isEmployeeLogin ? (
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setIsForgotMode((prev) => !prev);
                        }}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {isForgotMode ? "Back to Login" : "Forgot?"}
                      </button>
                    ) : (
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Forgot?
                      </Link>
                    )}
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={
                        isEmployeeLogin && isForgotMode
                          ? resetPassword
                          : password
                      }
                      onChange={(e) =>
                        isEmployeeLogin && isForgotMode
                          ? setResetPassword(e.target.value)
                          : setPassword(e.target.value)
                      }
                      className={`w-full rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 pl-4 pr-10 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder-slate-400 ${theme.focusBorder} focus:ring-4 ${theme.focusRing}`}
                      placeholder="••••••••"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute right-3.5 text-slate-400 transition-colors ${theme.eyeHover}`}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5 stroke-[1.8]" />
                      ) : (
                        <Eye className="h-4.5 w-4.5 stroke-[1.8]" />
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                type="submit"
                disabled={isLoading}
                className={`group relative mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-bold text-white transition-all duration-300 active:scale-[0.99] disabled:bg-slate-300 disabled:shadow-none ${theme.buttonBg} ${theme.buttonShadow} ${theme.buttonHoverBg} ${theme.buttonHoverShadow}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                    <span className="tracking-wide text-xs">
                      {isForgotMode
                        ? "Resetting account..."
                        : "Authenticating..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide text-xs">
                      {isForgotMode ? "Reset Password" : "Sign In to ERP"}
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-white" />
                  </>
                )}
              </motion.button>

              {!isEmployeeLogin && (
                <div className="text-center mt-4">
                  <Link
                    to="/employee/login"
                    className="inline-block text-xs font-semibold text-slate-400 hover:text-slate-500 hover:underline transition-colors duration-200"
                  >
                    Want to sign in as an employee?
                  </Link>
                </div>
              )}
            </form>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>Secure Enterprise Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
