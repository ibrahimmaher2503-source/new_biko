import React from 'react';
import {
  MapPin,
  ArrowDownUp,
  Package,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  Navigation
} from 'lucide-react';
import { LocationSelection, ServiceType, CustomerOrder } from '../types/biko';
import { GoogleMapView } from './GoogleMapView';
import { GpsLocation } from '../hooks/useGeolocation';

interface HomeViewProps {
  pickup: LocationSelection | null;
  destination: LocationSelection | null;
  onSelectLocation: (isPickup: boolean) => void;
  onSwapLocations: () => void;
  onStartOrder: (service: ServiceType) => void;
  lastOrder?: CustomerOrder;
  onBookAgain: (order: CustomerOrder) => void;
  onGoToHistory: () => void;
  userGpsLocation?: GpsLocation | null;
  gpsLoading?: boolean;
  gpsError?: string | null;
  onRequestGps?: () => void;
  lang: 'ar' | 'en';
}

export const HomeView: React.FC<HomeViewProps> = ({
  pickup,
  destination,
  onSelectLocation,
  onSwapLocations,
  onStartOrder,
  lastOrder,
  onBookAgain,
  onGoToHistory,
  userGpsLocation,
  gpsLoading,
  gpsError,
  onRequestGps,
  lang,
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Hero Welcome & Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isAr ? 'إلى أين؟' : 'Where to?'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr ? 'حدّد المسار عبر خرائط Google وخدمة الـ GPS.' : 'Set route via Google Maps & GPS.'}
          </p>
        </div>
        <button
          onClick={onRequestGps}
          disabled={gpsLoading}
          className="w-10 h-10 rounded-2xl bg-red-50 text-[#E50914] hover:bg-red-100 flex items-center justify-center shadow-xs transition"
          title={isAr ? 'تفعيل خدمة الـ GPS' : 'Activate GPS'}
        >
          <Navigation className={`w-5 h-5 fill-current ${gpsLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Interactive Google Map with live GPS positioning */}
      <GoogleMapView
        pickup={pickup}
        destination={destination}
        userGpsLocation={userGpsLocation}
        gpsLoading={gpsLoading}
        gpsError={gpsError}
        onRequestGps={onRequestGps}
        className="h-48 w-full shadow-md"
      />

      {/* Location Input Box */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 relative">
        {/* Swap button */}
        {pickup && destination && (
          <button
            onClick={onSwapLocations}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 flex items-center justify-center shadow-xs z-10 transition"
            title={isAr ? 'تبديل نقطة الاستلام والوجهة' : 'Swap pickup and destination'}
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Pickup Field */}
        <div
          onClick={() => onSelectLocation(true)}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition"
        >
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              {isAr ? 'نقطة الاستلام' : 'Pickup Location'}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate block">
              {pickup ? pickup.name : isAr ? 'اختر نقطة الانطلاق...' : 'Select pickup point...'}
            </span>
          </div>
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Destination Field */}
        <div
          onClick={() => onSelectLocation(false)}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition"
        >
          <div className="w-3 h-3 rounded-full bg-[#E50914] ring-4 ring-red-100 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              {isAr ? 'الوجهة' : 'Destination'}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate block">
              {destination ? destination.name : isAr ? 'إلى أين تتجه؟' : 'Where are you heading?'}
            </span>
          </div>
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Service Selection Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">
            {isAr ? 'احجز الآن بالدراجة' : 'Book a Motorcycle'}
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">
            {isAr ? 'بسعر تقترحه أنت' : 'Your Proposed Fare'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Ride Card */}
          <button
            onClick={() => onStartOrder('ride')}
            className="text-right p-4 rounded-2xl bg-white hover:bg-red-50/40 border-2 border-transparent hover:border-[#E50914]/40 shadow-sm transition group active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center mb-3 group-hover:scale-105 transition shadow-xs">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H10c-2.21 0-4 1.79-4 4 0 .34.05.67.12.98C4.54 14.54 3 16.59 3 19c0 2.76 2.24 5 5 5 2.41 0 4.46-1.54 4.98-3.71.36.08.73.12 1.11.12.38 0 .75-.04 1.11-.12.52 2.17 2.57 3.71 4.98 3.71 2.76 0 5-2.24 5-5 0-2.41-1.54-4.46-3.71-4.98-.03-.99-.44-1.92-1.12-2.61l.09-.13.96.96 1.41-1.41-2.38-2.45zm-11.44 13c-1.65 0-3-1.35-3-3s1.35-3 3-3c1.53 0 2.81 1.17 2.97 2.68-.62.4-1.15.93-1.55 1.55C7.29 20.08 7.15 20 7 20c-.55 0-1 .45-1 1s.45 1 1 1h1zm11 0c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
              </svg>
            </div>
            <div className="font-bold text-sm text-slate-900">{isAr ? 'رحلة' : 'Ride'}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{isAr ? 'راكب واحد' : '1 Passenger'}</div>
            <div className="mt-2 text-[10px] font-semibold text-[#E50914] flex items-center gap-1">
              <span>{isAr ? 'طلب فوري' : 'Instant booking'}</span>
              <ChevronLeft className="w-3 h-3" />
            </div>
          </button>

          {/* Delivery Card */}
          <button
            onClick={() => onStartOrder('delivery')}
            className="text-right p-4 rounded-2xl bg-white hover:bg-amber-50/40 border-2 border-transparent hover:border-amber-400/50 shadow-sm transition group active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center mb-3 group-hover:scale-105 transition shadow-xs">
              <Package className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="font-bold text-sm text-slate-900">{isAr ? 'توصيل' : 'Delivery'}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{isAr ? 'طرد حتى 8 كجم' : 'Parcel up to 8kg'}</div>
            <div className="mt-2 text-[10px] font-semibold text-[#F59E0B] flex items-center gap-1">
              <span>{isAr ? 'توصيل سريع' : 'Fast courier'}</span>
              <ChevronLeft className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>


      {/* Last Order / Book Again Card */}
      {lastOrder && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {isAr ? 'آخر طلب' : 'Last Order'}
            </h3>
            <button
              onClick={onGoToHistory}
              className="text-[11px] font-semibold text-[#E50914] hover:underline"
            >
              {isAr ? 'كل الطلبات' : 'All Orders'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {lastOrder.service === 'ride' ? (isAr ? 'رحلة' : 'Ride') : (isAr ? 'توصيل' : 'Delivery')}
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {lastOrder.agreedPrice || lastOrder.proposedPrice} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                {isAr ? 'مكتمل' : 'Completed'}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{lastOrder.pickup.name}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-[#E50914] shrink-0" />
                <span className="truncate">{lastOrder.destination.name}</span>
              </div>
            </div>

            <button
              onClick={() => onBookAgain(lastOrder)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-[#E50914] text-xs font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isAr ? 'طلب مرة أخرى' : 'Book Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
