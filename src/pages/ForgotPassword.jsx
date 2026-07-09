import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck, Fingerprint, LockKeyhole } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_CSAAP_URL}/api/builder-companies/forgot-password`,
        { adminEmail: email }
      );

      if (response.data.success) {
        setSuccess("OTP has been securely sent to your inbox.");
        setTimeout(() => setStep(2), 1500);
      } else {
        setError(response.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_CSAAP_URL}/api/builder-companies/reset-password`,
        {
          adminEmail: email,
          otp,
          newPassword,
        }
      );

      if (response.data.success) {
        setSuccess("Access restored! Redirecting to secure login...");
        setTimeout(() => {
          navigate("/admin/login");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f7f4] flex items-center justify-center p-4 md:p-8 font-body relative overflow-hidden">
      
      {/* Premium Ambient Background (Light Green / Emerald) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{ x: [0, 50, -20, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full bg-linear-to-br from-emerald-400/20 via-green-300/10 to-transparent blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -60, 40, 0], y: [0, 50, -30, 0], scale: [1, 0.8, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-linear-to-tl from-emerald-300/20 via-teal-200/10 to-transparent blur-[100px]"
        />
      </div>

      {/* Glassmorphic Container (Dual Pane) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-5xl min-h-150 grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-white shadow-[0_32px_64px_-12px_rgba(16,185,129,0.08)] border border-white/60 overflow-hidden"
      >
        
        {/* Left Pane - Abstract Visuals */}
        <div className="hidden lg:flex relative bg-emerald-900 overflow-hidden flex-col justify-between p-12 text-white">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-800 to-emerald-950 z-0"></div>
          
          {/* Animated geometric overlays */}
          <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-30%] left-[-30%] w-[150%] h-[150%] bg-linear-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-semibold tracking-wider text-emerald-50 uppercase">Secure Recovery</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
              Lost your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-teal-200">
                keys?
              </span>
            </h1>
            <p className="text-emerald-100/80 text-lg max-w-sm leading-relaxed">
              Don't worry. Our secure, encrypted recovery protocol will help you regain access to your workspace in seconds.
            </p>
          </div>

          <div className="relative z-10">
            <div className="w-full h-0.5 bg-linear-to-r from-emerald-500/50 to-transparent mb-6"></div>
            <div className="flex items-center gap-4 text-sm font-medium text-emerald-300/60 uppercase tracking-widest">
              <Fingerprint className="w-4 h-4" />
              End-to-End Encrypted
            </div>
          </div>
        </div>

        {/* Right Pane - The Form */}
        <div className="relative z-10 flex flex-col p-8 sm:p-12 lg:p-16 justify-center bg-white">
          <Link
            to="/admin/login"
            className="absolute top-8 left-8 sm:left-12 lg:left-16 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-emerald-600 transition-colors group"
          >
            <span className="p-1 rounded-full bg-slate-100 group-hover:bg-emerald-50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </span>
            Back to portal
          </Link>

          <div className="max-w-md w-full mx-auto mt-12">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6 shadow-sm shadow-emerald-100/50">
                      <LockKeyhole className="w-7 h-7 text-emerald-600 stroke-[1.5]" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                      Password Reset
                    </h2>
                    <p className="text-slate-500 leading-relaxed text-sm">
                      Enter the email address associated with your administrator account and we will send you a secure OTP code.
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse"></div>
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                        Admin Email
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-600 text-slate-400">
                          <Mail className="h-5 w-5" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-slate-800 font-medium bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                          placeholder="admin@csaap.com"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="relative w-full py-3.5 px-4 rounded-xl text-white font-bold tracking-wide transition-all overflow-hidden group bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(16,185,129,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Request Secure Link"}
                      </span>
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6 shadow-sm shadow-emerald-100/50">
                      <KeyRound className="w-7 h-7 text-emerald-600 stroke-[1.5]" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                      Verify & Reset
                    </h2>
                    <p className="text-slate-500 leading-relaxed text-sm">
                      We've sent a 6-digit code to <strong className="text-slate-700">{email}</strong>.
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse"></div>
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                      {success}
                    </motion.div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                        6-Digit Security Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="block w-full px-4 py-4 border border-slate-200 rounded-xl text-center text-3xl tracking-[0.4em] transition-all bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-black shadow-sm"
                        placeholder="••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                        New Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-600 text-slate-400">
                          <LockKeyhole className="h-5 w-5" />
                        </div>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-slate-800 font-medium bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                          placeholder="Choose a strong password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6 || !newPassword}
                      className="relative w-full py-3.5 px-4 rounded-xl text-white font-bold tracking-wide transition-all overflow-hidden group bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(16,185,129,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                      <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm New Password"}
                      </span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
