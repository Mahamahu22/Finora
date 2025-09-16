"use client";

import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ThemeProviderCustom, useThemeContext } from "../context/ThemeContext";
import NavBar from "../components/NavBar";
import { UserProvider } from "../context/UserContext";

// ⬇️ Import i18n setup
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

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
        <I18nextProvider i18n={i18n}>
          <ThemeProviderCustom>
            <ThemeConsumerWrapper>{children}</ThemeConsumerWrapper>
          </ThemeProviderCustom>
        </I18nextProvider>
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
