import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import Home from "./Home"; // Assuming Home is also in a separate file
import Resume from "./Resume"; // Import the new Resume component
import AboutMe from "./AboutMe"; // Import the new About Me component
import headshot from "./assets/headshot.png"; // Replace with your actual photo

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {/* Ty Friedman as a link to the homepage */}
          <div className="brand">
            <Link to="/">Ty Friedman</Link>
          </div>
          {/* Navbar on the right side */}
          <nav className="navbar">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/resume">Resume</Link></li>
              <li><Link to="/about-me">About Me</Link></li>
            </ul>
          </nav>
        </header>
        <div className="App-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/about-me" element={<AboutMe />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
