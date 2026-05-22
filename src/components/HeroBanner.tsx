import { Sparkles, MapPin, Calendar, Plane, MessageCircle, CreditCard } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroBannerProps {
  onStartPlanning: (mode: 'chat' | 'form') => void;
}

export function HeroBanner({ onStartPlanning }: HeroBannerProps) {
  return (
    <div className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1715526239919-af51497b77e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhaXJwbGFuZSUyMHNreXxlbnwxfHx8fDE3NjIzNTQzNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Travel background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 via-fuchsia-600/85 to-cyan-500/80"></div>
      </div>

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Floating elements animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <Plane className="w-12 h-12 text-yellow-300/40" />
        </div>
        <div className="absolute bottom-32 right-20 animate-float-delayed">
          <MapPin className="w-10 h-10 text-pink-300/40" />
        </div>
        <div className="absolute top-40 right-32 animate-float">
          <Calendar className="w-8 h-8 text-cyan-300/40" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float-delayed">
          <Sparkles className="w-10 h-10 text-purple-300/40" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20 shadow-lg">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span className="text-white">✨ Powered by Advanced AI Technology</span>
        </div>

        <h1 className="text-white mb-6 max-w-4xl mx-auto leading-tight text-5xl md:text-6xl lg:text-7xl">
          Your Dream Vacation
          <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
            Starts Here
          </span>
        </h1>
        
        <p className="text-white/95 mb-4 max-w-2xl mx-auto text-lg md:text-xl">
          Let our AI craft the perfect itinerary for you. From finding the best flights to creating day-by-day plans, we handle everything so you can focus on making memories.
        </p>

        <p className="text-white/90 mb-10 max-w-xl mx-auto text-lg">
          🚀 Choose your preferred way to start:
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-6">
          <button
            onClick={() => onStartPlanning('chat')}
            className="group relative px-10 py-6 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white rounded-3xl hover:shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-4 min-w-[300px] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="relative text-left">
              <div className="flex items-center gap-2 text-lg">
                <span>💬 Chat with AI</span>
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-white/90 text-sm">Quick & conversational</span>
            </div>
          </button>
          
          <button
            onClick={() => onStartPlanning('form')}
            className="group relative px-10 py-6 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white rounded-3xl hover:shadow-2xl hover:shadow-pink-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-4 min-w-[300px] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="relative text-left">
              <div className="flex items-center gap-2 text-lg">
                <span>📝 Fill Out Form</span>
              </div>
              <span className="text-white/90 text-sm">Detailed & structured</span>
            </div>
          </button>
        </div>

        <p className="text-white/70 mb-16 text-sm">
          Both options use AI to create personalized itineraries for you ✨
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 to-purple-600/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all hover:transform hover:scale-105 duration-300">
              <p className="text-white mb-2 text-4xl">🎉 500K+</p>
              <p className="text-white/90 text-lg">Happy Travelers</p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all hover:transform hover:scale-105 duration-300">
              <p className="text-white mb-2 text-4xl">🌍 195+</p>
              <p className="text-white/90 text-lg">Countries Covered</p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-orange-600/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all hover:transform hover:scale-105 duration-300">
              <p className="text-white mb-2 text-4xl">⚡ 24/7</p>
              <p className="text-white/90 text-lg">AI Assistance</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(-5deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes pulse-slower {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.15);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 10s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
