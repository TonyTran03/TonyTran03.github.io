import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";

function App() {
  return (
    <Router>
      <Intro />
    </Router>
  );
}

export default App;
