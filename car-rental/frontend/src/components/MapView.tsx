/**
 * MapView Component
 * 
 * Shows vehicles on a map. Uses OpenStreetMap embed via iframe for a simple map view.
 * For full interactivity with custom pins, install: npm install react-leaflet leaflet @types/leaflet
 */
import React, { useState } from 'react';
import { MapPin, Navigation, Car, Star, Zap } from 'lucide-react';
import { Vehicle } from '../types';
import { useNavigate } from 'react-router-dom';

interface MapViewProps {
  vehicles: Vehicle[];
  userLat?: number;
  userLng?: number;
}

export default function MapView({ vehicles, userLat, userLng }: MapViewProps) {
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const navigate = useNavigate();

  // Center map on first vehicle with geoLocation or a default (India center)
  const vehiclesWithGeo = vehicles.filter(v => v.geoLocation?.lat && v.geoLocation?.lng);
  const centerLat = userLat ?? vehiclesWithGeo[0]?.geoLocation?.lat ?? 20.5937;
  const centerLng = userLng ?? vehiclesWithGeo[0]?.geoLocation?.lng ?? 78.9629;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.5},${centerLat - 0.3},${centerLng + 0.5},${centerLat + 0.3}&layer=mapnik`;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-dark-700 h-[520px]">
      {/* Map iframe */}
      <iframe
        src={mapUrl}
        className="w-full h-full border-0 grayscale contrast-125 brightness-75"
        title="Vehicle Map"
        loading="lazy"
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-dark-950/30 pointer-events-none" />

      {/* Vehicle pins overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {vehiclesWithGeo.map(v => {
          // Rough pixel mapping — works for overview area
          const deltaLat = (centerLat - (v.geoLocation!.lat ?? centerLat));
          const deltaLng = ((v.geoLocation!.lng ?? centerLng) - centerLng);
          // Map delta to % of container (viewport ~1 degree = ~33% height at this bbox)
          const top = `${50 + deltaLat * 30}%`;
          const left = `${50 + deltaLng * 15}%`;

          return (
            <button
              key={v._id}
              style={{ top, left, position: 'absolute', transform: 'translate(-50%, -100%)', pointerEvents: 'auto' }}
              onClick={() => setSelected(v)}
              className="group focus:outline-none"
              aria-label={v.title}
            >
              <div className={`relative flex flex-col items-center transition-transform group-hover:scale-110 ${selected?._id === v._id ? 'scale-110' : ''}`}>
                <div className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap border-2 border-white">
                  ₹{v.pricing.baseRate}
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-[6px] border-l-transparent border-r-transparent border-t-primary-500 -mt-px" />
              </div>
            </button>
          );
        })}
      </div>

      {/* User location pin */}
      {userLat && userLng && (
        <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <div className="bg-blue-500 text-white w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <Navigation className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Vehicles without geo – listed */}
      {vehicles.length > vehiclesWithGeo.length && (
        <div className="absolute bottom-24 right-3 bg-dark-900/90 rounded-lg px-3 py-1.5 text-xs text-dark-300">
          {vehicles.length - vehiclesWithGeo.length} vehicles without location data
        </div>
      )}

      {/* Selected vehicle popup */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 bg-dark-900 border border-dark-700 rounded-2xl p-4 shadow-2xl flex gap-3">
          {selected.images[0] && (
            <img
              src={selected.images[0].url}
              alt={selected.title}
              className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-dark-50 text-sm truncate">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-dark-400 hover:text-dark-200 flex-shrink-0 text-lg leading-none">×</button>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {selected.avgRating != null && (
                <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-400" /> {selected.avgRating.toFixed(1)}
                </span>
              )}
              {selected.instantBooking && (
                <span className="text-xs text-green-400 flex items-center gap-0.5">
                  <Zap className="w-3 h-3" /> Instant
                </span>
              )}
              {selected.distanceKm != null && (
                <span className="text-xs text-dark-400 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" /> {selected.distanceKm} km
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-primary-400 font-semibold text-sm">₹{selected.pricing.baseRate}/day</span>
              <button
                onClick={() => navigate(`/vehicle/${selected._id}`)}
                className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded-lg"
              >
                View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No geo data notice */}
      {vehiclesWithGeo.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-dark-900/90 rounded-2xl p-6 text-center">
            <MapPin className="w-8 h-8 text-dark-400 mx-auto mb-2" />
            <p className="text-dark-300 text-sm">No location data available</p>
            <p className="text-dark-400 text-xs mt-1">Owners need to add GPS coordinates</p>
          </div>
        </div>
      )}
    </div>
  );
}
