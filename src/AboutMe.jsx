import React from 'react';
import gym1 from './assets/gym1.jpeg'
import gym2 from './assets/gym2.jpeg'
import waterski from './assets/waterski.jpg';
import run1 from './assets/run1.jpeg';
import run2 from './assets/run2.jpeg';
import football from './assets/football.jpeg';
import pizza1 from './assets/pizza1.jpeg'
import pizza2 from './assets/pizza2.jpeg'
import course from './assets/course.jpeg';
import squirrel1 from './assets/squirrel1.jpeg';
import squirrel2 from './assets/squirrel2.jpeg';
import './AboutMe.css';


const AboutMe = () => {
  return (
    <div className="about-me-page">
      <h1> My life, through some photos of my favorite things </h1>
      {/* Gymnastics Images */}
      <div className="photo-pair">
        <img src={gym1} alt="Gymnastics 1" className="photo-gold-border" />
        <img src={gym2} alt="Gymnastics 2" className="photo-gold-border" />
      </div>
      <div className="text-box-green-pair">
        <p>I've done gymnastics my entire life, and it is easily my favorite sport. I've spent countless hours in the gym, and now am on the Club Gymnastics Team at Notre Dame.
        </p>
      </div>

      {/* Waterskiing Image */}
      <img src={waterski} alt="Waterskiing" className="photo-gold-border" />
      <div className="text-box-green">
        <p>One of my favorite things about summer is being able to spend time waterskiing at our family cabin in Idaho. Plus, it is great practice
           for club waterski season!
        </p>
      </div>

      {/* Run1 and Run2 (Paired Images) */}
      <div className="photo-pair">
        <img src={run1} alt="Run 1" className="photo-gold-border" />
        <img src={run2} alt="Run 2" className="photo-gold-border" />
      </div>
      <div className="text-box-green-pair">
        <p>Running is one of my favorite ways to get outside and enjoy all of the parks and forests that I am surrounded by in the Pacific Northwest.</p>
      </div>

      {/* Football Image */}
      <img src={football} alt="Football" className="photo-gold-border" />
      <div className="text-box-green">
        <p>Believe it or not, I am not on the football team -- just a dedicated fan whose happiness is decided by a team that I have no influence over.</p>
      </div>

      {/* Pizza1 and Pizza2 (Paired Images) */}
      <div className="photo-pair">
        <img src={pizza1} alt="Pizza 1" className="photo-gold-border" />
        <img src={pizza2} alt="Pizza 2" className="photo-gold-border" />
      </div>
      <div className="text-box-green-pair">
        <p>I'm no chef, but I love making pizza. Pro tip: pickles are actually really good on pizza (also pineapple). Now, I am the manager for Zaland, 
          which is the pizzeria in my dorm, which sells dollar slices every night.</p>
      </div>

      {/* Golf Course Image */}
      <img src={course} alt="Golf Course" className="photo-gold-border" />
      <div className="text-box-green">
        <p>I've been a greenskeeper at a local golf course over the past two summers, and nothing beats the sunrises over a beautiful course.</p>
      </div>

      {/* Squirrel1 and Squirrel2 (Paired Images) */}
      <div className="photo-pair">
        <img src={squirrel1} alt="Squirrel 1" className="photo-gold-border" />
        <img src={squirrel2} alt="Squirrel 2" className="photo-gold-border" />
      </div>
      <div className="text-box-green-pair">
        <p>If you can't tell, I'm a huge fan of squirrels. That cute guy on the left is named Scrat (after the squirrel from Ice Age) and was nice enough to bite my finger in Albuquerque on a Club Gymnastics trip.
        </p>
      </div>
    </div>

  );
};

export default AboutMe;
