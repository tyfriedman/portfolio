const ExperienceSection = () => {
  return (
    <section id="experience" className="py-16 border-b border-neutral-200">
      <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-8">
        Experience
      </h2>
      <div className="space-y-12">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
            <h3 className="text-neutral-900">Software Engineer</h3>
            <span className="text-sm text-neutral-400 shrink-0">Jun 2026 – Present</span>
          </div>
          <p className="text-sm text-neutral-500">Visa · Value Added Services · Risk and Identity Services Team · Austin, TX</p>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
            <h3 className="text-neutral-900">Software Engineering Intern</h3>
            <span className="text-sm text-neutral-400 shrink-0">May 2025 – Aug 2025</span>
          </div>
          <p className="text-sm text-neutral-500 mb-3">Volexity · Silver Spring, MD</p>
          <ul className="text-sm text-neutral-600 space-y-2 leading-relaxed">
            <li>Designed and implemented a tool in Go for proprietary memory forensics product to enable verification of executable files on Windows file systems</li>
            <li>Developed new features for production software in Go and Python supporting Fortune 500 customer requirements</li>
            <li>Contributed to backend services with database consistency enforcement mechanisms and command line tool improvements</li>
            <li>Performed memory forensics on AWS EC2 instances and laptops using proprietary and open-source tools</li>
          </ul>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
            <h3 className="text-neutral-900">Full-Stack Software Engineering Intern</h3>
            <span className="text-sm text-neutral-400 shrink-0">May 2024 – Apr 2025</span>
          </div>
          <p className="text-sm text-neutral-500 mb-3">Swedemom Center of Giving · McMinnville, OR</p>
          <ul className="text-sm text-neutral-600 space-y-2 leading-relaxed">
            <li>Developed intuitive front-end applications using ASP.NET Core, JavaScript, HTML, and CSS to streamline business operations</li>
            <li>Implemented internal tools with C#, SQL, and OpenAI Assistant APIs to automate routine intake tasks, increasing efficiency by 200%</li>
            <li>Designed methods for revising posted items for increased SEO, leading to July sales reaching holiday season levels</li>
            <li>Revamped pricing estimation methods for eBay products to increase accuracy and speed up automated revision processes</li>
          </ul>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
            <h3 className="text-neutral-900">Engineering Computing TA</h3>
            <span className="text-sm text-neutral-400 shrink-0">Aug 2023 – May 2026</span>
          </div>
          <p className="text-sm text-neutral-500 mb-3">First-Year Engineering Program · Notre Dame, IN</p>
          <ul className="text-sm text-neutral-600 space-y-2 leading-relaxed">
            <li>Collaborated with 24 other TAs to instruct and assist first-year engineering students in Engineering Computing and Design classes</li>
            <li>Conducted office hours and provided mentorship throughout the academic year</li>
            <li>Enhanced grading process by developing automated programs in MATLAB Grader</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
