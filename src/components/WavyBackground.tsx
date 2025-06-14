
export function WavyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-warm-orange-50 via-pastel-green-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
      
      {/* Animated waves */}
      <svg
        className="absolute bottom-0 left-0 w-full h-64 opacity-30"
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
      >
        <path
          fill="url(#wave-gradient)"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,133.3C672,139,768,181,864,197.3C960,213,1056,203,1152,181.3C1200,160,1248,128,1296,128C1344,128,1392,160,1440,181.3L1488,203L1488,320L1440,320C1392,320,1344,320,1296,320C1248,320,1200,320,1152,320C1104,320,1056,320,1008,320C960,320,912,320,864,320C816,320,768,320,720,320C672,320,624,320,576,320C528,320,480,320,432,320C384,320,336,320,288,320C240,320,192,320,144,320C96,320,48,320,24,320L0,320Z"
          className="animate-pulse"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;50 0;0 0"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#84cc16" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-warm-orange-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
