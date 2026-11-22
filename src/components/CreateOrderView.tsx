import React, { useState } from 'react';
import {
  ArrowRight,
  MapPin,
  Clock,
  Navigation2,
  Package,
  Plus,
  Minus,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { LocationSelection, ServiceType, DeliveryDetails, CustomerOrder } from '../types/biko';
import { calculateQuote } from '../data/mockData';
import { GoogleMapView } from './GoogleMapView';
import { GpsLocation } from '../hooks/useGeolocation';

interface CreateOrderViewProps {
  service: ServiceType;
  pickup: LocationSelection;
  destination: LocationSelection;
  onBack: () => void;
  onSubmitOrder: (order: Partial<CustomerOrder>) => void;
  userGpsLocation?: GpsLocation | null;
  lang: 'ar' | 'en';
}

export const CreateOrderView: React.FC<CreateOrderViewProps> = ({
  service,
  pickup,
  destination,
  onBack,
  onSubmitOrder,
  userGpsLocation,
  lang,
}) => {
  const isAr = lang === 'ar';
  const quote = calculateQuote(pickup, destination, service);

  // Proposed price starts at 70% of suggested guidance (per Biko product rules)
  const [proposedPrice, setProposedPrice] = useState<number>(quote.minPrice);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [parcelWeight, setParcelWeight] = useState(2);
  const [declaredValue, setDeclaredValue] = useState(200);
  const [instructions, setInstructions] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdjustPrice = (delta: number) => {
    const next = proposedPrice + delta;
    if (next < quote.minPrice) {
      setErrorMsg(
        isAr
          ? `الحد الأدنى المقبول للاقتراح هو ${quote.minPrice} ج.م (70% من السعر الإرشادي)`
          : `Minimum allowable offer is ${quote.minPrice} EGP (70% of suggested)`
      );
      return;
    }
    setErrorMsg(null);
    setProposedPrice(next);
  };

  const handleCreate = () => {
    if (proposedPrice < quote.minPrice) {
      setErrorMsg(
        isAr
          ? `السعر المقترح يجب ألا يقل عن ${quote.minPrice} ج.م`
          : `Proposed price must be at least ${quote.minPrice} EGP`
      );
      return;
    }

    if (service === 'delivery') {
      if (!recipientName.trim() || !recipientPhone.trim()) {
        setErrorMsg(
          isAr
            ? 'يرجى إدخال اسم ورقم هاتف المستلم للطرد'
            : 'Please enter recipient name and phone number'
        );
        return;
      }
    }

    const deliveryDetails: DeliveryDetails | undefined =
      service === 'delivery'
        ? {
            recipientName,
            recipientPhone,
            parcelWeightKg: parcelWeight,
            declaredValue,
            instructions,
          }
        : undefined;

    // Generate random 4-digit PIN for delivery
    const deliveryCode =
      service === 'delivery'
        ? Math.floor(1000 + Math.random() * 9000).toString()
        : undefined;

    onSubmitOrder({
      service,
      pickup,
      destination,
      proposedPrice,
      distanceKm: quote.distanceKm,
      durationMinutes: quote.durationMinutes,
      delivery: deliveryDetails,
      deliveryCode,
    });
  };

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs transition"
        >
          <ChevronRight className="w-4 h-4" />
          {isAr ? 'العودة للرئيسية' : 'Back'}
        </button>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-[#E50914] border border-red-100 flex items-center gap-1">
          {service === 'ride' ? (
            <>
              <Navigation2 className="w-3 h-3 fill-current" />
              {isAr ? 'حجز رحلة بالدراجة' : 'Motorcycle Ride'}
            </>
          ) : (
            <>
              <Package className="w-3 h-3" />
              {isAr ? 'توصيل طرد سريع' : 'Parcel Delivery'}
            </>
          )}
        </span>
      </div>

      {/* Real Google Map Preview with Pickup & Destination Pins */}
      <div className="space-y-2">
        <GoogleMapView
          pickup={pickup}
          destination={destination}
          userGpsLocation={userGpsLocation}
          className="h-44 w-full shadow-sm"
        />

        {/* Route Stats Badges */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Navigation2 className="w-3.5 h-3.5 text-emerald-600" />
              {isAr ? 'المسافة:' : 'Distance:'}
            </span>
            <span className="font-mono font-bold text-slate-900">{quote.distanceKm} {isAr ? 'كم' : 'km'}</span>
          </div>
          <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              {isAr ? 'الوقت المقدر:' : 'Est. Time:'}
            </span>
            <span className="font-mono font-bold text-slate-900">{quote.durationMinutes} {isAr ? 'دقيقة' : 'mins'}</span>
          </div>
        </div>
      </div>

        {/* Addresses Summary */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <div className="truncate">
            <strong className="text-slate-800">{pickup.area || pickup.name}</strong> &rarr;{' '}
            <strong className="text-slate-800">{destination.area || destination.name}</strong>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {isAr ? 'دراجة نارية فردية' : 'Motorcycle'}
          </span>
        </div>

      {/* Suggested Price Guidance */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-amber-900 block">
            {isAr ? 'السعر الإرشادي للنظام:' : 'System Suggested Fare:'}{' '}
            <strong className="font-mono text-base">{quote.suggestedPrice}</strong> {isAr ? 'ج.م' : 'EGP'}
          </span>
          <span className="text-[11px] text-amber-700/90 block mt-0.5">
            {isAr
              ? `يبدأ مقترحك من ${quote.minPrice} ج.م (70%)، ولك حرية الاقتراح`
              : `Offers start at 70% (${quote.minPrice} EGP). You decide your offer.`}
          </span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Proposed Price Stepper (inDrive Negotiation Model) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900">
            {isAr ? 'سعرك المقترح للكابتن' : 'Your Proposed Fare'}
          </label>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            {isAr ? 'مباشر وبدون وسيط' : 'Direct to Captain'}
          </span>
        </div>

        {/* Counter Display with Big Number */}
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            onClick={() => handleAdjustPrice(-5)}
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition font-bold"
            title="-5 EGP"
          >
            <Minus className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-baseline gap-1.5 px-6 py-2 rounded-2xl bg-slate-50 border border-slate-200 min-w-[140px] justify-center">
            <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {proposedPrice}
            </span>
            <span className="text-xs font-bold text-slate-500">{isAr ? 'ج.م' : 'EGP'}</span>
          </div>

          <button
            onClick={() => handleAdjustPrice(5)}
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition font-bold"
            title="+5 EGP"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex gap-2 justify-center pt-1">
          {[-5, 5, 10].map((delta) => (
            <button
              key={delta}
              onClick={() => handleAdjustPrice(delta)}
              className="text-xs font-bold font-mono px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
            >
              {delta > 0 ? `+${delta}` : delta} {isAr ? 'ج.م' : 'EGP'}
            </button>
          ))}
          <button
            onClick={() => setProposedPrice(quote.suggestedPrice)}
            className="text-xs font-bold px-3 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[#E50914] transition"
          >
            {isAr ? 'السعر العادل' : 'Suggested'}
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Delivery Parcel Details Form (if Service === Delivery) */}
      {service === 'delivery' && (
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#F59E0B]" />
              {isAr ? 'بيانات الطرد والمستلم' : 'Recipient & Parcel Details'}
            </h3>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
              {isAr ? 'حد أقصى 8 كجم' : 'Max 8kg'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {isAr ? 'اسم المستلم' : 'Recipient Name'} *
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: محمد السيد' : 'e.g. Mohamed El-Sayed'}
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {isAr ? 'رقم هاتف المستلم' : 'Recipient Phone'} *
              </label>
              <input
                type="tel"
                placeholder="010XXXXXXXX"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {isAr ? 'وزن الطرد التقريبي (كجم)' : 'Parcel Weight (kg)'}
              </label>
              <select
                value={parcelWeight}
                onChange={(e) => setParcelWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#E50914]"
              >
                <option value={1}>1 كجم أو أقل (مستندات/أوراق)</option>
                <option value={2}>2 - 3 كجم (علبة صغيرة / طعام)</option>
                <option value={5}>4 - 5 كجم (صندوق متوسط)</option>
                <option value={8}>8 كجم (الحد الأقصى للدراجة)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {isAr ? 'القيمة التقريبية للمحتوى' : 'Declared Value (EGP)'}
              </label>
              <input
                type="number"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              {isAr ? 'ملاحظات للكابتن (اختياري)' : 'Instructions for Driver (Optional)'}
            </label>
            <input
              type="text"
              placeholder={isAr ? 'مثال: محتويات قابلة للكسر، الاتصال عند الوصول' : 'e.g. Fragile items, call upon arrival'}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E50914]"
            />
          </div>
        </div>
      )}

      {/* Safety & Trust Note */}
      <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          {isAr
            ? 'جميع كباتن بيكو مفحوصين وموثقين مع فحص أمني للمركبة ورخصة القيادة.'
            : 'All Biko captains are verified with driver licenses & vehicle background checks.'}
        </span>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={handleCreate}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#E50914] hover:bg-[#B70710] active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition"
      >
        <span>
          {isAr
            ? `طلب الكابتن بسعر ${proposedPrice} ج.م`
            : `Request Captain for ${proposedPrice} EGP`}
        </span>
      </button>
    </div>
  );
};
