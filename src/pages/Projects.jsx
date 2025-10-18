import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeContext.jsx";
import Typography from "@mui/material/Typography";

export default function Projects() {
  const navigate = useNavigate();
  const { isDayMode } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        backgroundColor: isDayMode ? "#f5f5f5" : "#1a1a1a",
        color: isDayMode ? "#333" : "#f0f0f0",
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          padding: "0.5rem 1rem",
          backgroundColor: isDayMode ? "#333" : "#f0f0f0",
          color: isDayMode ? "#f0f0f0" : "#333",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        ← Back to Home
      </button>

      <Typography
        variant="h2"
        sx={{
          fontFamily: "Poppins, sans-serif",
          fontSize: "3rem",
          marginBottom: "2rem",
        }}
      >
        My Projects
      </Typography>

      <Typography
        sx={{
          fontFamily: "Poppins, sans-serif",
          fontSize: "1.2rem",
          maxWidth: "600px",
          textAlign: "center",
        }}
      >
        Projects page coming soon...
      </Typography>
    </div>
  );
}
