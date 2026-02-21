import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Fuel, Settings2, Star, ArrowUpRight } from 'lucide-react';
import type { Vehicle } from '../types';
import { useTilt } from '../hooks/useTilt';

interface Props {
  vehicle: Vehicle;
  onQuickBook?: (vehicleId: string) => void;
}

export default function VehicleCard({ vehicle, onQuickBook }: Props) {
  const navigate = useNavigate();
  const { ref: tiltRef, tiltProps } = useTilt({ maxTilt: 6, scale: 1.03, speed: 400 });

  const primaryImage = vehicle.images?.find((i) => i.isPrimary) || vehicle.images?.[0];
  const imgSrc = primaryImage?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600';

  const handleView = () => navigate(`/vehicle/${vehicle._id}`);

  // Determine ribbon: low price = deal, high rating = popular, recent = new
  const getRibbon = () => {
    if (vehicle.pricing.baseRate < 1500) return { label: 'Best Deal', cls: 'ribbon-deal' };
    if ((vehicle as any).avgRating >= 4.5) return { label: 'Popular', cls: 'ribbon-popular' };
    return null;
  };
  const ribbon = getRibbon();

  return (
    <article
      ref={tiltRef as React.RefObject<HTMLElement>}
      {...tiltProps}
      className="group cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 relative holo-card"
      onClick={handleView}
      role="article"
      aria-label={`${vehicle.title} - ₹${vehicle.pricing.baseRate}/day`}
      style={{ ...tiltProps.style, background: 'linear-gradient(145deg, rgba(22,23,31,1) 0%, rgba(28,29,39,1) 100%)' }}
    >
      {/* Corner ribbon badge */}
      {ribbon && (
        <div className={`ribbon-badge ${ribbon.cls}`}>
          {ribbon.label}
        </div>
      )}

      {/* Neon border glow on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" style={{ background: 'linear-gradient(135deg, rgba(255,68,51,0.3), rgba(0,212,255,0.2), rgba(168,85,247,0.2))', filter: 'blur(20px)' }} />
      <div className="absolute inset-0 rounded-3xl border border-white/[0.06] group-hover:border-white/[0.12] transition-colors duration-500" />

      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden">
        <img
          src={imgSrc}
          alt={vehicle.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.08] group-hover:brightness-110"
          loading="lazy"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Fuel type pill */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 bg-dark-900/70 backdrop-blur-xl text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
            <Fuel className="w-3 h-3 text-primary-400" />
            {vehicle.specs.fuel}
          </span>
        </div>

        {/* Location */}
        {vehicle.location && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/80 text-[11px] font-medium">
            <MapPin className="w-3 h-3" />
            {vehicle.location.split(',')[0]}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white group-hover:text-primary-400 transition-colors truncate">
              {vehicle.title}
            </h3>
            {vehicle.specs.year && (
              <p className="text-xs text-dark-400 mt-0.5 font-medium">
                {vehicle.specs.year}
                {vehicle.specs.color && (
                  <span className="ml-1.5 inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full border border-dark-600" style={{ background: vehicle.specs.color.toLowerCase() }} />
                    {vehicle.specs.color}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:shadow-glow transition-all duration-300">
            <ArrowUpRight className="w-3.5 h-3.5 text-dark-400 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 mt-4 text-xs text-dark-400 font-medium">
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-neon-blue" /> {vehicle.specs.seats}
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="inline-flex items-center gap-1">
            <Settings2 className="w-3.5 h-3.5 text-neon-purple" /> {vehicle.specs.transmission === 'auto' ? 'Auto' : 'Manual'}
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="inline-flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-neon-green" /> {vehicle.specs.fuel}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mt-5 pt-4 border-t border-white/[0.06]">
          <div>
            <p className="text-xs text-dark-500 font-medium mb-0.5">from</p>
            <span className="text-2xl font-extrabold text-white tracking-tight">
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
