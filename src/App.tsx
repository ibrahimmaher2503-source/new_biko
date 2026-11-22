import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  Home,
  Receipt,
  User,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  X
} from 'lucide-react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { CreateOrderView } from './components/CreateOrderView';
import { OrderStatusView } from './components/OrderStatusView';
import { OrderHistoryView } from './components/OrderHistoryView';
import { ProfileView } from './components/ProfileView';
import { LocationPickerModal } from './components/LocationPickerModal';
import { useGeolocation } from './hooks/useGeolocation';
import {
  LocationSelection,
  ServiceType,
  CustomerOrder,
  OrderStatus,
  CustomerProfile,
} from './types/biko';
import {
  CAIRO_LOCATIONS,
  MOCK_PROFILE,
  INITIAL_ORDER_HISTORY,
} from './data/mockData';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'profile'>('home');
  const [showImportNotice, setShowImportNotice] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Real GPS Geolocation Hook
  const {
    location: userGpsLocation,
    loading: gpsLoading,
    error: gpsError,
    requestGpsLocation,
  } = useGeolocation();

  // Tier 2 In-App Quota Listener
  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  // When GPS location becomes available, offer or auto-set as pickup if user hasn't customized
  useEffect(() => {
    if (userGpsLocation) {
      setPickup({
        name: lang === 'ar' ? 'موقعي الحالي (GPS)' : 'Current Location (GPS)',
        displayAddress: lang === 'ar' ? 'إحداثياتك المباشرة بدقة عالية' : 'Your real-time GPS coordinates',
        latitude: userGpsLocation.latitude,
        longitude: userGpsLocation.longitude,
        area: lang === 'ar' ? 'GPS مباشر' : 'Live GPS',
      });
    }
  }, [userGpsLocation, lang]);

  // Profile State
  const [profile, setProfile] = useState<CustomerProfile>(MOCK_PROFILE);

  // Location Selections for Home
  const [pickup, setPickup] = useState<LocationSelection | null>(CAIRO_LOCATIONS[0]); // Tahrir
  const [destination, setDestination] = useState<LocationSelection | null>(CAIRO_LOCATIONS[1]); // City Stars

  // Modal State for Location Picking
  const [locationPickerState, setLocationPickerState] = useState<{
    isOpen: boolean;
    isPickup: boolean;
  }>({ isOpen: false, isPickup: true });

  // Order Creation Draft State
  const [draftService, setDraftService] = useState<ServiceType | null>(null);

  // Active Order State (replicates activeOrderProvider from Biko Flutter)
  const [activeOrder, setActiveOrder] = useState<CustomerOrder | null>(null);

  // Order History State
  const [orderHistory, setOrderHistory] = useState<CustomerOrder[]>(INITIAL_ORDER_HISTORY);

  // Handlers
  const handleOpenLocationPicker = (isPickup: boolean) => {
    setLocationPickerState({ isOpen: true, isPickup });
  };

  const handleLocationSelected = (loc: LocationSelection) => {
    if (locationPickerState.isPickup) {
      setPickup(loc);
    } else {
      setDestination(loc);
    }
  };

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  const handleStartBooking = (service: ServiceType) => {
    if (!pickup || !destination) {
      handleOpenLocationPicker(!pickup);
      return;
    }
    setDraftService(service);
  };

  const handleSubmitOrder = (orderData: Partial<CustomerOrder>) => {
    const newOrder: CustomerOrder = {
      id: `ord_${Date.now().toString().slice(-6)}`,
      service: orderData.service || 'ride',
      pickup: orderData.pickup || pickup!,
      destination: orderData.destination || destination!,
      proposedPrice: orderData.proposedPrice || 35,
      status: 'bidding',
      createdAt: new Date().toISOString(),
      biddingExpiresAt: new Date(Date.now() + 120000).toISOString(),
      distanceKm: orderData.distanceKm || 6.5,
      durationMinutes: orderData.durationMinutes || 15,
      delivery: orderData.delivery,
      deliveryCode: orderData.deliveryCode,
    };

    setActiveOrder(newOrder);
    setDraftService(null);
  };

  const handleUpdateOrderStatus = (
    newStatus: OrderStatus,
    updatedFields?: Partial<CustomerOrder>
  ) => {
    if (!activeOrder) return;

    const updated = {
      ...activeOrder,
      status: newStatus,
      ...updatedFields,
    };

    setActiveOrder(updated);

    // If order finalized (completed/cancelled), record in history
    if (newStatus === 'completed' || newStatus === 'cancelled' || newStatus === 'expired') {
      setOrderHistory((prev) => [updated, ...prev]);

      // If completed, deduct wallet if user has balance
      if (newStatus === 'completed' && updated.agreedPrice) {
        setProfile((p) => ({
          ...p,
          totalTrips: p.totalTrips + 1,
        }));
      }
    }
  };

  const handleCancelOrder = (reason: string) => {
    handleUpdateOrderStatus('cancelled', { cancellationReason: reason });
  };

  const handleBookAgain = (order: CustomerOrder) => {
    setPickup(order.pickup);
    setDestination(order.destination);
    setDraftService(order.service);
    setCurrentTab('home');
  };

  const isAr = lang === 'ar';

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      language={lang}
      region="EG"
    >
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="min-h-screen bg-[#F7F7F8] text-[#111111] flex flex-col font-sans selection:bg-[#E50914] selection:text-white"
      >
        {/* Tier 2 Google Maps Quota Warning Banner (if quota reached) */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Top GitHub Repo Ported Banner */}
        {showImportNotice && (
          <div className="bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-semibold text-emerald-400">
                {isAr ? 'خدمة الـ GPS وخرائط Google نشطة:' : 'GPS & Google Maps Active:'}
              </span>
              <span className="font-mono text-slate-300 truncate">
                ibrahimmaher2503-source/biko-user-app
              </span>
            </div>
            <button
              onClick={() => setShowImportNotice(false)}
              className="text-slate-400 hover:text-white shrink-0 pr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Biko Header */}
        <Header
          profile={profile}
          lang={lang}
          onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        />

        {/* Active Order Float Banner (if order active while on another tab) */}
        {activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && currentTab !== 'home' && (
          <div className="max-w-md mx-auto w-full px-4 pt-3">
            <button
              onClick={() => setCurrentTab('home')}
              className="w-full bg-[#E50914] text-white px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between text-xs font-bold animate-bounce"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>
                  {activeOrder.status === 'bidding'
                    ? (isAr ? 'طلبك نشط: جاري استقبال عروض الكباتن...' : 'Request active: Receiving offers...')
                    : (isAr ? 'رحلتك الحالية جارية &bull; انقر للمتابعة' : 'Trip in progress &bull; Click to track')}
                </span>
              </div>
              <span>{isAr ? 'عرض الطلب' : 'View'} &rarr;</span>
            </button>
          </div>
        )}

        {/* Main Body Container (constrained to mobile phone layout) */}
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
          {/* VIEW 1: ACTIVE ORDER RUNNING */}
          {activeOrder && currentTab === 'home' ? (
            <OrderStatusView
              order={activeOrder}
              onUpdateStatus={handleUpdateOrderStatus}
              onCancelOrder={handleCancelOrder}
              onNewOrder={() => setActiveOrder(null)}
              userGpsLocation={userGpsLocation}
              onRequestGps={requestGpsLocation}
              lang={lang}
            />
          ) : draftService && currentTab === 'home' ? (
            /* VIEW 2: CREATE ORDER / FARE NEGOTIATION */
            <CreateOrderView
              service={draftService}
              pickup={pickup!}
              destination={destination!}
              onBack={() => setDraftService(null)}
              onSubmitOrder={handleSubmitOrder}
              userGpsLocation={userGpsLocation}
              lang={lang}
            />
          ) : (
            /* VIEW 3: STANDARD TABS (HOME, HISTORY, PROFILE) */
            <>
              {currentTab === 'home' && (
                <HomeView
                  pickup={pickup}
                  destination={destination}
                  onSelectLocation={handleOpenLocationPicker}
                  onSwapLocations={handleSwapLocations}
                  onStartOrder={handleStartBooking}
                  lastOrder={orderHistory[0]}
                  onBookAgain={handleBookAgain}
                  onGoToHistory={() => setCurrentTab('history')}
                  userGpsLocation={userGpsLocation}
                  gpsLoading={gpsLoading}
                  gpsError={gpsError}
                  onRequestGps={requestGpsLocation}
                  lang={lang}
                />
              )}

              {currentTab === 'history' && (
                <OrderHistoryView
                  orders={orderHistory}
                  onBookAgain={handleBookAgain}
                  lang={lang}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  profile={profile}
                  onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
                  lang={lang}
                  onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Bar (replicates AppBottomNavigation in user_shell.dart) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
          <div className="max-w-md mx-auto grid grid-cols-3 h-16 px-4">
            {/* Home Tab */}
            <button
              onClick={() => {
                setDraftService(null);
                setCurrentTab('home');
              }}
              className={`flex flex-col items-center justify-center gap-1 transition ${
                currentTab === 'home'
                  ? 'text-[#E50914] font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Home className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px]">{isAr ? 'الرئيسية' : 'Home'}</span>
            </button>

            {/* History Tab */}
            <button
              onClick={() => setCurrentTab('history')}
              className={`flex flex-col items-center justify-center gap-1 transition ${
                currentTab === 'history'
                  ? 'text-[#E50914] font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Receipt className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px]">{isAr ? 'طلباتي' : 'Orders'}</span>
            </button>

            {/* Account Tab */}
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex flex-col items-center justify-center gap-1 transition ${
                currentTab === 'profile'
                  ? 'text-[#E50914] font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <User className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px]">{isAr ? 'الحساب' : 'Account'}</span>
            </button>
          </div>
        </nav>

        {/* Location Picker Modal */}
        <LocationPickerModal
          title={
            locationPickerState.isPickup
              ? isAr
                ? 'اختر نقطة الاستلام'
                : 'Select Pickup'
              : isAr
              ? 'اختر الوجهة'
              : 'Select Destination'
          }
          isOpen={locationPickerState.isOpen}
          onClose={() => setLocationPickerState((s) => ({ ...s, isOpen: false }))}
          onSelect={handleLocationSelected}
          initialLocation={
            locationPickerState.isPickup ? pickup || undefined : destination || undefined
          }
          lang={lang}
        />
      </div>
    </APIProvider>
  );
}
