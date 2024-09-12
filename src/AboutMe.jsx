import React from 'react';
import pommelhorse from './assets/pommel.jpeg'
import './AboutMe.css'; // Optionally, create a separate CSS file for About Me page styling


const AboutMe = () => {
  return (
    <div className="about-me-page">
      <h1>About Me</h1>
      <img src={pommelhorse} alt="Pommel Horse" className="gymnastics-photo" />
        <div>
        </div>
    </div>
  );
};

export default AboutMe;
