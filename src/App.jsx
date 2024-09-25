import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Resume from "./Resume";
import AboutMe from "./AboutMe";
import Projects from "./Projects";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {/* Ty Friedman as a link to the homepage on the left side */}
          <div className="brand">
            <Link to="/">Ty Friedman</Link>
          </div>
          {/* Navbar on the right side */}
          <nav className="navbar">
            <ul>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/resume">Resume</Link></li>
              <li><Link to="/about-me">About Me</Link></li>
            </ul>
          </nav>
        </header>
        <div className="App-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/about-me" element={<AboutMe />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

