import React from 'react';
import headshot from './assets/headshot.png';
import githubIcon from './assets/github-icon.png';
import linkedinIcon from './assets/linkedin-icon.png';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <img src={headshot} alt="Ty Friedman" className="profile-photo" />
      <div className="social-icons">
        <a href="https://github.com/tyfriedman" target="_blank" rel="noopener noreferrer">
          <img src={githubIcon} alt="GitHub" className="icon" />
        </a>
        <a href="https://linkedin.com/in/ty-friedman" target="_blank" rel="noopener noreferrer">
          <img src={linkedinIcon} alt="LinkedIn" className="icon" />
        </a>
      </div>
    </div>
  );
};

export default Home;

