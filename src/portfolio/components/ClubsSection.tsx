const ClubsSection = () => {
  return (
    <section id="clubs" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Clubs & Organizations</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Data Club of Notre Dame</h3>
            <p className="text-gray-600 mb-4">President | January 2024 – Present</p>
            <p className="text-gray-700 text-sm">
              Lead a team of 6 board members to manage 300 members and 10 projects with industry partners. 
              Used web scraping, data collection from API endpoints, data parsing, and data analysis to develop 
              social media recommendations to increase engagement on the Cleveland Guardians social media.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-3">CS4Good</h3>
            <p className="text-gray-600 mb-4">Director of Projects | August 2024 – Present</p>
            <p className="text-gray-700 text-sm">
              Coordinated initiatives with 6 non-profit organizations in the South Bend community and 50+ project leads and members. 
              Led a team of 5 in working with local non-profit, Unity Gardens, to implement data entry and backend storage of 
              volunteer data, event data, and information for grant applications.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClubsSection;
