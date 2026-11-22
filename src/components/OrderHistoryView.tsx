import React, { useState } from 'react';
import {
  Clock,
  RotateCcw,
  Navigation2,
  Package,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Calendar
} from 'lucide-react';
import { CustomerOrder, ServiceType } from '../types/biko';

interface OrderHistoryViewProps {
  orders: CustomerOrder[];
  onBookAgain: (order: CustomerOrder) => void;
  lang: 'ar' | 'en';
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  onBookAgain,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return o.status === 'completed';
    if (filter === 'cancelled') return o.status === 'cancelled' || o.status === 'expired';
    return true;
  });

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {isAr ? 'طلباتي السابقة' : 'Order History'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'سجل الرحلات وطلبات التوصيل' : 'Your rides & deliveries log'}
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {orders.length} {isAr ? 'طلب' : 'orders'}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
        {[
          { key: 'all', label: isAr ? 'الكل' : 'All' },
          { key: 'completed', label: isAr ? 'المكتملة' : 'Completed' },
          { key: 'cancelled', label: isAr ? 'الملغاة' : 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === tab.key
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            {isAr ? 'لا توجد طلبات في هذا القسم' : 'No orders found'}
          </h3>
          <p className="text-xs text-slate-400">
            {isAr ? 'ابدأ طلبك الأول الآن من الصفحة الرئيسية.' : 'Start your first trip from the home page.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === 'completed';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        order.service === 'ride'
                          ? 'bg-red-50 text-[#E50914]'
                          : 'bg-amber-50 text-[#F59E0B]'
                      }`}
                    >
                      {order.service === 'ride' ? (
                        <Navigation2 className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Package className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">
                        {order.service === 'ride'
                          ? (isAr ? 'رحلة بالدراجة' : 'Motorcycle Ride')
                          : (isAr ? 'توصيل طرد' : 'Parcel Delivery')}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="font-mono font-black text-sm text-slate-900">
                      {order.agreedPrice || order.proposedPrice} {isAr ? 'ج.م' : 'EGP'}
                    </span>
                    <div>
                      {isCompleted ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {isAr ? 'مكتمل' : 'Completed'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          {isAr ? 'ملغي' : 'Cancelled'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pickup and Destination */}
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{order.pickup.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#E50914] shrink-0" />
                    <span className="truncate">{order.destination.name}</span>
                  </div>
                </div>

                {/* Driver Info or Delivery details if present */}
                {order.driver && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      {isAr ? 'الكابتن:' : 'Captain:'} <strong className="text-slate-800">{order.driver.driverFirstName}</strong>
                    </span>
                    <span className="font-mono">{order.driver.motorcycleBrand} ({order.driver.motorcyclePlateNumber})</span>
                  </div>
                )}

                {/* Action button: Re-book */}
                <button
                  onClick={() => onBookAgain(order)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#E50914] text-xs font-bold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isAr ? 'طلب نفس المشوار مجدداً' : 'Re-book Trip'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
