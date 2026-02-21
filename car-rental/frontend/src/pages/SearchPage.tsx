import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapIcon, List, Bookmark, Clock, Zap, ChevronDown } from 'lucide-react';
import { vehiclesAPI, searchAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Vehicle, SavedSearch } from '../types';
import VehicleCard from '../components/VehicleCard';
import ScrollReveal from '../components/ScrollReveal';
import { customToast } from '../components/CustomToast';

const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];
const TRANSMISSION_TYPES = ['auto', 'manual'];
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'distance', label: 'Nearest' },
];

interface Filters {
  query: string;
  fuel: string;
  transmission: string;
  seats: string;
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
  location: string;
  sort: string;
  instantBooking: boolean;
  availableNow: boolean;
}

const defaultFilters: Filters = {
  query: '', fuel: '', transmission: '', seats: '',
  minPrice: '', maxPrice: '', startDate: '', endDate: '',
  location: '', sort: 'createdAt', instantBooking: false, availableNow: false,
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Vehicle[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [filters, setFilters] = useState<Filters>(() => ({
    query: searchParams.get('q') || '',
    fuel: searchParams.get('fuel') || '',
    transmission: searchParams.get('transmission') || '',
    seats: searchParams.get('seats') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    location: searchParams.get('location') || '',
    sort: searchParams.get('sort') || 'createdAt',
    instantBooking: searchParams.get('instantBooking') === 'true',
    availableNow: searchParams.get('availableNow') === 'true',
  }));

  const fetchVehicles = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: p,
        limit: 12,
        sort: f.sort,
      };
      if (f.query) params.query = f.query;
      if (f.fuel) params.fuel = f.fuel;
      if (f.transmission) params.transmission = f.transmission;
      if (f.seats) params.seats = parseInt(f.seats);
      if (f.minPrice) params.min_price = parseFloat(f.minPrice);
      if (f.maxPrice) params.max_price = parseFloat(f.maxPrice);
      if (f.startDate) params.start_date = f.startDate;
      if (f.endDate) params.end_date = f.endDate;
      if (f.location) params.location = f.location;
      if (f.instantBooking) params.instant_booking = true;
      if (f.availableNow) params.available_now = true;
      if (userLocation) {
        params.user_lat = userLocation.lat;
        params.user_lng = userLocation.lng;
      }
      const res = await vehiclesAPI.search(params);
      const data = res.data;
      setVehicles(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      customToast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchVehicles(filters, page);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters, page, fetchVehicles]);

  useEffect(() => {
    if (user) {
      searchAPI.savedSearches().then(r => setSavedSearches(r.data.items || [])).catch(() => {});
      searchAPI.recentlyViewed().then(r => setRecentlyViewed(r.data.items || [])).catch(() => {});
    }
  }, [user]);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const saveCurrentSearch = async () => {
    if (!user) { customToast.error('Login to save searches'); return; }
    const name = prompt('Name this search:');
    if (!name) return;
    try {
      await searchAPI.saveSearch({ name, filters: { ...filters } });
      customToast.success('Search saved!');
      const res = await searchAPI.savedSearches();
      setSavedSearches(res.data.items || []);
    } catch { customToast.error('Failed to save search'); }
  };

  const loadSavedSearch = (s: SavedSearch) => {
    setFilters({ ...defaultFilters, ...s.filters });
    setPage(1);
    setShowSaved(false);
  };

  const deleteSavedSearch = async (id: string) => {
    try {
      await searchAPI.deleteSavedSearch(id);
      setSavedSearches(prev => prev.filter(s => s._id !== id));
    } catch { customToast.error('Failed to delete saved search'); }
  };

  const detectLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        customToast.success('Location detected!');
      },
      () => customToast.error('Location access denied'),
    );
  };

  const activeFilterCount = [
    filters.fuel, filters.transmission, filters.seats,
    filters.minPrice, filters.maxPrice, filters.startDate,
    filters.location,
    filters.instantBooking ? '1' : '',
    filters.availableNow ? '1' : '',
  ].filter(Boolean).length;

  return (
    <div className="container-app py-8 pb-24 md:pb-8">
      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search by make, model, location..."
            value={filters.query}
            onChange={e => updateFilter('query', e.target.value)}
            className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-100 placeholder:text-dark-400 focus:outline-none focus:border-primary-500"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={"flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors " + (activeFilterCount > 0 ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-dark-800 border-dark-700 text-dark-300')}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && <span className="bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
        </button>
        <button
          onClick={() => setViewMode(v => v === 'grid' ? 'map' : 'grid')}
          className="p-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-300 hover:text-dark-100 transition-colors"
          title={viewMode === 'grid' ? 'Map view' : 'Grid view'}
        >
          {viewMode === 'grid' ? <MapIcon className="w-4 h-4" /> : <List className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => updateFilter('availableNow', !filters.availableNow)}
          className={"flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors " + (filters.availableNow ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-dark-800 border-dark-700 text-dark-400')}
        >
          <span className={"w-1.5 h-1.5 rounded-full " + (filters.availableNow ? 'bg-green-400' : 'bg-dark-500')} />
          Available Now
        </button>
        <button
          onClick={() => updateFilter('instantBooking', !filters.instantBooking)}
          className={"flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors " + (filters.instantBooking ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' : 'bg-dark-800 border-dark-700 text-dark-400')}
        >
          <Zap className="w-3 h-3" />
          Instant Booking
        </button>

        {/* Sort */}
        <div className="relative ml-auto">
          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="text-xs bg-dark-800 border border-dark-700 rounded-full pl-3 pr-7 py-1.5 text-dark-300 appearance-none focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-400 pointer-events-none" />
        </div>

        {/* Location detect */}
        <button onClick={detectLocation} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-dark-800 border-dark-700 text-dark-400 hover:text-dark-200">
          ?? Near Me
        </button>

        {/* Save search */}
        {user && (
          <button onClick={saveCurrentSearch} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border bg-dark-800 border-dark-700 text-dark-400 hover:text-dark-200">
            <Bookmark className="w-3 h-3" /> Save
          </button>
        )}

        {/* Saved searches */}
        {user && savedSearches.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border bg-dark-800 border-dark-700 text-dark-400 hover:text-dark-200"
            >
              <Clock className="w-3 h-3" /> Saved ({savedSearches.length})
            </button>
            {showSaved && (
              <div className="absolute right-0 top-full mt-1 z-30 min-w-48 bg-dark-900 border border-dark-700 rounded-xl shadow-xl py-1">
                {savedSearches.map(s => (
                  <div key={s._id} className="flex items-center justify-between px-3 py-2 hover:bg-dark-800 group">
                    <button onClick={() => loadSavedSearch(s)} className="text-xs text-dark-200 flex-1 text-left">{s.name}</button>
                    <button onClick={() => deleteSavedSearch(s._id)} className="text-dark-500 hover:text-red-400 ml-2 opacity-0 group-hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Filters */}
      {filtersOpen && (
        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-dark-400 mb-1">Fuel Type</label>
            <select value={filters.fuel} onChange={e => updateFilter('fuel', e.target.value)} className="w-full input-sm">
              <option value="">Any</option>
              {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Transmission</label>
            <select value={filters.transmission} onChange={e => updateFilter('transmission', e.target.value)} className="w-full input-sm">
              <option value="">Any</option>
              {TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Min Seats</label>
            <input type="number" min={1} max={9} value={filters.seats} onChange={e => updateFilter('seats', e.target.value)} placeholder="Any" className="w-full input-sm" />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Location</label>
            <input type="text" value={filters.location} onChange={e => updateFilter('location', e.target.value)} placeholder="City or area" className="w-full input-sm" />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Min Price/day (Rs.)</label>
            <input type="number" min={0} value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} placeholder="0" className="w-full input-sm" />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Max Price/day (Rs.)</label>
            <input type="number" min={0} value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} placeholder="No limit" className="w-full input-sm" />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">From</label>
            <input type="date" value={filters.startDate} onChange={e => updateFilter('startDate', e.target.value)} className="w-full input-sm" />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">To</label>
            <input type="date" value={filters.endDate} onChange={e => updateFilter('endDate', e.target.value)} className="w-full input-sm" />
          </div>
          <div className="col-span-2 md:col-span-4 flex justify-end">
            <button onClick={clearFilters} className="text-xs text-dark-400 hover:text-dark-200 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-dark-400">
          {loading ? 'Searching...' : (total.toLocaleString() + ' vehicle' + (total !== 1 ? 's' : '') + ' found')}
        </p>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-primary-400 hover:text-primary-300">Clear filters</button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-dark-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-300">No vehicles match your criteria</p>
          <button onClick={clearFilters} className="mt-3 text-sm text-primary-400 hover:text-primary-300">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v, idx) => (
            <ScrollReveal key={v._id} delay={idx * 80} direction={idx % 2 === 0 ? 'up' : 'scale'}>
              <div style={{ marginTop: idx % 3 === 1 ? '24px' : idx % 3 === 2 ? '12px' : '0px' }}>
                <VehicleCard vehicle={v} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-sm disabled:opacity-40">Prev</button>
          <span className="text-sm text-dark-400 flex items-center">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Recently Viewed */}
      {user && recentlyViewed.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-dark-400" /> Recently Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentlyViewed.slice(0, 3).map((v, idx) => (
              <ScrollReveal key={v._id} delay={idx * 100}>
                <VehicleCard vehicle={v} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}