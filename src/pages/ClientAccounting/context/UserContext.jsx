import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_ACCOUNTING_URL || "http://localhost:5000";

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
          withCredentials: true,
        });

        if (response.data.success && response.data.user) {
          const userData = response.data.user;
          setUser(userData);
          setUserId(userData.id);
        }
      } catch (error) {
        setUser(null);
        setUserId(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      checkSubscriptionStatus();
    }
  }, [userId]);

  const checkSubscriptionStatus = async () => {
    if (!userId) return;

    setLoadingSubscription(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/subscription/status?userId=${userId}`,
        { withCredentials: true },
      );
      const data = response.data;

      if (data.success) {
        setHasActiveSubscription(data.hasActiveSubscription);
        setSubscriptionData(data.subscription);
      }
    } catch (error) {
      console.error("Failed to check subscription status:", error);
      setHasActiveSubscription(false);
      setSubscriptionData(null);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      setUserId(null);
      setHasActiveSubscription(false);
      setSubscriptionData(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        user,
        setUser,
        loadingAuth,
        hasActiveSubscription,
        subscriptionData,
        checkSubscriptionStatus,
        loadingSubscription,
        logout,
      }}
    >
      {!loadingAuth && children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
