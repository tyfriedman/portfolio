const ExperienceSection = () => {
  return (
    <section id="experience" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12 md:mb-16">Professional Experience</h2>
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 sm:mb-4 gap-2 md:gap-0">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Software Engineering Intern</h3>
                <p className="text-base sm:text-lg text-gray-600">Volexity | Silver Spring, MD</p>
              </div>
              <span className="text-blue-600 font-medium text-sm sm:text-base">May 2025 – August 2025</span>
            </div>
            <ul className="text-sm sm:text-base text-gray-700 space-y-2 leading-relaxed">
              <li>• Designed and implemented a tool in Go for proprietary memory forensics product to enable verification of executable files on Windows file systems</li>
              <li>• Developed new features for production software in Go and Python supporting Fortune 500 customer requirements</li>
              <li>• Contributed to backend services with database consistency enforcement mechanisms and command line tool improvements</li>
              <li>• Performed memory forensics on AWS EC2 instances and laptops using proprietary and open-source tools</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 sm:mb-4 gap-2 md:gap-0">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Full-Stack Software Engineering Intern</h3>
                <p className="text-base sm:text-lg text-gray-600">Swedemom Center of Giving | McMinnville, OR</p>
              </div>
              <span className="text-blue-600 font-medium text-sm sm:text-base">May 2024 – April 2025</span>
            </div>
            <ul className="text-sm sm:text-base text-gray-700 space-y-2 leading-relaxed">
              <li>• Developed intuitive front-end applications using ASP.NET Core, JavaScript, HTML, and CSS to streamline business operations</li>
              <li>• Implemented internal tools with C#, SQL, and OpenAI Assistant APIs to automate routine intake tasks, increasing efficiency by 200%</li>
              <li>• Designed methods for revising posted items for increased SEO, leading to July sales reaching holiday season levels</li>
              <li>• Revamped pricing estimation methods for eBay products to increase accuracy and speed up automated revision processes</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 sm:mb-4 gap-2 md:gap-0">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Engineering Computing TA</h3>
                <p className="text-base sm:text-lg text-gray-600">First-Year Engineering Program | Notre Dame, IN</p>
              </div>
              <span className="text-blue-600 font-medium text-sm sm:text-base">August 2023 – Present</span>
            </div>
            <ul className="text-sm sm:text-base text-gray-700 space-y-2 leading-relaxed">
              <li>• Collaborated with 24 other TAs to instruct and assist first-year engineering students in Engineering Computing and Design classes</li>
              <li>• Conducted office hours and provided mentorship throughout the academic year</li>
              <li>• Enhanced grading process by developing automated programs in MATLAB Grader</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
