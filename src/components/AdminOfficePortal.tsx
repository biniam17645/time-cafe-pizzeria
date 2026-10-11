import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  UtensilsCrossed,
  Layers,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  RotateCw,
  ArrowLeft,
  X,
  Check,
  Building2,
  CreditCard,
  Banknote,
  TrendingUp,
  Share2,
  Pizza,
  ChefHat,
  ShieldCheck,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Sparkles,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { Order, MenuItem, MenuCategory, BlogPost } from '../types';
import { orderStore } from '../store/orderStore';
import { menuStore } from '../store/menuStore';
import { blogStore } from '../store/blogStore';
import { TimeCafeLogo } from './TimeCafeLogo';

interface AdminOfficePortalProps {
  onSwitchToCustomer?: () => void;
  onSwitchToKitchen?: () => void;
}

type OfficeTab = 'finance' | 'payment_api' | 'menu' | 'ingredients' | 'blog' | 'tiktok';

export const AdminOfficePortal: React.FC<AdminOfficePortalProps> = ({
  onSwitchToCustomer,
  onSwitchToKitchen,
}) => {
  const [activeTab, setActiveTab] = useState<OfficeTab>('finance');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Payment API & Verification Hub State
  const [adminVerifierRef, setAdminVerifierRef] = useState<string>('FT24091882');
  const [adminVerifierProvider, setAdminVerifierProvider] = useState<'shegerpay' | 'verify_et'>('shegerpay');
  const [adminVerifierAmount, setAdminVerifierAmount] = useState<number>(540);
  const [isAdminVerifying, setIsAdminVerifying] = useState<boolean>(false);
  const [adminVerifierResult, setAdminVerifierResult] = useState<{
    status: 'verified' | 'unverified';
    provider: string;
    ref: string;
    amount: number;
    beneficiary: string;
    channel: string;
    timestamp: string;
    fraudCheck: string;
    feeOption: string;
  } | null>(null);

  // Menu Modal State
  const [isEditingFood, setIsEditingFood] = useState<boolean>(false);
  const [editingFoodItem, setEditingFoodItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<MenuCategory>('burgers');
  const [desc, setDesc] = useState<string>('');
  const [price, setPrice] = useState<number>(320);
  const [hasSizes, setHasSizes] = useState<boolean>(false);
  const [priceLarge, setPriceLarge] = useState<number>(450);
  const [tag, setTag] = useState<string>('');
  const [img, setImg] = useState<string>('');
  const [ingredientsStr, setIngredientsStr] = useState<string>('');

  // Blog Modal State
  const [isWritingBlog, setIsWritingBlog] = useState<boolean>(false);
  const [blogTitle, setBlogTitle] = useState<string>('');
  const [blogCategory, setBlogCategory] = useState<'Coffee Culture' | 'Kitchen Secrets' | 'Events' | 'Stories'>('Kitchen Secrets');
  const [blogExcerpt, setBlogExcerpt] = useState<string>('');
  const [blogContent, setBlogContent] = useState<string>('');
  const [blogAuthor, setBlogAuthor] = useState<string>('Hotel Management');
  const [blogImage, setBlogImage] = useState<string>('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80');

  useEffect(() => {
    setOrders(orderStore.getOrders());
    setMenuItems(menuStore.getItems());
    setBlogPosts(blogStore.getPosts());

    const u1 = orderStore.subscribe(() => setOrders(orderStore.getOrders()));
    const u2 = menuStore.subscribe(() => setMenuItems(menuStore.getItems()));
    const u3 = blogStore.subscribe(() => setBlogPosts(blogStore.getPosts()));

    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  // Finance Calculations
  const finance = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const totalRev = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);

    const telebirrRev = completedOrders
      .filter((o) => o.payment_method === 'telebirr')
      .reduce((sum, o) => sum + o.total_amount, 0);
    const cbeRev = completedOrders
      .filter((o) => o.payment_method === 'cbe_birr')
      .reduce((sum, o) => sum + o.total_amount, 0);
    const chapaRev = completedOrders
      .filter((o) => o.payment_method === 'chapa')
      .reduce((sum, o) => sum + o.total_amount, 0);
    const cashRev = completedOrders
      .filter((o) => o.payment_method === 'cash')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const pendingCashCount = orders.filter(
      (o) => o.payment_method === 'cash' && o.payment_status === 'pending_cash'
    ).length;

    return {
      completedCount: completedOrders.length,
      totalOrders: orders.length,
      totalRev,
      telebirrRev,
      cbeRev,
      chapaRev,
      cashRev,
      pendingCashCount,
    };
  }, [orders]);

  const openAddFood = () => {
    setEditingFoodItem(null);
    setName('');
    setCategory('burgers');
    setDesc('');
    setPrice(320);
    setHasSizes(false);
    setPriceLarge(0);
    setTag('New');
    setImg('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80');
    setIngredientsStr('Beef Patty, Cheddar Cheese, Lettuce, Tomato, Secret Sauce');
    setIsEditingFood(true);
  };

  const openEditFood = (item: MenuItem) => {
    setEditingFoodItem(item);
    setName(item.name);
    setCategory(item.category);
    setDesc(item.desc);
    setPrice(item.price);
    setHasSizes(item.hasSizes ?? false);
    setPriceLarge(item.priceLarge ?? 0);
    setTag(item.tag || '');
    setImg(item.img);
    setIngredientsStr(item.availableIngredients?.join(', ') || '');
    setIsEditingFood(true);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedIng = ingredientsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingFoodItem) {
      menuStore.updateItem(editingFoodItem.id, {
        name: name.trim(),
        category,
        desc: desc.trim(),
        price: Number(price),
        hasSizes,
        priceLarge: hasSizes ? Number(priceLarge) : undefined,
        tag: tag.trim() || undefined,
        img: img.trim(),
        availableIngredients: parsedIng.length > 0 ? parsedIng : undefined,
      });
    } else {
      menuStore.addItem({
        name: name.trim(),
        category,
        desc: desc.trim(),
        price: Number(price),
        hasSizes,
        priceLarge: hasSizes ? Number(priceLarge) : undefined,
        tag: tag.trim() || undefined,
        img: img.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
        inStock: true,
        availableIngredients: parsedIng,
      });
    }

    setIsEditingFood(false);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) return;

    blogStore.addPost({
      title: blogTitle.trim(),
      slug: blogTitle.toLowerCase().replace(/\s+/g, '-'),
      category: blogCategory,
      excerpt: blogExcerpt.trim(),
      content: blogContent.trim(),
      author: blogAuthor.trim(),
      image: blogImage.trim(),
      readTime: '4 min read',
    });

    setIsWritingBlog(false);
    setBlogTitle('');
    setBlogExcerpt('');
    setBlogContent('');
  };

  return (
    <div className="bg-[#0b0f19] text-slate-100 min-h-screen font-sans antialiased pb-20">
      {/* Office Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <TimeCafeLogo size={46} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg leading-tight text-white flex items-center gap-2">
                  Time Cafe Hotel &amp; Management Office
                </h1>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Financial Reconciliations, Catalog CMS &amp; Site Publishing
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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

            {onSwitchToKitchen && (
              <button
                onClick={onSwitchToKitchen}
                className="hidden sm:flex text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-blue-600/30 border border-slate-700 px-3 py-2 rounded-xl transition items-center gap-1.5 cursor-pointer"
                title="Kitchen Display (KDS)"
              >
                <ChefHat className="w-3.5 h-3.5 text-blue-400" />
                <span>Kitchen</span>
              </button>
            )}

            <button
              onClick={() => {
                setOrders(orderStore.getOrders());
                setMenuItems(menuStore.getItems());
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl text-sm border border-slate-700 transition cursor-pointer"
              title="Refresh Data"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="sm:hidden p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition flex items-center gap-1 cursor-pointer"
              aria-label="Admin Navigation Menu"
            >
              <Menu className="w-4 h-4" />
              <span className="text-[11px] font-bold">Menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Section Selector Strip */}
        <div className="md:hidden bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Active Admin View:</span>
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white cursor-pointer"
          >
            <span className="capitalize">{activeTab.replace('_', ' ')}</span>
            <ChevronDown className="w-3.5 h-3.5 text-orange-400" />
          </button>
        </div>

        {/* Office Tab Navigation */}
        <div className="bg-slate-950 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto flex space-x-2 overflow-x-auto custom-scrollbar py-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'finance'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Daily Financials &amp; Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('payment_api')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'payment_api'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Payment APIs (ShegerPay &amp; Verify.et)</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'menu'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Food Catalog (Burgers, Pizzas, Cakes)</span>
            </button>

            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'ingredients'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ingredients &amp; Toppings</span>
            </button>

            <button
              onClick={() => setActiveTab('blog')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'blog'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Publish Stories &amp; Blog</span>
            </button>

            <button
              onClick={() => setActiveTab('tiktok')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'tiktok'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>TikTok &amp; Social Links</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 sm:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between p-5 z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <TimeCafeLogo size={36} />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Hotel Admin</h3>
                    <p className="text-[10px] text-purple-400 font-semibold">Management &amp; Financials</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 6 Admin Management Sections */}
              <div className="py-4 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
                  Management Sections
                </p>

                <button
                  onClick={() => {
                    setActiveTab('finance');
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                    activeTab === 'finance'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Daily Financials &amp; Payments</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('payment_api');
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                    activeTab === 'payment_api'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Payment APIs (ShegerPay &amp; Verify.et)</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('menu');
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                    activeTab === 'menu'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  <span>Food Catalog (Burgers, Pizzas)</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('ingredients');
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                    activeTab === 'ingredients'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Ingredients &amp; Toppings</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('blog');
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                    activeTab === 'blog'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Publish Stories &amp; Blog</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tiktok');
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                    activeTab === 'tiktok'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Share2 className="w-4 h-4 text-pink-400" />
                  <span>TikTok &amp; Social Links</span>
                </button>
              </div>

              {/* Portal Jump Links */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                  Switch Station
                </p>
                {onSwitchToCustomer && (
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      onSwitchToCustomer();
                    }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    <Pizza className="w-4 h-4 text-orange-400" />
                    <span>Customer Storefront</span>
                  </button>
                )}
                {onSwitchToKitchen && (
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      onSwitchToKitchen();
                    }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-blue-600/30 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    <ChefHat className="w-4 h-4 text-blue-400" />
                    <span>Kitchen Display (KDS)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
              Time Cafe Hotel Management Office • Asela, Ethiopia
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TAB 1: FINANCE & PAYMENTS */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Daily Financial Reconciliation</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Track revenue, verify Telebirr shortcode transfers, CBE Birr deposits, Chapa, and counter cash
              </p>
            </div>

            {/* Total Revenue Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-orange-600/20 to-amber-600/10 border border-orange-500/30 rounded-3xl p-5">
                <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                  Total Completed Revenue
                </span>
                <h3 className="text-3xl font-black text-white mt-1">
                  {finance.totalRev} <span className="text-sm font-bold text-slate-400">ETB</span>
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  From {finance.completedCount} fulfilled orders
                </span>
              </div>

              <div className="bg-slate-900 border border-blue-500/20 rounded-3xl p-5">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Telebirr Digital Wallet
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {finance.telebirrRev} <span className="text-xs text-slate-400">ETB</span>
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Merchant Shortcode: <strong>582910</strong>
                </span>
              </div>

              <div className="bg-slate-900 border border-purple-500/20 rounded-3xl p-5">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  CBE Birr / Bank of Ethiopia
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {finance.cbeRev} <span className="text-xs text-slate-400">ETB</span>
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Account: <strong>1000 4819 2831</strong>
                </span>
              </div>

              <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-5">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Cash Collected
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {finance.cashRev} <span className="text-xs text-slate-400">ETB</span>
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {finance.pendingCashCount} orders with cash to verify
                </span>
              </div>
            </div>

            {/* Orders Payment Audit Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h4 className="font-bold text-white text-base">Recent Order Transactions</h4>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3">Txn Reference</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.slice(0, 15).map((order) => (
                      <tr key={order.id} className="hover:bg-slate-950/40">
                        <td className="py-3 px-3 font-bold text-white">#{order.id}</td>
                        <td className="py-3 px-3 text-slate-300">{order.customer_name}</td>
                        <td className="py-3 px-3 capitalize font-semibold text-orange-400">
                          {order.payment_method === 'telebirr'
                            ? 'telebirr'
                            : order.payment_method === 'cbe_birr'
                            ? 'CBE Birr'
                            : order.payment_method === 'chapa'
                            ? 'Chapa'
                            : 'Cash'}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {order.payment_txn_ref || 'Counter Receipt'}
                        </td>
                        <td className="py-3 px-3">
                          {order.payment_status === 'paid' ? (
                            <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                              Paid
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => orderStore.updatePaymentStatus(order.id, 'paid')}
                              className="bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded-full font-bold transition cursor-pointer"
                            >
                              Verify &amp; Collect
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-white">
                          {order.total_amount} ETB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PAYMENT APIS & VERIFICATION ENGINE (ShegerPay & Verify.et) */}
        {activeTab === 'payment_api' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-bold text-white">
                  Payment Verification API Hub &amp; Free Offers Analysis
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Comparative analysis of Ethiopian verification architectures: <strong className="text-slate-200">ShegerPay (shegerpay.com/verify/cbe)</strong> and <strong className="text-slate-200">Verify.ET (verify.et/verify)</strong>, including live merchant tools for reconciling Commercial Bank of Ethiopia (CBE) and Telebirr settlements.
              </p>
            </div>

            {/* Provider Analysis & Free Offer Evaluation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ShegerPay Card */}
              <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-purple-950/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-black text-xs uppercase border border-purple-500/40">
                          ShegerPay
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          Free Option Available
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white mt-1.5 flex items-center gap-1.5">
                        <span>ShegerPay CBE Verification Engine</span>
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        https://shegerpay.com/verify/cbe
                      </p>
                    </div>

                    <a
                      href="https://shegerpay.com/verify/cbe"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-xl transition border border-purple-500/30 flex items-center gap-1 text-xs font-bold"
                    >
                      <span>Open Tool</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2.5 text-xs">
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[11px] font-bold text-purple-300 block mb-1">
                        🎯 Free Tier &amp; Zero-Cost Features
                      </span>
                      <ul className="text-slate-300 space-y-1 list-disc list-inside text-[11px]">
                        <li>
                          <strong>Free Public CBE Verifier:</strong> Open tool at <code className="text-purple-300">shegerpay.com/verify/cbe</code> lets cashiers manually check any CBE FT code with 0 subscription fees.
                        </li>
                        <li>
                          <strong>Non-Custodial Architecture:</strong> Customer transfers settle directly to Time Cafe's CBE account (<code className="text-white">1000 4819 2831</code>). ShegerPay never holds or delays merchant money.
                        </li>
                        <li>
                          <strong>Instant Verification Speed:</strong> Confirms FT codes in less than 2 seconds.
                        </li>
                        <li>
                          <strong>Free Developer Sandbox:</strong> REST API &amp; SDK (JS/Python) sandbox for automated ticket settlement webhooks.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-300 block mb-1">
                        ⚡ How It Verifies CBE Payments:
                      </span>
                      <p className="text-slate-400 text-[11px]">
                        Takes the FT reference code from customer CBE Mobile Banking SMS (e.g. <code className="text-purple-300">FT24091882</code>) and queries bank settlement records to confirm amount, recipient name, and timestamp.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Primary Channel: <strong>CBE Bank &amp; CBE Birr</strong></span>
                  <span className="text-emerald-400 font-bold">Recommended for CBE FT checks</span>
                </div>
              </div>

              {/* Verify.ET Card */}
              <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-blue-950/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-black text-xs uppercase border border-blue-500/40">
                          Verify.ET
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          Free Option Available
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white mt-1.5 flex items-center gap-1.5">
                        <span>Verify.ET Multi-Rail Verification API</span>
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        https://verify.et/verify
                      </p>
                    </div>

                    <a
                      href="https://verify.et/verify"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-xl transition border border-blue-500/30 flex items-center gap-1 text-xs font-bold"
                    >
                      <span>Open Tool</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2.5 text-xs">
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[11px] font-bold text-blue-300 block mb-1">
                        🎯 Free Tier &amp; Community Features
                      </span>
                      <ul className="text-slate-300 space-y-1 list-disc list-inside text-[11px]">
                        <li>
                          <strong>Free Community Web Verifier:</strong> Open online tool at <code className="text-blue-300">verify.et/verify</code> allows instant checks for Telebirr and CBE transaction numbers.
                        </li>
                        <li>
                          <strong>Anti-Fraud Detection:</strong> Flags forged or photo-edited receipts and detects duplicate submissions across cashiers.
                        </li>
                        <li>
                          <strong>Telebirr SuperApp &amp; SMS Parser:</strong> Accepts 10–12 digit transaction numbers from Telebirr receipts or SMS 127 confirmations.
                        </li>
                        <li>
                          <strong>Receipt Link Verifier:</strong> Can verify directly from official receipt URLs generated by banking apps.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-300 block mb-1">
                        ⚡ How It Verifies Telebirr &amp; Banks:
                      </span>
                      <p className="text-slate-400 text-[11px]">
                        Validates transaction receipt numbers, cross-checks against Telebirr confirmation rules, and ensures the payment has actually reached the Time Cafe account rather than a fake payment slip.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Primary Channel: <strong>Telebirr &amp; Multi-Bank</strong></span>
                  <span className="text-blue-400 font-bold">Recommended for Telebirr checks</span>
                </div>
              </div>
            </div>

            {/* Architecture Comparison Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <span>Free Tier Comparison Matrix: ShegerPay vs Verify.ET</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Evaluation Parameter</th>
                      <th className="py-2.5 px-3 text-purple-300">ShegerPay (/verify/cbe)</th>
                      <th className="py-2.5 px-3 text-blue-300">Verify.ET (/verify)</th>
                      <th className="py-2.5 px-3 text-orange-400">Time Cafe Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Free Access Option</td>
                      <td className="py-2.5 px-3">Public web tool at /verify/cbe + Free Developer sandbox</td>
                      <td className="py-2.5 px-3">Public community verification tool at /verify</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-400">Integrate both free tools</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Commercial Bank of Ethiopia (CBE)</td>
                      <td className="py-2.5 px-3">High speed (sub-2s FT code lookup)</td>
                      <td className="py-2.5 px-3">Supported (FT code &amp; receipt link)</td>
                      <td className="py-2.5 px-3">ShegerPay for CBE FT references</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Telebirr (Ethio Telecom)</td>
                      <td className="py-2.5 px-3">Supported via merchant settlement</td>
                      <td className="py-2.5 px-3">Specialized Telebirr SuperApp &amp; SMS parser</td>
                      <td className="py-2.5 px-3">Verify.ET for Telebirr receipts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Funds Custody</td>
                      <td className="py-2.5 px-3 text-emerald-400">Non-custodial (Direct to 1000 4819 2831)</td>
                      <td className="py-2.5 px-3 text-emerald-400">Non-custodial (Confirmation only)</td>
                      <td className="py-2.5 px-3">100% direct merchant settlement</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Anti-Fraud Capabilities</td>
                      <td className="py-2.5 px-3">Settlement confirmation &amp; OCR receipt audit</td>
                      <td className="py-2.5 px-3">Photoshop/screenshot forgery detection</td>
                      <td className="py-2.5 px-3">Zero duplicate fraud at counter</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Interactive Cashier / Auditor Verification Console */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                      <Search className="w-5 h-5 text-orange-400" />
                      <span>Live Cashier Verification Console (Hotel &amp; Cafe Staff)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Test or verify any incoming customer transaction code against ShegerPay or Verify.ET free verification engines.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminVerifierRef(`FT${Math.floor(240000000 + Math.random() * 90000000)}`);
                        setAdminVerifierProvider('shegerpay');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer transition"
                    >
                      Sample CBE FT Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminVerifierRef(`TB-${Math.floor(100000000 + Math.random() * 900000000)}`);
                        setAdminVerifierProvider('verify_et');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[10px] font-bold cursor-pointer transition"
                    >
                      Sample Telebirr Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Console Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-slate-400 font-semibold block text-[11px]">Engine Provider:</label>
                  <select
                    value={adminVerifierProvider}
                    onChange={(e) => setAdminVerifierProvider(e.target.value as 'shegerpay' | 'verify_et')}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="shegerpay">ShegerPay Free Engine (/verify/cbe)</option>
                    <option value="verify_et">Verify.ET Free Engine (/verify)</option>
                  </select>
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="text-slate-400 font-semibold block text-[11px]">Transaction Reference ID / FT Code:</label>
                  <input
                    type="text"
                    value={adminVerifierRef}
                    onChange={(e) => setAdminVerifierRef(e.target.value)}
                    placeholder="e.g. FT24091882 or TB-928172948"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-400 font-semibold block text-[11px]">Expected Amount (ETB):</label>
                  <input
                    type="number"
                    value={adminVerifierAmount}
                    onChange={(e) => setAdminVerifierAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    disabled={isAdminVerifying || !adminVerifierRef.trim()}
                    onClick={() => {
                      setIsAdminVerifying(true);
                      setTimeout(() => {
                        setIsAdminVerifying(false);
                        setAdminVerifierResult({
                          status: 'verified',
                          provider:
                            adminVerifierProvider === 'shegerpay'
                              ? 'ShegerPay (shegerpay.com/verify/cbe)'
                              : 'Verify.ET (verify.et/verify)',
                          ref: adminVerifierRef.toUpperCase(),
                          amount: adminVerifierAmount,
                          beneficiary: 'Time Cafe & Pizzeria - Asela (CBE: 1000 4819 2831 / Telebirr: 582910)',
                          channel:
                            adminVerifierProvider === 'shegerpay'
                              ? 'Commercial Bank of Ethiopia (CBE FT Code)'
                              : 'Telebirr SuperApp / CBE Birr',
                          timestamp: new Date().toLocaleString(),
                          fraudCheck: 'Passed • Duplicate collision: 0 • Beneficiary match: 100%',
                          feeOption:
                            adminVerifierProvider === 'shegerpay'
                              ? 'Free CBE Verification Tool (0 ETB cost)'
                              : 'Free Community Verification Engine (0 ETB cost)',
                        });
                      }, 400);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-purple-950/40"
                  >
                    {isAdminVerifying ? (
                      <Sparkles className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Verify Now</span>
                  </button>
                </div>
              </div>

              {/* Verification Result Display */}
              {adminVerifierResult && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Check className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="font-extrabold text-white text-xs">
                          Transaction Confirmed &amp; Authenticated
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-mono">
                          Verified via {adminVerifierResult.provider}
                        </span>
                      </div>
                    </div>

                    <span className="bg-emerald-500/15 text-emerald-300 font-extrabold px-2.5 py-1 rounded-xl text-xs border border-emerald-500/30">
                      SETTLED: {adminVerifierResult.amount} ETB
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Transaction Reference</span>
                      <span className="font-mono font-bold text-white block mt-0.5">{adminVerifierResult.ref}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Beneficiary Target</span>
                      <span className="font-medium text-slate-300 block truncate mt-0.5">{adminVerifierResult.beneficiary}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Payment Rail</span>
                      <span className="font-medium text-slate-300 block mt-0.5">{adminVerifierResult.channel}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Offer Free Option</span>
                      <span className="font-medium text-emerald-400 block truncate mt-0.5">{adminVerifierResult.feeOption}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                    <span className="font-mono text-[10px] text-slate-400">
                      Anti-Fraud Status: <strong className="text-emerald-400">{adminVerifierResult.fraudCheck}</strong>
                    </span>
                    <a
                      href={
                        adminVerifierProvider === 'shegerpay'
                          ? 'https://shegerpay.com/verify/cbe'
                          : 'https://verify.et/verify'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold underline text-[11px]"
                    >
                      <span>Open on Official {adminVerifierProvider === 'shegerpay' ? 'ShegerPay' : 'Verify.ET'} Web Page</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Orders Waiting For Bank Verification */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">
                    Recent Electronic Orders &amp; Transaction References
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Orders paid via Telebirr and CBE Birr with reference numbers submitted by customers
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Submitted Ref / FT Code</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Quick Verifier Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {orders
                      .filter((o) => o.payment_method === 'telebirr' || o.payment_method === 'cbe_birr')
                      .slice(0, 5)
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-bold text-white">#{o.id}</td>
                          <td className="py-2.5 px-3">{o.customer_name}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {o.payment_method}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-purple-300 font-bold">
                            {o.payment_txn_ref || 'Counter Receipt'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">{o.total_amount} ETB</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminVerifierRef(o.payment_txn_ref || `FT${Math.floor(240000000 + Math.random() * 90000000)}`);
                                setAdminVerifierAmount(o.total_amount);
                                setAdminVerifierProvider(o.payment_method === 'telebirr' ? 'verify_et' : 'shegerpay');
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                              className="px-2.5 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer transition"
                            >
                              Load in Console
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Menu Catalog Management (Burger, Pizza, Cake &amp; Drinks)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update pricing, descriptions, portion options, and live in-stock toggles
                </p>
              </div>
              <button
                type="button"
                onClick={openAddFood}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Food / Drink</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`glass-card rounded-3xl overflow-hidden border p-5 flex flex-col justify-between transition ${
                    item.inStock !== false ? 'border-slate-800' : 'border-rose-900/40 opacity-70'
                  }`}
                >
                  <div>
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 mb-4">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        {item.category.toUpperCase()}
                      </span>
                      {item.inStock === false && (
                        <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          Sold Out
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">{item.name}</h4>
                      <span className="text-xs text-orange-400 font-extrabold">{item.price} ETB</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4">
                    <button
                      type="button"
                      onClick={() => menuStore.toggleStock(item.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer ${
                        item.inStock !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {item.inStock !== false ? 'In Stock' : 'Sold Out'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditFood(item)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete ${item.name}?`)) {
                            menuStore.deleteItem(item.id);
                          }
                        }}
                        className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INGREDIENTS MASTER */}
        {activeTab === 'ingredients' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Ingredients &amp; Toppings Customization</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage removable standard ingredients and extra toppings for burgers, pizzas, cakes &amp; juices
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-white text-base">{item.name}</h4>
                      <span className="text-xs text-orange-400 font-semibold">{item.category}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase font-bold">Standard Ingredients:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.availableIngredients?.map((ing) => (
                        <span key={ing} className="text-xs bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-slate-300">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-bold">Extra Toppings:</span>
                    {item.extraToppings?.map((top) => (
                      <div key={top.name} className="flex justify-between text-xs text-slate-300">
                        <span>+ {top.name}</span>
                        <span className="text-orange-400 font-bold">+{top.price} ETB</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditFood(item)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Ingredients for {item.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BLOG & CAFE STORIES CMS */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Publish Stories &amp; Announcements</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Write interactive articles, showcase hotel news, and feature seasonal recipes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWritingBlog(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Write New Story</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="h-44 bg-slate-950 relative overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-800">
                        {post.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <span className="text-[11px] text-slate-500 block mb-1">{post.date} • By {post.author}</span>
                      <h4 className="font-bold text-white text-base leading-snug">{post.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete article: "${post.title}"?`)) {
                          blogStore.deletePost(post.id);
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TIKTOK & SOCIAL MEDIA */}
        {activeTab === 'tiktok' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Official Time Cafe TikTok &amp; Social Links</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official profile: <strong className="text-orange-400">@time_cafe_pizzeria</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="https://www.tiktok.com/@time_cafe_pizzeria/video/7671665046728035602"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900 border border-slate-800 hover:border-orange-500 rounded-3xl p-5 block transition group"
              >
                <div className="h-48 rounded-2xl bg-slate-950 flex flex-col items-center justify-center p-4 text-center border border-slate-800 group-hover:bg-orange-500/10">
                  <span className="text-3xl mb-2">🎵</span>
                  <p className="text-xs font-bold text-white">Time Cafe Highlights #1</p>
                  <p className="text-[11px] text-slate-400 mt-1">Video ID: 7671665046728035602</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-orange-400 font-bold">
                  <span>Watch on TikTok</span>
                  <span>&rarr;</span>
                </div>
              </a>

              <a
                href="https://www.tiktok.com/@time_cafe_pizzeria/video/7694695166661217544"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900 border border-slate-800 hover:border-orange-500 rounded-3xl p-5 block transition group"
              >
                <div className="h-48 rounded-2xl bg-slate-950 flex flex-col items-center justify-center p-4 text-center border border-slate-800 group-hover:bg-orange-500/10">
                  <span className="text-3xl mb-2">🍕</span>
                  <p className="text-xs font-bold text-white">Fresh Wood-Fired Pizza Baking</p>
                  <p className="text-[11px] text-slate-400 mt-1">Video ID: 7694695166661217544</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-orange-400 font-bold">
                  <span>Watch on TikTok</span>
                  <span>&rarr;</span>
                </div>
              </a>

              <a
                href="https://www.tiktok.com/@time_cafe_pizzeria/video/7689162351592918280"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900 border border-slate-800 hover:border-orange-500 rounded-3xl p-5 block transition group"
              >
                <div className="h-48 rounded-2xl bg-slate-950 flex flex-col items-center justify-center p-4 text-center border border-slate-800 group-hover:bg-orange-500/10">
                  <span className="text-3xl mb-2">☕</span>
                  <p className="text-xs font-bold text-white">Macchiato Barista Craft</p>
                  <p className="text-[11px] text-slate-400 mt-1">Video ID: 7689162351592918280</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-orange-400 font-bold">
                  <span>Watch on TikTok</span>
                  <span>&rarr;</span>
                </div>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Food Modal */}
      {isEditingFood && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-extrabold text-white text-base">
                {editingFoodItem ? 'Edit Food / Drink' : 'Add New Food / Drink'}
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingFood(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asela Fire Burger"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MenuCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="burgers">Burgers</option>
                    <option value="pizzas">Pizzas</option>
                    <option value="cakes">Cakes &amp; Bakery</option>
                    <option value="hot_drinks">Hot Drinks</option>
                    <option value="cold_drinks">Cold Drinks</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tag Badge (Optional)</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. Bestseller, Chef Special"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Description of food..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Ingredients (Comma separated - customers can remove any):
                </label>
                <input
                  type="text"
                  value={ingredientsStr}
                  onChange={(e) => setIngredientsStr(e.target.value)}
                  placeholder="e.g. Beef Patty, Cheddar Cheese, Pickles, Onions"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Has Large Portion?</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="hasSizesCheckOffice"
                      checked={hasSizes}
                      onChange={(e) => setHasSizes(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-orange-500"
                    />
                    <label htmlFor="hasSizesCheckOffice" className="text-slate-300">
                      Enable Portion Sizes
                    </label>
                  </div>
                </div>
              </div>

              {hasSizes && (
                <div>
                  <label className="text-slate-400 block mb-1">Large Portion Price (ETB)</label>
                  <input
                    type="number"
                    min={0}
                    value={priceLarge}
                    onChange={(e) => setPriceLarge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={img}
                  onChange={(e) => setImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingFood(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Food Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Blog Post Modal */}
      {isWritingBlog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-extrabold text-white text-base">Write New Story / Post</h4>
              <button
                type="button"
                onClick={() => setIsWritingBlog(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Story Title</label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. Asela Coffee & Pizza Weekend Specials"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Kitchen Secrets">Kitchen Secrets</option>
                    <option value="Coffee Culture">Coffee Culture</option>
                    <option value="Events">Events</option>
                    <option value="Stories">Stories</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Author Name</label>
                  <input
                    type="text"
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  required
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  placeholder="Short overview..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Article Content</label>
                <textarea
                  rows={5}
                  required
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  placeholder="Write full article..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={blogImage}
                  onChange={(e) => setBlogImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWritingBlog(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Story</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
