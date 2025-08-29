// src/app/layout.jsx
"use client";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <NavBar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
