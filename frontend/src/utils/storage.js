"use client";

const USER_KEY = "user";

export const saveUser = (user) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify({ user })); // always wrap in { user }
    window.dispatchEvent(new Event("userChange"));
  }
};

export const getUser = () => {
  if (typeof window !== "undefined") {
    const str = localStorage.getItem(USER_KEY);
    if (!str) return null;
    const parsed = JSON.parse(str);
    return parsed.user || null; // always extract user
  }
  return null;
};

export const removeUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("userChange"));
  }
};

export const saveItem = (key, value) => {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
};
export const getItem = (key) => {
  if (typeof window !== "undefined") {
    const str = localStorage.getItem(key);
    return str ? JSON.parse(str) : null;
  }
  return null;
};
export const removeItem = (key) => {
  if (typeof window !== "undefined") localStorage.removeItem(key);
};
export const clearAll = () => {
  if (typeof window !== "undefined") {
    localStorage.clear();
    window.dispatchEvent(new Event("userChange"));
  }
};
