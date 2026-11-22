import React, { useState } from 'react';
import { MapPin, Search, Navigation, X, Check } from 'lucide-react';
import { LocationSelection } from '../types/biko';
import { CAIRO_LOCATIONS } from '../data/mockData';

interface LocationPickerModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: LocationSelection) => void;
  initialLocation?: LocationSelection;
  lang: 'ar' | 'en';
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  title,
  isOpen,
  onClose,
  onSelect,
  initialLocation,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const filteredLocations = CAIRO_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.displayAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.area && loc.area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCustomAdd = () => {
    if (!customAddress.trim()) return;
    const newLoc: LocationSelection = {
      name: customAddress.trim(),
      displayAddress: `${customAddress.trim()}، القاهرة`,
      latitude: 30.0444 + (Math.random() - 0.5) * 0.08,
      longitude: 31.2357 + (Math.random() - 0.5) * 0.08,
      area: isAr ? 'موقع مخصص' : 'Custom Location',
    };
    onSelect(newLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={isAr ? 'ابحث في أحياء ومعالم القاهرة...' : 'Search Cairo landmarks & neighborhoods...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
              autoFocus
            />
          </div>

          {/* Quick Real GPS Location button */}
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    onSelect({
                      name: isAr ? 'موقعي الحالي (GPS)' : 'Current GPS Location',
                      displayAddress: isAr
                        ? `إحداثيات حية: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`
                        : `Live GPS: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`,
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude,
                      area: isAr ? 'GPS مباشر' : 'Live GPS',
                    });
                    onClose();
                  },
                  () => {
                    // Fallback to central Cairo if permission denied
                    onSelect({
                      name: isAr ? 'موقعي الحالي' : 'Current GPS Location',
                      displayAddress: isAr ? 'شارع التحرير، الدقي، الجيزة' : 'Tahrir St, Dokki, Giza',
                      latitude: 30.0384,
                      longitude: 31.2124,
                      area: isAr ? 'الدقي' : 'Dokki',
                    });
                    onClose();
                  },
                  { enableHighAccuracy: true, timeout: 8000 }
                );
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 text-[#E50914] hover:bg-red-100 text-xs font-semibold transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            {isAr ? 'تحديد موقعي الحالي تلقائياً عبر GPS' : 'Detect My Exact Location via GPS'}
          </button>
        </div>

        {/* Location List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            {isAr ? 'أماكن ومحطات شهيرة' : 'Popular Landmarks'}
          </div>

          <div className="space-y-1.5">
            {filteredLocations.map((loc) => {
              const isSelected = initialLocation?.name === loc.name;
              return (
                <button
                  key={loc.name}
                  onClick={() => {
                    onSelect(loc);
                    onClose();
                  }}
                  className={`w-full text-right p-3 rounded-xl border flex items-center justify-between transition ${
                    isSelected
                      ? 'border-[#E50914] bg-red-50/50'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#E50914] text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{loc.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                        {loc.displayAddress}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#E50914]" />}
                </button>
              );
            })}
          </div>

          {/* Custom text location input */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
              {isAr ? 'أو اكتب عنواناً آخر' : 'Or enter custom address'}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isAr ? 'مثال: شارع مصدق أمام سينما التحرير' : 'e.g., Mosaddak St, in front of cinema'}
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E50914]"
              />
              <button
                onClick={handleCustomAdd}
                disabled={!customAddress.trim()}
                className="px-4 py-2 bg-[#E50914] hover:bg-[#B70710] disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition"
              >
                {isAr ? 'تأكيد' : 'Set'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
