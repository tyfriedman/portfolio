import TypewriterText from '@/portfolio/components/TypewriterText';
import Image from 'next/image';

const HeroSection = () => {
  const typewriterWords = [
    'computer scientist',
    'aspiring runner', 
    'data fanatic',
    'travel enthusiast',
    'curious student',
    'pizza connoisseur',
    'tech junkie',
    'washed-up gymnast',
    'nature lover'
  ];

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Photo Section */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-lg">
              <Image
                src="/photos/me.jpg"
                alt="Ty Friedman"
                width={224}
                height={224}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Text Section */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Ty Friedman
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 min-h-[2.5rem] flex items-center justify-center md:justify-start">
              <TypewriterText words={typewriterWords} />
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="#contact"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get In Touch
              </a>
              <a
                href="#projects"
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                View Projects
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
