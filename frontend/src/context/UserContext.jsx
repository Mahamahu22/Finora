"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getUser, saveUser } from "../utils/storage";
import api from "../utils/api";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user on client mount
  useEffect(() => {
    const stored = getUser();
    if (stored) setUser(stored);
  }, []);

  const persistUser = useCallback((nextUser) => {
    saveUser(nextUser); // now saves as { user: nextUser } internally
    setUser(nextUser);
  }, []);

  const updatePreferences = useCallback(
  async (prefsPatch = {}) => {
    if (!user) {
      console.warn("updatePreferences called before user loaded");
      return { success: false, error: new Error("No user logged in") };
    }
    try {
      const res = await api.put("/settings", prefsPatch);
      const returnedPrefs = res?.data?.preferences ?? {};
      const mergedPrefs = { ...user.preferences, ...returnedPrefs, ...prefsPatch };
      const nextUser = { ...user, preferences: mergedPrefs };
      persistUser(nextUser);
      return { success: true, preferences: mergedPrefs };
    } catch (err) {
      console.error("updatePreferences error", err);
      return { success: false, error: err };
    }
  },
  [user, persistUser]
);


  const changePassword = async ({ oldPassword, newPassword }) =>
    api.put("/settings/password", { oldPassword, newPassword });

  return (
    <UserContext.Provider value={{ user, setUser: persistUser, updatePreferences, changePassword }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
};
