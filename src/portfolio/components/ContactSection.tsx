const ContactSection = () => {
  return (
    <section id="contact" className="pt-16">
      <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-8">
        Contact
      </h2>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <a href="mailto:tyfriedman@pm.me" className="text-neutral-600 hover:text-neutral-900 transition-colors">
          tyfriedman@pm.me
        </a>
        <a href="https://linkedin.com/in/ty-friedman" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-neutral-900 transition-colors">
          LinkedIn
        </a>
        <span className="text-neutral-500">(509) 818-5940</span>
      </div>
    </section>
  );
};

export default ContactSection;
