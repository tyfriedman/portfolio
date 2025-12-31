const AcademicSection = () => {
  return (
    <section id="academic" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Academic History</h2>
        <div className="space-y-8">
          <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">University of Notre Dame</h3>
                <p className="text-lg text-gray-600">Bachelor of Science in Computer Science</p>
                <p className="text-md text-gray-500">Minor: Engineering Corporate Practice</p>
              </div>
              <span className="text-blue-600 font-medium">May 2026</span>
            </div>
            <p className="text-gray-700 mb-4">
              Relevant coursework: Data Structures, Algorithms, Operating Systems, Databases, AI, Data Science, Web Development
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">GPA: 3.9/4.0</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Notre Dame, IN</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcademicSection;
