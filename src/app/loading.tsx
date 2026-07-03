export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9 animate-pulse">
          <rect width="32" height="32" rx="7" fill="#FF4200" />
          <path
            d="M10 13 C10 9.5 13 7.5 16 7.5 C19 7.5 22 9.5 22 13"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="7" y="13" width="18" height="12" rx="2.5" fill="white" />
          <path
            d="M13 21 L16 15.5 L19 21 M14 19 H18"
            stroke="#FF4200"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="w-32 h-1 bg-line rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-brand rounded-full animate-[loadingbar_1.2s_ease-in-out_infinite]" />
      </div>
      <style>{`
        @keyframes loadingbar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
