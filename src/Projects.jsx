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
          <p>This semester, I am leading a team of 10 in a partnership with Palantir. We will be utilizing Palantir's Artificial Intelligence 
            Platform (AIP) to analyze data from a local source and provide insights to the organization. We are excited to work with Palantir
            and are looking forward to the results of our project. Please stay tuned for updates, as much progress is expected in the coming weeks!
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
