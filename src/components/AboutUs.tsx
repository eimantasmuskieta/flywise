import { Plane, Sparkles, Globe, Clock } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About FlyWise
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your intelligent companion for creating perfect travel itineraries with the power of artificial intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="mb-3 text-gray-900">AI-Powered Planning</h3>
            <p className="text-gray-600">
              Our advanced AI algorithms analyze millions of travel data points to create personalized itineraries that match your preferences, budget, and interests perfectly.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Plane className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="mb-3 text-gray-900">Best Flight Deals</h3>
            <p className="text-gray-600">
              We compare thousands of flight options in real-time to find you the best deals that fit your schedule and budget, saving you time and money.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="mb-3 text-gray-900">Global Coverage</h3>
            <p className="text-gray-600">
              Access travel options to destinations worldwide, from popular tourist spots to hidden gems, with local insights and recommendations for authentic experiences.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="mb-3 text-gray-900">Save Time</h3>
            <p className="text-gray-600">
              Skip hours of research and planning. Our AI creates comprehensive itineraries in seconds, giving you more time to look forward to your trip.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="mb-6 text-gray-900">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            At FlyWise, we believe that everyone deserves to experience the joy of travel without the stress of planning. Our mission is to democratize travel planning by making it accessible, affordable, and enjoyable for everyone.
          </p>
          <p className="text-gray-600 mb-4">
            Founded by travel enthusiasts and AI experts, we've combined our passion for exploration with cutting-edge technology to create a platform that understands your unique travel style and crafts experiences that match your dreams.
          </p>
          <p className="text-gray-600">
            Whether you're a solo adventurer, a couple seeking romance, a family planning a vacation, or a group of friends ready for an adventure, our AI adapts to your needs and creates the perfect journey for you.
          </p>
        </div>
      </div>
    </div>
  );
}
