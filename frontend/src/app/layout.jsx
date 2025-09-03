"use client";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { UserProvider } from "../context/UserContext"; // ✅ import the user context

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeProvider theme={theme}>
          <UserProvider> {/* ⬅️ wrap everything so user is available globally */}
            <div
              style={{
                minHeight: "100vh", // full height
                display: "flex",
                flexDirection: "column",
              }}
            >
              <NavBar />
              <main style={{ flex: 1 }}>{children}</main>
              <Footer /> {/* only visible at the very bottom */}
            </div>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
