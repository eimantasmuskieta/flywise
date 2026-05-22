import { useState, useEffect, FormEvent } from 'react';
import { MapPin, Calendar, Users, DollarSign, Heart, MessageCircle, CreditCard, Sparkles, Plane, Wallet, CalendarDays, Utensils, Landmark } from 'lucide-react';
import { TripResults } from './TripResults';
import './plan-your-trip.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

type ViewMode = 'form' | 'chat';

interface PlanYourTripProps {
  initialMode?: ViewMode;
  user: { id: number; name: string; email: string } | null;
  onSaveTrip: (trip: any) => void;
  onAuthRequired: () => void;
}

interface FlightOption {
  airline?: { name?: string };
  flight?: { iata?: string };
  departure?: { airport?: string; scheduled?: string };
  arrival?: { airport?: string; scheduled?: string };
  trip_leg?: string;
}

interface PlanApiData {
  reply: string;
  flights: FlightOption[];
  itinerary: string[];
}

interface ChatMessage {
  role: 'user' | 'ai';
  message: string;
  flights?: FlightOption[];
  itinerary?: string[];
}

type TripDraft = {
  route?: string;
  date?: string;
  duration?: string;
  travelers?: string;
  budget?: string;
};

function detectRoute(text: string) {
  const fromTo = text.match(/from\s+([a-zA-Z\s.'-]+?)\s+to\s+([a-zA-Z\s.'-]+)/i);
  if (fromTo) {
    return `${fromTo[1].trim()} to ${fromTo[2].trim()}`;
  }

  const plain = text.match(/\b([a-zA-Z\s.'-]+?)\s+to\s+([a-zA-Z\s.'-]+?)(?=\s+(on|for|with|budget|date)\b|$)/i);
  if (plain) {
    return `${plain[1].trim()} to ${plain[2].trim()}`;
  }

  return undefined;
}

function detectDate(text: string) {
  const normalized = text.replace(/[,.]/g, ' ');

  const iso = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (iso) return iso[0];

  const slashOrDash = normalized.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
  if (slashOrDash) {
    const month = slashOrDash[1].padStart(2, '0');
    const day = slashOrDash[2].padStart(2, '0');
    const yearRaw = slashOrDash[3];
    if (yearRaw) {
      const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
      return `${year}-${month}-${day}`;
    }

    const now = new Date();
    return `${now.getFullYear()}-${month}-${day}`;
  }

  const named = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?\b/i);
  if (named) return named[0];

  return undefined;
}

function detectDuration(text: string) {
  const days = text.match(/\b\d{1,2}\s*(day|days|night|nights)\b/i);
  if (days) return days[0];

  const weeks = text.match(/\b\d{1,2}\s*weeks?\b/i);
  if (weeks) return weeks[0];

  if (/\b(a|one)\s+week\b/i.test(text)) return '1 week';
  return undefined;
}

function detectTravelers(text: string) {
  const normalized = text.replace(/[,.]/g, ' ').trim();

  const numeric = normalized.match(/\b\d{1,2}\s*(people|persons|travelers|travellers|ppl|passengers?)\b/i);
  if (numeric) return numeric[0];

  const wordNumeric = normalized.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*(people|persons|travelers|travellers|ppl|passengers?)\b/i);
  if (wordNumeric) return `${wordNumeric[1].toLowerCase()} ${wordNumeric[2].toLowerCase()}`;

  const standaloneNumber = normalized.match(/^\s*(\d{1,2})\s*$/);
  if (standaloneNumber) return `${standaloneNumber[1]} people`;

  const standaloneWord = normalized.match(/^\s*(one|two|three|four|five|six|seven|eight|nine|ten)\s*$/i);
  if (standaloneWord) return `${standaloneWord[1].toLowerCase()} people`;

  if (/\bcouple\b/i.test(normalized)) return '2 people';
  return undefined;
}

function detectBudget(text: string) {
  const explicit = text.match(/\bbudget\s*(is|:|=)?\s*(\d[\d,.]*)\b/i);
  if (explicit) return `${explicit[2]} EUR`;

  const money = text.match(/\b(\d[\d,.]*)\s*(eur|euro|euros|usd|dollars?)\b/i);
  if (money) return `${money[1]} ${money[2]}`;

  return undefined;
}

function mergeTripDraft(previous: TripDraft, prompt: string) {
  const route = detectRoute(prompt);
  const date = detectDate(prompt);
  const duration = detectDuration(prompt);
  const travelers = detectTravelers(prompt);
  const budget = detectBudget(prompt);

  if (route && previous.route && route.toLowerCase() !== previous.route.toLowerCase()) {
    return {
      route,
      date,
      duration,
      travelers,
      budget
    };
  }

  return {
    route: route || previous.route,
    date: date || previous.date,
    duration: duration || previous.duration,
    travelers: travelers || previous.travelers,
    budget: budget || previous.budget
  };
}

function getMissingField(draft: TripDraft) {
  if (!draft.route) return 'route';
  if (!draft.date) return 'date';
  if (!draft.duration) return 'duration';
  if (!draft.travelers) return 'travelers';
  if (!draft.budget) return 'budget';
  return null;
}

function buildMissingFieldQuestion(draft: TripDraft, missing: string) {
  const questions: Record<string, string> = {
    route: "Please tell me your route (example: from Vilnius to Rome).",
    date: "What is your departure date? (example: 2026-05-07 or May 7th)",
    duration: "How long is your trip? (example: 4 days or 1 week)",
    travelers: "How many travelers are going? (example: 2 people)",
    budget: "What is your total budget? (example: 1500 euros)"
  };

  return [
    "Great, I can help with that.",
    questions[missing],
    "",
    "Checklist:",
    `- Route: ${draft.route ? 'ok' : 'missing'}`,
    `- Date: ${draft.date ? 'ok' : 'missing'}`,
    `- Trip length: ${draft.duration ? 'ok' : 'missing'}`,
    `- Travelers: ${draft.travelers ? 'ok' : 'missing'}`,
    `- Budget: ${draft.budget ? 'ok' : 'missing'}`
  ].join('\n');
}

function buildPlanningPromptFromDraft(draft: TripDraft) {
  return `Plan a trip from ${draft.route} on ${draft.date}, for ${draft.duration}, ${draft.travelers}, budget ${draft.budget}.`;
}

function isGreetingOnly(text: string) {
  const normalized = text.trim().toLowerCase();
  return /^(hi|hello|hey|yo|good\s*(morning|afternoon|evening))$/.test(normalized);
}

function friendlyRoutePrompt() {
  return "Hi there! I am happy to help. Share your route, date, trip length, and travelers (for example: from Vilnius to Athens on July 1 for a week, 2 people).";
}

function normalizeAssistantReply(reply: string) {
  const legacyPrompt = "Share your route in natural language, for example: 'from Lagos to Tokyo' or 'Vilnius to Athens'.";
  if (reply.trim() === legacyPrompt) {
    return friendlyRoutePrompt();
  }

  return reply;
}

function buildItineraryFromSummary(summaryLines: string[]) {
  if (!Array.isArray(summaryLines) || summaryLines.length === 0) {
    return [] as string[];
  }

  const hasRoute = summaryLines.some((line) => /^route:/i.test(line));
  if (!hasRoute) {
    return [] as string[];
  }

  const tripLengthLine = summaryLines.find((line) => /^trip length:/i.test(line)) || '';
  const tripLengthMatch = tripLengthLine.match(/(\d{1,2})/);
  const days = Math.max(2, Math.min(Number(tripLengthMatch?.[1] || 4), 10));

  const itinerary = [
    'Day 1: Arrival, check-in, and an easy first walk in central areas.',
    'Day 2: Main sightseeing day with top attractions and local food spots.',
    'Day 3: Culture-focused day with museums and neighborhood exploration.'
  ];

  if (days >= 4) {
    itinerary.push('Day 4: Flexible day for markets, shopping, and optional activities.');
  }

  if (days >= 5) {
    itinerary.push('Day 5+: Final highlights and departure preparation.');
  }

  return itinerary;
}

function formatSchedule(value?: string) {
  if (!value) return 'Time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function parseAiMessage(message: string) {
  const normalizeLine = (line: string) => line
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const lines = message
    .split('\n')
    .map(line => normalizeLine(line))
    .filter(Boolean);

  const header = lines.find(line => /^Trip plan(?: for)?/i.test(line)) || '';
  const travelDate = lines.find(line => /^Travel date:/i.test(line)) || '';
  const travelers = lines.find(line => /^Travelers?:/i.test(line)) || '';
  const dayLines = lines
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(line => /^Day\s+\d+(?:\+)?\s*:/i.test(line));
  const museumPicks = lines.find(line => /^Museum picks:/i.test(line)) || '';
  const foodPicks = lines.find(line => /^Food picks:/i.test(line)) || '';
  const budgetTip = lines.find(line => /^Budget tip:/i.test(line)) || '';
  const flightIntro = lines.find(line => /^Live flights from/i.test(line) || /^I could not find live flights/i.test(line) || /^SerpAPI flight results from/i.test(line)) || '';

  const getSectionLines = (sectionName: string) => {
    const headerIndex = lines.findIndex(line => new RegExp(`^${sectionName}:$`, 'i').test(line));
    if (headerIndex === -1) return [] as string[];

    const result: string[] = [];
    for (let i = headerIndex + 1; i < lines.length; i += 1) {
      if (/^(summary|itinerary|flights|budget|tips):$/i.test(lines[i])) break;
      result.push(lines[i].replace(/^[-*]\s*/, '').trim());
    }
    return result.filter(Boolean);
  };

  const summarySection = getSectionLines('Summary');
  const itinerarySection = getSectionLines('Itinerary');
  const flightsSection = getSectionLines('Flights');
  const budgetSection = getSectionLines('Budget');
  const tipsSection = getSectionLines('Tips');

  return { header, travelDate, travelers, dayLines, museumPicks, foodPicks, budgetTip, flightIntro, summarySection, itinerarySection, flightsSection, budgetSection, tipsSection };
}

export function PlanYourTrip({ initialMode = 'form', user, onSaveTrip, onAuthRequired }: PlanYourTripProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  // List of popular departure cities; you can expand this as needed
  const departureCities = [
    'Vilnius', 'Riga', 'Tallinn', 'London', 'Paris', 'Berlin', 'Warsaw', 'Amsterdam', 'Madrid', 'Rome', 'New York', 'Singapore', 'Tokyo', 'Dubai'
  ];
  const [originCity, setOriginCity] = useState(departureCities[0]);

  useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode]);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [budget, setBudget] = useState('3000');
  const [interests, setInterests] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formPlanData, setFormPlanData] = useState<PlanApiData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [tripDraft, setTripDraft] = useState<TripDraft>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.max(2, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 || 4);

    const message = [
      `Plan a trip from ${originCity} to ${destination}`,
      `on ${startDate}`,
      `for ${daysDiff} days`,
      `${travelers} people`,
      `budget ${budget} euros`,
      interests.trim() ? `interests: ${interests.trim()}` : ''
    ].filter(Boolean).join(', ');

    setIsSubmittingForm(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          history: []
        })
      });

      const data = await res.json();
      const planData: PlanApiData = {
        reply: typeof data?.reply === 'string' ? data.reply : 'Trip plan was generated with limited details.',
        flights: Array.isArray(data?.flights) ? data.flights : [],
        itinerary: Array.isArray(data?.itinerary)
          ? data.itinerary.filter((line: unknown) => typeof line === 'string' && line.trim().length > 0)
          : []
      };

      setFormPlanData(planData);
      setShowResults(true);
    } catch (error) {
      setFormPlanData({
        reply: `I could not reach the API. Make sure backend is running on ${API_BASE_URL}.`,
        flights: [],
        itinerary: []
      });
      setShowResults(true);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt) return;

    const userMessage = { role: 'user' as const, message: prompt };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    if (isGreetingOnly(prompt)) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'ai',
          message: "Hello! Great to meet you. Tell me where you want to go, when, how long, and how many travelers, and I will build a short trip plan for you."
        }
      ]);
      return;
    }

    const nextDraft = mergeTripDraft(tripDraft, prompt);
    setTripDraft(nextDraft);

    const missing = getMissingField(nextDraft);
    if (missing) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'ai',
          message: buildMissingFieldQuestion(nextDraft, missing)
        }
      ]);
      return;
    }

    const planningPrompt = buildPlanningPromptFromDraft(nextDraft);

    try {
     const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: planningPrompt,
          history: chatMessages.slice(-8).map(item => ({ role: item.role, message: item.message }))
        })
      });

      const data = await res.json();
      const reply = typeof data?.reply === 'string'
        ? normalizeAssistantReply(
            data.reply
              .split('\n')
              .filter(line => !/^Day\s+\d+/i.test(line.trim()))
              .join('\n')
          )
        : 'I received an unexpected API response. Please try again.';
      const flights = Array.isArray(data?.flights) ? data.flights : [];
      const itinerary = Array.isArray(data?.itinerary)
        ? data.itinerary.filter((line: unknown) => typeof line === 'string' && line.trim().length > 0)
        : [];

      setChatMessages(prev => [...prev, { role: 'ai', message: reply, flights, itinerary }]);
    } catch (error) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'ai',
          message: `I could not reach the API. Make sure backend is running on ${API_BASE_URL}.`
        }
      ]);
    }
  };

  const handleSaveTrip = () => {
    const trip = {
      id: Date.now().toString(),
      destination,
      startDate,
      endDate,
      travelers: parseInt(travelers),
      budget: parseInt(budget),
      interests,
      savedAt: new Date()
    };
    console.log(trip);
  };

  if (showResults) {
    return (
      <TripResults
        destination={destination}
        startDate={startDate}
        endDate={endDate}
        travelers={parseInt(travelers)}
        budget={parseInt(budget)}
        interests={interests}
        apiBaseUrl={API_BASE_URL}
        planData={formPlanData}
        onBack={() => setShowResults(false)}
        onSaveTrip={handleSaveTrip}
        user={user}
        onAuthRequired={onAuthRequired}
      />
    );
  }

  return (
    <div className="trip-shell min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="trip-panel rounded-3xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex trip-tabs">
            <button
              onClick={() => setViewMode('form')}
              className={`trip-tab flex-1 py-4 px-6 flex items-center justify-center gap-2 transition-all ${
                viewMode === 'form'
                  ? 'trip-tab--active text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Fill Out Form
            </button>
            <button
              onClick={() => setViewMode('chat')}
              className={`trip-tab flex-1 py-4 px-6 flex items-center justify-center gap-2 transition-all ${
                viewMode === 'chat'
                  ? 'trip-tab--active text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Chat with AI
            </button>
          </div>

          {/* Form View */}
          {viewMode === 'form' && (
            <form onSubmit={handleSubmit} className="trip-form p-8 space-y-6">
              {/* Departure City */}
              <div>
                <label className="flex items-center gap-2 mb-3 text-gray-700">
                  <span className="text-xl">🛫</span>
                  Departure city
                </label>
                <div>
                  <select
                    value={originCity}
                    onChange={e => setOriginCity(e.target.value)}
                    className="trip-input w-full pr-4 py-4 rounded-xl focus:outline-none"
                    required
                  >
                    {departureCities.map(city => (
                      <option key={city} value={city}>🛫 {city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="flex items-center gap-2 mb-3 text-gray-700">
                  <span className="text-xl">🌍</span>
                  Where do you want to go?
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Tokyo, Paris, Bali..."
                    className="trip-input w-full pl-20 pr-4 py-4 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-3 text-gray-700">
                    <span className="text-xl">📅</span>
                    Trip start date
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="trip-input w-full pl-20 pr-4 py-4 rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-3 text-gray-700">
                    <span className="text-xl">📅</span>
                    Trip end date
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="trip-input w-full pl-20 pr-4 py-4 rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Travelers and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-3 text-gray-700">
                    <span className="text-xl">👥</span>
                    Number of travelers
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <input
                      type="number"
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                      min="1"
                      className="trip-input w-full pl-20 pr-4 py-4 rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-3 text-gray-700">
                    <span className="text-xl">💰</span>
                    Budget (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      min="0"
                      step="100"
                      className="trip-input w-full pl-20 pr-4 py-4 rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="flex items-center gap-2 mb-3 text-gray-700">
                  <Heart className="w-5 h-5 text-red-500" />
                  What are your interests? (optional)
                </label>
                <textarea
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., food, culture, adventure, beaches, nightlife, museums..."
                  className="trip-input w-full px-4 py-4 rounded-xl focus:outline-none min-h-[100px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingForm}
                className="trip-submit w-full py-4 px-6 text-white rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {isSubmittingForm ? 'Generating Trip Plan...' : 'Generate My Amazing Itinerary'}
              </button>
            </form>
          )}

          {/* Chat View */}
          {viewMode === 'chat' && (
            <div className="trip-chat flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="trip-empty-state text-center py-12 text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Start chatting with our AI travel assistant!</p>
                    <p className="mt-2">Ask about destinations, flights, hotels, or activities.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'user' ? (
                        <div className="trip-bubble-user max-w-[80%] px-4 py-3 rounded-2xl text-white shadow-sm">
                          {msg.message}
                        </div>
                      ) : (
                        <div className="trip-bubble-ai max-w-[88%] rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold">
                            <Sparkles className="w-4 h-4" />
                            Travel Assistant
                          </div>

                          {(() => {
                            const parsed = parseAiMessage(msg.message);
                            const structuredItinerary = Array.isArray(msg.itinerary) ? msg.itinerary : [];
                            const summaryBasedItinerary = parsed.dayLines.length === 0
                              && parsed.itinerarySection.length === 0
                              && structuredItinerary.length === 0
                              ? buildItineraryFromSummary(parsed.summarySection)
                              : [];
                            const hasStructuredPlan = parsed.header
                              || parsed.dayLines.length > 0
                              || parsed.summarySection.length > 0
                              || parsed.itinerarySection.length > 0
                              || structuredItinerary.length > 0
                              || summaryBasedItinerary.length > 0
                              || parsed.flightsSection.length > 0
                              || parsed.budgetSection.length > 0
                              || parsed.tipsSection.length > 0;

                            if (!hasStructuredPlan) {
                              return (
                                <div className="space-y-1 text-gray-800 text-sm leading-6 whitespace-pre-line">
                                  {msg.message}
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-3">
                                {parsed.header && (
                                  <div className="rounded-xl bg-white border border-cyan-100 p-3">
                                    <p className="text-sm font-semibold text-blue-700">{parsed.header}</p>
                                    {parsed.travelDate && (
                                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        {parsed.travelDate}
                                      </p>
                                    )}
                                    {parsed.travelers && (
                                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" />
                                        {parsed.travelers}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {parsed.dayLines.length > 0 && (
                                  <div className="rounded-xl bg-white border border-cyan-100 p-3">
                                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Itinerary Timeline</p>
                                    <div className="space-y-2">
                                      {parsed.dayLines.map((line, lineIdx) => {
                                        const [dayLabel, ...rest] = line.split(':');
                                        return (
                                          <div key={lineIdx} className="flex gap-2 items-start">
                                            <span className="bg-blue-100 text-blue-700 text-sm font-semibold w-[78px] h-[34px] flex items-center justify-center flex-shrink-0 text-center">
                                              {dayLabel}
                                            </span>
                                            <p className="text-sm text-gray-700 leading-5">{rest.join(':').trim()}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {parsed.dayLines.length === 0 && parsed.itinerarySection.length > 0 && (
                                  <div className="rounded-xl bg-white border border-cyan-100 p-3">
                                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Itinerary Timeline</p>
                                    <ul className="space-y-1">
                                      {parsed.itinerarySection.map((line, idx2) => (
                                        <li key={idx2} className="text-sm text-gray-700 flex items-start gap-2">
                                          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                                          <span>{line}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {parsed.dayLines.length === 0 && parsed.itinerarySection.length === 0 && structuredItinerary.length > 0 && (
                                  <div className="rounded-xl bg-white border border-cyan-100 p-3">
                                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Itinerary Timeline</p>
                                    <ul className="space-y-1">
                                      {structuredItinerary.map((line, idx2) => (
                                        <li key={idx2} className="text-sm text-gray-700 flex items-start gap-2">
                                          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                                          <span>{line}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {parsed.dayLines.length === 0 && parsed.itinerarySection.length === 0 && structuredItinerary.length === 0 && summaryBasedItinerary.length > 0 && (
                                  <div className="rounded-xl bg-white border border-cyan-100 p-3">
                                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Itinerary Timeline</p>
                                    <ul className="space-y-1">
                                      {summaryBasedItinerary.map((line, idx2) => (
                                        <li key={idx2} className="text-sm text-gray-700 flex items-start gap-2">
                                          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                                          <span>{line}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {parsed.budgetTip && (
                                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                                    <p className="text-sm text-amber-900 flex items-start gap-2">
                                      <Wallet className="w-4 h-4 mt-0.5" />
                                      {parsed.budgetTip}
                                    </p>
                                  </div>
                                )}

                                {parsed.museumPicks && (
                                  <div className="rounded-xl bg-violet-50 border border-violet-200 p-3">
                                    <p className="text-sm text-violet-900 flex items-start gap-2">
                                      <Landmark className="w-4 h-4 mt-0.5" />
                                      {parsed.museumPicks}
                                    </p>
                                  </div>
                                )}

                                {parsed.foodPicks && (
                                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
                                    <p className="text-sm text-rose-900 flex items-start gap-2">
                                      <Utensils className="w-4 h-4 mt-0.5" />
                                      {parsed.foodPicks}
                                    </p>
                                  </div>
                                )}

                                {parsed.flightIntro && (
                                  <div className="rounded-xl bg-sky-50 border border-sky-200 p-3">
                                    <p className="text-sm text-sky-900 flex items-start gap-2">
                                      <Plane className="w-4 h-4 mt-0.5" />
                                      {parsed.flightIntro}
                                    </p>
                                  </div>
                                )}

                                {parsed.summarySection.length > 0 && (
                                  <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-3">
                                    <p className="text-sm uppercase tracking-wide text-cyan-700 mb-2">Summary</p>
                                    <ul className="space-y-1">
                                      {parsed.summarySection.map((line, idx2) => (
                                        <li key={idx2} className="text-sm text-cyan-900 flex items-start gap-2">
                                          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-cyan-600" />
                                          <span>{line}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {parsed.flightsSection.length > 0 && (
                                  <div className="rounded-xl bg-sky-50 border border-sky-200 p-3">
                                    <p className="text-sm uppercase tracking-wide text-sky-700 mb-2">Flights</p>
                                    <ul className="space-y-1">
                                      {parsed.flightsSection.slice(0, 5).map((line, idx2) => (
                                        <li key={idx2} className="text-sm text-sky-900 flex items-start gap-2">
                                          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-sky-600" />
                                          <span>{line}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {parsed.budgetSection.length > 0 && (
                                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                                    <p className="text-sm uppercase tracking-wide text-amber-700 mb-2">Budget</p>
                                    <ul className="space-y-1">
                                      {parsed.budgetSection.map((line, idx2) => (
                                        <li key={idx2} className="text-sm text-amber-900 flex items-start gap-2">
                                          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-amber-600" />
                                          <span>{line}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {parsed.tipsSection.length > 0 && (
                                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                                    <p className="text-sm uppercase tracking-wide text-emerald-700 mb-2">Tips</p>
                                    <ul className="space-y-1">
                                      {parsed.tipsSection.map((line, idx2) => (
                                        <li key={idx2} className="text-sm text-emerald-900 flex items-start gap-2">
                                          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                          <span>{line}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {Array.isArray(msg.flights) && msg.flights.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {msg.flights.slice(0, 4).map((flight, flightIdx) => (
                                <div
                                  key={flightIdx}
                                  className="trip-flight-card rounded-xl p-3"
                                >
                                  <p className="text-sm font-semibold text-blue-700">
                                    {flight?.airline?.name || 'Airline unavailable'}
                                  </p>
                                  {flight?.trip_leg && (
                                    <p className="text-[11px] font-semibold text-sky-700 mt-1 uppercase tracking-wide">
                                      {flight.trip_leg}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500 mt-1">
                                    Flight {flight?.flight?.iata || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-700 mt-2">
                                    {flight?.departure?.airport || 'Departure airport unavailable'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatSchedule(flight?.departure?.scheduled)}
                                  </p>
                                  <p className="text-sm text-gray-700 mt-2">
                                    {flight?.arrival?.airport || 'Arrival airport unavailable'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatSchedule(flight?.arrival?.scheduled)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={handleChatSubmit} className="trip-chat-form p-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="trip-chat-input flex-1 px-4 py-3 rounded-xl focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="trip-chat-send px-6 py-3 text-white rounded-xl transition-all"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
