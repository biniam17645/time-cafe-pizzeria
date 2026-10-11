import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Flame,
  Search,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  UtensilsCrossed,
  Package,
  Phone,
  User,
  Coffee,
  GlassWater,
  Croissant,
  Pizza,
  LayoutGrid,
  CreditCard,
  Ban,
  SlidersHorizontal,
  BookOpen,
  ChefHat,
  Building2,
  Menu,
  ChevronRight,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '../data/menu';
import { MenuItem, CartItem, OrderType, Order, PaymentMethod, PaymentStatus, CartItemCustomization } from '../types';
import { orderStore } from '../store/orderStore';
import { menuStore } from '../store/menuStore';
import { TimeCafeLogo } from './TimeCafeLogo';
import { AselaDeliveryMapModal } from './AselaDeliveryMapModal';
import { EthiopianPaymentModal } from './EthiopianPaymentModal';
import { CustomizeFoodModal } from './CustomizeFoodModal';
import { CafeBlogSection } from './CafeBlogSection';

interface CustomerPortalProps {
  onSwitchToAdmin?: () => void;
  onSwitchToKitchen?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  onSwitchToAdmin,
  onSwitchToKitchen,
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, 'Standard' | 'Large'>>({});

  // Active section view (Menu vs Stories)
  const [activeCustomerView, setActiveCustomerView] = useState<'menu' | 'stories'>('menu');

  // Food Customization Modal state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Checkout form
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [tableOrAddress, setTableOrAddress] = useState<string>('');
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [paymentTxnRef, setPaymentTxnRef] = useState<string | undefined>(undefined);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  // Map modal state
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);

  // Receipt modal state
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Active tracking state
  const [activeOrderId, setActiveOrderId] = useState<number | null>(() => {
    const saved = localStorage.getItem('active_cafe_order_id');
    return saved ? parseInt(saved, 10) : null;
  });
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync menu items from menuStore
  useEffect(() => {
    setMenuItems(menuStore.getItems());
    const unsubscribe = menuStore.subscribe(() => {
      setMenuItems(menuStore.getItems());
    });
    return unsubscribe;
  }, []);

  // Sync tracked order with store
  useEffect(() => {
    const updateTracking = () => {
      if (activeOrderId) {
        const found = orderStore.getOrder(activeOrderId);
        if (found) {
          setTrackedOrder(found);
        }
      } else {
        setTrackedOrder(null);
      }
    };

    updateTracking();
    const unsubscribe = orderStore.subscribe(updateTracking);
    return unsubscribe;
  }, [activeOrderId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  const handleSizeChange = (itemId: number, size: 'Standard' | 'Large') => {
    setSelectedSizes((prev) => ({ ...prev, [itemId]: size }));
  };

  const handleAddCustomizedToCart = (
    item: MenuItem,
    size: 'Standard' | 'Large',
    customization: CartItemCustomization
  ) => {
    const basePrice = size === 'Large' && item.priceLarge ? item.priceLarge : item.price;
    const additionsPrice = customization.selectedAdditions.reduce((sum, a) => sum + a.price, 0);
    const finalPrice = basePrice + additionsPrice;
    const itemName = item.hasSizes ? `${item.name} (${size})` : item.name;

    setCart((prev) => [
      ...prev,
      {
        id: item.id,
        name: itemName,
        price: finalPrice,
        qty: 1,
        size,
        customization,
      },
    ]);

    showToast(`Added customized ${item.name} to cart!`);
  };

  const quickAddToCart = (item: MenuItem) => {
    if (item.inStock === false) {
      showToast(`${item.name} is currently sold out`);
      return;
    }

    // If item has customizable ingredients or extra toppings, open customizer
    if (
      (item.availableIngredients && item.availableIngredients.length > 0) ||
      (item.extraToppings && item.extraToppings.length > 0)
    ) {
      setCustomizingItem(item);
      return;
    }

    const size = item.hasSizes ? selectedSizes[item.id] || 'Standard' : 'Standard';
    const price = size === 'Large' && item.priceLarge ? item.priceLarge : item.price;
    const itemName = item.hasSizes ? `${item.name} (${size})` : item.name;

    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id && c.size === size && !c.customization);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id && c.size === size && !c.customization ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { id: item.id, name: itemName, price, qty: 1, size }];
    });

    showToast(`Added ${item.name} to cart!`);
  };

  const updateCartQtyByIndex = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        const nextQty = updated[index].qty + delta;
        if (nextQty <= 0) {
          updated.splice(index, 1);
        } else {
          updated[index] = { ...updated[index], qty: nextQty };
        }
      }
      return updated;
    });
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const deliveryFee = orderType === 'delivery' ? 50 : 0;
  const grandTotal = subtotal + deliveryFee;

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const handleInitiateCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Please enter your name and phone number');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }

    // Open Ethiopian Payment Modal
    setIsPaymentModalOpen(true);
  };

  const handleFinalizeOrder = (paymentDetails: {
    method: PaymentMethod;
    status: PaymentStatus;
    txnRef?: string;
  }) => {
    const order = orderStore.createOrder({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      order_type: orderType,
      table_or_address: tableOrAddress.trim() || (orderType === 'dine_in' ? 'Table 01' : 'N/A'),
      delivery_coordinates: deliveryCoordinates,
      total_amount: grandTotal,
      payment_method: paymentDetails.method,
      payment_status: paymentDetails.status,
      payment_txn_ref: paymentDetails.txnRef,
      items: cart.map((c) => ({
        id: c.id,
        name: c.name,
        quantity: c.qty,
        price: c.price,
        customization: c.customization,
      })),
    });

    localStorage.setItem('active_cafe_order_id', order.id.toString());
    setActiveOrderId(order.id);
    setConfirmedOrder(order);

    // Reset modals and cart
    setIsPaymentModalOpen(false);
    setCart([]);
    setIsCartOpen(false);
  };

  const dismissTracker = () => {
    localStorage.removeItem('active_cafe_order_id');
    setActiveOrderId(null);
    setTrackedOrder(null);
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'pizzas':
        return <Pizza className="w-3.5 h-3.5" />;
      case 'hot_drinks':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'cold_drinks':
        return <GlassWater className="w-3.5 h-3.5" />;
      case 'pastries':
        return <Croissant className="w-3.5 h-3.5" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <TimeCafeLogo size={46} />
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                TIME <span className="text-orange-500">CAFE</span> &amp; PIZZERIA
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Asela • Craft, Passion &amp; Cafe Stories</p>
            </div>
          </div>

          {/* Desktop Sub Navigation (Menu vs Cafe Stories) */}
          <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveCustomerView('menu')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeCustomerView === 'menu'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pizza className="w-3.5 h-3.5" />
              <span>Menu &amp; Ordering</span>
            </button>
            <button
              onClick={() => setActiveCustomerView('stories')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeCustomerView === 'stories'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cafe Stories &amp; Blog</span>
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onSwitchToKitchen && (
              <button
                onClick={onSwitchToKitchen}
                className="hidden lg:flex text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700 px-3 py-2.5 rounded-xl transition items-center gap-1.5 cursor-pointer"
                title="Kitchen Display Station"
              >
                <ChefHat className="w-3.5 h-3.5 text-blue-400" />
                <span>Kitchen</span>
              </button>
            )}

            {onSwitchToAdmin && (
              <button
                onClick={onSwitchToAdmin}
                className="hidden sm:flex text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-2.5 rounded-xl transition items-center gap-1.5 cursor-pointer"
                title="Hotel Management Admin"
              >
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-semibold flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-orange-500/25 transition duration-200 cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-bold">Cart</span>
              <span className="bg-white text-orange-600 text-xs font-extrabold px-2 py-0.5 rounded-full">
                {totalCartCount}
              </span>
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-md"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5 text-orange-400" />
              <span className="text-xs font-bold text-slate-200">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between p-5 z-10 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <TimeCafeLogo size={42} />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Time Cafe</h3>
                    <p className="text-[10px] text-orange-400 font-semibold">Asela, Ethiopia</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
                  aria-label="Close Mobile Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="py-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">Navigation</p>
                <button
                  onClick={() => {
                    setActiveCustomerView('menu');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition cursor-pointer ${
                    activeCustomerView === 'menu'
                      ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Pizza className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">Food &amp; Drink Menu</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setActiveCustomerView('stories');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition cursor-pointer ${
                    activeCustomerView === 'stories'
                      ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">Cafe Stories &amp; Blog</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMapModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left text-slate-300 hover:bg-slate-800 font-semibold transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm">Assela Delivery Map</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Satellite
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left text-slate-300 hover:bg-slate-800 font-semibold transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">Order Cart</span>
                  </div>
                  <span className="text-xs bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full">
                    {totalCartCount} items
                  </span>
                </button>
              </div>

              {/* Staff & Admin Portals */}
              <div className="py-2 space-y-2 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">Hotel &amp; Kitchen Portals</p>
                {onSwitchToKitchen && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSwitchToKitchen();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-left bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-300 font-bold text-xs transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ChefHat className="w-4 h-4 text-blue-400" />
                      <span>Kitchen Display (KDS &amp; Voice)</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {onSwitchToAdmin && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSwitchToAdmin();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-left bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-300 font-bold text-xs transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span>Hotel Admin &amp; Finance</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer: Phone, Social & Asela Info */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <a
                href="tel:+251911234567"
                className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Call Kitchen: +251 91 123 4567</span>
              </a>

              <a
                href="https://www.tiktok.com/@time_cafe_pizzeria"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-xs text-slate-400 hover:text-white bg-slate-800/40 p-2.5 rounded-xl"
              >
                <span>TikTok @time_cafe_pizzeria</span>
                <span className="text-[10px] text-orange-400 font-bold">Watch</span>
              </a>

              <p className="text-[10px] text-slate-500 text-center">
                Asela, Ethiopia • Near Ras Hotel &amp; Arsi Univ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Order Tracker Banner */}
      {trackedOrder && (
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-4 shadow-lg sticky top-20 z-30 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl animate-pulse">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-orange-100">
                    Active Order Tracker (#{trackedOrder.id})
                  </p>
                  <span className="text-[10px] bg-black/20 text-orange-100 uppercase px-2 py-0.5 rounded-md font-bold">
                    {trackedOrder.payment_method === 'telebirr'
                      ? 'telebirr'
                      : trackedOrder.payment_method === 'cbe_birr'
                      ? 'CBE Birr'
                      : trackedOrder.payment_method === 'chapa'
                      ? 'Chapa'
                      : 'Cash'}
                  </span>
                </div>
                <div className="text-sm font-bold flex items-center gap-2 mt-0.5">
                  <span>Status:</span>
                  {trackedOrder.status === 'pending' && (
                    <span className="underline decoration-amber-200">
                      Pending confirmation from kitchen...
                    </span>
                  )}
                  {trackedOrder.status === 'confirmed' && (
                    <span className="text-amber-200 font-extrabold flex items-center gap-1">
                      <Flame className="w-4 h-4 inline animate-bounce" /> Accepted &amp; Preparing in kitchen!
                    </span>
                  )}
                  {trackedOrder.status === 'completed' && (
                    <span className="text-emerald-200 font-extrabold">
                      Completed! Enjoy your meal from Time Cafe!
                    </span>
                  )}
                  {trackedOrder.status === 'cancelled' && (
                    <span className="text-rose-200 font-extrabold">
                      Cancelled by the restaurant.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onSwitchToAdmin && (
                <button
                  onClick={onSwitchToAdmin}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                >
                  View in Kitchen Dispatch
                </button>
              )}
              <button
                onClick={dismissTracker}
                className="text-xs bg-black/20 hover:bg-black/30 text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conditional View: Stories / Blog vs Menu */}
      {activeCustomerView === 'stories' ? (
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <button
              onClick={() => setActiveCustomerView('menu')}
              className="text-xs text-orange-400 hover:text-white font-bold flex items-center gap-1"
            >
              <span>&larr; Back to Food &amp; Drink Menu</span>
            </button>
          </div>
          <CafeBlogSection
            onOrderNow={() => setActiveCustomerView('menu')}
            onCustomizeItem={(item) => {
              setActiveCustomerView('menu');
              setCustomizingItem(item);
            }}
          />
        </div>
      ) : (
        <>
          {/* Hero Banner Section */}
          <section className="relative overflow-hidden pt-4 sm:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Mobile Quick Mode Selector */}
              <div className="md:hidden mb-4">
                <div className="flex items-center bg-slate-900/95 p-1 rounded-2xl border border-slate-800 text-xs font-bold shadow-lg">
                  <button
                    onClick={() => setActiveCustomerView('menu')}
                    className="flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 bg-orange-500 text-white shadow-md shadow-orange-500/30 font-bold"
                  >
                    <Pizza className="w-3.5 h-3.5" />
                    <span>Food Menu</span>
                  </button>
                  <button
                    onClick={() => setActiveCustomerView('stories')}
                    className="flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-slate-400 hover:text-white font-bold"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Cafe Stories &amp; Blog</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-10 border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-orange-950/30 shadow-2xl">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-4">
                    <Flame className="w-3.5 h-3.5 text-orange-500" /> Best Quality in Asela • Mount Chilalo Craft
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3">
                    Crafted with Passion, <br />
                    <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                      Served with Love.
                    </span>
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                    Fresh 72-hour fermented pizzas, single-origin Ethiopian coffees, rich layered juices, and artisanal pastries. Select &amp; customize ingredients or order fast delivery to Assela Ras Hotel and Arsi University.
                  </p>

                  {/* Search Bar & Blog Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl">
                    <div className="relative flex-1 w-full">
                      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search pizza, cappuccino, avocado juice..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition text-sm"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveCustomerView('stories')}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      <BookOpen className="w-4 h-4 text-orange-400" />
                      <span>Cafe Stories</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Category Tabs Navigation */}
          <section className="sticky top-20 z-30 bg-[#0b0f19]/90 backdrop-blur-md py-4 border-y border-slate-800/80 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Menu Grid Section */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Full Menu'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Tap customize to pick and adjust your ingredients</p>
              </div>
              <span className="text-xs text-slate-400 font-medium bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                {filteredMenu.length} Items Available
              </span>
            </div>

            {filteredMenu.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-300">No menu items found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search query or selecting a different category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredMenu.map((item) => {
                  const selectedSize = item.hasSizes
                    ? selectedSizes[item.id] || 'Standard'
                    : 'Standard';
                  const currentPrice =
                    selectedSize === 'Large' && item.priceLarge
                      ? item.priceLarge
                      : item.price;
                  const isSoldOut = item.inStock === false;

                  return (
                    <div
                      key={item.id}
                      className={`glass-card rounded-3xl overflow-hidden flex flex-col justify-between border group transition ${
                        isSoldOut ? 'border-rose-900/40 opacity-75' : 'border-slate-800/80'
                      }`}
                    >
                      <div className="relative overflow-hidden h-48 bg-slate-900 cursor-pointer" onClick={() => !isSoldOut && setCustomizingItem(item)}>
                        <img
                          src={item.img}
                          alt={item.name}
                          className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${
                            isSoldOut ? 'grayscale-50' : ''
                          }`}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          {item.tag && (
                            <span className="bg-orange-500/90 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-md backdrop-blur-sm">
                              {item.tag}
                            </span>
                          )}
                          {isSoldOut && (
                            <span className="bg-rose-600/90 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-md backdrop-blur-sm">
                              Sold Out
                            </span>
                          )}
                        </div>

                        {/* Ingredients Tag Pill */}
                        {item.availableIngredients && item.availableIngredients.length > 0 && (
                          <div className="absolute bottom-3 left-3 right-3 text-[10px] text-slate-300 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800/80 truncate">
                            ✨ {item.availableIngredients.slice(0, 3).join(', ')}...
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                        <div>
                          <h4
                            onClick={() => !isSoldOut && setCustomizingItem(item)}
                            className="font-bold text-white text-base leading-snug group-hover:text-orange-400 transition cursor-pointer"
                          >
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        {/* Size Selector for Pizzas */}
                        {item.hasSizes && (
                          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-center">
                            <button
                              type="button"
                              onClick={() => handleSizeChange(item.id, 'Standard')}
                              className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                                selectedSize === 'Standard'
                                  ? 'bg-orange-500 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Regular
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSizeChange(item.id, 'Large')}
                              className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                                selectedSize === 'Large'
                                  ? 'bg-orange-500 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Large
                            </button>
                          </div>
                        )}

                        {/* Price and Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <div>
                            <span className="text-[10px] text-slate-500 font-medium block">Price</span>
                            <span className="text-lg font-black text-orange-500">
                              {currentPrice}{' '}
                              <span className="text-xs font-semibold text-slate-400">ETB</span>
                            </span>
                          </div>

                          {isSoldOut ? (
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                              <Ban className="w-3.5 h-3.5" /> Unavailable
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {/* Customize Ingredients Button */}
                              <button
                                type="button"
                                onClick={() => setCustomizingItem(item)}
                                className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                                title="Customize Ingredients & Add-ons"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                                <span className="hidden sm:inline">Custom</span>
                              </button>

                              {/* Quick Add Button */}
                              <button
                                onClick={() => quickAddToCart(item)}
                                className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/20 hover:border-orange-500 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </>
      )}

      {/* Food Customization Modal */}
      {customizingItem && (
        <CustomizeFoodModal
          item={customizingItem}
          onAddToCart={handleAddCustomizedToCart}
          onClose={() => setCustomizingItem(null)}
        />
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-white text-lg">Your Order</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar my-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
                    <ShoppingBag className="w-14 h-14 mb-3 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm text-slate-300">Your cart is empty</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Browse our menu of wood-fired pizzas and fresh Asela drinks to get started.
                    </p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <h5 className="font-bold text-white text-sm">{item.name}</h5>
                          <span className="text-xs font-extrabold text-orange-500">
                            {item.price * item.qty} ETB
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => updateCartQtyByIndex(idx, -1)}
                            className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded-md flex items-center justify-center text-xs font-bold transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">{item.qty}</span>
                          <button
                            onClick={() => updateCartQtyByIndex(idx, 1)}
                            className="w-6 h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center justify-center text-xs font-bold transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Display Customized Ingredients In Cart */}
                      {item.customization && (
                        <div className="pt-2 border-t border-slate-850 text-[11px] space-y-0.5 text-slate-400">
                          {item.customization.removedIngredients.length > 0 && (
                            <div className="text-rose-400 font-medium">
                              ❌ No: {item.customization.removedIngredients.join(', ')}
                            </div>
                          )}
                          {item.customization.selectedAdditions.length > 0 && (
                            <div className="text-emerald-400 font-medium">
                              ✨ Extra: {item.customization.selectedAdditions.map((a) => a.name).join(', ')}
                            </div>
                          )}
                          {item.customization.specialInstructions && (
                            <div className="text-amber-300 italic">
                              "{item.customization.specialInstructions}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Order Form & Totals */}
              {cart.length > 0 && (
                <form onSubmit={handleInitiateCheckout} className="border-t border-slate-800 pt-4 space-y-4">
                  {/* Order Type Toggle */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-center">
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                        orderType === 'dine_in'
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-slate-400 bg-transparent'
                      }`}
                    >
                      Dine-In
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                        orderType === 'takeaway'
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-slate-400 bg-transparent'
                      }`}
                    >
                      Takeaway
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                        orderType === 'delivery'
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-slate-400 bg-transparent'
                      }`}
                    >
                      Delivery
                    </button>
                  </div>

                  {/* Customer Inputs */}
                  <div className="space-y-2 text-xs">
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone Number (e.g. 0911234567)"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Delivery Map Button / Address Input */}
                    <div>
                      {orderType === 'delivery' && (
                        <div className="space-y-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setIsMapModalOpen(true)}
                            className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition cursor-pointer"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>Open Assela Delivery Map (Satellite / Ras Hotel)</span>
                          </button>

                          {/* Quick Assela Area Presets in Cart */}
                          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                            <button
                              type="button"
                              onClick={() => {
                                setTableOrAddress('Assela Ras Hotel (7.9644, 39.1326)');
                                setDeliveryCoordinates({ lat: 7.964356, lng: 39.132628 });
                                showToast('Selected Assela Ras Hotel');
                              }}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold shrink-0 cursor-pointer transition ${
                                tableOrAddress.includes('Ras Hotel')
                                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              🏨 Ras Hotel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTableOrAddress('Arsi University Main Campus (7.9621, 39.1290)');
                                setDeliveryCoordinates({ lat: 7.9621, lng: 39.1290 });
                                showToast('Selected Arsi University');
                              }}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold shrink-0 cursor-pointer transition ${
                                tableOrAddress.includes('Arsi University')
                                  ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              🎓 Arsi University
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTableOrAddress('Arsi Referral Hospital (7.9592, 39.1205)');
                                setDeliveryCoordinates({ lat: 7.9592, lng: 39.1205 });
                                showToast('Selected Arsi Hospital');
                              }}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold shrink-0 cursor-pointer transition ${
                                tableOrAddress.includes('Hospital')
                                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              🏥 Arsi Hospital
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        {orderType === 'delivery' ? (
                          <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        ) : (
                          <UtensilsCrossed className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        )}
                        <input
                          type="text"
                          value={tableOrAddress}
                          onChange={(e) => setTableOrAddress(e.target.value)}
                          placeholder={
                            orderType === 'dine_in'
                              ? 'Table Number (e.g. Table 04)'
                              : orderType === 'takeaway'
                              ? 'Pickup Time / Special Notes'
                              : 'Delivery Address in Assela (e.g. Assela Ras Hotel)'
                          }
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {orderType === 'delivery' && tableOrAddress && (
                        <div className="mt-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-[11px] text-emerald-400">
                          <span className="truncate max-w-[240px]">
                            ✓ Set for Assela delivery: <strong>{tableOrAddress}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsMapModalOpen(true)}
                            className="underline text-emerald-300 hover:text-white shrink-0 ml-1 cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>{subtotal} ETB</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Delivery Fee</span>
                      <span>{deliveryFee} ETB</span>
                    </div>
                    <div className="border-t border-slate-800 pt-1 flex justify-between font-extrabold text-white text-sm">
                      <span>Total Amount</span>
                      <span className="text-orange-500">{grandTotal} ETB</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Payment</span>
                    <CreditCard className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Asela Satellite Map Modal */}
      {isMapModalOpen && (
        <AselaDeliveryMapModal
          initialLat={deliveryCoordinates?.lat}
          initialLng={deliveryCoordinates?.lng}
          onSelectLocation={(loc) => {
            setTableOrAddress(loc.address);
            setDeliveryCoordinates({ lat: loc.lat, lng: loc.lng });
            showToast(`Location set: ${loc.address}`);
          }}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}

      {/* Ethiopian Payment Modal */}
      {isPaymentModalOpen && (
        <EthiopianPaymentModal
          amount={grandTotal}
          selectedMethod={paymentMethod}
          onChangeMethod={setPaymentMethod}
          onConfirmPayment={handleFinalizeOrder}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      {/* Order Receipt Modal */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-1">
                <TimeCafeLogo size={56} />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Order Placed &amp; Dispatched</span>
              </div>
              <h3 className="text-2xl font-black text-white">Order Sent to Kitchen!</h3>
              <p className="text-xs text-slate-400">
                Your request has been routed to the Time Cafe kitchen in Asela.
              </p>
            </div>

            <div className="mt-6 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Order Reference</span>
                <span className="font-bold text-orange-500">#TC-{confirmedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer</span>
                <span className="text-white font-medium">{confirmedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="text-white font-medium uppercase">
                  {confirmedOrder.order_type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="text-white font-medium capitalize flex items-center gap-1">
                  {confirmedOrder.payment_method === 'telebirr'
                    ? 'telebirr'
                    : confirmedOrder.payment_method === 'cbe_birr'
                    ? 'CBE Birr'
                    : confirmedOrder.payment_method === 'chapa'
                    ? 'Chapa Gateway'
                    : 'Cash'}
                  {confirmedOrder.payment_status === 'paid' ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                      Paid
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
                      Pay on Arrival
                    </span>
                  )}
                </span>
              </div>
              {confirmedOrder.payment_txn_ref && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Txn Ref</span>
                  <span className="font-mono text-slate-300 font-semibold">{confirmedOrder.payment_txn_ref}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Location / Table</span>
                <span className="text-white font-medium truncate max-w-[200px]">
                  {confirmedOrder.table_or_address}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm">
                <span className="text-white">Amount Due</span>
                <span className="text-emerald-400">{confirmedOrder.total_amount} ETB</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmedOrder(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Done
              </button>
              {(onSwitchToKitchen || onSwitchToAdmin) && (
                <button
                  onClick={() => {
                    setConfirmedOrder(null);
                    if (onSwitchToKitchen) onSwitchToKitchen();
                    else if (onSwitchToAdmin) onSwitchToAdmin();
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>View in Kitchen (KDS)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Cart Checkout Bar (Thumb friendly for mobile shoppers) */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 sm:hidden shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="pl-1">
            <p className="text-[11px] text-slate-400 font-medium">
              {totalCartCount} item{totalCartCount > 1 ? 's' : ''} in cart
            </p>
            <p className="text-base font-black text-orange-400">{subtotal} ETB</p>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/30 text-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart &amp; Checkout</span>
          </button>
        </div>
      )}

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-orange-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 mt-16 pb-20 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <TimeCafeLogo size={32} />
            <div>
              <span className="font-semibold text-slate-300">Time Cafe &amp; Pizzeria</span> • Asela, Ethiopia
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setActiveCustomerView('menu')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Order Menu
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveCustomerView('stories')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Cafe Stories &amp; Blog
            </button>
            <span>•</span>
            <span>Dine-In • Takeaway • Fast Local Delivery</span>
          </div>
          <div>© 2026 Time Cafe. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
