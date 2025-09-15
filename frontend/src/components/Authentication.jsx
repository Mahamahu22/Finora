"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  ThemeProvider,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import theme from "../theme";

const AuthForm = ({ title, fields, submitText, onSubmit }) => {
  const initialForm = fields.reduce((acc, f) => ({ ...acc, [f]: "" }), {});
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await onSubmit(formData, setError, setSuccess);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: "url('/assets/fin.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <Container
          maxWidth="xs"
          sx={{
            bgcolor: "rgba(241, 230, 219, 0.9)",
            p: 4,
            borderRadius: 4,
            boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
            textAlign: "center",
            transform: "translateY(-50px)",
            animation: "float 1s ease-out forwards",
            "@keyframes float": {
              "0%": { transform: "translateY(-50px)", opacity: 0 },
              "100%": { transform: "translateY(0)", opacity: 1 },
            },
          }}
        >
          
          {/* Title */}
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </Typography>

          {/* Success / Error Messages */}
          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.primary.main,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {success}
            </Alert>
          )}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {fields.map((field) => (
              <TextField
                key={field}
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                type={
                  field === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : "text"
                }
                value={formData[field]}
                onChange={handleChange}
                margin="normal"
                InputProps={
                  field === "password"
                    ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowPassword((prev) => !prev)
                              }
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    : {}
                }
                sx={{
                  "& .MuiInputBase-root": {
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:focus-within": {
                      transform: "scale(1.02)",
                      boxShadow: "0 0 10px rgba(62,44,35,0.3)",
                    },
                  },
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            ))}

            {/* ✅ Button with Circular Loader */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                bgcolor: "primary.main",
                fontWeight: "bold",
                fontFamily: "'Poppins', sans-serif",
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "scale(1.02)",
                },
                transition: "transform 0.3s",
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                submitText
              )}
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AuthForm;
