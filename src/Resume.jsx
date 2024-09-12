import React from 'react';
import './Resume.css';

const Resume = () => {
  return (
    <div className="resume-container">
      <div className="resume">
        <section>
          <h1>Ty Friedman</h1>
          <p>(509) 818-5940 | <a href="mailto:tyfriedman@pm.me">tyfriedman@pm.me</a> | <a href="https://linkedin.com/in/ty-friedman/" target="_blank" rel="noreferrer">LinkedIn</a> | <a href="https://tyfriedman.me" target="_blank" rel="noreferrer">tyfriedman.me</a></p>
        </section>

        <section>
          <h3>Education</h3>
          <p><strong>University of Notre Dame</strong> | Notre Dame, IN | May 2026</p>
          <p>Bachelor of Science | GPA: 3.9</p>
          <p>Major: Computer Science | Minor: Engineering Corporate Practice</p>
          <p>Relevant Coursework: Data Structures, Systems Programming, Logic Design, Fundamentals of Computing, Discrete Math</p>
        </section>

        <section>
          <h3>Experience</h3>
          <h4><a href="https://www.swedemom.com/" target="_blank" rel="noreferrer">Swedemom Center of Giving</a> | McMinnville, OR | May 2024 – August 2024</h4>
          <p>Full-Stack Software Engineering Intern</p>
          <ul>
            <li>Utilized ASP.NET Core, JavaScript, HTML, and CSS to develop intuitive front-end applications that streamlined business operations, that allowed less-experienced employees to perform tasks traditionally handled by more skilled staff.</li>
            <li>Implemented internal tools with C#, SQL, and OpenAI Assistant APIs to automate routine intake tasks such as title and description generation that increased efficiency of donation intake by 200%..</li>
            <li>Designed and established quicker methods of revising posted items for increased SEO that led to an increase in July sales to holiday season levels and greatly increased site traffic.</li>
            <li>Revamped, implemented, and tested new methods of estimating optimized pricing for products to be sold on eBay to increase accuracy and quality of posted items and speed up automated revision of old item posts.</li>
          </ul>

          <h4>First-Year Engineering Program | Notre Dame, IN | August 2023 – Present</h4>
          <p>Engineering Computing TA</p>
          <ul>
            <li>Collaborated with a group of 23 other TAs to instruct and assist first-year engineering students in Engineering Computing and Design classes by assisting in lecture, holding office hours, and providing mentorship throughout the year.</li>
            <li>Enhanced and streamlined the grading process by developing automated programs in MATLAB Grader.</li>
          </ul>

          <h4>Indian Canyon Golf Course | Spokane, WA | May 2023 – August 2024</h4>
          <p>Greenskeeper</p>
          <ul>
            <li>Worked with a team of 12 others to carry out routine course maintenance and improve course conditions.</li>
            <li>Assisted with a large variety of tasks including irrigation system repairs, fertilizer applications, and large-scale turf repair.</li>
          </ul>
        </section>

        <section>
          <h3>Leadership & Organizations</h3>
          <h4>Data Club of Notre Dame | Notre Dame, IN | January 2024 – Present</h4>
          <p>Director of Projects | Cleveland Guardians Project Leader</p>
          <ul>
            <li>Led a team of 6 people in a project with the Cleveland Guardians social media team to analyze social media post data.</li>
            <li>Used web scraping, data collection from API endpoints, data parsing, and data analysis to develop social media recommendations to increase engagement and expand audience.</li>
          </ul>
          
          <h4>Engineering Leadership Council | Notre Dame, IN | September 2022 – May 2023</h4>
          <p>Community Outreach Team Lead</p>
          <ul>
            <li>Arranged community outreach and volunteering events in collaboration with the Boys and Girls Club of St. Joseph County.</li>
            <li>Oversaw STEM demonstrations and participation events to stimulate interest among children in the Boys and Girls Club.</li>
          </ul>
        </section>

        <section>
          <h3>Projects</h3>
          <h4>Personal Website | <a href="https://tyfriedman.me" target="_blank" rel="noreferrer">tyfriedman.me</a> | 2024</h4>
          <ul>
            <li>Gained experience with ReactJS, CSS, and HTML front-end applications to showcase personal and professional interests.</li>
          </ul>

          <h4>Image Downloader | <a href="https://github.com/tyfriedman/getImages" target="_blank" rel="noreferrer">GitHub</a> | 2023</h4>
          <ul>
            <li>Developed a multithreaded web crawler using Python to download and save specified file types (e.g., images, audio, PDFs) from web pages in parallel, optimizing performance with concurrency.</li>
          </ul>
        </section>

        <section>
          <h3>Technical Skills, Interests, & Other</h3>
          <p><strong>Technical:</strong> Python, JavaScript, HTML, CSS, SQL, C#, C, GitHub, Unix, CAD, Excel</p>
          <p><strong>Interests:</strong> Gymnastics, Skiing, Cooking, Golf, Waterskiing, Music, Running, Photography, Hiking</p>
        </section>
      </div>
    </div>
  );
};

export default Resume;

