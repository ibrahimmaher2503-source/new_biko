import React, { useState, useEffect } from 'react';
import {
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Navigation,
  ChevronLeft,
  Key,
  Flame,
  ArrowRight
} from 'lucide-react';
import { CustomerOrder, DriverOffer, OrderStatus } from '../types/biko';
import { MOCK_DRIVERS } from '../data/mockData';
import { GoogleMapView } from './GoogleMapView';
import { GpsLocation } from '../hooks/useGeolocation';

interface OrderStatusViewProps {
  order: CustomerOrder;
  onUpdateStatus: (newStatus: OrderStatus, updatedFields?: Partial<CustomerOrder>) => void;
  onCancelOrder: (reason: string) => void;
  onNewOrder: () => void;
  userGpsLocation?: GpsLocation | null;
  onRequestGps?: () => void;
  lang: 'ar' | 'en';
}

export const OrderStatusView: React.FC<OrderStatusViewProps> = ({
  order,
  onUpdateStatus,
  onCancelOrder,
  onNewOrder,
  userGpsLocation,
  onRequestGps,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [availableOffers, setAvailableOffers] = useState<DriverOffer[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // Captain live location calculation based on order status
  const captainLocation = order.driver
    ? {
        latitude:
          order.status === 'in_transit'
            ? (order.pickup.latitude + order.destination.latitude) / 2
            : order.status === 'arrived_pickup'
            ? order.pickup.latitude + 0.0005
            : order.pickup.latitude + 0.004,
        longitude:
          order.status === 'in_transit'
            ? (order.pickup.longitude + order.destination.longitude) / 2
            : order.status === 'arrived_pickup'
            ? order.pickup.longitude + 0.0005
            : order.pickup.longitude + 0.004,
        name: order.driver.driverFirstName,
      }
    : null;

  // Countdown timer for bidding phase
  useEffect(() => {
    if (order.status !== 'bidding') return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          onUpdateStatus('expired');
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order.status, onUpdateStatus]);

  // Simulate incoming driver offers during bidding
  useEffect(() => {
    if (order.status !== 'bidding') return;

    setAvailableOffers([]);

    // First offer arrives in 2 seconds
    const t1 = setTimeout(() => {
      const first = { ...MOCK_DRIVERS[0], price: order.proposedPrice };
      setAvailableOffers([first]);
    }, 1800);

    // Second offer arrives in 4.5 seconds (counter-offer +5 EGP)
    const t2 = setTimeout(() => {
      const second = { ...MOCK_DRIVERS[1], price: order.proposedPrice + 5 };
      setAvailableOffers((prev) => [...prev, second]);
    }, 4500);

    // Third offer arrives in 7.5 seconds (matching price)
    const t3 = setTimeout(() => {
      const third = { ...MOCK_DRIVERS[2], price: Math.max(25, order.proposedPrice - 2) };
      setAvailableOffers((prev) => [...prev, third]);
    }, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [order.status, order.proposedPrice]);

  const handleAcceptOffer = (offer: DriverOffer) => {
    onUpdateStatus('driver_assigned', {
      driver: offer,
      agreedPrice: offer.price,
    });
  };

  const handleDismissOffer = (offerId: string) => {
    setAvailableOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  // Helper to advance the simulation to the next step
  const handleAdvanceSimulation = () => {
    switch (order.status) {
      case 'driver_assigned':
        onUpdateStatus('on_the_way');
        break;
      case 'on_the_way':
        onUpdateStatus('arrived_pickup');
        break;
      case 'arrived_pickup':
        onUpdateStatus('in_transit');
        break;
      case 'in_transit':
        onUpdateStatus('completed');
        break;
      default:
        break;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">
                {isAr ? 'تأكيد إلغاء الطلب' : 'Cancel Order Confirmation'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'يرجى اختيار سبب الإلغاء لمساعدتنا في تحسين خدمة بيكو:'
                : 'Please let us know why you are cancelling:'}
            </p>
            <div className="space-y-1.5">
              {[
                'تأخر وصول الكابتن',
                'تغيير في خطة المشوار',
                'السعر غير مناسب',
                'سبب شخصي آخر',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCancellationReason(reason)}
                  className={`w-full text-right p-2.5 rounded-xl border text-xs transition ${
                    cancellationReason === reason
                      ? 'border-[#E50914] bg-red-50 text-[#E50914] font-semibold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {isAr ? 'تراجع' : 'Close'}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  onCancelOrder(cancellationReason || 'إلغاء من العميل');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow"
              >
                {isAr ? 'تأكيد الإلغاء' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1: BIDDING (WAITING FOR OFFERS) */}
      {order.status === 'bidding' && (
        <div className="space-y-4">
          {/* Radar Scanning Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-6 text-center shadow-lg border border-slate-800 relative overflow-hidden">
            {/* Animated Pulsing Radar Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-48 h-48 rounded-full border border-red-500 animate-ping" />
              <div className="w-72 h-72 rounded-full border border-red-500/40" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-[#E50914] flex items-center justify-center text-[#E50914] mb-3 shadow-lg shadow-red-500/20">
                <Navigation className="w-7 h-7 fill-current animate-pulse" />
              </div>

              <h2 className="text-lg font-black text-white">
                {isAr ? 'جاري البحث عن كباتن بيكو...' : 'Finding Biko Captains...'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {isAr
                  ? 'عرضنا طلبك على الكباتن القريبين بسعرك المقترح.'
                  : 'Your request was dispatched to nearby motorcycle drivers.'}
              </p>

              {/* Countdown Badge */}
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {isAr ? 'الوقت المتبقي لتلقي العروض:' : 'Remaining:'} {formatTime(secondsLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Current Request Summary */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">
                {isAr ? 'عرضك المقترح' : 'Your Offer'}
              </span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {order.proposedPrice} {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
            <div className="text-left text-slate-600">
              <div className="font-semibold text-slate-800">{order.pickup.name}</div>
              <div className="text-[11px] text-slate-500">&rarr; {order.destination.name}</div>
            </div>
          </div>

          {/* Incoming Driver Offers List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#E50914]" />
                {isAr ? 'عروض الكباتن المستلمة' : 'Incoming Captain Offers'} (
                {availableOffers.length})
              </h3>
              <span className="text-[10px] text-slate-400">
                {isAr ? 'اختر العرض الأنسب لك' : 'Pick the best offer'}
              </span>
            </div>

            {availableOffers.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mx-auto text-[#E50914]" />
                <p className="text-xs text-slate-500 font-medium">
                  {isAr
                    ? 'في انتظار استجابة أول كابتن متاح...'
                    : 'Awaiting the first captain response...'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {availableOffers.map((offer) => {
                  const isMatchingPrice = offer.price === order.proposedPrice;
                  const isCounterOffer = offer.price > order.proposedPrice;

                  return (
                    <div
                      key={offer.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-[#E50914]/40 transition space-y-3 animate-in fade-in"
                    >
                      {/* Driver Info Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {/* Driver Avatar */}
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden relative">
                            {offer.driverFirstName[0]}
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-900">
                                {offer.driverFirstName}
                              </span>
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                                <Star className="w-3 h-3 fill-current" />
                                {offer.rating}
                              </span>
                              <span>&bull;</span>
                              <span>{offer.completedTripCount} مشوار</span>
                            </div>

                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {offer.motorcycleBrand} {offer.motorcycleModel} ({offer.motorcyclePlateNumber})
                            </div>
                          </div>
                        </div>

                        {/* Price Tag */}
                        <div className="text-left">
                          <div className="text-lg font-black text-slate-900 font-mono">
                            {offer.price} <span className="text-xs font-normal text-slate-500">{isAr ? 'ج.م' : 'EGP'}</span>
                          </div>
                          {isMatchingPrice ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {isAr ? 'قبل بسعرك' : 'Matches your price'}
                            </span>
                          ) : isCounterOffer ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              {isAr ? `عرض مضاد (+${offer.price - order.proposedPrice})` : 'Counter-offer'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
                              {isAr ? 'سعر مخفض' : 'Lower price'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Distance Time & Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {isAr ? `يبعد عنك ${offer.distanceMinutes} دقائق` : `${offer.distanceMinutes} mins away`}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDismissOffer(offer.id)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition"
                          >
                            {isAr ? 'تجاهل' : 'Pass'}
                          </button>
                          <button
                            onClick={() => handleAcceptOffer(offer)}
                            className="px-4 py-1.5 rounded-xl bg-[#E50914] hover:bg-[#B70710] active:scale-95 text-white text-xs font-bold shadow-xs transition"
                          >
                            {isAr ? 'قبول العرض' : 'Accept Offer'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cancel Order Link */}
          <div className="text-center pt-2">
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-slate-400 hover:text-red-600 transition"
            >
              {isAr ? 'إلغاء طلب المشوار' : 'Cancel Request'}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: DRIVER ASSIGNED & IN TRANSIT */}
      {[
        'driver_assigned',
        'on_the_way',
        'arrived_pickup',
        'in_transit',
      ].includes(order.status) && (
        <div className="space-y-4">
          {/* Live Google Map Tracking View */}
          <GoogleMapView
            pickup={order.pickup}
            destination={order.destination}
            userGpsLocation={userGpsLocation}
            captainLocation={captainLocation}
            onRequestGps={onRequestGps}
            className="h-48 w-full shadow-md"
            zoom={14}
          />

          {/* Status Progress Stepper */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">
                {order.status === 'driver_assigned' && (isAr ? 'تم إسناد الكابتن بنجاح' : 'Captain Assigned')}
                {order.status === 'on_the_way' && (isAr ? 'الكابتن في الطريق إليك' : 'Captain On The Way')}
                {order.status === 'arrived_pickup' && (isAr ? 'وصل الكابتن لنقطة الاستلام' : 'Captain Arrived at Pickup')}
                {order.status === 'in_transit' && (isAr ? 'المشوار جاري نحو الوجهة' : 'In Transit to Destination')}
              </span>
              <span className="font-mono font-bold text-xs text-[#E50914] bg-red-50 px-2 py-0.5 rounded">
                {order.agreedPrice} {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>

            {/* Visual Stepper Dots */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { key: 'driver_assigned', label: 'تم الإسناد' },
                { key: 'on_the_way', label: 'في الطريق' },
                { key: 'arrived_pickup', label: 'وصل' },
                { key: 'in_transit', label: 'جاري' },
              ].map((step, idx) => {
                const stepOrder = ['driver_assigned', 'on_the_way', 'arrived_pickup', 'in_transit'];
                const currentIdx = stepOrder.indexOf(order.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={step.key} className="space-y-1 text-center">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isPassed ? 'bg-[#E50914]' : 'bg-slate-200'
                      } ${isCurrent ? 'ring-2 ring-red-200' : ''}`}
                    />
                    <span className="text-[9px] font-semibold text-slate-500 block truncate">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery PIN Code Card (if Delivery service) */}
          {order.service === 'delivery' && order.deliveryCode && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  {isAr ? 'رمز تأكيد استلام الطرد' : 'Delivery Confirmation PIN'}
                </span>
                <span className="text-xs text-amber-900 mt-0.5 block">
                  {isAr ? 'أعطِ هذا الرمز للمستلم لتأكيد الاستلام' : 'Give this code to recipient'}
                </span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white border border-amber-300 font-mono text-xl font-black text-amber-800 tracking-widest shadow-2xs">
                #{order.deliveryCode}
              </div>
            </div>
          )}

          {/* Driver Card */}
          {order.driver && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-base">
                    {order.driver.driverFirstName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">
                        {order.driver.driverFirstName}
                      </span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {order.driver.motorcycleBrand} {order.driver.motorcycleModel}
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit mt-1">
                      {order.driver.motorcyclePlateNumber}
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {order.driver.rating}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {order.driver.completedTripCount} مشوار
                  </span>
                </div>
              </div>

              {/* Action Buttons: Call & Chat */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <a
                  href="tel:+201012345678"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E50914]" />
                  {isAr ? 'اتصال بالكابتن' : 'Call Captain'}
                </a>

                <button
                  onClick={() => alert(isAr ? 'محادثة الدردشة المباشرة مع الكابتن' : 'Chat with driver')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#E50914]" />
                  {isAr ? 'مراسلة' : 'Message'}
                </button>
              </div>
            </div>
          )}

          {/* Interactive Driver Simulation Fast-Forward Button */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-dashed border-slate-300 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">{isAr ? 'محاكاة حركة الكابتن (للتجربة):' : 'Simulation Controls:'}</span>
              <span className="text-[10px] text-slate-400 font-mono">{order.status}</span>
            </div>
            <button
              onClick={handleAdvanceSimulation}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <span>
                {order.status === 'driver_assigned' && 'تسريع: الكابتن تحرك في الطريق &rarr;'}
                {order.status === 'on_the_way' && 'تسريع: الكابتن وصل لنقطة الاستلام &rarr;'}
                {order.status === 'arrived_pickup' && 'تسريع: بدء التحرك نحو الوجهة &rarr;'}
                {order.status === 'in_transit' && 'تسريع: إنهاء المشوار بنجاح &check;'}
              </span>
            </button>
          </div>

          {/* Cancel Order Link */}
          <div className="text-center pt-2">
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-slate-400 hover:text-red-600 transition"
            >
              {isAr ? 'إلغاء الطلب' : 'Cancel Order'}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: COMPLETED */}
      {order.status === 'completed' && (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-md space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">
              {isAr ? 'تم إنهاء المشوار بنجاح!' : 'Trip Completed Successfully!'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr ? 'شكراً لاستخدامك بيكو لتنقل الدراجات السريع.' : 'Thank you for choosing Biko.'}
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>{isAr ? 'المبلغ المستحق للدفع:' : 'Paid Amount:'}</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {order.agreedPrice || order.proposedPrice} {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px] border-t border-slate-200 pt-2">
              <span>{isAr ? 'طريقة الدفع:' : 'Payment:'}</span>
              <span className="font-semibold text-slate-700">{isAr ? 'نقداً للكابتن' : 'Cash to Captain'}</span>
            </div>
            {order.driver && (
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>{isAr ? 'الكابتن:' : 'Captain:'}</span>
                <span className="font-semibold text-slate-700">{order.driver.driverFirstName}</span>
              </div>
            )}
          </div>

          <button
            onClick={onNewOrder}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#E50914] hover:bg-[#B70710] text-white font-bold text-xs shadow-md shadow-red-500/20 transition flex items-center justify-center gap-1.5"
          >
            <span>{isAr ? 'بدء مشوار جديد' : 'Book Another Trip'}</span>
          </button>
        </div>
      )}

      {/* PHASE 4: CANCELLED OR EXPIRED */}
      {(order.status === 'cancelled' || order.status === 'expired') && (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {order.status === 'cancelled'
                ? (isAr ? 'تم إلغاء الطلب' : 'Order Cancelled')
                : (isAr ? 'انتهى وقت تلقي العروض' : 'Offer Window Expired')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {order.cancellationReason || (isAr ? 'لم يتم العثور على كابتن متاح بالسعر المقترح.' : 'No captain matched the proposed price.')}
            </p>
          </div>

          <button
            onClick={onNewOrder}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            {isAr ? 'إعادة المحاولة بسعر آخر' : 'Try Again'}
          </button>
        </div>
      )}
    </div>
  );
};
