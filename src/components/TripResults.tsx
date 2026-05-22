import React, { useEffect, useState } from 'react';
import axios from "axios";

interface PlanApiData {
  reply: string;
  itinerary: string[];
}

interface TripResultsProps {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  planData: PlanApiData | null;
  onBack: () => void;
}

interface FlightCardData {
  type: "RETURN" | "OUTBOUND";
  airline: string;
  dateTime: string;
  price: string;
  raw: string;
}

interface StoredUser {
  id?: string | number;
  name?: string;
  email?: string;
}

export function TripResults({
  destination,
  startDate,
  endDate,
  travelers,
  budget,
  planData,
  onBack
}: TripResultsProps) {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  const readUserFromStorage = () => {
    try {
      const userRaw = localStorage.getItem("user");
      if (!userRaw) return null;

      const parsed = JSON.parse(userRaw);
      if (parsed && parsed.id) {
        return parsed;
      }

      return null;
    } catch (error) {
      console.error("Failed to read user from localStorage:", error);
      return null;
    }
  };

  useEffect(() => {
    const syncAuthState = () => {
      const user = readUserFromStorage();
      setCurrentUser(user);
    };

    syncAuthState();

    const handleFocus = () => {
      syncAuthState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncAuthState();
      }
    };

    const handleStorage = () => {
      syncAuthState();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const isLoggedIn = !!currentUser?.id;

  const saveTrip = async () => {
    try {
      const user = readUserFromStorage();

      if (!user || !user.id) {
        alert("Please login first");
        return;
      }

      const response = await axios.post("/api/trips/save", {
        user_id: user.id,
        destination,
        start_date: startDate,
        end_date: endDate,
        travelers,
        budget
      });

      if (response.status === 200 || response.status === 201) {
        alert("Trip saved!");
      } else {
        alert("Failed to save trip");
      }
    } catch (err: any) {
      console.log(err);

      if (err?.response?.status === 401) {
        alert("You must be logged in to save a trip.");
        return;
      }

      alert("Failed to save trip");
    }
  };

  const itineraryLines = planData?.itinerary || [];
  const replyText = planData?.reply || "No AI summary available.";

  const flightMatches = replyText.match(/\[(RETURN|OUTBOUND)\][^\n]+/g) || [];

  const flights: FlightCardData[] = flightMatches.map((line) => {
    const type = line.includes("[RETURN]") ? "RETURN" : "OUTBOUND";
    const cleanLine = line.replace(/^\[(RETURN|OUTBOUND)\]\s*/, "").trim();
    const parts = cleanLine.split(" - ").map(part => part.trim());

    return {
      type,
      airline: parts[0] || "Flight option",
      dateTime: parts[1] || "",
      price: parts[2]?.replace(/\s*EUR.*$/i, "").trim() || "",
      raw: cleanLine
    };
  });

  const extractNumericPrice = (price: string) => {
    const match = price.match(/(\d+)/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  };

  const lowestPrice = flights.length
    ? Math.min(...flights.map((flight) => extractNumericPrice(flight.price)))
    : null;

  const shortenAirlineName = (name: string) => {
    return name
      .replace(/\((.*?)\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getAirlineCode = (name: string) => {
    const shortName = shortenAirlineName(name).toUpperCase();

    if (shortName.includes("FINNAIR")) return "AY";
    if (shortName.includes("SCANDINAVIAN")) return "SK";
    if (shortName.includes("LOT")) return "LO";
    if (shortName.includes("RYANAIR")) return "FR";
    if (shortName.includes("WIZZ")) return "W6";

    return shortName.slice(0, 2) || "FL";
  };

  const getDestinationCode = (city: string) => {
    const value = city.trim().toLowerCase();

    if (value.includes("paris")) return "PAR";
    if (value.includes("rome")) return "CIA";
    if (value.includes("london")) return "LON";
    if (value.includes("barcelona")) return "BCN";
    if (value.includes("berlin")) return "BER";
    if (value.includes("milan")) return "MIL";
    if (value.includes("madrid")) return "MAD";
    if (value.includes("lisbon")) return "LIS";
    if (value.includes("amsterdam")) return "AMS";

    return city.slice(0, 3).toUpperCase();
  };

  const formatFlightDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const originCode = "VNO";
  const destinationCode = getDestinationCode(destination);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
          ← Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 overflow-visible">

          <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-bold mb-3">
                ✨ Travel Assistant
              </h1>

              <p className="text-gray-600 text-lg">
                Personalized AI travel itinerary and recommendations
              </p>
            </div>

            {isLoggedIn && (
              <button
                onClick={saveTrip}
                className="relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap self-start
                           h-12 px-6 min-w-[150px]
                           rounded-2xl
                           bg-gradient-to-r from-purple-500 to-pink-500
                           text-white text-base font-semibold leading-none
                           shadow-md
                           border border-white/20
                           hover:shadow-lg hover:-translate-y-0.5
                           active:translate-y-0 active:scale-[0.98]
                           transition-all duration-200"
              >
                <span>❤️</span>
                <span>Save Trip</span>
              </button>
            )}
          </div>

          {/* TRIP OVERVIEW */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-5 py-4">
              <div className="flex flex-col justify-center h-full gap-2">
                <div className="flex items-center gap-2 text-sm text-blue-500 font-medium">
                  <span>📍</span>
                  <span>Destination</span>
                </div>
                <div className="text-[18px] leading-5 font-semibold text-gray-900">
                  {destination}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-5 py-4">
              <div className="flex flex-col justify-center h-full gap-2">
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <span>📅</span>
                  <span>Dates</span>
                </div>
                <div className="text-[16px] leading-5 font-semibold text-gray-900">
                  {startDate} → {endDate}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white px-5 py-4">
              <div className="flex flex-col justify-center h-full gap-2">
                <div className="flex items-center gap-2 text-sm text-violet-500 font-medium">
                  <span>👥</span>
                  <span>Travelers</span>
                </div>
                <div className="text-[18px] leading-5 font-semibold text-gray-900">
                  {travelers} people
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white px-5 py-4">
              <div className="flex flex-col justify-center h-full gap-2">
                <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                  <span>💶</span>
                  <span>Budget</span>
                </div>
                <div className="text-[18px] leading-5 font-semibold text-gray-900">
                  EUR {budget.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* ITINERARY */}
          <div className="border border-cyan-200 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">
              🗓️ Itinerary Timeline
            </h2>

            <div className="space-y-5">
              {itineraryLines.length > 0 ? (
                itineraryLines.map((line, index) => {
                  const match = line.match(/^Day\s+\d+/i);
                  const dayLabel = match ? match[0] : `Day ${index + 1}`;
                  const description = line.replace(dayLabel, '').trim();

                  return (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full min-w-[90px] text-center font-semibold">
                        {dayLabel}
                      </div>
                      <div className="text-gray-700 text-lg leading-relaxed">
                        {description || line}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500">
                  No itinerary data found
                </div>
              )}
            </div>
          </div>

          {/* FLIGHTS */}
          {flights.length > 0 && (
            <div className="border border-gray-300 rounded-2xl p-4 mb-8 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <span>✈️</span>
                  <span>Flights</span>
                </h2>

                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200">
                  🔥 Best prices selected
                </div>
              </div>

              <div className="space-y-2">
                {flights.map((flight, index) => {
                  const numericPrice = extractNumericPrice(flight.price);
                  const isBestPrice = lowestPrice !== null && numericPrice === lowestPrice;
                  const shortAirline = shortenAirlineName(flight.airline);
                  const airlineCode = getAirlineCode(flight.airline);
                  const fromCode = flight.type === "OUTBOUND" ? originCode : destinationCode;
                  const toCode = flight.type === "OUTBOUND" ? destinationCode : originCode;

                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2"
                    >
                      <div className="hidden lg:grid lg:grid-cols-[280px_1fr_130px] lg:items-center lg:gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {airlineCode}
                          </div>

                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-gray-900 truncate">
                              {shortAirline}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {airlineCode} {index + 101}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 min-w-0">
                          <div className="text-center min-w-[60px]">
                            <div className="text-base font-bold text-gray-900 leading-none">
                              {fromCode}
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center flex-1 max-w-[220px]">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1 ${
                                flight.type === "OUTBOUND"
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {flight.type === "OUTBOUND" ? "Outbound" : "Return"}
                            </span>

                            <div className="flex items-center w-full">
                              <div className="h-px bg-gray-300 flex-1" />
                              <div className="px-2 text-gray-400 text-xs">✈</div>
                              <div className="h-px bg-gray-300 flex-1" />
                            </div>

                            <div className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">
                              {formatFlightDate(flight.dateTime)}
                            </div>
                          </div>

                          <div className="text-center min-w-[60px]">
                            <div className="text-base font-bold text-gray-900 leading-none">
                              {toCode}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-600 leading-none">
                            {flight.price || "—"}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            per person
                          </div>

                          {isBestPrice && (
                            <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                              🔥 Best
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="lg:hidden space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {airlineCode}
                          </div>

                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-gray-900 truncate">
                              {shortAirline}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {airlineCode} {index + 101}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="text-center min-w-[56px]">
                            <div className="text-base font-bold text-gray-900">{fromCode}</div>
                          </div>

                          <div className="flex-1 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1 ${
                                flight.type === "OUTBOUND"
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {flight.type === "OUTBOUND" ? "Outbound" : "Return"}
                            </span>

                            <div className="flex items-center">
                              <div className="h-px bg-gray-300 flex-1" />
                              <div className="px-2 text-gray-400 text-xs">✈</div>
                              <div className="h-px bg-gray-300 flex-1" />
                            </div>

                            <div className="text-[10px] text-gray-500 mt-1">
                              {formatFlightDate(flight.dateTime)}
                            </div>
                          </div>

                          <div className="text-center min-w-[56px]">
                            <div className="text-base font-bold text-gray-900">{toCode}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-emerald-600 leading-none">
                              {flight.price || "—"}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              per person
                            </div>
                          </div>

                          {isBestPrice && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                              🔥 Best
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EXTRA INFO */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  ✈️ Flight Recommendation
                </h3>
                <span className="text-2xl font-bold text-purple-600">
                  From €320
                </span>
              </div>

              <p className="text-gray-600 leading-7">
                Best flights are usually available 1-2 months before departure.
                Morning departures are often cheaper and have fewer delays.
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">🏨 Accommodation</h3>
              <p className="text-gray-600 leading-7">
                Staying near the city center gives easier access to attractions,
                restaurants, and transportation.
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">🍽️ Food Suggestions</h3>
              <p className="text-gray-600 leading-7">
                Explore authentic restaurants, cafés, local bakeries and
                traditional dishes popular in {destination}.
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">🌤️ Weather Tips</h3>
              <p className="text-gray-600 leading-7">
                Prepare comfortable clothes, walking shoes and always check
                weather forecasts before departure.
              </p>
            </div>
          </div>

          {/* AI SUMMARY */}
          <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-5">🎯 AI Travel Summary</h3>

            <div className="space-y-4 text-gray-700 leading-7">
              {(planData?.reply || "No AI summary available.")
                .split('. ')
                .slice(0, 6)
                .map((sentence, index) => (
                  <p key={index}>
                    {sentence.trim()}.
                  </p>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
