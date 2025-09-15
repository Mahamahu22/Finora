"use client";

import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ThemeProviderCustom, useThemeContext } from "../context/ThemeContext";
import NavBar from "../components/NavBar";
import { UserProvider } from "../context/UserContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ height: "100%", margin: 0, padding: 0 }}>
      <body
        style={{
          margin: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ThemeProviderCustom>
          <ThemeConsumerWrapper>{children}</ThemeConsumerWrapper>
        </ThemeProviderCustom>
      </body>
    </html>
  );
}

function ThemeConsumerWrapper({ children }) {
  const { theme } = useThemeContext();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            backgroundColor: theme.palette.background.default,
          }}
        >
          <NavBar />

          {/* Main content */}
          <main
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </main>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}
