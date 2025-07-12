export function ClaudeCodeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4v8.82c0 4.34-2.88 8.36-7 9.68V11h-2v15.68c-4.12-1.32-7-5.34-7-9.68V8.18l8-4z" />
      <path d="M12 6L6 9v6c0 3.31 2.29 6.44 5 7.36V14h2v8.36c2.71-.92 5-4.05 5-7.36V9l-6-3z" />
    </svg>
  );
}