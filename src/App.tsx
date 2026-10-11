/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CustomerPortal } from './components/CustomerPortal';
import { KitchenPortal } from './components/KitchenPortal';
import { AdminOfficePortal } from './components/AdminOfficePortal';
import { Pizza, ChefHat, Building2 } from 'lucide-react';
import { TimeCafeLogo } from './components/TimeCafeLogo';
import { orderStore } from './store/orderStore';

export default function App() {
  const [activeView, setActiveView] = useState<'customer' | 'kitchen' | 'admin'>('customer');
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const orders = orderStore.getOrders();
      setPendingOrdersCount(orders.filter((o) => o.status === 'pending').length);
    };
    updateCount();
    const unsub = orderStore.subscribe(updateCount);
    return unsub;
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top App Mode Navigation Bar */}
      <aside aria-label="Portal Navigation" className="bg-slate-950/95 border-b border-slate-800/80 px-2 sm:px-6 py-2 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Cafe Info */}
          <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
            <TimeCafeLogo size={30} />
            <div className="truncate">
              <span className="font-extrabold text-white text-xs sm:text-sm">Time Cafe</span>
              <span className="hidden sm:inline text-slate-600 mx-1.5">•</span>
              <span className="hidden sm:inline text-slate-400">Asela, Ethiopia</span>
            </div>
          </div>

          {/* Desktop View Switcher: 3 Separate Portals */}
          <div className="hidden md:flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            {/* 1. Customer Storefront */}
            <button
              onClick={() => setActiveView('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeView === 'customer'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pizza className="w-3.5 h-3.5" />
              <span>Customer Menu &amp; Stories</span>
            </button>

            {/* 2. Separated Kitchen KDS */}
            <button
              onClick={() => setActiveView('kitchen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer relative ${
                activeView === 'kitchen'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen (KDS &amp; Voice)</span>
              {pendingOrdersCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* 3. Separated Hotel Management Admin */}
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hotel Admin &amp; Finance</span>
            </button>
          </div>

          {/* Mobile View Switcher: Compact, touch-friendly, non-wrapping pills */}
          <div className="flex md:hidden items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold shrink-0">
            <button
              onClick={() => setActiveView('customer')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === 'customer'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pizza className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>

            <button
              onClick={() => setActiveView('kitchen')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer relative ${
                activeView === 'kitchen'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen</span>
              {pendingOrdersCount > 0 && (
                <span className="ml-0.5 px-1 py-0.2 rounded-full text-[9px] bg-amber-400 text-slate-950 font-black">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Display */}
      <div className="flex-1">
        {activeView === 'customer' && (
          <CustomerPortal
            onSwitchToAdmin={() => setActiveView('admin')}
            onSwitchToKitchen={() => setActiveView('kitchen')}
          />
        )}
        {activeView === 'kitchen' && (
          <KitchenPortal
            onSwitchToCustomer={() => setActiveView('customer')}
            onSwitchToAdmin={() => setActiveView('admin')}
          />
        )}
        {activeView === 'admin' && (
          <AdminOfficePortal
            onSwitchToCustomer={() => setActiveView('customer')}
            onSwitchToKitchen={() => setActiveView('kitchen')}
          />
        )}
      </div>
    </div>
  );
}
