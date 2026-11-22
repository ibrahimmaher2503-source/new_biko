import { useState, useEffect, useCallback } from 'react';

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GpsLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'prompt' | 'denied' | 'unsupported'>('prompt');

  // Check initial permission state if supported
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus('unsupported');
      setError('خاصية تحديد الموقع الجغرافي (GPS) غير مدعومة في هذا المتصفح.');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state as any);
          result.onchange = () => {
            setPermissionStatus(result.state as any);
          };
        })
        .catch(() => {});
    }
  }, []);

  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('GPS غير مدعوم في متصفحك');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setLoading(false);
        setPermissionStatus('granted');
      },
      (err) => {
        setLoading(false);
        let msg = 'تعذر الحصول على إحداثيات GPS الحالية.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'يرجى السماح بصلاحية الموقع الجغرافي (GPS) في المتصفح لاستخدام الخدمة.';
          setPermissionStatus('denied');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'إشارة الـ GPS غير متوفرة حالياً.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'استغرق استرداد موقع الـ GPS وقتاً طويلاً.';
        }
        setError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  }, []);

  return {
    location,
    loading,
    error,
    permissionStatus,
    requestGpsLocation,
  };
}
