import { MapPin, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function PopularDestinations() {
  const destinations = [
    {
      name: 'Bali, Indonesia',
      description: 'Tropical paradise with stunning beaches',
      rating: 4.9,
      reviews: '12.5K',
      price: 'from $899',
      image: 'https://images.unsplash.com/photo-1739315014260-b581f8fdfa7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHZhY2F0aW9uJTIwZGVzdGluYXRpb258ZW58MXx8fHwxNzYyMzU0MzYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      name: 'Swiss Alps',
      description: 'Majestic mountains and pristine lakes',
      rating: 4.8,
      reviews: '8.3K',
      price: 'from $1,299',
      image: 'https://images.unsplash.com/photo-1548932134-3d7d765bece2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGFkdmVudHVyZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjIzNDY3Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      name: 'Tokyo, Japan',
      description: 'Modern culture meets ancient traditions',
      rating: 4.9,
      reviews: '15.2K',
      price: 'from $999',
      image: 'https://images.unsplash.com/photo-1715526239919-af51497b77e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhaXJwbGFuZSUyMHNreXxlbnwxfHx8fDE3NjIzNTQzNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 px-6 py-3 rounded-full mb-6 shadow-lg border border-cyan-200">
            <MapPin className="w-5 h-5 text-cyan-600 animate-pulse" />
            <span className="text-cyan-700">🔥 Trending Now</span>
          </div>
          <h2 className="mb-6 text-gray-900">Popular Destinations</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover the most sought-after travel destinations loved by our community of travelers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((destination, idx) => (
            <button
              key={idx}
              className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-2 border-transparent hover:border-cyan-200 text-left"
            >
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white mb-1">{destination.name}</h3>
                  <p className="text-white/90">{destination.description}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-900">{destination.rating}</span>
                    <span className="text-gray-500">({destination.reviews})</span>
                  </div>
                  <span className="text-purple-600">{destination.price}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
