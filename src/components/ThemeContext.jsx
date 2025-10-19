import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDayMode, setIsDayMode] = useState(true);

  const toggleMode = () => {
    setIsDayMode((prevMode) => !prevMode);
    const html = document.querySelector("html");
    html.setAttribute("data-mode", !isDayMode ? "day" : "night");
  };

  return (
    <ThemeContext.Provider value={{ isDayMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
