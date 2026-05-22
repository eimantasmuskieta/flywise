import { useEffect, useState } from 'react';
import { Heart, MapPin, Calendar, Users, Trash2 } from 'lucide-react';

interface SavedTrip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget: number;
  created_at: string;
}

interface SavedTripsProps {
  trips: SavedTrip[];
  user: { id: number; name: string; email: string } | null;
  onDeleteTrip: (id: string) => void;
  onViewTrip: (trip: SavedTrip) => void;
}

export function SavedTrips({ user, onDeleteTrip, onViewTrip }: SavedTripsProps) {
  const [dbTrips, setDbTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setDbTrips([]);
      return;
    }

    fetch(`/api/trips/${user.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch trips: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setDbTrips(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.log(err));
  }, [user?.id]);

  if (!user?.id) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <Heart className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Sign in to view saved trips</h2>
            <p className="text-gray-600">Saved trips are available only for your logged-in account.</p>
          </div>
        </div>
      </div>
    );
  }

  if (dbTrips.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <Heart className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h2 className="mb-4 text-gray-900">No Saved Trips Yet</h2>
            <p className="text-gray-600 mb-8">
              Start planning your dream vacation and save your favorite itineraries to access them anytime!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ❤️ Your Saved Trips
          </h1>

          <p className="text-gray-600">
            You have {dbTrips.length} saved {dbTrips.length === 1 ? 'trip' : 'trips'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dbTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-purple-100"
            >
              <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-6 text-white">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl">{trip.destination}</h3>

                  <button
                    onClick={() => onDeleteTrip(trip.id)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-white/80 text-sm">
                  Saved {new Date(trip.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-purple-500" />

                  <span className="text-sm">
                    {new Date(trip.start_date).toLocaleDateString()} -
                    {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-purple-500" />

                  <span className="text-sm">
                    {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-purple-500" />

                  <span className="text-sm">
                    ${trip.budget?.toLocaleString()} budget
                  </span>
                </div>

                <button
                  onClick={() => onViewTrip(trip)}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  View Itinerary
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
