// AboutMe.jsx

import React, { useRef, useEffect, useState } from 'react';
import './AboutMe.css';
import gym1 from './assets/gym1.jpeg';
import gym2 from './assets/gym2.jpeg';
import waterski from './assets/waterski.jpg';
import run1 from './assets/run1.jpeg';
import run2 from './assets/run2.jpeg';
import football from './assets/football.jpeg';
import pizza1 from './assets/pizza1.jpeg';
import pizza2 from './assets/pizza2.jpeg';
import course from './assets/course.jpeg';
import squirrel1 from './assets/squirrel1.jpeg';
import squirrel2 from './assets/squirrel2.jpeg';

const AboutMeSection = ({ images, caption }) => {
  const imagesRef = useRef(null);
  const captionRef = useRef(null);
  const [imagesVisible, setImagesVisible] = useState(false);
  const [captionVisible, setCaptionVisible] = useState(false);

  useEffect(() => {
    const options = {
      threshold: 0.15,
    };

    const imagesObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImagesVisible(true);
          imagesObserver.unobserve(entry.target);
        }
      });
    }, options);

    const captionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCaptionVisible(true);
          captionObserver.unobserve(entry.target);
        }
      });
    }, options);

    if (imagesRef.current) {
      imagesObserver.observe(imagesRef.current);
    }

    if (captionRef.current) {
      captionObserver.observe(captionRef.current);
    }

    return () => {
      if (imagesRef.current) imagesObserver.unobserve(imagesRef.current);
      if (captionRef.current) captionObserver.unobserve(captionRef.current);
    };
  }, []);

  return (
    <div className="about-me-section">
      <div
        className={`about-me-images ${
          imagesVisible ? 'slide-in-left' : ''
        }`}
        ref={imagesRef}
      >
        {images.map((image, index) => (
          <img
            src={image.src}
            alt={image.alt}
            className="about-me-photo"
            key={index}
          />
        ))}
      </div>
      <p
        className={`about-me-caption ${
          captionVisible ? 'slide-in-right' : ''
        }`}
        ref={captionRef}
      >
        {caption}
      </p>
    </div>
  );
};

const AboutMe = () => {
  return (
    <div className="about-me-page">
      <h1 className="about-me-heading">My Life Through Photos</h1>

      <div className="about-me-content">
        {/* Gymnastics Section */}
        <AboutMeSection
          images={[
            { src: gym1, alt: 'Gymnastics 1' },
            { src: gym2, alt: 'Gymnastics 2' },
          ]}
          caption="I've done gymnastics my entire life, and it is easily my favorite sport. I've spent countless hours in the gym, and now am on the Club Gymnastics Team at Notre Dame."
        />

        {/* Waterskiing Section */}
        <AboutMeSection
          images={[{ src: waterski, alt: 'Waterskiing' }]}
          caption="One of my favorite things about summer is being able to spend time waterskiing at our family cabin in Idaho. Plus, it is great practice for club waterski season!"
        />

        {/* Running Section */}
        <AboutMeSection
          images={[
            { src: run1, alt: 'Run 1' },
            { src: run2, alt: 'Run 2' },
          ]}
          caption="Running is one of my favorite ways to get outside and enjoy all of the parks and forests that I am surrounded by in the Pacific Northwest."
        />

        {/* Football Section */}
        <AboutMeSection
          images={[{ src: football, alt: 'Football' }]}
          caption="Believe it or not, I am not on the football team—just a dedicated fan whose happiness is decided by a team that I have no influence over."
        />

        {/* Pizza Section */}
        <AboutMeSection
          images={[
            { src: pizza1, alt: 'Pizza 1' },
            { src: pizza2, alt: 'Pizza 2' },
          ]}
          caption="I'm no chef, but I love making pizza. Pro tip: pickles are actually really good on pizza (also pineapple). Now, I am the manager for Zaland, which is the pizzeria in my dorm and sells dollar slices every night of the week."
        />

        {/* Golf Course Section */}
        <AboutMeSection
          images={[{ src: course, alt: 'Golf Course' }]}
          caption="I've been a greenskeeper at a local golf course over the past two summers, and nothing beats the sunrises over a beautiful course."
        />
      </div>
    </div>
  );
};

export default AboutMe;
