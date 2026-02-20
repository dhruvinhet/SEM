import React from 'react';

export function VehicleCardSkeleton() {
  return (
    <div className="rounded-3xl border border-sand-200 bg-white overflow-hidden">
      <div className="h-52 skeleton !rounded-none" />
      <div className="p-5 space-y-3">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-3.5 skeleton w-1/2" />
        <div className="flex gap-3 pt-1">
          <div className="h-4 skeleton w-10" />
          <div className="h-4 skeleton w-10" />
          <div className="h-4 skeleton w-10" />
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-sand-200">
          <div className="h-7 skeleton w-28" />
          <div className="h-10 skeleton w-24 !rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BookingRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-16 h-12 skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton w-48" />
        <div className="h-3 skeleton w-32" />
      </div>
      <div className="h-6 skeleton w-20 !rounded-md" />
      <div className="h-5 skeleton w-16" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6">
      <div className="h-4 skeleton w-24 mb-3" />
      <div className="h-8 skeleton w-32 mb-2" />
      <div className="h-3 skeleton w-20" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="h-8 skeleton w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="space-y-3">
        <BookingRowSkeleton />
        <BookingRowSkeleton />
        <BookingRowSkeleton />
      </div>
    </div>
  );
}
