import Navigation from '@/portfolio/components/Navigation';
import AcademicSection from '@/portfolio/components/AcademicSection';
import ExperienceSection from '@/portfolio/components/ExperienceSection';
import ContactSection from '@/portfolio/components/ContactSection';

export default function Portfolio() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">
        <header className="mb-20">
          <h1 className="text-3xl font-medium tracking-tight text-neutral-900">
            Ty Friedman
          </h1>
          <p className="mt-3 text-neutral-600 leading-relaxed">
            Software Engineer - Visa - Value Added Services - Risk and Identity Services Team
          </p>
        </header>
        <AcademicSection />
        <ExperienceSection />
        <ContactSection />
      </main>
    </div>
  );
}
