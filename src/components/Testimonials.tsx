import { Star, Quote, CheckCircle2, CalendarDays, MapPin } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah J.',
      location: 'New York, USA',
      rating: 4.8,
      trip: '7-day Italy city break',
      date: 'March 2026',
      text: 'The itinerary structure was excellent and easy to adjust. We swapped two activities and everything still flowed well. Hotel suggestions were solid for our budget.',
      helpful: 23
    },
    {
      name: 'Michael C.',
      location: 'Singapore',
      rating: 4.6,
      trip: 'Family trip to Tokyo and Kyoto',
      date: 'February 2026',
      text: 'Flight options were genuinely competitive compared to what I found manually. I would like more kid-focused restaurant picks, but route planning was very practical.',
      helpful: 17
    },
    {
      name: 'Emma R.',
      location: 'Barcelona, Spain',
      rating: 4.9,
      trip: 'Honeymoon in Bali',
      date: 'January 2026',
      text: 'I expected generic suggestions, but recommendations felt personalized. Beach schedule and spa timing were perfect. Only one transfer option was a bit tight.',
      helpful: 31
    }
  ];

  const averageRating = (
    testimonials.reduce((sum, review) => sum + review.rating, 0) / testimonials.length
  ).toFixed(1);

  const totalReviews = 1247;

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/90 px-5 py-3 rounded-full mb-6 shadow-md border border-purple-200">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-gray-800">{averageRating} average rating</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{totalReviews.toLocaleString()} verified reviews</span>
          </div>
          <h2 className="mb-6 text-gray-900">What Our Travelers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Real feedback from travelers who used FlyWise to compare flights and build practical itineraries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl px-10 py-7 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(testimonial.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified traveler</span>
              </div>

              <Quote className="w-8 h-8 text-purple-200 mb-3" />

              <p className="text-gray-700 mb-6 leading-relaxed">
                {testimonial.text}
              </p>

              <div className="space-y-2 mb-5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span>{testimonial.trip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-500" />
                  <span>{testimonial.date}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                </div>
                <p className="text-xs text-gray-500">{testimonial.helpful} found this helpful</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
