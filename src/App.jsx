
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import headshot from "./assets/headshot.png"; // Replace with your actual photo

// Define your pages
function Resume() {
  return <h2>Resume Page</h2>;
}

function AboutMe() {
  return <h2>About Me Page</h2>;
}

function Home() {
  return (
    <div className="home">
      <img src={headshot} alt="Ty Friedman" className="profile-photo" /> {/* Replace with your photo */}
      <div className="social-links">
        <a href="https://github.com/tyfriedman" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://linkedin.com/in/ty-friedman" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </div>
  );
}

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

