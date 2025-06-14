
export function WavyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-warm-orange-50 via-pastel-green-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
      
      {/* Animated waves */}
      <svg
        className="absolute bottom-0 left-0 w-full h-64 opacity-30"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#84cc16" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient-1)"
          d="M0,160L48,181.3C96,203,192,245,288,250.7C384,256,480,224,576,192C672,160,768,128,864,133.3C960,139,1056,181,1152,192C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -50 0; 0 0"
            dur="12s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full h-80 opacity-20"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
           <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#84cc16" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient-2)"
          d="M0,224L48,208C96,192,192,160,288,170.7C384,181,480,235,576,229.3C672,224,768,160,864,149.3C960,139,1056,181,1152,202.7C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
           <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 50 0; 0 0"
            dur="15s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-warm-orange-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
