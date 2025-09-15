"use client";
import React from "react";
import { Button } from "@mui/material";

const CustomButton = ({ variant = "primary", startIcon, children, ...props }) => {
  let color = "primary";

  if (variant === "danger") color = "error";
  else if (variant === "secondary") color = "secondary";

  return (
    <Button color={color} variant="contained" startIcon={startIcon} {...props}>
      {children}
    </Button>
  );
};

export default CustomButton;
