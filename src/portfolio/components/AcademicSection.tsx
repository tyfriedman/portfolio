const AcademicSection = () => {
  return (
    <section id="academic" className="pb-16 border-b border-neutral-200">
      <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-8">
        Academic
      </h2>
      <div className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
          <h3 className="text-neutral-900">University of Notre Dame</h3>
          <span className="text-sm text-neutral-400 shrink-0">May 2026</span>
        </div>
        <p className="text-neutral-600">Bachelor of Science in Computer Science, Magna Cum Laude</p>
        <p className="text-sm text-neutral-500">Minor in Engineering Corporate Practice</p>
      </div>
      <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
        Relevant coursework: Data Structures, Algorithms, Operating Systems, Databases,
        AI, Data Science, Web Development
      </p>
      <p className="mt-3 text-sm text-neutral-500">
        GPA 3.9/4.0 · Notre Dame, IN
      </p>
    </section>
  );
};

export default AcademicSection;
