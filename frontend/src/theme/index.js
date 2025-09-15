import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3e2c23", // Dark brown
    },
    secondary: {
      main: "#f0c27b", // Light golden brown
    },
    background: {
      default: "#7b5536", // Corrected 6-char hex
      paper: "#7b5536",   // Corrected 6-char hex
    },
    text: {
      primary: "#533626ff",
      secondary: "#6f4e37",
    },
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, sans-serif",
    h2: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
      color: "#f0c27b", // ✅ valid hex
    },
  },
});

export default theme;
