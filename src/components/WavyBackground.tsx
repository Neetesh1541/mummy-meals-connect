
export function WavyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 animated-soft-gradient"></div>
      
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
          d="M0,224L48,218.7C96,213,192,203,288,186.7C384,171,480,149,576,165.3C672,181,768,235,864,240C960,245,1056,203,1152,181.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 30 -15; 0 0"
            dur="20s"
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
          d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,218.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
           <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -40 20; 0 0"
            dur="28s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full h-96 opacity-10"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
           <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#f8b86d" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#86efac" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient-3)"
          d="M0,192L40,181.3C80,171,160,149,240,149.3C320,149,400,171,480,197.3C560,224,640,256,720,250.7C800,245,880,203,960,186.7C1040,171,1120,181,1200,197.3C1280,213,1360,235,1400,245.3L1440,256L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
        >
           <animateTransform
            attributeName="transform"
            type="translate"
            values="-60 0; 60 0; -60 0"
            dur="35s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full h-48 opacity-20"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient-4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient-4)"
          d="M0,256L60,234.7C120,213,240,171,360,165.3C480,160,600,192,720,208C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 10 20; 0 0"
            dur="22s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-warm-orange-300 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
        {[...Array(80)].map((_, i) => (
          <div
            key={`speck-${i}`}
            className="absolute w-1 h-1 bg-pastel-green-300 rounded-full opacity-40 animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${5 + Math.random() * 7}s`,
            }}
          />
        ))}
        {[...Array(30)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute w-3 h-3 bg-cream-300 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
