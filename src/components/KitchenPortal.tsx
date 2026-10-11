import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Flame,
  Check,
  RotateCw,
  Volume2,
  VolumeX,
  Clock,
  Truck,
  Armchair,
  ShoppingBag,
  Sparkles,
  Ban,
  ArrowLeft,
  UtensilsCrossed,
  Layers,
  ChefHat,
  Pizza,
  Building2,
  Radio,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { orderStore } from '../store/orderStore';
import {
  speakKitchenOrder,
  stopSpeaking,
  playAutomaticKitchenChime,
  unlockKitchenAudio,
  testBrassBell,
  getKitchenTTSLanguage,
  setKitchenTTSLanguage,
  KitchenTTSLanguage,
} from '../utils/speech';
import { TimeCafeLogo } from './TimeCafeLogo';

interface KitchenPortalProps {
  onSwitchToCustomer?: () => void;
  onSwitchToAdmin?: () => void;
}

export const KitchenPortal: React.FC<KitchenPortalProps> = ({
  onSwitchToCustomer,
  onSwitchToAdmin,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [ttsLang, setTtsLang] = useState<KitchenTTSLanguage>(getKitchenTTSLanguage());
  const [lastAnnouncedOrder, setLastAnnouncedOrder] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Track all orders that have already been read aloud by kitchen TTS
  const announcedOrderIdsRef = useRef<Set<number>>(new Set());
  const initialLoadDoneRef = useRef<boolean>(false);

  // Auto-unlock audio context on user interaction to comply with browser autoplay policies
  useEffect(() => {
    const handleUnlock = () => {
      unlockKitchenAudio();
    };

    window.addEventListener('click', handleUnlock, { passive: true });
    window.addEventListener('touchstart', handleUnlock, { passive: true });
    window.addEventListener('keydown', handleUnlock, { passive: true });

    return () => {
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, []);

  useEffect(() => {
    const initialOrders = orderStore.getOrders();
    setOrders(initialOrders);

    // Populate existing order IDs so we only automatically read out NEW incoming orders
    if (!initialLoadDoneRef.current) {
      initialOrders.forEach((o) => announcedOrderIdsRef.current.add(o.id));
      initialLoadDoneRef.current = true;
    }

    const unsubscribe = orderStore.subscribe(() => {
      const currentList = orderStore.getOrders();
      setOrders(currentList);

      // Find any newly received order that hasn't been announced yet
      const unannouncedOrders = currentList.filter(
        (o) => !announcedOrderIdsRef.current.has(o.id) && o.status === 'pending'
      );

      if (unannouncedOrders.length > 0) {
        // Mark as announced immediately to prevent duplicate playback
        unannouncedOrders.forEach((o) => announcedOrderIdsRef.current.add(o.id));

        if (ttsEnabled) {
          const newest = unannouncedOrders[0];
          playAutomaticKitchenChime();
          // Read out loud strictly: "New order! [items]" (omits customer names per instructions) in Amharic or English
          setTimeout(() => {
            speakKitchenOrder(newest, { lang: ttsLang });
            setLastAnnouncedOrder(
              `Order #${newest.id}: ${newest.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`
            );
          }, 350);
        }
      }
    });

    return () => {
      unsubscribe();
      stopSpeaking();
    };
  }, [ttsEnabled, ttsLang]);

  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const handleUpdateStatus = (id: number, status: OrderStatus) => {
    orderStore.updateStatus(id, status);
  };

  const getOrderTypeBadge = (type: string, detail: string) => {
    switch (type) {
      case 'delivery':
        return (
          <div className="flex items-center gap-1.5 text-xs bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-xl font-bold">
            <Truck className="w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">Delivery: {detail}</span>
          </div>
        );
      case 'takeaway':
        return (
          <div className="flex items-center gap-1.5 text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl font-bold">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">Takeaway: {detail}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-xs bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-xl font-bold">
            <Armchair className="w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">Dine-In: {detail}</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#090d16] text-slate-100 min-h-screen font-sans antialiased pb-20">
      {/* Kitchen Station Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <TimeCafeLogo size={46} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg sm:text-xl leading-tight text-white flex items-center gap-2">
                  Time Cafe Kitchen Display (KDS)
                </h1>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                  Live Station
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cooks &amp; Barista Tickets • Voice Alert Notifications
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {onSwitchToCustomer && (
              <button
                onClick={onSwitchToCustomer}
                className="hidden sm:flex text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl transition items-center gap-1.5 cursor-pointer"
                title="Customer Storefront"
              >
                <Pizza className="w-3.5 h-3.5 text-orange-400" />
                <span>Storefront</span>
              </button>
            )}

            {onSwitchToAdmin && (
              <button
                onClick={onSwitchToAdmin}
                className="hidden sm:flex text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-purple-600/30 border border-slate-700 px-3 py-2 rounded-xl transition items-center gap-1.5 cursor-pointer"
                title="Hotel Management Admin"
              >
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Hotel Admin</span>
              </button>
            )}

            {/* TTS Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !ttsEnabled;
                setTtsEnabled(next);
                if (!next) stopSpeaking();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                ttsEnabled
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle automatic Text-to-Speech order announcements for cooks"
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span className="hidden sm:inline">
                {ttsEnabled ? 'Voice: ON' : 'Voice: OFF'}
              </span>
            </button>

            {/* Test Bell Ring */}
            <button
              type="button"
              onClick={() => {
                unlockKitchenAudio();
                testBrassBell();
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Play brass service bell chime"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Test Bell</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
              aria-label="Kitchen Quick Menu"
            >
              <Menu className="w-4 h-4 text-orange-400" />
            </button>

            {/* Test Order */}
            <button
              type="button"
              onClick={() => {
                const test = orderStore.createOrder({
                  customer_name: 'Guest Kitchen Test',
                  customer_phone: '0911000000',
                  order_type: 'dine_in',
                  table_or_address: 'Table 04',
                  total_amount: 450,
                  payment_method: 'telebirr',
                  payment_status: 'paid',
                  items: [
                    {
                      name: 'Time Special Pizza (Large)',
                      quantity: 1,
                      price: 580,
                      customization: {
                        selectedAdditions: [{ name: 'Extra Mozzarella Cheese', price: 50 }],
                        removedIngredients: ['Fresh Red Onions'],
                      },
                    },
                    {
                      name: 'Special Macchiato',
                      quantity: 2,
                      price: 50,
                    },
                  ],
                });

                if (ttsEnabled) {
                  speakKitchenOrder(test);
                }
              }}
              className="hidden md:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Test Order Audio</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => setOrders(orderStore.getOrders())}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl text-sm border border-slate-700 transition cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 py-2.5 flex items-center justify-between">
          <div className="flex space-x-2 overflow-x-auto custom-scrollbar text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Tickets ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                filter === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>Pending</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950/40 text-amber-300">
                {orders.filter((o) => o.status === 'pending').length}
              </span>
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                filter === 'confirmed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>Preparing in Kitchen</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950/40 text-blue-200">
                {orders.filter((o) => o.status === 'confirmed').length}
              </span>
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                filter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>Completed / Dispatched</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950/40 text-emerald-200">
                {orders.filter((o) => o.status === 'completed').length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Kitchen Synced</span>
            </span>
          </div>
        </div>
      </header>

      {/* Kitchen Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between p-5 z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <TimeCafeLogo size={36} />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Kitchen Menu</h3>
                    <p className="text-[10px] text-blue-400 font-semibold">KDS &amp; Order Dispatch</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">Switch Portals</p>
                {onSwitchToCustomer && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSwitchToCustomer();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Pizza className="w-4 h-4 text-orange-400" />
                      <span>Customer Storefront</span>
                    </div>
                  </button>
                )}

                {onSwitchToAdmin && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSwitchToAdmin();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span>Hotel Admin &amp; Finance</span>
                    </div>
                  </button>
                )}

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Voice Announcement Language</p>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button
                      onClick={() => {
                        setTtsLang('am-ET');
                        setKitchenTTSLanguage('am-ET');
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                        ttsLang === 'am-ET'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🇪🇹 አማርኛ</span>
                    </button>
                    <button
                      onClick={() => {
                        setTtsLang('en-US');
                        setKitchenTTSLanguage('en-US');
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                        ttsLang === 'en-US'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🇬🇧 English</span>
                    </button>
                  </div>

                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-2">Audio Actions</p>
                  <button
                    onClick={() => {
                      testBrassBell();
                    }}
                    className="w-full flex items-center gap-2 p-3 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>Ring Brass Bell Notification</span>
                  </button>

                  <button
                    onClick={() => {
                      unlockKitchenAudio();
                      playAutomaticKitchenChime();
                      const sampleOrder: Order = orders[0] || {
                        id: 101,
                        customer_name: 'Customer',
                        phone: '0911000000',
                        items: [
                          { id: 1, name: 'Special Burger', quantity: 2, price: 350 },
                          { id: 2, name: 'Margherita Pizza', quantity: 1, price: 420 },
                        ],
                        total: 1120,
                        status: 'pending',
                        created_at: new Date().toISOString(),
                        type: 'dine_in',
                        payment_status: 'paid',
                        payment_method: 'telebirr',
                      };
                      setTimeout(() => speakKitchenOrder(sampleOrder, { lang: ttsLang }), 400);
                    }}
                    className="w-full flex items-center gap-2 p-3 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-blue-400" />
                    <span>Test Voice ({ttsLang === 'am-ET' ? 'አማርኛ' : 'English'})</span>
                  </button>

                  <button
                    onClick={() => {
                      const next = !ttsEnabled;
                      setTtsEnabled(next);
                      if (!next) stopSpeaking();
                    }}
                    className="w-full flex items-center gap-2 p-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    {ttsEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    <span>{ttsEnabled ? 'Mute Announcements' : 'Unmute Announcements'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
              Time Cafe KDS • Asela, Ethiopia
            </div>
          </div>
        </div>
      )}

      {/* Main Kitchen Tickets Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Automatic TTS Live Notification Banner */}
        <div className="mb-6 bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Automatic Kitchen TTS: Active</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  AUTO-BELL &amp; READOUT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Every newly placed customer order automatically plays an authentic brass service bell &amp; reads ordered items out loud for cooks (Customer names are strictly omitted).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Language Selector Pills */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTtsLang('am-ET');
                  setKitchenTTSLanguage('am-ET');
                }}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  ttsLang === 'am-ET'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Speak orders in Amharic (አማርኛ)"
              >
                <span>🇪🇹 አማርኛ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTtsLang('en-US');
                  setKitchenTTSLanguage('en-US');
                }}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  ttsLang === 'en-US'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Speak orders in English"
              >
                <span>🇬🇧 English</span>
              </button>
            </div>

            {lastAnnouncedOrder && (
              <span className="text-[11px] text-slate-400 hidden xl:inline truncate max-w-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Last: {lastAnnouncedOrder}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                unlockKitchenAudio();
                testBrassBell();
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              title="Ring the brass service bell chime"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>🔔 Test Bell</span>
            </button>
            <button
              type="button"
              onClick={() => {
                unlockKitchenAudio();
                playAutomaticKitchenChime();
                const sampleOrder: Order = orders[0] || {
                  id: 101,
                  customer_name: 'Customer',
                  phone: '0911000000',
                  items: [
                    { id: 1, name: 'Special Burger', quantity: 2, price: 350 },
                    { id: 2, name: 'Margherita Pizza', quantity: 1, price: 420 },
                  ],
                  total: 1120,
                  status: 'pending',
                  created_at: new Date().toISOString(),
                  type: 'dine_in',
                  payment_status: 'paid',
                  payment_method: 'telebirr',
                };
                setTimeout(() => speakKitchenOrder(sampleOrder, { lang: ttsLang }), 450);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition"
              title={`Test readout in ${ttsLang === 'am-ET' ? 'Amharic' : 'English'}`}
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Test Voice ({ttsLang === 'am-ET' ? 'አማርኛ' : 'EN'})</span>
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/40 rounded-3xl border border-slate-800">
            <TimeCafeLogo size={56} className="mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No Kitchen Tickets in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              New customer orders will ring the bell chime and speak out loud automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const formattedTime = new Date(order.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className={`bg-slate-900 border-2 rounded-3xl p-5 flex flex-col justify-between transition ${
                    order.status === 'pending'
                      ? 'border-amber-500 shadow-xl shadow-amber-500/10'
                      : order.status === 'confirmed'
                      ? 'border-blue-500 shadow-xl shadow-blue-500/10'
                      : 'border-slate-800 opacity-80'
                  }`}
                >
                  <div>
                    {/* Ticket Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-2xl font-black text-white">
                          #{order.id}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {formattedTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Audio Speak Button for Cook */}
                        <button
                          type="button"
                          onClick={() => speakKitchenOrder(order)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition cursor-pointer"
                          title="Re-read items out loud"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Status Label */}
                        {order.status === 'pending' && (
                          <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl uppercase">
                            NEW
                          </span>
                        )}
                        {order.status === 'confirmed' && (
                          <span className="bg-blue-600 text-white font-black text-xs px-2.5 py-1 rounded-xl uppercase">
                            COOKING
                          </span>
                        )}
                        {order.status === 'completed' && (
                          <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-xl uppercase">
                            DONE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Destination */}
                    <div className="my-3">
                      {getOrderTypeBadge(order.order_type, order.table_or_address)}
                    </div>

                    {/* Ordered Items List with INGREDIENTS */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 my-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="border-b border-slate-850 pb-2.5 last:border-0 last:pb-0"
                        >
                          <div className="flex items-baseline justify-between">
                            <span className="text-base font-black text-white">
                              <span className="text-orange-400 text-lg mr-1 font-black">
                                {item.quantity}x
                              </span>
                              {item.name}
                            </span>
                          </div>

                          {/* Ingredient Exclusions & Additions */}
                          {item.customization && (
                            <div className="mt-1 pl-4 text-xs space-y-0.5 font-bold">
                              {item.customization.removedIngredients.length > 0 && (
                                <div className="text-rose-400 flex items-center gap-1">
                                  <span>❌ NO:</span>
                                  <span>{item.customization.removedIngredients.join(', ')}</span>
                                </div>
                              )}
                              {item.customization.selectedAdditions.length > 0 && (
                                <div className="text-emerald-400 flex items-center gap-1">
                                  <span>✨ EXTRA:</span>
                                  <span>
                                    {item.customization.selectedAdditions.map((a) => a.name).join(', ')}
                                  </span>
                                </div>
                              )}
                              {item.customization.specialInstructions && (
                                <div className="text-amber-300 italic font-semibold">
                                  📝 "{item.customization.specialInstructions}"
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ticket Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Accept &amp; Start Preparing</span>
                      </button>
                    )}

                    {order.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Food Ready / Mark Completed</span>
                      </button>
                    )}

                    {order.status === 'completed' && (
                      <div className="py-2.5 bg-slate-800 text-emerald-400 rounded-xl text-xs font-bold text-center border border-slate-700">
                        ✓ Dispatched / Complete
                      </div>
                    )}

                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="w-full py-1.5 bg-slate-800/40 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
