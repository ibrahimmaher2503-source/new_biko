import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Star,
  MapPin,
  Shield,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Globe
} from 'lucide-react';
import { CustomerProfile } from '../types/biko';

interface ProfileViewProps {
  profile: CustomerProfile;
  onUpdateProfile: (updated: Partial<CustomerProfile>) => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  lang,
  onToggleLang,
}) => {
  const isAr = lang === 'ar';
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);

  const handleSaveProfile = () => {
    onUpdateProfile({ fullName, phone });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <h1 className="text-xl font-black text-slate-900 tracking-tight">
        {isAr ? 'حسابي وبياناتي' : 'My Account'}
      </h1>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#E50914] to-red-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-red-500/20">
            {profile.fullName[0]}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base text-slate-900 truncate">
              {profile.fullName}
            </h2>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{profile.phone}</div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                <Star className="w-3 h-3 fill-current" />
                {profile.rating}
              </span>
              <span>&bull;</span>
              <span>{profile.totalTrips} {isAr ? 'مشوار مكتمل' : 'trips'}</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-[#E50914] font-bold px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 transition"
          >
            {isEditing ? (isAr ? 'إلغاء' : 'Cancel') : (isAr ? 'تعديل' : 'Edit')}
          </button>
        </div>

        {isEditing && (
          <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {isAr ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#E50914]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {isAr ? 'رقم الهاتف' : 'Phone'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#E50914]"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full py-2 bg-[#E50914] hover:bg-[#B70710] text-white text-xs font-bold rounded-xl transition shadow"
            >
              {isAr ? 'حفظ التعديلات' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Cash Payment Guarantee Card (No in-app wallet) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            ج.م
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {isAr ? 'طريقة الدفع: نقداً للكابتن' : 'Payment: Direct Cash to Captain'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {isAr
                ? 'الدفع نقداً ومباشرة للكابتن عند إتمام المشوار بدون محفظة أو عمولات إضافية'
                : 'Direct cash payment upon arrival. No in-app wallet required.'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full shrink-0">
          {isAr ? 'نقدي فقط' : 'Cash Only'}
        </span>
      </div>

      {/* Saved Places */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900 px-1">
          {isAr ? 'الأماكن المحفوظة' : 'Saved Addresses'}
        </h3>
        <div className="space-y-1.5 text-xs">
          {[
            { label: 'المنزل', address: 'شارع التحرير، الدقي' },
            { label: 'العمل', address: 'القرية الذكية، طريق الإسكندرية الصحراوي' },
            { label: 'الجامعة', address: 'ميدان جامعة القاهرة' },
          ].map((place, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                <div>
                  <div className="font-bold text-slate-900">{place.label}</div>
                  <div className="text-[10px] text-slate-500">{place.address}</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Settings & Support Links */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm divide-y divide-slate-100 text-xs">
        <button
          onClick={onToggleLang}
          className="w-full p-3 flex items-center justify-between text-slate-700 hover:bg-slate-50 transition rounded-xl"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">{isAr ? 'لغة التطبيق' : 'Language'}</span>
          </div>
          <span className="font-bold text-slate-900 font-mono text-xs">
            {isAr ? 'العربية (RTL)' : 'English (LTR)'}
          </span>
        </button>

        <div className="w-full p-3 flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{isAr ? 'مركز الأمان وخدمة الدراجات' : 'Safety Center'}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
            {isAr ? 'نشط' : 'Active'}
          </span>
        </div>

        <div className="w-full p-3 flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">{isAr ? 'المساعدة والدعم الفني 24/7' : 'Help & Support'}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">19XXX</span>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center text-[11px] text-slate-400 space-y-1">
        <div>Biko User App &bull; Ported from GitHub</div>
        <div className="font-mono text-[10px]">v2.0.0 &bull; Cairo Regional Release</div>
      </div>
    </div>
  );
};
