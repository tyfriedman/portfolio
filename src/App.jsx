import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import reactLogo from "./assets/react.svg";

// Define your pages
function Resume() {
  return <h2>Resume Page</h2>;
}

function AboutMe() {
  return <h2>About Me Page</h2>;
}

function AI() {
  return <h2>AI Page</h2>;
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="navbar">
            <ul>
              <li><Link to="/resume">Resume</Link></li>
              <li><Link to="/about-me">About Me</Link></li>
              <li><Link to="/ai">AI</Link></li>
            </ul>
          </nav>
          <div className="App-content">
            <h1>Ty Friedman</h1>
            <Routes>
              <Route path="/resume" element={<Resume />} />
              <Route path="/about-me" element={<AboutMe />} />
              <Route path="/ai" element={<AI />} />
            </Routes>
          </div>
        </header>
      </div>
    </Router>
  );
}

export default App;

