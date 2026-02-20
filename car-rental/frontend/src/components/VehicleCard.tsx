import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Fuel, Settings2, Star, ArrowUpRight } from 'lucide-react';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  onQuickBook?: (vehicleId: string) => void;
}

export default function VehicleCard({ vehicle, onQuickBook }: Props) {
  const navigate = useNavigate();

  const primaryImage = vehicle.images?.find((i) => i.isPrimary) || vehicle.images?.[0];
  const imgSrc = primaryImage?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600';

  const handleView = () => navigate(`/vehicle/${vehicle._id}`);

  return (
    <article
      className="group cursor-pointer bg-white border border-sand-200 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-elevated hover:-translate-y-1 hover:border-transparent"
      onClick={handleView}
      role="article"
      aria-label={`${vehicle.title} - ₹${vehicle.pricing.baseRate}/day`}
    >
      {/* Image — with gradient scrim instead of full overlays */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-sand-100">
        <img
          src={imgSrc}
          alt={vehicle.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          loading="lazy"
        />
        {/* Subtle bottom gradient for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Fuel type — top-left pill (not top-right like typical AI cards) */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-dark-700 text-[11px] font-bold px-2.5 py-1 rounded-lg">
            <Fuel className="w-3 h-3 text-primary-500" />
            {vehicle.specs.fuel}
          </span>
        </div>

        {/* Location — bottom-right (instead of bottom-left) */}
        {vehicle.location && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-[11px] font-medium">
            <MapPin className="w-3 h-3" />
            {vehicle.location.split(',')[0]}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Title row with year */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-dark-800 group-hover:text-primary-600 transition-colors truncate">
              {vehicle.title}
            </h3>
            {vehicle.specs.year && (
              <p className="text-xs text-dark-400 mt-0.5 font-medium">
                {vehicle.specs.year}
                {vehicle.specs.color && (
                  <span className="ml-1.5 inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full border border-sand-300" style={{ background: vehicle.specs.color.toLowerCase() }} />
                    {vehicle.specs.color}
                  </span>
                )}
              </p>
            )}
          </div>
          {/* Arrow indicator */}
          <div className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5 text-dark-400 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Specs — horizontal chips with dividers */}
        <div className="flex items-center gap-3 mt-4 text-xs text-dark-400 font-medium">
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {vehicle.specs.seats}
          </span>
          <span className="w-px h-3 bg-sand-300" />
          <span className="inline-flex items-center gap-1">
            <Settings2 className="w-3.5 h-3.5" /> {vehicle.specs.transmission === 'auto' ? 'Auto' : 'Manual'}
          </span>
          <span className="w-px h-3 bg-sand-300" />
          <span className="inline-flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5" /> {vehicle.specs.fuel}
          </span>
        </div>

        {/* Price — bold, clean, left-aligned */}
        <div className="flex items-end justify-between mt-5 pt-4 border-t border-sand-200">
          <div>
            <p className="text-xs text-dark-400 font-medium mb-0.5">from</p>
            <span className="text-2xl font-extrabold text-dark-800 tracking-tight">
              ₹{vehicle.pricing.baseRate.toLocaleString()}
            </span>
            <span className="text-sm text-dark-400 font-medium ml-0.5">/day</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickBook) onQuickBook(vehicle._id);
              else navigate(`/vehicle/${vehicle._id}`);
            }}
            className="btn-primary !px-5 !py-2.5 text-sm !rounded-xl"
          >
            Book now
          </button>
        </div>
      </div>
    </article>
  );
}
