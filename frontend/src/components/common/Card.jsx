"use client";
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const CustomCard = ({
  icon,
  title,
  value,
  children,
  hover = true,
  sx = {},
}) => (
  <Card
    sx={{
      p: 2,
      borderRadius: 3,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      transition: "0.2s",
      "&:hover": hover
        ? { transform: "translateY(-4px)", boxShadow: "0 6px 16px rgba(0,0,0,0.12)" }
        : {},
      ...sx,
    }}
  >
    <CardContent>
      {icon && <Box mb={1}>{icon}</Box>}
      {title && (
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      )}
      {value && (
        <Typography variant="h6" fontWeight="bold">
          {value}
        </Typography>
      )}
      {children}
    </CardContent>
  </Card>
);

export default CustomCard;
