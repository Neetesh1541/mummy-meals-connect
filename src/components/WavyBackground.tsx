
export function WavyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Enhanced animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-warm-orange-50 via-pastel-green-50 to-cream-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
      
      {/* Multi-layered animated waves with enhanced movement */}
      <svg
        className="absolute bottom-0 left-0 w-full h-80 opacity-40"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6">
              <animate attributeName="stop-color" values="#fb923c;#22c55e;#3b82f6;#fb923c" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.5">
              <animate attributeName="stop-color" values="#22c55e;#3b82f6;#fb923c;#22c55e" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6">
              <animate attributeName="stop-color" values="#3b82f6;#fb923c;#22c55e;#3b82f6" dur="8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          fill="url(#wave-gradient-1)"
          filter="url(#glow)"
          d="M0,224L48,218.7C96,213,192,203,288,186.7C384,171,480,149,576,165.3C672,181,768,235,864,240C960,245,1056,203,1152,181.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 50 -30; -25 15; 0 0"
            dur="12s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      <svg
        className="absolute bottom-0 left-0 w-full h-96 opacity-30"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.7">
              <animate attributeName="stop-color" values="#86efac;#fbbf24;#f472b6;#86efac" dur="10s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.5">
              <animate attributeName="stop-color" values="#fbbf24;#f472b6;#86efac;#fbbf24" dur="10s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.7">
              <animate attributeName="stop-color" values="#f472b6;#86efac;#fbbf24;#f472b6" dur="10s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient-2)"
          d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,218.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-60 0; 60 35; -30 -20; -60 0"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      <svg
        className="absolute bottom-0 left-0 w-full h-72 opacity-25"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.8">
              <animate attributeName="stop-color" values="#fef9c3;#ddd6fe;#fed7aa;#fef9c3" dur="14s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.6">
              <animate attributeName="stop-color" values="#fed7aa;#fef9c3;#ddd6fe;#fed7aa" dur="14s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient-3)"
          d="M0,192L40,181.3C80,171,160,149,240,149.3C320,149,400,171,480,197.3C560,224,640,256,720,250.7C800,245,880,203,960,186.7C1040,171,1120,181,1200,197.3C1280,213,1360,235,1400,245.3L1440,256L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="80 0; -80 0; 40 25; 80 0"
            dur="20s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {/* Additional flowing wave layer */}
      <svg
        className="absolute bottom-0 left-0 w-full h-64 opacity-20"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient-4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6">
              <animate attributeName="stop-color" values="#a78bfa;#34d399;#fbbf24;#a78bfa" dur="18s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.4">
              <animate attributeName="stop-color" values="#34d399;#fbbf24;#a78bfa;#34d399" dur="18s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient-4)"
          d="M0,256L60,234.7C120,213,240,171,360,165.3C480,160,600,192,720,208C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 30 40; -45 -15; 0 0"
            dur="22s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {/* Enhanced floating particles with varied animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-warm-orange-200 to-warm-orange-300 opacity-20 animate-float-complex"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 20}s`,
            }}
          />
        ))}
        
        {/* Medium particles */}
        {[...Array(40)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-pastel-green-200 to-pastel-green-400 opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${8 + Math.random() * 16}px`,
              height: `${8 + Math.random() * 16}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
            }}
          />
        ))}
        
        {/* Small sparkles */}
        {[...Array(80)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-cream-200 to-yellow-300 opacity-40 animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${4 + Math.random() * 8}s`,
            }}
          />
        ))}
        
        {/* Twinkling stars */}
        {[...Array(60)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${3 + Math.random() * 6}s`,
            }}
          />
        ))}
        
        {/* Floating geometric shapes */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`geo-${i}`}
            className="absolute opacity-10 animate-float-complex"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${15 + Math.random() * 25}px`,
              height: `${15 + Math.random() * 25}px`,
              backgroundColor: ['#fb923c', '#22c55e', '#3b82f6', '#a78bfa'][Math.floor(Math.random() * 4)],
              borderRadius: Math.random() > 0.5 ? '50%' : '20%',
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 30}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
