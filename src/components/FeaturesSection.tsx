import { Sparkles, Shield, Clock, Globe, Zap, Heart } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      title: '✨ AI-Powered Itineraries',
      description: 'Our advanced AI creates personalized travel plans tailored to your preferences and budget.',
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: '⚡ Instant Results',
      description: 'Get comprehensive travel plans in seconds, not hours. Save time for what matters most.',
      gradient: 'from-yellow-400 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50'
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: '🌍 Global Destinations',
      description: 'Explore over 195 countries with curated recommendations and local insights.',
      gradient: 'from-blue-400 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: '🔒 Secure & Private',
      description: 'Your travel data is encrypted and protected with enterprise-grade security.',
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      title: '⏰ 24/7 Support',
      description: 'Chat with our AI assistant anytime, anywhere. Get help whenever you need it.',
      gradient: 'from-indigo-400 to-purple-500',
      bgGradient: 'from-indigo-50 to-purple-50'
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: '💝 Best Price Guarantee',
      description: 'We find the best deals on flights and hotels, ensuring you get maximum value.',
      gradient: 'from-red-400 to-pink-500',
      bgGradient: 'from-red-50 to-pink-50'
    }
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full mb-6 shadow-lg border border-purple-200">
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="text-purple-700">Why Choose Us</span>
          </div>
          <h2 className="mb-6 text-gray-900">Everything You Need in One Place</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Experience the future of travel planning with cutting-edge AI technology designed to make your journey unforgettable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-3xl p-8 border-2 border-transparent hover:border-purple-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
