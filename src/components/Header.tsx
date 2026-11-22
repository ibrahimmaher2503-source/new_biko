import React from 'react';
import { CustomerProfile } from '../types/biko';

interface HeaderProps {
  profile: CustomerProfile;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  lang,
  onToggleLang,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-md mx-auto px-4 h-15 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E50914] flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Motorcycle Silhouette Icon */}
              <path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H10c-2.21 0-4 1.79-4 4 0 .34.05.67.12.98C4.54 14.54 3 16.59 3 19c0 2.76 2.24 5 5 5 2.41 0 4.46-1.54 4.98-3.71.36.08.73.12 1.11.12.38 0 .75-.04 1.11-.12.52 2.17 2.57 3.71 4.98 3.71 2.76 0 5-2.24 5-5 0-2.41-1.54-4.46-3.71-4.98-.03-.99-.44-1.92-1.12-2.61l.09-.13.96.96 1.41-1.41-2.38-2.45zm-11.44 13c-1.65 0-3-1.35-3-3s1.35-3 3-3c1.53 0 2.81 1.17 2.97 2.68-.62.4-1.15.93-1.55 1.55C7.29 20.08 7.15 20 7 20c-.55 0-1 .45-1 1s.45 1 1 1h1zm11 0c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#111111]">BIKO</span>
              <span className="text-xs font-bold text-[#E50914] bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                بيكو
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {isAr ? 'تنقل وتوصيل بالدراجة' : 'Motorcycle Mobility'}
            </p>
          </div>
        </div>

        {/* Right side controls: Language switcher */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition text-xs font-bold"
            title="Toggle Language"
          >
            {isAr ? 'EN' : 'ع'}
          </button>
        </div>
      </div>
    </header>
  );
};
