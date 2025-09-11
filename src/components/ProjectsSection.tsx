const ProjectsSection = () => {
  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Featured Projects</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Memory Forensics Tool</h3>
            <p className="text-gray-600 mb-4">
              Developed a Go-based tool for Volexity&apos;s proprietary memory forensics product to enable verification 
              of executable files on Windows file systems by extracting code signatures and X.509 certificates.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Go</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Windows API</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">X.509 Certificates</span>
            </div>
            <div className="flex space-x-4">
              <span className="text-gray-500 font-medium">Proprietary Project</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Automated Donation Intake System</h3>
            <p className="text-gray-600 mb-4">
              Full-stack application using ASP.NET Core and OpenAI APIs to automate routine intake tasks, 
              increasing efficiency by 200% for Swedemom Center of Giving.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">ASP.NET Core</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">C#</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">SQL</span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">OpenAI API</span>
            </div>
            <div className="flex space-x-4">
              <span className="text-gray-500 font-medium">Internal Tool</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Cleveland Guardians Social Media Analytics</h3>
            <p className="text-gray-600 mb-4">
              Data analysis project for Data Club using web scraping, API endpoints, and data parsing to develop 
              social media recommendations for increased engagement.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Python</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Web Scraping</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Data Analysis</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">API Integration</span>
            </div>
            <div className="flex space-x-4">
              <span className="text-gray-500 font-medium">Data Club Project</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Unity Gardens Data Management System</h3>
            <p className="text-gray-600 mb-4">
              Led a team of 5 in developing a data entry and backend storage system for volunteer data, 
              event data, and grant application information for local non-profit Unity Gardens.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Full-Stack</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Database Design</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Team Leadership</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">CS4Good</span>
            </div>
            <div className="flex space-x-4">
              <span className="text-gray-500 font-medium">Community Service</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
