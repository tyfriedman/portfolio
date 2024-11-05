import React from 'react';
import './Projects.css';
import palantir from './assets/palantir-logo.png';
import unityGardens from './assets/unity-gardens-logo.jpg';

const Projects = () => {
  return (
    <div className="Projects">
      <h1 className="ProjectsHeading">Current Club Projects</h1>
      <section className="ProjectSection">
        <div className="ProjectLogo">
          <img src={palantir} alt="Palantir Logo" />
        </div>
        <div className="ProjectContent">
          <h2>Data Club of ND - Palantir Project</h2>
          <h3>Project Lead</h3>
          <p>In partnership with Palantir, I am leading a ND Data Club Project with ten members that will be utilizing Palantir's Artificial Intelligence Platform (AIP). 
            We are creating a real-time representation of energy consumption across the US, with the goal of providing a tool that can be used to identify 
            inefficiencies in energy consumption and predict areas where energy demand will increase in the future.
          </p>
        </div>
      </section>
      <section className="ProjectSection">
        <div className="ProjectLogo">
          <img src={unityGardens} alt="Unity Gardens Logo" />
        </div>
        <div className="ProjectContent">
          <h2>CS4Good - Unity Gardens Project</h2>
          <h3>Project Lead</h3>
          <p>In partnership with Unity Gardens -- a South Bend non-profit committed to providing fresh fruits and vegetables,
            a social community, and educational opportunities for the disadvantaged in the local community -- I am leading a team of 5
            in developing a database for grant information and impact reports and an inventory system using their Square checkout system.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Projects;
