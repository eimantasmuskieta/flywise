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
  onAuthRequired?: () => void;
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

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function TripResults({
  destination,
  startDate,
  endDate,
  travelers,
  budget,
  planData,
  onBack,
  onAuthRequired
}: TripResultsProps) {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isSavingTrip, setIsSavingTrip] = useState(false);

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
    if (isSavingTrip) return;

    try {
      const user = readUserFromStorage();

      if (!user || !user.id) {
        if (onAuthRequired) {
          onAuthRequired();
        } else {
          alert("Please login first");
        }
        return;
      }

      setIsSavingTrip(true);
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
    } finally {
      setIsSavingTrip(false);
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
      return SECTION_KEYWORDS[section].some((keyword) => {
        const keywordMatcher = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
        return keywordMatcher.test(sentence);
      });
    });

    if (section === "flight" && lowestPrice !== null) {
      const baseFlightTip = FALLBACK_TEXT.flight.replace(/[.!?]\s*$/, "");
      return `${baseFlightTip}. Current lowest detected fare: €${lowestPrice}.`;
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
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 lg:py-6">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={onBack}
          className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          ← Back
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                ✨ Travel Assistant
              </h1>
              <p className="text-sm text-slate-600">
                Personalized itinerary and practical recommendations for a smoother trip.
              </p>
            </div>

            <button
              onClick={saveTrip}
              disabled={isSavingTrip}
              aria-label={isSavingTrip ? "Saving trip" : "Save trip"}
              className="inline-flex h-10 min-w-[130px] items-center justify-center gap-2 self-start whitespace-nowrap rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-semibold leading-none text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>❤️</span>
              <span>{isSavingTrip ? "Saving..." : "Save Trip"}</span>
            </button>
          </div>

          {!isLoggedIn && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              Please sign in to save this trip to your account
            </div>
          )}

          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-3 py-2.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                <span>📍</span>
                <span>Destination</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 sm:text-base">{destination}</div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-3 py-2.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <span>📅</span>
                <span>Dates</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {startDate} → {endDate}
              </div>
            </div>

            <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white px-3 py-2.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
                <span>👥</span>
                <span>Travelers</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 sm:text-base">{travelers} people</div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white px-3 py-2.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <span>💶</span>
                <span>Budget</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 sm:text-base">EUR {budget.toLocaleString()}</div>
            </div>
          </div>

          <section className="mb-5 rounded-xl border border-cyan-100 bg-gradient-to-b from-cyan-50/60 to-white p-4 sm:p-5">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 sm:text-xl">🗺️ Itinerary timeline</h2>

            {itineraryLines.length > 0 ? (
              <div className="space-y-3">
                {itineraryLines.map((line, index) => {
                  const match = line.match(/^Day\s+\d+/i);
                  const dayLabel = match ? match[0] : `Day ${index + 1}`;
                  const description = line.replace(dayLabel, "").trim();
                  const itineraryKey = `${dayLabel}-${line}`;

                  return (
                    <div key={itineraryKey} className="relative pl-10">
                      {index < itineraryLines.length - 1 && (
                        <span className="absolute left-[14px] top-7 h-[calc(100%+14px)] w-px bg-cyan-200" />
                      )}
                      <span className="absolute left-0 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700 ring-2 ring-white">
                        {index + 1}
                      </span>

                      <div className="rounded-lg border border-cyan-100 bg-white px-3 py-2.5 shadow-sm">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">{dayLabel}</div>
                        <p className="text-sm leading-6 text-slate-700">
                          {description || line}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No itinerary data found.</p>
            )}
          </section>

          {flights.length > 0 && (
            <section className="mb-5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
                  <span>✈️</span>
                  <span>Flight recommendations</span>
                </h2>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  🔥 Best fares highlighted
                </div>
              </div>

              <div className="space-y-2.5">
                {flights.map((flight, index) => {
                  const numericPrice = extractNumericPrice(flight.price);
                  const isBestPrice = lowestPrice !== null && numericPrice === lowestPrice;
                  const shortAirline = shortenAirlineName(flight.airline);
                  const airlineCode = getAirlineCode(flight.airline);
                  const fromCode = flight.type === "OUTBOUND" ? originCode : destinationCode;
                  const toCode = flight.type === "OUTBOUND" ? destinationCode : originCode;

                  return (
                    <article key={`${flight.type}-${flight.airline}-${flight.dateTime}-${flight.price}`} className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5">
                      <div className="hidden lg:grid lg:grid-cols-[220px_1fr_110px] lg:items-center lg:gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[10px] font-bold text-white">
                            {airlineCode}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-slate-900">{shortAirline}</div>
                            <div className="text-[10px] text-slate-500">
                              {airlineCode} {index + 101}
                            </div>
                          </div>
                        </div>

                        <div className="flex min-w-0 items-center justify-center gap-4">
                          <div className="min-w-[50px] text-center text-sm font-bold text-slate-900">{fromCode}</div>

                          <div className="flex max-w-[220px] flex-1 flex-col items-center justify-center">
                            <span
                              className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                flight.type === "OUTBOUND" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {flight.type === "OUTBOUND" ? "Outbound" : "Return"}
                            </span>

                            <div className="flex w-full items-center">
                              <div className="h-px flex-1 bg-slate-300" />
                              <div className="px-2 text-xs text-slate-400">✈</div>
                              <div className="h-px flex-1 bg-slate-300" />
                            </div>

                            <div className="mt-1 whitespace-nowrap text-[10px] text-slate-500">
                              {formatFlightDate(flight.dateTime)}
                            </div>
                          </div>

                          <div className="min-w-[50px] text-center text-sm font-bold text-slate-900">{toCode}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-bold leading-none text-emerald-600">{flight.price || "—"}</div>
                          <div className="mt-0.5 text-[10px] text-slate-500">per person</div>
                          {isBestPrice && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              🔥 Best
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2.5 lg:hidden">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[10px] font-bold text-white">
                            {airlineCode}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-slate-900">{shortAirline}</div>
                            <div className="text-[10px] text-slate-500">
                              {airlineCode} {index + 101}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-[48px] text-center text-sm font-bold text-slate-900">{fromCode}</div>

                          <div className="flex-1 text-center">
                            <span
                              className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                flight.type === "OUTBOUND" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {flight.type === "OUTBOUND" ? "Outbound" : "Return"}
                            </span>

                            <div className="flex items-center">
                              <div className="h-px flex-1 bg-slate-300" />
                              <div className="px-2 text-xs text-slate-400">✈</div>
                              <div className="h-px flex-1 bg-slate-300" />
                            </div>

                            <div className="mt-1 text-[10px] text-slate-500">{formatFlightDate(flight.dateTime)}</div>
                          </div>

                          <div className="min-w-[48px] text-center text-sm font-bold text-slate-900">{toCode}</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-base font-bold leading-none text-emerald-600">{flight.price || "—"}</div>
                            <div className="mt-0.5 text-[10px] text-slate-500">per person</div>
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

          <section className="mb-5 grid gap-3 sm:grid-cols-2">
            {infoSections.map((section) => (
              <article
                key={section.key}
                className={`rounded-xl border ${section.border} bg-gradient-to-br ${section.background} p-3.5 shadow-sm`}
              >
                <h3 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${section.accent}`}>
                  <span>{section.icon}</span>
                  <span>{section.title}</span>
                </h3>
                <p className="text-sm leading-6 text-slate-700">{section.text}</p>
              </article>
            ))}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-slate-900 sm:text-lg">🎯 AI travel summary</h3>
            <div className="space-y-2">
              {summarySentences.slice(0, 6).map((sentence, index) => (
                <div key={`summary-${index}`} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <p className="text-sm leading-6 text-slate-700">{sentence}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
