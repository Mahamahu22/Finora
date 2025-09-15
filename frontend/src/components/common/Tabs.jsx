"use client";
import React from "react";
import { Tabs as MUITabs, Tab } from "@mui/material";

const CustomTabs = ({ value, onChange, tabs }) => (
  <MUITabs
    value={value}
    onChange={(e, val) => onChange(val)}
    textColor="primary"
    indicatorColor="primary"
    sx={{ mb: 2 }}
  >
    {tabs.map((t, idx) => (
      <Tab key={idx} label={t.label} value={idx} /> // use index as value
    ))}
  </MUITabs>
);

export default CustomTabs;
