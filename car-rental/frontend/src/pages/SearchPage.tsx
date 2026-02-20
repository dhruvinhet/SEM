import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { vehiclesAPI } from '../lib/api';
import VehicleCard from '../components/VehicleCard';
import { VehicleCardSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/States';
import { Search as SearchIcon, SlidersHorizontal, X, Car, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import type { Vehicle } from '../types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [fuel, setFuel] = useState(searchParams.get('fuel') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [seats, setSeats] = useState(searchParams.get('seats') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt');
  const page = parseInt(searchParams.get('page') || '1');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page, limit: 12, sort };
      if (query) params.query = query;
      if (fuel) params.fuel = fuel;
      if (transmission) params.transmission = transmission;
      if (seats) params.seats = parseInt(seats);
      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);
      if (location) params.location = location;

      const res = await vehiclesAPI.list(params);
      setVehicles(res.data.items || res.data.vehicles || []);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [page, query, fuel, transmission, seats, minPrice, maxPrice, location, sort]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (query) params.query = query;
    if (fuel) params.fuel = fuel;
    if (transmission) params.transmission = transmission;
    if (seats) params.seats = seats;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (location) params.location = location;
    if (sort) params.sort = sort;
    params.page = '1';
    setSearchParams(params);
  };

  const clearFilters = () => {
    setQuery('');
    setFuel('');
    setTransmission('');
    setSeats('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSort('createdAt');
    setSearchParams({ page: '1' });
  };

  const hasActiveFilters = fuel || transmission || seats || minPrice || maxPrice || location;
  const activeFilterCount = [fuel, transmission, seats, minPrice, maxPrice, location].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Page header ── */}
      <div className="mb-10">
        <span className="section-label mb-3 block w-fit">Explore</span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-dark-800 !text-3xl md:!text-4xl">Browse cars</h1>
            <p className="text-dark-400 mt-2 text-sm">
              {total > 0
                ? <>{total} vehicle{total !== 1 && 's'} available <span className="text-dark-300">·</span> Page {page} of {pages}</>
                : 'Find your perfect ride'}
            </p>
          </div>

          {/* Search bar — pill-shaped */}
          <form
            onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
            className="flex gap-2 w-full md:w-auto"
          >
            <div className="relative flex-1 md:w-80">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, brand, type..."
                className="input-field !pl-11 !rounded-full !border-sand-300 !bg-white"
                aria-label="Search vehicles"
              />
            </div>
            <button type="submit" className="btn-primary !px-4 !rounded-full">
              <SearchIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`relative btn-secondary !px-4 !rounded-full ${filtersOpen ? '!border-primary-500 !text-primary-600' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── Filters Panel — redesigned with chips + clear section ── */}
      {filtersOpen && (
        <div className="rounded-3xl bg-white border border-sand-200 p-6 mb-8 animate-slide-down">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-dark-800 font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-500" />
              Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-50">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="label">Fuel type</label>
              <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="input-field !rounded-xl">
                <option value="">Any</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="label">Transmission</label>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="input-field !rounded-xl">
                <option value="">Any</option>
                <option value="auto">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="label">Min seats</label>
              <select value={seats} onChange={(e) => setSeats(e.target.value)} className="input-field !rounded-xl">
                <option value="">Any</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
                <option value="7">7+</option>
              </select>
            </div>
            <div>
              <label className="label">Min price (₹)</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input-field !rounded-xl" placeholder="0" />
            </div>
            <div>
              <label className="label">Max price (₹)</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-field !rounded-xl" placeholder="50000" />
            </div>
            <div>
              <label className="label">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field !rounded-xl" placeholder="City..." />
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-5 border-t border-sand-200">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-dark-300" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field !w-auto !py-2 !text-sm !rounded-full !border-sand-300"
              >
                <option value="createdAt">Newest first</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>
            <button onClick={applyFilters} className="btn-primary !rounded-xl !px-6">Apply</button>
          </div>
        </div>
      )}

      {/* ── Active filter chips ── */}
      {hasActiveFilters && !filtersOpen && (
        <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in">
          <span className="text-xs text-dark-400 font-medium mr-1">Active:</span>
          {fuel && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
              {fuel} <button onClick={() => { setFuel(''); applyFilters(); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {transmission && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
              {transmission} <button onClick={() => { setTransmission(''); applyFilters(); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {seats && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
              {seats}+ seats <button onClick={() => { setSeats(''); applyFilters(); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
              {location} <button onClick={() => { setLocation(''); applyFilters(); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-dark-400 hover:text-primary-600 font-medium ml-2">
            Clear all
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {error ? (
        <ErrorState message={error} onRetry={fetchVehicles} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles found"
          message="Try adjusting your filters or search query"
          icon={<Car className="w-8 h-8 text-dark-300" />}
          action={
            hasActiveFilters ? (
              <button onClick={clearFilters} className="btn-secondary text-sm !rounded-full">
                Clear Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <VehicleCard key={v._id} vehicle={v} />
            ))}
          </div>

          {/* Pagination — left/right with page indicator */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-12">
              <button
                disabled={page <= 1}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}
                className="w-10 h-10 rounded-full bg-white border border-sand-200 flex items-center justify-center text-dark-400 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(p) })}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                    p === page
                      ? 'bg-primary-500 text-white shadow-glow'
                      : 'bg-white text-dark-500 border border-sand-200 hover:border-primary-300'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= pages}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}
                className="w-10 h-10 rounded-full bg-white border border-sand-200 flex items-center justify-center text-dark-400 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
