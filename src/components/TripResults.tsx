import React, { useEffect, useMemo, useState } from "react";
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
}

interface StoredUser {
  id?: string | number;
  name?: string;
  email?: string;
}

interface InfoSection {
  key: "flight" | "accommodation" | "food" | "weather";
  icon: string;
  title: string;
  accent: string;
  border: string;
  background: string;
  text: string;
}

const SECTION_KEYWORDS: Record<InfoSection["key"], string[]> = {
  flight: ["flight", "airport", "departure", "airline", "ticket", "fare"],
  accommodation: ["hotel", "stay", "accommodation", "hostel", "apartment", "check-in"],
  food: ["food", "restaurant", "cafe", "local dish", "dining", "meal"],
  weather: ["weather", "rain", "temperature", "forecast", "jacket", "climate"]
};

const FALLBACK_TEXT: Record<InfoSection["key"], string> = {
  flight: "Book flights 4–8 weeks ahead, compare nearby airports, and prioritize morning departures for better punctuality.",
  accommodation: "Choose accommodation with easy public transport access and flexible cancellation in case plans shift.",
  food: "Mix local favorites with highly rated neighborhood spots and reserve popular restaurants in advance.",
  weather: "Check forecast 2–3 days before departure and pack light layers for comfortable day-to-night transitions."
};

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
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        alert("You must be logged in to save a trip.");
        return;
      }

      console.error(err);
      alert("Failed to save trip");
    }
  };

  const itineraryLines = planData?.itinerary || [];
  const replyText = planData?.reply || "No AI summary available.";

  const flightMatches = useMemo(
    () => replyText.match(/\[(RETURN|OUTBOUND)\][^\n]+/g) || [],
    [replyText]
  );

  const flights: FlightCardData[] = useMemo(
    () =>
      flightMatches.map((line) => {
        const type = line.includes("[RETURN]") ? "RETURN" : "OUTBOUND";
        const cleanLine = line.replace(/^\[(RETURN|OUTBOUND)\]\s*/, "").trim();
        const parts = cleanLine.split(" - ").map((part) => part.trim());

        return {
          type,
          airline: parts[0] || "Flight option",
          dateTime: parts[1] || "",
          price: parts[2]?.replace(/\s*EUR.*$/i, "").trim() || ""
        };
      }),
    [flightMatches]
  );

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

  const cleanedReplyForSummary = useMemo(
    () =>
      replyText
        .replace(/\[(RETURN|OUTBOUND)\][^\n]+/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    [replyText]
  );

  const summarySentences = useMemo(() => {
    if (!cleanedReplyForSummary) {
      return ["No AI summary available."];
    }

    const parts = cleanedReplyForSummary
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    if (!parts.length) {
      return [cleanedReplyForSummary];
    }

    return parts.slice(0, 8);
  }, [cleanedReplyForSummary]);

  const getSectionText = (section: InfoSection["key"]) => {
    const match = summarySentences.find((sentence) => {
      const lower = sentence.toLowerCase();
      return SECTION_KEYWORDS[section].some((keyword) => lower.includes(keyword));
    });

    if (section === "flight" && lowestPrice !== null) {
      return `${FALLBACK_TEXT.flight} Current lowest detected fare: €${lowestPrice}.`;
    }

    return match || FALLBACK_TEXT[section];
  };

  const infoSections: InfoSection[] = [
    {
      key: "flight",
      icon: "✈️",
      title: "Flight recommendations",
      accent: "text-violet-700",
      border: "border-violet-100",
      background: "from-violet-50 to-white",
      text: getSectionText("flight")
    },
    {
      key: "accommodation",
      icon: "🏨",
      title: "Accommodation tips",
      accent: "text-blue-700",
      border: "border-blue-100",
      background: "from-blue-50 to-white",
      text: getSectionText("accommodation")
    },
    {
      key: "food",
      icon: "🍽️",
      title: "Food suggestions",
      accent: "text-orange-700",
      border: "border-orange-100",
      background: "from-orange-50 to-white",
      text: getSectionText("food")
    },
    {
      key: "weather",
      icon: "🌤️",
      title: "Weather tips",
      accent: "text-emerald-700",
      border: "border-emerald-100",
      background: "from-emerald-50 to-white",
      text: getSectionText("weather")
    }
  ];

  const originCode = "VNO";
  const destinationCode = getDestinationCode(destination);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={onBack}
          className="mb-5 rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
        >
          ← Back
        </button>

        <div className="overflow-visible rounded-3xl border border-gray-100 bg-white p-5 shadow-xl sm:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                ✨ Travel Assistant
              </h1>
              <p className="text-sm text-gray-600 sm:text-base">
                Personalized itinerary and practical recommendations for a smoother trip.
              </p>
            </div>

            {isLoggedIn && (
              <button
                onClick={saveTrip}
                className="inline-flex h-12 min-w-[150px] items-center justify-center gap-2 self-start whitespace-nowrap rounded-2xl border border-white/20 bg-gradient-to-r from-purple-500 to-pink-500 px-6 text-base font-semibold leading-none text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
              >
                <span>❤️</span>
                <span>Save Trip</span>
              </button>
            )}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-5 py-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-500">
                <span>📍</span>
                <span>Destination</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">{destination}</div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-5 py-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span>📅</span>
                <span>Dates</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 sm:text-base">
                {startDate} → {endDate}
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white px-5 py-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-500">
                <span>👥</span>
                <span>Travelers</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">{travelers} people</div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white px-5 py-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-600">
                <span>💶</span>
                <span>Budget</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">EUR {budget.toLocaleString()}</div>
            </div>
          </div>

          <section className="mb-8 rounded-2xl border border-cyan-200 bg-gradient-to-b from-cyan-50/40 to-white p-6">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">��️ Itinerary Timeline</h2>

            {itineraryLines.length > 0 ? (
              <div className="space-y-5">
                {itineraryLines.map((line, index) => {
                  const match = line.match(/^Day\s+\d+/i);
                  const dayLabel = match ? match[0] : `Day ${index + 1}`;
                  const description = line.replace(dayLabel, "").trim();

                  return (
                    <div key={`${dayLabel}-${index}`} className="relative pl-11">
                      {index < itineraryLines.length - 1 && (
                        <span className="absolute left-[17px] top-8 h-[calc(100%+20px)] w-px bg-cyan-200" />
                      )}
                      <span className="absolute left-0 top-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700 ring-4 ring-white">
                        {index + 1}
                      </span>

                      <div className="rounded-xl border border-cyan-100 bg-white px-4 py-3 shadow-sm">
                        <div className="mb-1 text-sm font-semibold text-cyan-700">{dayLabel}</div>
                        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                          {description || line}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No itinerary data found.</p>
            )}
          </section>

          {flights.length > 0 && (
            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 sm:text-2xl">
                  <span>✈️</span>
                  <span>Flight recommendations</span>
                </h2>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:text-sm">
                  🔥 Best fares highlighted
                </div>
              </div>

              <div className="space-y-3">
                {flights.map((flight, index) => {
                  const numericPrice = extractNumericPrice(flight.price);
                  const isBestPrice = lowestPrice !== null && numericPrice === lowestPrice;
                  const shortAirline = shortenAirlineName(flight.airline);
                  const airlineCode = getAirlineCode(flight.airline);
                  const fromCode = flight.type === "OUTBOUND" ? originCode : destinationCode;
                  const toCode = flight.type === "OUTBOUND" ? destinationCode : originCode;

                  return (
                    <article key={`${airlineCode}-${flight.dateTime}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-3">
                      <div className="hidden lg:grid lg:grid-cols-[260px_1fr_130px] lg:items-center lg:gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
                            {airlineCode}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold text-gray-900">{shortAirline}</div>
                            <div className="text-[11px] text-gray-500">
                              {airlineCode} {index + 101}
                            </div>
                          </div>
                        </div>

                        <div className="flex min-w-0 items-center justify-center gap-4">
                          <div className="min-w-[60px] text-center text-base font-bold text-gray-900">{fromCode}</div>

                          <div className="flex max-w-[220px] flex-1 flex-col items-center justify-center">
                            <span
                              className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                flight.type === "OUTBOUND" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {flight.type === "OUTBOUND" ? "Outbound" : "Return"}
                            </span>

                            <div className="flex w-full items-center">
                              <div className="h-px flex-1 bg-gray-300" />
                              <div className="px-2 text-xs text-gray-400">✈</div>
                              <div className="h-px flex-1 bg-gray-300" />
                            </div>

                            <div className="mt-1 whitespace-nowrap text-[10px] text-gray-500">
                              {formatFlightDate(flight.dateTime)}
                            </div>
                          </div>

                          <div className="min-w-[60px] text-center text-base font-bold text-gray-900">{toCode}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold leading-none text-emerald-600">{flight.price || "—"}</div>
                          <div className="mt-0.5 text-[10px] text-gray-500">per person</div>
                          {isBestPrice && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              🔥 Best
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 lg:hidden">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
                            {airlineCode}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold text-gray-900">{shortAirline}</div>
                            <div className="text-[11px] text-gray-500">
                              {airlineCode} {index + 101}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-[56px] text-center text-base font-bold text-gray-900">{fromCode}</div>

                          <div className="flex-1 text-center">
                            <span
                              className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                flight.type === "OUTBOUND" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {flight.type === "OUTBOUND" ? "Outbound" : "Return"}
                            </span>

                            <div className="flex items-center">
                              <div className="h-px flex-1 bg-gray-300" />
                              <div className="px-2 text-xs text-gray-400">✈</div>
                              <div className="h-px flex-1 bg-gray-300" />
                            </div>

                            <div className="mt-1 text-[10px] text-gray-500">{formatFlightDate(flight.dateTime)}</div>
                          </div>

                          <div className="min-w-[56px] text-center text-base font-bold text-gray-900">{toCode}</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold leading-none text-emerald-600">{flight.price || "—"}</div>
                            <div className="mt-0.5 text-[10px] text-gray-500">per person</div>
                          </div>

                          {isBestPrice && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              🔥 Best
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mb-8 grid gap-4 sm:grid-cols-2">
            {infoSections.map((section) => (
              <article
                key={section.key}
                className={`rounded-2xl border ${section.border} bg-gradient-to-br ${section.background} p-5 shadow-sm`}
              >
                <h3 className={`mb-3 flex items-center gap-2 text-lg font-semibold ${section.accent}`}>
                  <span>{section.icon}</span>
                  <span>{section.title}</span>
                </h3>
                <p className="text-sm leading-7 text-gray-700 sm:text-base">{section.text}</p>
              </article>
            ))}
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="mb-5 text-2xl font-bold text-gray-900">🎯 AI travel summary</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {summarySentences.slice(0, 6).map((sentence, index) => (
                <div key={`${index}-${sentence.slice(0, 20)}`} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-sm leading-6 text-gray-700 sm:text-base">{sentence}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
