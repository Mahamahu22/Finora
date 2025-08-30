"use client";
import axios from "axios";
import { getUser } from "./storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // e.g. http://localhost:4000/api
});

// Attach token (if present) to every request
api.interceptors.request.use((config) => {
  const stored = getUser();
  const token = stored?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
