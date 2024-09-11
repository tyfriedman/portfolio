import React from 'react';
import headshot from './assets/headshot.png';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <img src={headshot} alt="Ty Friedman" className="profile-photo" />
      <div className="social-links">
        <a href="https://github.com/tyfriedman" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://linkedin.com/in/ty-friedman" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </div>
  );
};

export default Home;
