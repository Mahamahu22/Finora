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
      default: "#7b5536ff", // Light beige background
      paper: "#e9d9ccff",   // Slight cream for sections
    },
    text: {
      primary: "#3e2c23",
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
    },
  },
});

export default theme;
