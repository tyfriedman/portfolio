export default function CookieIcon({
  className = "",
  size = 96,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Cookie body with a bite taken out of the top right */}
      <path
        d="M50 6
           C 62 6, 72 11, 79 19
           C 73 24, 72 33, 78 39
           C 84 45, 93 45, 97 40
           C 96 68, 76 94, 50 94
           C 26 94, 6 74, 6 50
           C 6 26, 26 6, 50 6 Z"
        fill="#d9a05b"
        stroke="#b57d3f"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Chocolate chips */}
      <ellipse cx="34" cy="34" rx="6" ry="5" fill="#5a3a22" transform="rotate(-20 34 34)" />
      <ellipse cx="60" cy="52" rx="6.5" ry="5" fill="#5a3a22" transform="rotate(15 60 52)" />
      <ellipse cx="38" cy="64" rx="5.5" ry="4.5" fill="#5a3a22" transform="rotate(30 38 64)" />
      <ellipse cx="66" cy="76" rx="5" ry="4" fill="#5a3a22" transform="rotate(-10 66 76)" />
      <ellipse cx="24" cy="50" rx="4" ry="3.5" fill="#5a3a22" transform="rotate(10 24 50)" />
      <ellipse cx="50" cy="26" rx="4" ry="3.5" fill="#5a3a22" transform="rotate(-35 50 26)" />
      {/* Crumbs near the bite */}
      <circle cx="90" cy="24" r="2" fill="#d9a05b" stroke="#b57d3f" strokeWidth="1" />
      <circle cx="84" cy="14" r="1.5" fill="#d9a05b" stroke="#b57d3f" strokeWidth="1" />
    </svg>
  );
}
