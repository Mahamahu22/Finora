"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getUser } from "../utils/storage";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // initial load
    const stored = getUser();
    if (stored) setUser(stored);

    // listen for changes in localStorage
    const handleChange = () => setUser(getUser());
    window.addEventListener("userChange", handleChange);

    return () => window.removeEventListener("userChange", handleChange);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
