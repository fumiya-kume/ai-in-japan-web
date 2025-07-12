export function CursorIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.64 2.27L4.64 11.27C4.25 11.66 4.25 12.29 4.64 12.68L11.32 19.36C11.71 19.75 12.34 19.75 12.73 19.36L21.73 10.36C22.12 9.97 22.12 9.34 21.73 8.95L15.05 2.27C14.66 1.88 14.03 1.88 13.64 2.27ZM14.35 4.39L19.61 9.65L12.02 17.24L6.76 11.98L14.35 4.39Z" />
    </svg>
  );
}