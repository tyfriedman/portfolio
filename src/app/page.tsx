import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import AcademicSection from '@/components/AcademicSection';
import ExperienceSection from '@/components/ExperienceSection';
import ClubsSection from '@/components/ClubsSection';
import ProjectsSection from '@/components/ProjectsSection';
import ContactSection from '@/components/ContactSection';

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
