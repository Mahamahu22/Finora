"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createTheme } from "@mui/material/styles";
import defaultTheme from "../theme";

const ThemeContext = createContext();

export const ThemeProviderCustom = ({ children }) => {
  const [mode, setMode] = useState("light");

  // Load theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored).user;
      if (user?.preferences?.theme) setMode(user.preferences.theme);
    }
  }, []);

  const toggleTheme = (newMode) => {
    setMode(newMode);
  };

  // Improved dark colors for better readability
  // Improved dark colors for better readability
const theme = createTheme({
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    mode, // tells MUI it's dark or light
    background: {
      default: mode === "dark" ? "#121111ff" : "#ceb097ff", // dark gray for dark mode, light for light
      paper: mode === "dark" ? "#2a2a2a" : "#ead5c0ff",       // cards/paper
    },
    text: {
      primary: mode === "dark" ? "#ffffff" : "#3e2c23", // main text
      secondary: mode === "dark" ? "#bbbbbb" : "#3e2c23", // secondary text
    },
    primary: {
      main: mode === "dark" ? "#6289aa" : "#3e2c23", // buttons/links
    },
    secondary: {
      main: mode === "dark" ? "#cd8aa0" : "#e0ad5fff",
    },
  },
});


  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
