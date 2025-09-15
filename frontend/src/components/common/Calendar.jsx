"use client";
import React from "react";
import { TextField } from "@mui/material";
import dayjs from "dayjs";

const Calendar = ({ label, value, onChange }) => {
  // HTML input needs YYYY-MM-DD format
  const dateValue = value ? dayjs(value).format("YYYY-MM-DD") : "";

  const handleChange = (e) => {
    const newDate = e.target.value ? dayjs(e.target.value, "YYYY-MM-DD") : null;
    onChange(newDate);
  };

  return (
    <TextField
      type="date"
      label={label}
      value={dateValue}
      onChange={handleChange}
      fullWidth
      margin="normal"
      InputLabelProps={{ shrink: true }}
    />
  );
};

export default Calendar;
