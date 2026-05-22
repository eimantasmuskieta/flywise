import { useEffect, useState } from 'react';
import { Plane, Calendar, Tag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const ENV_API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').trim();
const API_BASE_CANDIDATES = Array.from(
  new Set([
    '/api',
    ENV_API_BASE_URL
  ].filter(Boolean))
);

type Deal = {
  destination: string;
  price: number;
  originalPrice: number;
  discount: number;
  validUntil: string;
  description: string;
  image: string;
};

type CityOption = {
  code: string;
  name: string;
  country?: string;
  airport: string;
  airportLabel: string;
  originCityCode?: string;
};

function formatDealDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function makeApiUrl(base: string, path: string): string {
  if (!base) return path;
  return `${base}${path}`;
}

async function fetchJsonWithFallback(path: string): Promise<{ res: Response; data: any; base: string }> {
  let lastError: Error | null = null;
  const attempts: string[] = [];

  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(makeApiUrl(base, path));
      const data = await readJsonSafe(res);
      return { res, data, base };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown API error');
      attempts.push(`${makeApiUrl(base, path)} -> ${lastError.message}`);
    }
  }

  if (attempts.length > 0) {
    throw new Error(`Deals API is not reachable. Tried: ${attempts.join(' | ')}`);
  }

  throw lastError || new Error('Deals API is not reachable.');
}

async function readJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  const startsLikeHtml = text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html');

  if (startsLikeHtml) {
    throw new Error('API returned non-JSON response. Check backend URL/port.');
  }

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error('API returned invalid JSON.');
  }
}

const FALLBACK_COUNTRIES: CityOption[] = [
  { code: 'Lithuania', name: 'Lithuania', airport: 'VNO', airportLabel: 'Vilnius (VNO)', originCityCode: 'Vilnius' },
  { code: 'Latvia', name: 'Latvia', airport: 'RIX', airportLabel: 'Riga (RIX)', originCityCode: 'Riga' },
  { code: 'Estonia', name: 'Estonia', airport: 'TLL', airportLabel: 'Tallinn (TLL)', originCityCode: 'Tallinn' },
  { code: 'Germany', name: 'Germany', airport: 'FRA', airportLabel: 'Frankfurt (FRA)', originCityCode: 'Frankfurt' },
  { code: 'France', name: 'France', airport: 'CDG', airportLabel: 'Paris CDG (CDG)', originCityCode: 'Paris' },
  { code: 'Spain', name: 'Spain', airport: 'MAD', airportLabel: 'Madrid (MAD)', originCityCode: 'Madrid' },
  { code: 'Italy', name: 'Italy', airport: 'FCO', airportLabel: 'Rome FCO (FCO)', originCityCode: 'Rome' },
  { code: 'United Kingdom', name: 'United Kingdom', airport: 'LHR', airportLabel: 'London Heathrow (LHR)', originCityCode: 'London' },
  { code: 'Netherlands', name: 'Netherlands', airport: 'AMS', airportLabel: 'Amsterdam (AMS)', originCityCode: 'Amsterdam' },
  { code: 'Poland', name: 'Poland', airport: 'WAW', airportLabel: 'Warsaw (WAW)', originCityCode: 'Warsaw' }
];

export function Deals() {
  const [countries, setCountries] = useState<CityOption[]>(FALLBACK_COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState('Lithuania');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [originLabel, setOriginLabel] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedOption = countries.find((country) => country.code === selectedCountry);
  const selectedOriginCity = selectedOption?.originCityCode || '';
  const displayedDeals = deals.slice(0, 9);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesResult = await fetchJsonWithFallback('/api/deals/countries');
        const options = Array.isArray(countriesResult.data?.countries) ? countriesResult.data.countries : [];
        if (options.length > 0) {
          setCountries(options);
          return;
        }

        const citiesResult = await fetchJsonWithFallback('/api/deals/cities');
        const cities = Array.isArray(citiesResult.data?.cities) ? citiesResult.data.cities : [];
        if (cities.length > 0) {
          const uniqueByCountry = new Map<string, CityOption>();
          for (const city of cities) {
            const countryName = city.country || city.name;
            if (!countryName || uniqueByCountry.has(countryName)) continue;
            uniqueByCountry.set(countryName, {
              code: countryName,
              name: countryName,
              airport: city.airport,
              airportLabel: city.airportLabel,
              originCityCode: city.code
            });
          }
          const derivedCountries = Array.from(uniqueByCountry.values());
          if (derivedCountries.length > 0) {
            setCountries(derivedCountries);
            return;
          }
        }

        setErrorMessage('No countries returned by deals API.');
      } catch (err) {
        setCountries(FALLBACK_COUNTRIES);
        if (err instanceof Error) {
          setErrorMessage(err.message.includes('Deals API is not reachable')
            ? 'Live deals service is temporarily unavailable. Please try again shortly.'
            : err.message);
        }
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    const loadDeals = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const countryParam = `fromCountry=${encodeURIComponent(selectedCountry)}`;
        const cityParam = selectedOriginCity ? `&fromCity=${encodeURIComponent(selectedOriginCity)}` : '';
        const { res, data } = await fetchJsonWithFallback(`/api/deals?${countryParam}${cityParam}`);
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load deals');
        }

        const liveDeals = Array.isArray(data?.deals) ? data.deals : [];
        setDeals(liveDeals);
        setOriginLabel(data?.fromAirport ? `${selectedCountry} (${data.fromAirport})` : selectedCountry);
      } catch (err: any) {
        setDeals([]);
        setOriginLabel(selectedCountry);
        const incomingMessage = err?.message || 'Unable to load live deals';
        setErrorMessage(incomingMessage.includes('Deals API is not reachable')
          ? 'Live deals service is temporarily unavailable. Please try again shortly.'
          : incomingMessage);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, [selectedCountry, selectedOriginCity]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-orange-600 via-rose-500 to-pink-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(244,114,182,0.18)]">
            Exclusive Travel Deals
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover the best deals, handpicked from live fares.
          </p>
          <div className="mt-6 max-w-md mx-auto text-left">
            <label className="block text-sm text-gray-600 mb-2">Filter by departure country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} - {country.airportLabel}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">Showing deals from: {originLabel || selectedCountry}</p>
          </div>
        </div>

        {loading && (
          <div className="text-center text-gray-600 py-8">Updating deals...</div>
        )}

        {!loading && errorMessage && (
          <div className="text-center text-red-600 py-4">{errorMessage}</div>
        )}

        {!loading && !errorMessage && deals.length === 0 && (
          <div className="text-center text-gray-600 py-6">No live deals found for this country right now.</div>
        )}

        {displayedDeals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedDeals.map((deal, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-48 relative overflow-hidden">
                  <ImageWithFallback
                    src={deal.image}
                    alt={deal.destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {deal.discount}% OFF
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-2 text-gray-900">{deal.destination}</h3>
                  <p className="text-gray-600 mb-4">{deal.description}</p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-orange-600">${deal.price}</span>
                    <span className="text-gray-400 line-through">${deal.originalPrice}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Departure date {formatDealDate(deal.validUntil)}</span>
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all">
                    
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg text-center">
          <Plane className="w-12 h-12 mx-auto mb-4 text-purple-600" />
          <h2 className="mb-3 text-gray-900">Ready to Book Your Trip?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Check back regularly for new deals and exclusive offers. Start planning your dream vacation today!
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all">
            ✈️ Start Planning
          </button>
        </div>
      </div>
    </div>
  );
}
