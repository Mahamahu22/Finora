"use client";
import React from "react";
import { Card, CardContent, Typography, CardMedia, Box } from "@mui/material";

const StatOverview = ({ title, desc, icon, img, link }) => {
  return (
    <Card
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        p: 2,
        height: img ? 240 : 180,
        borderRadius: 3,
        transition: "transform 0.3s",
        "&:hover": { transform: "translateY(-5px)" },
      }}
    >
      {icon && <Box sx={{ mb: 1 }}>{icon}</Box>}
      {img && (
        <CardMedia
          component="img"
          height="140"
          image={img}
          alt={title}
          sx={{
            objectFit: "cover",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
      )}
      <CardContent>
        {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
        {desc && <Typography color="text.secondary">{desc}</Typography>}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#b56e2a", fontWeight: "bold" }}
          >
            Read Book
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default StatOverview;
