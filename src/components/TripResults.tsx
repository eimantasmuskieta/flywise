import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  Landmark,
  Utensils,
  Camera,
  ShoppingBag,
  CalendarDays,
  Sparkles,
  Map,
} from "lucide-react";

interface FlightOption {
  airline?: { name?: string };
  flight?: { iata?: string };
  departure?: { airport?: string; scheduled?: string };
  arrival?: { airport?: string; scheduled?: string };
  trip_leg?: string;
}

interface PlanApiData {
  reply: string;
  itinerary: string[];
  flights?: FlightOption[];
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
  originCity?: string;
}

interface ParsedFlight {
  type: "OUTBOUND" | "RETURN";
  airline: string;
  flightNumber: string;
  airlineCode: string;
  fromCode: string;
  toCode: string;
  fromCity: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: string;
  isDirect: boolean;
}

interface StoredUser {
  id?: string | number;
  name?: string;
  email?: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const CITY_AIRPORT: Record<string, string> = {
  vilnius: "VNO",
  riga: "RIX",
  tallinn: "TLL",
  london: "LHR",
  paris: "CDG",
  berlin: "BER",
  warsaw: "WAW",
  amsterdam: "AMS",
  madrid: "MAD",
  rome: "FCO",
  milan: "MXP",
  lisbon: "LIS",
  barcelona: "BCN",
  dubai: "DXB",
  "new york": "JFK",
  singapore: "SIN",
  tokyo: "NRT",
};

const AIRPORT_CITY: Record<string, string> = {
  VNO: "Vilnius",
  RIX: "Riga",
  TLL: "Tallinn",
  LHR: "London",
  CDG: "Paris",
  BER: "Berlin",
  WAW: "Warsaw",
  AMS: "Amsterdam",
  MAD: "Madrid",
  FCO: "Rome",
  CIA: "Rome (Ciampino)",
  MXP: "Milan",
  LIS: "Lisbon",
  BCN: "Barcelona",
  DXB: "Dubai",
  JFK: "New York",
  SIN: "Singapore",
  NRT: "Tokyo",
};

const AIRLINE_COLORS: Record<string, string> = {
  FR: "#E6EEFB",
  W6: "#FDE7EE",
  AY: "#E8EFFA",
  SK: "#E8ECF7",
  LO: "#E8EFFA",
  EW: "#FDEBEC",
  LX: "#FDEBEC",
  OS: "#FDEBEC",
};

function getOriginCode(city: string) {
  return CITY_AIRPORT[city.toLowerCase()] ?? city.slice(0, 3).toUpperCase();
}

function getDestCode(city: string) {
  const v = city.trim().toLowerCase();
  if (v.includes("paris")) return "CDG";
  if (v.includes("rome")) return "CIA";
  if (v.includes("london")) return "LHR";
  if (v.includes("barcelona")) return "BCN";
  if (v.includes("berlin")) return "BER";
  if (v.includes("milan")) return "MXP";
  if (v.includes("madrid")) return "MAD";
  if (v.includes("lisbon")) return "LIS";
  if (v.includes("amsterdam")) return "AMS";
  if (v.includes("tokyo")) return "NRT";
  if (v.includes("dubai")) return "DXB";
  return CITY_AIRPORT[v] ?? city.slice(0, 3).toUpperCase();
}

function getAirlineCode(name: string) {
  const n = name.toUpperCase();
  if (n.includes("RYANAIR")) return "FR";
  if (n.includes("WIZZ")) return "W6";
  if (n.includes("FINNAIR")) return "AY";
  if (n.includes("SCANDINAVIAN") || n.includes(" SAS")) return "SK";
  if (n.includes(" LOT")) return "LO";
  if (n.includes("EUROWINGS")) return "EW";
  if (n.includes("SWISS")) return "LX";
  if (n.includes("AUSTRIAN")) return "OS";
  const match = name.match(/\b([A-Z]{2})\s*\d{3,4}\b/);
  return match ? match[1] : name.slice(0, 2).toUpperCase();
}

function extractFlightNumber(text: string) {
  const m = text.match(/\b([A-Z]{2}\s*\d{3,4})\b/);
  return m ? m[1] : "";
}

function formatFlightDateTime(scheduled?: string) {
  if (!scheduled) return "";
  const d = new Date(scheduled);
  if (isNaN(d.getTime())) return scheduled;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function calcDuration(dep?: string, arr?: string) {
  if (!dep || !arr) return "";
  const d = new Date(dep);
  const a = new Date(arr);
  if (isNaN(d.getTime()) || isNaN(a.getTime())) return "";
  const diff = a.getTime() - d.getTime();
  if (diff <= 0) return "";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

function itineraryDate(startDate: string, dayIndex: number) {
  const d = new Date(startDate);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(s: string, e: string) {
  const fmt = (ds: string) => {
    const d = new Date(ds);
    if (isNaN(d.getTime())) return ds;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  return `${fmt(s)} - ${fmt(e)}`;
}

function dayCount(s: string, e: string) {
  const start = new Date(s);
  const end = new Date(e);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function getItineraryIcon(text: string) {
  const t = text.toLowerCase();
  if (/arriv|check.in|hotel|fly|flight|depart/.test(t))
    return { Icon: Plane, bg: "bg-blue-100", color: "text-blue-600" };
  if (/sight|landmark|museum|cathedral|monument|attraction/.test(t))
    return { Icon: Landmark, bg: "bg-teal-100", color: "text-teal-600" };
  if (/culture|food|restaurant|dining|cafe|local dish|market/.test(t))
    return { Icon: Utensils, bg: "bg-orange-100", color: "text-orange-500" };
  if (/neighb|photo|market|street|explore/.test(t))
    return { Icon: Camera, bg: "bg-violet-100", color: "text-violet-600" };
  if (/shopping|souvenir|highlight|final|last day/.test(t))
    return { Icon: ShoppingBag, bg: "bg-slate-100", color: "text-slate-600" };
  return { Icon: Map, bg: "bg-indigo-100", color: "text-indigo-600" };
}

function parseItineraryLine(line: string) {
  const withoutDay = line.replace(/^Day\s*\d+\+?\s*[:(–\-]?\s*/i, "").trim();
  const withoutDate = withoutDay.replace(/^\(\d{4}-\d{2}-\d{2}\)\s*:?\s*/i, "").trim();
  const m = withoutDate.match(/^([^,:\n]+?)[,:](.+)$/s);
  if (m) return { title: m[1].trim(), description: m[2].trim() };
  return { title: withoutDate, description: "" };
}

function parsePlanSections(reply: string) {
  const normLine = (l: string) =>
    l.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/^[-*•]\s*/, "").trim();

  const known = ["Summary", "Itinerary", "Flights", "Return", "Budget", "Tips"];
  const sectionRe = new RegExp(`^(${known.join("|")}):?\\s*$`, "i");

  const lines = reply.split("\n").map(normLine).filter(Boolean);
  const sections: Record<string, string[]> = {};
  const introLines: string[] = [];
  let current: string | null = null;

  for (const line of lines) {
    if (/^\[(OUTBOUND|RETURN)\]/i.test(line)) continue;
    const sm = line.match(sectionRe);
    if (sm) {
      current = sm[1].toLowerCase();
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    } else {
      introLines.push(line);
    }
  }

  return { intro: introLines.join(" "), sections };
}

function buildFlightsFromStructured(
  structured: FlightOption[],
  originCode: string,
  destCode: string
): ParsedFlight[] {
  return structured.map((f) => {
    const legRaw = (f.trip_leg ?? "").toLowerCase();
    const type: ParsedFlight["type"] =
      legRaw.includes("return") || legRaw.includes("inbound") ? "RETURN" : "OUTBOUND";
    const airline = f.airline?.name ?? "";
    const code = getAirlineCode(airline);
    const flightNum = f.flight?.iata ?? extractFlightNumber(airline);
    const dep = f.departure?.scheduled;
    const arr = f.arrival?.scheduled;
    const isOutbound = type === "OUTBOUND";
    const fromCode = isOutbound ? originCode : destCode;
    const toCode = isOutbound ? destCode : originCode;
    return {
      type,
      airline: airline || "Flight",
      flightNumber: flightNum,
      airlineCode: code,
      fromCode,
      toCode,
      fromCity: AIRPORT_CITY[fromCode] ?? fromCode,
      toCity: AIRPORT_CITY[toCode] ?? toCode,
      departureTime: formatFlightDateTime(dep),
      arrivalTime: formatFlightDateTime(arr),
      duration: calcDuration(dep, arr),
      price: "",
      isDirect: true,
    };
  });
}

function buildFlightsFromText(
  reply: string,
  originCode: string,
  destCode: string
): ParsedFlight[] {
  const matches = reply.match(/\[(RETURN|OUTBOUND)\][^\n]+/g) ?? [];
  return matches.map((line) => {
    const type = line.includes("[RETURN]") ? "RETURN" : "OUTBOUND";
    const clean = line.replace(/^\[(RETURN|OUTBOUND)\]\s*/i, "").trim();
    const parts = clean.split(" - ").map((p) => p.trim());
    const airline = parts[0] ?? "";
    const code = getAirlineCode(airline);
    const flightNum = extractFlightNumber(airline) || extractFlightNumber(clean);
    const dateTimePart = parts[1] ?? "";
    const pricePart = parts[2] ?? "";
    const price = pricePart.replace(/[^0-9]/g, "")
      ? `€${pricePart.replace(/[^0-9]/g, "")}`
      : pricePart;
    const isOutbound = type === "OUTBOUND";
    const fromCode = isOutbound ? originCode : destCode;
    const toCode = isOutbound ? destCode : originCode;
    return {
      type: type as "OUTBOUND" | "RETURN",
      airline,
      flightNumber: flightNum,
      airlineCode: code,
      fromCode,
      toCode,
      fromCity: AIRPORT_CITY[fromCode] ?? fromCode,
      toCity: AIRPORT_CITY[toCode] ?? toCode,
      departureTime: formatFlightDateTime(dateTimePart) || dateTimePart,
      arrivalTime: "",
      duration: "",
      price,
      isDirect: true,
    };
  });
}

// ─── sub-components ───────────────────────────────────────────────────────────

function AirlineLogo({ code, name, bg }: { code: string; name: string; bg: string }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200"
      style={{ backgroundColor: bg || "#F3F4F6" }}
    >
      {!err ? (
        <img
          src={`https://pics.avs.io/64/64/${code}.png`}
          alt={name}
          className="h-10 w-10 object-contain"
          onError={() => setErr(true)}
        />
      ) : (
        <span className="text-xs font-bold tracking-wide text-gray-700">{code}</span>
      )}
    </div>
  );
}

const SECTION_LABELS: Record<string, { label: string; color: string }> = {
  summary:   { label: "Summary:",   color: "text-blue-600" },
  itinerary: { label: "Itinerary:", color: "text-orange-500" },
  flights:   { label: "Flights:",   color: "text-teal-600" },
  return:    { label: "Return:",    color: "text-teal-600" },
  budget:    { label: "Budget:",    color: "text-blue-600" },
  tips:      { label: "Tips:",      color: "text-emerald-600" },
};

// ─── main component ───────────────────────────────────────────────────────────

export function TripResults({
  destination,
  startDate,
  endDate,
  travelers,
  budget,
  planData,
  onBack,
  onAuthRequired,
  originCity = "Vilnius",
}: TripResultsProps) {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const readUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const p = JSON.parse(raw);
      return p?.id ? p : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const sync = () => setCurrentUser(readUser());
    sync();
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") sync();
    });
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isLoggedIn = !!currentUser?.id;

  const saveTrip = async () => {
    if (isSavingTrip) return;
    const user = readUser();
    if (!user?.id) {
      if (onAuthRequired) onAuthRequired();
      else alert("Please sign in to save this trip.");
      return;
    }
    setIsSavingTrip(true);
    try {
      const res = await axios.post("/api/trips/save", {
        user_id: user.id,
        destination,
        start_date: startDate,
        end_date: endDate,
        travelers,
        budget,
      });
      if (res.status === 200 || res.status === 201) {
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 3000);
      } else {
        alert("Failed to save trip.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        if (onAuthRequired) onAuthRequired();
        return;
      }
      alert("Failed to save trip.");
    } finally {
      setIsSavingTrip(false);
    }
  };

  // ── derived data ────────────────────────────────────────────────────────────

  const itineraryLines = planData?.itinerary ?? [];
  const replyText = planData?.reply ?? "";

  const originCode = useMemo(() => getOriginCode(originCity), [originCity]);
  const destCode = useMemo(() => getDestCode(destination), [destination]);

  const flights: ParsedFlight[] = useMemo(() => {
    const structured = planData?.flights ?? [];
    if (structured.length > 0)
      return buildFlightsFromStructured(structured, originCode, destCode);
    return buildFlightsFromText(replyText, originCode, destCode);
  }, [planData?.flights, replyText, originCode, destCode]);

  const lowestPrice = useMemo(() => {
    const nums = flights
      .map((f) => Number(f.price.replace(/[^0-9]/g, "")))
      .filter((n) => n > 0);
    return nums.length ? Math.min(...nums) : null;
  }, [flights]);

  const planSections = useMemo(() => parsePlanSections(replyText), [replyText]);

  const days = useMemo(() => dayCount(startDate, endDate), [startDate, endDate]);

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── info strip ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-4">
            {/* Destination */}
            <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                <span className="text-xs font-medium text-blue-500">Destination</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">{destination}</div>
            </div>

            {/* Dates */}
            <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="mb-1.5 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-xs font-medium text-green-500">Dates</span>
                </div>
                {days && (
                  <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    {days} days
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatDateRange(startDate, endDate)}
              </div>
            </div>

            {/* Travelers */}
            <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0 text-purple-500" />
                <span className="text-xs font-medium text-purple-500">Travelers</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">{travelers} people</div>
            </div>

            {/* Budget */}
            <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="mb-1.5 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 shrink-0 text-orange-500" />
                <span className="text-xs font-medium text-orange-500">Budget</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                EUR {budget.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── page content ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        {/* back + save row */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800 hover:bg-gray-100"
          >
            ← Back
          </button>

          <button
            onClick={saveTrip}
            disabled={isSavingTrip}
            aria-label={isSavingTrip ? "Saving trip" : "Save trip"}
            className={`inline-flex h-9 min-w-[120px] items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-70 ${
              savedOk
                ? "bg-green-500"
                : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
            }`}
          >
            <span>{savedOk ? "✓" : "❤️"}</span>
            <span>{isSavingTrip ? "Saving…" : savedOk ? "Saved!" : "Save Trip"}</span>
          </button>
        </div>

        {!isLoggedIn && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            Please sign in to save this trip to your account.
          </div>
        )}

        {/* ── assistant plan ─────────────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Assistant Plan</h2>
          </div>

          <div className="space-y-2 text-sm leading-7 text-gray-700">
            {planSections.intro && (
              <p className="text-gray-600">{planSections.intro}</p>
            )}

            {Object.entries(SECTION_LABELS).map(([key, { label, color }]) => {
              const lines = planSections.sections[key];
              if (!lines || lines.length === 0) return null;
              const content = lines.join(" • ");
              return (
                <p key={key}>
                  <span className={`font-semibold ${color}`}>{label}</span>{" "}
                  <span className="text-gray-700">{content}</span>
                </p>
              );
            })}
          </div>
        </section>

        {/* ── daily itinerary ────────────────────────────────────────────── */}
        {itineraryLines.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Map className="h-5 w-5 text-slate-600" />
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                Daily Itinerary
              </h2>
            </div>

            <div className="space-y-3">
              {itineraryLines.map((line, idx) => {
                const { title, description } = parseItineraryLine(line);
                const { Icon, bg, color } = getItineraryIcon(title + " " + description);
                const dateStr = itineraryDate(startDate, idx);

                return (
                  <div
                    key={`itinerary-${idx}-${title}`}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
                  >
                    {/* day number badge */}
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
                      <span className="text-[9px] font-semibold uppercase tracking-widest leading-none">
                        DAY
                      </span>
                      <span className="text-lg font-bold leading-none">{idx + 1}</span>
                    </div>

                    {/* activity icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}
                    >
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>

                    {/* text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                      {description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</p>
                      )}
                    </div>

                    {/* date */}
                    {dateStr && (
                      <div className="flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1">
                        <CalendarDays className="h-3 w-3 text-violet-500" />
                        <span className="text-xs font-medium text-violet-600 whitespace-nowrap">
                          {dateStr}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── flights ────────────────────────────────────────────────────── */}
        {flights.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-slate-600" />
                <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Flights</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                🔥 Best prices selected
              </span>
            </div>

            <div className="space-y-3">
              {flights.map((fl, idx) => {
                const priceNum = Number(fl.price.replace(/[^0-9]/g, ""));
                const isBest =
                  lowestPrice !== null && priceNum > 0 && priceNum === lowestPrice;
                const airlineBg = AIRLINE_COLORS[fl.airlineCode] ?? "#F3F4F6";

                return (
                  <div
                    key={`${fl.type}-${fl.airline}-${idx}`}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* airline logo + info */}
                      <div className="flex items-center gap-3 sm:w-52 sm:shrink-0">
                        <AirlineLogo
                          code={fl.airlineCode}
                          name={fl.airline}
                          bg={airlineBg}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold leading-tight text-gray-900">
                            {fl.airline.replace(/\(.*?\)/g, "").trim()}
                          </p>
                          {fl.flightNumber && (
                            <p className="text-xs text-gray-500">{fl.flightNumber}</p>
                          )}
                          <span
                            className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              fl.type === "OUTBOUND"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {fl.type === "OUTBOUND" ? "Outbound" : "Return"}
                          </span>
                        </div>
                      </div>

                      {/* route */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {/* from */}
                        <div className="w-[90px] shrink-0 overflow-hidden">
                          <p className="text-2xl font-bold leading-none text-gray-900">{fl.fromCode}</p>
                          <p className="mt-0.5 truncate text-xs text-gray-500">{fl.fromCity}</p>
                          {fl.departureTime && (
                            <p className="mt-0.5 text-xs text-gray-400">{fl.departureTime}</p>
                          )}
                        </div>

                        {/* middle */}
                        <div className="flex flex-1 flex-col items-center gap-0.5">
                          {fl.duration && (
                            <span className="text-xs font-medium text-gray-500">{fl.duration}</span>
                          )}
                          <div className="flex w-full items-center gap-1">
                            <div className="h-px flex-1 bg-gray-200" />
                            <Plane className="h-3.5 w-3.5 text-gray-400" />
                            <div className="h-px flex-1 bg-gray-200" />
                          </div>
                          {fl.isDirect && (
                            <span className="text-[10px] font-medium text-emerald-600">
                              Direct
                            </span>
                          )}
                        </div>

                        {/* to */}
                        <div className="w-[90px] shrink-0 overflow-hidden text-right">
                          <p className="text-2xl font-bold leading-none text-gray-900">{fl.toCode}</p>
                          <p className="mt-0.5 truncate text-xs text-gray-500">{fl.toCity}</p>
                          {fl.arrivalTime && (
                            <p className="mt-0.5 text-xs text-gray-400">{fl.arrivalTime}</p>
                          )}
                        </div>
                      </div>

                      {/* price */}
                      {fl.price && (
                        <div className="shrink-0 text-right sm:pl-4">
                          <p className="text-2xl font-bold text-violet-600">{fl.price}</p>
                          <p className="text-xs text-gray-500">per person</p>
                          {isBest && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                              🔥 Best Price
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
