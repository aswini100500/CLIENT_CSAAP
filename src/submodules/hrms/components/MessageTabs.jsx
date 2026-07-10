import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import MessageToEmployee from "./Employee Management/MessageToEmployee";
import ComplaintsManagement from "./ComplaintsManagement";
import EmployeeServiceReq from "./EmployeeServiceReq";
import Announcement from "./Announcement";
import { 
  Mail, 
  AlertTriangle, 
  Settings, 
  Megaphone,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { usePermission } from "../../../hooks/usePermission";

const MessageTabs = () => {
  const { user } = useAuth();
  const { hasAccess } = usePermission();
  

  const [activeTab, setActiveTab] = useState(() => {
    if (hasAccess("hrms.message")) return "message-to-employee";
    if (hasAccess("hrms.message.complaints")) return "complaints";
    if (hasAccess("hrms.message.service_request")) return "service-request";
    if (hasAccess("hrms.message.announcement")) return "announcement";
    return "message-to-employee";
  });

  const [counts, setCounts] = useState({
    messages: 0,
    complaints: 0,
    serviceRequests: 0,
    announcements: 0
  });
  const [notifications, setNotifications] = useState({
    messages: 0,
    complaints: 0,
    serviceRequests: 0,
    announcements: 0
  });

  const fetchCounts = async () => {
    if (!user?.slug) return;
    try {
      const [msgRes, compRes, servRes, annRes] = await Promise.all([

        axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/messages/company/all?company_id=${user.company_id}&slug=${user.slug}`),
        axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/`),

        axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/company-search?company_id=${user.company_id}&slug=${user.slug}`),
        axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/announcements?company_id=${user.company_id}&slug=${user.slug}&status=active`)
      ]);

      const msgs = Array.isArray(msgRes.data) ? msgRes.data : [];
      const comps = Array.isArray(compRes.data) ? compRes.data : [];
      const servs = servRes.data.success ? servRes.data.data : [];
      const anns = Array.isArray(annRes.data) ? annRes.data : [];

      setCounts({
        messages: msgs.length,
        complaints: comps.length,
        serviceRequests: servs.length,
        announcements: anns.length
      });


      const getLastChecked = (key) => localStorage.getItem(`hrms_last_checked_${key}`) || '1970-01-01';
      
      const newNotifications = {
        messages: msgs.filter(m => (m.created_at || m.date) > getLastChecked('messages')).length,
        complaints: comps.filter(c => c.status === 'Pending' && c.created_at > getLastChecked('complaints')).length,
        serviceRequests: servs.filter(s => s.status === 'Pending' && s.created_at > getLastChecked('serviceRequests')).length,
        announcements: anns.filter(a => a.created_at > getLastChecked('announcements')).length
      };


      const tabToKey = {
        "message-to-employee": "messages",
        "complaints": "complaints",
        "service-request": "serviceRequests",
        "announcement": "announcements"
      };
      
      if (tabToKey[activeTab]) {
        newNotifications[tabToKey[activeTab]] = 0;
      }

      setNotifications(newNotifications);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    let keyToClear = "";
    if (tabId === "message-to-employee") keyToClear = "messages";
    else if (tabId === "complaints") keyToClear = "complaints";
    else if (tabId === "service-request") keyToClear = "serviceRequests";
    else if (tabId === "announcement") keyToClear = "announcements";

    if (keyToClear) {
      setNotifications(prev => ({ ...prev, [keyToClear]: 0 }));

      localStorage.setItem(`hrms_last_checked_${keyToClear}`, new Date().toISOString());
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [user]);

  const allTabs = [
    {
      id: "message-to-employee",
      permission: "hrms.message",
      label: "Messages",
      icon: <Mail className="w-5 h-5" />,
      count: counts.messages,
      notification: notifications.messages,
      description: "Direct employee communication",
      color: "bg-emerald-600",
      textColor: "text-emerald-600",
      component: <MessageToEmployee />
    },
    {
      id: "complaints",
      permission: "hrms.message.complaints",
      label: "Complaints",
      icon: <AlertTriangle className="w-5 h-5" />,
      count: counts.complaints,
      notification: notifications.complaints,
      description: "Grievance management",
      color: "bg-emerald-600",
      textColor: "text-emerald-600",
      component: <ComplaintsManagement />
    },
    {
      id: "service-request",
      permission: "hrms.message.service_request",
      label: "Service Requests",
      icon: <Settings className="w-5 h-5" />,
      count: counts.serviceRequests,
      notification: notifications.serviceRequests,
      description: "Support & fulfillment",
      color: "bg-emerald-600",
      textColor: "text-emerald-600",
      component: <EmployeeServiceReq />
    },
    {
      id: "announcement",
      permission: "hrms.message.announcement",
      label: "Announcements",
      icon: <Megaphone className="w-5 h-5" />,
      count: counts.announcements,
      notification: notifications.announcements,
      description: "Company-wide updates",
      color: "bg-emerald-600",
      textColor: "text-emerald-600",
      component: <Announcement />
    },
  ];

  const tabs = allTabs.filter(tab => hasAccess(tab.permission));

  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 lg:p-6 font-sans">

      <div className="flex justify-start mb-8">
        <nav className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  relative flex items-center gap-2 px-6 py-2.5 rounded-xl
                  text-sm font-bold transition-colors duration-300
                  ${isActive ? "text-white" : "text-slate-500 hover:text-slate-800"}
                `}
              >

                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className={`absolute inset-0 rounded-xl ${tab.color}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <span className={`relative z-10 text-base ${!isActive && tab.textColor}`}>
                  {tab.icon}
                </span>
                <span className="relative z-10">{tab.label}</span>


                {tab.notification > 0 && (
                  <span className="relative z-10 ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {tab.notification}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>


      <div className="w-full bg-white rounded-4xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">

        <div className="w-full min-h-150 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="w-full h-full p-4 sm:p-6"
            >
              {activeTabData?.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MessageTabs;
