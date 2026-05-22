import { Sparkles, ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/30 shadow-xl">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span className="text-white">✨ Start Your Journey</span>
        </div>

        <h2 className="text-white mb-6">
          Ready to Plan Your Next Adventure?
        </h2>
        
        <p className="text-white/90 mb-8 max-w-2xl mx-auto">
          Join over 500,000 travelers who trust our AI to plan their perfect trips. Get started today and discover destinations you'll love.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-purple-600 rounded-full hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center gap-2 shadow-xl"
          >
            🚀 Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
