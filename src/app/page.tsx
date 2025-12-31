import Navigation from '@/portfolio/components/Navigation';
import HeroSection from '@/portfolio/components/HeroSection';
import AcademicSection from '@/portfolio/components/AcademicSection';
import ExperienceSection from '@/portfolio/components/ExperienceSection';
import ClubsSection from '@/portfolio/components/ClubsSection';
import ProjectsSection from '@/portfolio/components/ProjectsSection';
import ContactSection from '@/portfolio/components/ContactSection';

export default function Portfolio() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <AcademicSection />
      <ExperienceSection />
      <ClubsSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}
