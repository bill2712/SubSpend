export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      <rect width="32" height="32" rx="9" fill="#0f6a58" />
      <path d="M9 21.5a7 7 0 1 1 11.9 5" fill="none" stroke="#aeead5" strokeWidth="3" strokeLinecap="round" transform="translate(0 -4)" />
      <path d="M16 9v8l4.5 2.6" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
