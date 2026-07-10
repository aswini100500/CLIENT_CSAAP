import {
  faBars,
  faBell,
  faChevronDown,
  faCog,
  faSearch,
  faSignOutAlt,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import useAuth from "../../../hooks/useAuth";

const Header = ({
  isSidebarCollapsed,
  toggleSidebar,
  isMobileSidebarOpen,
  toggleMobileSidebar,
  showCollapseIcon = true,
}) => {
  const { user } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const companySlug = user?.slug || user?.subdomain || "";
  const companyId = user?.company_id || user?.id || "";
  const companyFeedKey = useMemo(
    () => companySlug || companyId || "company",
    [companyId, companySlug],
  );

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "Just now";

    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const markCompanyNotificationsSeen = (items) => {
    if (!companyFeedKey || !items.length) return;
    localStorage.setItem(
      `seenCompanyNotifIds_${companyFeedKey}`,
      JSON.stringify(items.map((item) => item.id)),
    );
    setUnreadCount(0);
  };

  const handleDropdownToggle = (type) => {
    if (type === "profile") {
      setShowProfileDropdown(!showProfileDropdown);
      setShowNotifications(false);
    } else if (type === "notifications") {
      const nextOpen = !showNotifications;
      setShowNotifications(nextOpen);
      setShowProfileDropdown(false);
      if (nextOpen) {
        markCompanyNotificationsSeen(notifications);
      }
    }
  };

  useEffect(() => {
    if (user) {
      setUserInfo(user);
      setUserEmail(user.email || "");
    } else {
      setUserInfo(null);
      setUserEmail("");
    }
  }, [user]);

  useEffect(() => {
    if (!companySlug && !companyId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_HRMS_BASE_URL ||
          "https://csaapnodeapi.csaap.com";

        const response = await axios.get(
          `${baseUrl}/api/notifications/company/${companySlug || "all"}`,
          {
            params: {
              company_id: companyId || undefined,
              limit: 20,
            },
          },
        );

        const items = response.data?.success ? response.data.data || [] : [];
        setNotifications(items);

        const rawSeen = localStorage.getItem(
          `seenCompanyNotifIds_${companyFeedKey}`,
        );
        const seenIds = rawSeen ? JSON.parse(rawSeen) : [];
        setUnreadCount(
          items.filter((item) => !seenIds.includes(item.id)).length,
        );
      } catch (error) {
        console.error("Error fetching HR notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    const handleRefresh = () => fetchNotifications();
    window.addEventListener("new-notification", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("new-notification", handleRefresh);
    };
  }, [companyFeedKey, companyId, companySlug]);

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm dark:bg-gray-800 w-full h-16">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon
              icon={faBars}
              className="h-5 w-5 text-gray-600 dark:text-gray-300"
            />
          </button>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon
                icon={faSearch}
                className="h-4 w-4 text-gray-400 dark:text-gray-500"
              />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition-all duration-300 w-48 md:w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle("notifications")}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative transition-colors"
              aria-label="Notifications"
            >
              <FontAwesomeIcon
                icon={faBell}
                className="h-5 w-5 text-gray-600 dark:text-gray-300"
              />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
                  onClick={() => setShowNotifications(false)}
                />
                <div
                  className="fixed inset-0 z-30 md:absolute md:inset-auto md:right-0 md:top-full mt-2 w-full md:w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Notifications ({unreadCount} new)
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            notification.type === "new_employee"
                              ? "bg-blue-50 dark:bg-blue-900"
                              : ""
                          }`}
                        >
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {timeAgo(notification.createdAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No notifications yet
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href="#"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline block text-center"
                    >
                      View all notifications
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => handleDropdownToggle("profile")}
              className="flex items-center space-x-2 focus:outline-none group"
              aria-label="User profile"
            >
              <div className="h-9 w-9 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faUserCircle} size="lg" />
              </div>
              <span className="hidden md:inline font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Admin
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`hidden md:inline h-4 w-4 transition-transform ${
                  showProfileDropdown ? "transform rotate-180" : ""
                } text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400`}
              />
            </button>

            {showProfileDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
                  onClick={() => setShowProfileDropdown(false)}
                />
                <div
                  className="fixed inset-0 z-30 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 w-full md:w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg md:shadow-none overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Signed in as
                    </p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                      {userEmail}
                    </p>
                  </div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faUserCircle} className="mr-2" />{" "}
                    Profile
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCog} className="mr-2" /> Settings
                  </a>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />{" "}
                    Sign out
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
