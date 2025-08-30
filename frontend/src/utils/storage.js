"use client";

/** User-specific helpers */
const USER_KEY = "user";

export const saveUser = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }
};

export const getUser = () => {
  if (typeof window !== "undefined") {
    const str = localStorage.getItem(USER_KEY);
    return str ? JSON.parse(str) : null;
  }
  return null;
};

export const removeUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
};

/** Generic helpers (use for expenses/incomes/reports later) */
export const saveItem = (key, value) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const getItem = (key) => {
  if (typeof window !== "undefined") {
    const str = localStorage.getItem(key);
    return str ? JSON.parse(str) : null;
  }
  return null;
};

export const removeItem = (key) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

export const clearAll = () => {
  if (typeof window !== "undefined") {
    localStorage.clear();
  }
};
