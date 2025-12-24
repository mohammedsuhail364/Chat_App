import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const Home = () => {
  const navigate = useNavigate();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      navigate("/chat", { replace: true });
    }
  }, [userInfo, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-glow delay-500"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid"></div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          {/* APP BADGE */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 px-4 py-2 rounded-full text-sm text-purple-300 hover:bg-purple-500/20 transition-all duration-300 hover:scale-105 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Real-time secure messaging
            </div>
          </div>

          {/* MAIN HEADING */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="block bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent animate-gradient">
                Chat without
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                friction
              </span>
            </h1>
          </div>

          {/* SUBTEXT */}
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Fast, minimal, and secure chat built for people who hate clutter.
            <br />
            <span className="text-purple-400 font-medium">No noise. Just conversations.</span>
          </p>

          {/* CTA */}
          <div className="pt-4">
            <button
              onClick={() => navigate("/auth")}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#8417ff] to-[#bd00ff] hover:from-[#741bda] hover:to-[#a100d8] px-10 py-5 rounded-xl text-lg font-semibold transition-all duration-300 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 hover:-translate-y-1"
            >
              <span>Get Started</span>
              <svg 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/50 to-pink-600/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>
          </div>

          {/* FEATURES */}
          <div className="pt-8 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No ads</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No distractions</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="pt-12 flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-purple-300 animate-bounce delay-200"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .bg-grid {
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default Home;