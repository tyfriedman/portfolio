export default function ContactLinks({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-x-6 gap-y-2 text-sm ${className}`}>
      <a
        href="mailto:tymfriedman@gmail.com"
        className="text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        tymfriedman@gmail.com
      </a>
      <a
        href="https://linkedin.com/in/ty-friedman"
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        LinkedIn
      </a>
    </div>
  );
}
