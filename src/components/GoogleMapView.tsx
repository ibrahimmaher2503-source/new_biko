import React, { useEffect, useState } from 'react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Navigation, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { LocationSelection } from '../types/biko';
import { GpsLocation } from '../hooks/useGeolocation';

interface GoogleMapViewProps {
  pickup?: LocationSelection | null;
  destination?: LocationSelection | null;
  userGpsLocation?: GpsLocation | null;
  gpsLoading?: boolean;
  gpsError?: string | null;
  onRequestGps?: () => void;
  captainLocation?: { latitude: number; longitude: number; name?: string } | null;
  className?: string;
  zoom?: number;
}

// Sub-component to re-center the map when locations or GPS change
function MapCenterController({
  center,
  zoom,
}: {
  center: { lat: number; lng: number };
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    if (zoom) map.setZoom(zoom);
  }, [map, center.lat, center.lng, zoom]);
  return null;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  pickup,
  destination,
  userGpsLocation,
  gpsLoading,
  gpsError,
  onRequestGps,
  captainLocation,
  className = 'h-52 w-full',
  zoom = 13,
}) => {
  // Center determination priority: User GPS -> Pickup -> Destination -> Cairo Center
  const defaultCairo = { lat: 30.0444, lng: 31.2357 };
  const currentCenter = userGpsLocation
    ? { lat: userGpsLocation.latitude, lng: userGpsLocation.longitude }
    : pickup
    ? { lat: pickup.latitude, lng: pickup.longitude }
    : defaultCairo;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 ${className}`}>
      {/* Google Map Container with explicit CSS dimensions */}
      <div style={{ width: '100%', height: '100%' }}>
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={currentCenter}
          defaultZoom={zoom}
          style={{ width: '100%', height: '100%' }}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          <MapCenterController center={currentCenter} zoom={zoom} />

          {/* User Real GPS Location Marker (Pulsing Blue Radar Beacon) */}
          {userGpsLocation && (
            <AdvancedMarker
              position={{
                lat: userGpsLocation.latitude,
                lng: userGpsLocation.longitude,
              }}
              title="موقعي الحالي (GPS)"
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75" />
                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Pickup Marker (Emerald Green Pin) */}
          {pickup && (
            <AdvancedMarker
              position={{ lat: pickup.latitude, lng: pickup.longitude }}
              title={pickup.name}
            >
              <Pin
                background={'#10B981'}
                borderColor={'#065F46'}
                glyphColor={'#FFFFFF'}
                scale={1.1}
              />
            </AdvancedMarker>
          )}

          {/* Destination Marker (Biko Red Pin) */}
          {destination && (
            <AdvancedMarker
              position={{ lat: destination.latitude, lng: destination.longitude }}
              title={destination.name}
            >
              <Pin
                background={'#E50914'}
                borderColor={'#991B1B'}
                glyphColor={'#FFFFFF'}
                scale={1.1}
              />
            </AdvancedMarker>
          )}

          {/* Motorcycle Captain Marker (if active trip) */}
          {captainLocation && (
            <AdvancedMarker
              position={{ lat: captainLocation.latitude, lng: captainLocation.longitude }}
              title={captainLocation.name || 'كابتن بيكو'}
            >
              <div className="flex flex-col items-center">
                <div className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold shadow-md whitespace-nowrap mb-1">
                  {captainLocation.name || 'كابتن بيكو'}
                </div>
                <div className="w-9 h-9 rounded-full bg-[#E50914] text-white border-2 border-white shadow-lg flex items-center justify-center">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H10c-2.21 0-4 1.79-4 4 0 .34.05.67.12.98C4.54 14.54 3 16.59 3 19c0 2.76 2.24 5 5 5 2.41 0 4.46-1.54 4.98-3.71.36.08.73.12 1.11.12.38 0 .75-.04 1.11-.12.52 2.17 2.57 3.71 4.98 3.71 2.76 0 5-2.24 5-5 0-2.41-1.54-4.46-3.71-4.98-.03-.99-.44-1.92-1.12-2.61l.09-.13.96.96 1.41-1.41-2.38-2.45zm-11.44 13c-1.65 0-3-1.35-3-3s1.35-3 3-3c1.53 0 2.81 1.17 2.97 2.68-.62.4-1.15.93-1.55 1.55C7.29 20.08 7.15 20 7 20c-.55 0-1 .45-1 1s.45 1 1 1h1zm11 0c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
                  </svg>
                </div>
              </div>
            </AdvancedMarker>
          )}
        </Map>
      </div>

      {/* Floating GPS Services Status Pill & Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {/* GPS Status Indicator */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
          {gpsLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>جاري تحديد موقع الـ GPS...</span>
            </>
          ) : userGpsLocation ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700">GPS نشط (دقة عالية)</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-slate-500" />
              <span>خدمة الـ GPS جاهزة</span>
            </>
          )}
        </div>

        {/* GPS Re-center Floating Action Button */}
        {onRequestGps && (
          <button
            onClick={onRequestGps}
            disabled={gpsLoading}
            className="pointer-events-auto w-9 h-9 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-[#E50914] shadow-md border border-slate-200 flex items-center justify-center transition disabled:opacity-50"
            title="تحديث موقعي الحالي عبر GPS"
          >
            <Navigation className={`w-4 h-4 fill-current ${gpsLoading ? 'animate-pulse' : ''}`} />
          </button>
        )}
      </div>

      {/* GPS Error Notification if permission was denied */}
      {gpsError && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-600/95 backdrop-blur-md text-white text-[10px] font-medium p-2 rounded-xl flex items-center gap-1.5 shadow-lg z-10">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{gpsError}</span>
        </div>
      )}
    </div>
  );
};
