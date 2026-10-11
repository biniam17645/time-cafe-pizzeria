import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Pizza,
  Sparkles,
  Search,
  Coffee,
  X,
  Share2,
  Heart,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { BlogPost, MenuItem } from '../types';
import { blogStore } from '../store/blogStore';
import { menuStore } from '../store/menuStore';
import { TimeCafeLogo } from './TimeCafeLogo';

interface CafeBlogSectionProps {
  onOrderNow: () => void;
  onCustomizeItem?: (item: MenuItem) => void;
}

const TIKTOK_VIDEOS = [
  {
    id: '7671665046728035602',
    title: 'Time Cafe & Pizzeria Vibe in Asela',
    url: 'https://www.tiktok.com/@time_cafe_pizzeria/video/7671665046728035602',
    desc: 'Artisanal kitchen atmosphere and fresh table service',
    tag: '#Asela #TimeCafe',
  },
  {
    id: '7694695166661217544',
    title: 'Wood-Fired Pizza Sizzling Hot',
    url: 'https://www.tiktok.com/@time_cafe_pizzeria/video/7694695166661217544',
    desc: 'Watch our dough puff up in the 450°C oven with melted mozzarella',
    tag: '#PizzaLover #BurgerPizzaCake',
  },
  {
    id: '7689162351592918280',
    title: 'Double Shot Macchiato Barista Art',
    url: 'https://www.tiktok.com/@time_cafe_pizzeria/video/7689162351592918280',
    desc: 'Steamed milk layering and single-origin highland espresso',
    tag: '#EthiopianCoffee #Macchiato',
  },
];

export const CafeBlogSection: React.FC<CafeBlogSectionProps> = ({
  onOrderNow,
  onCustomizeItem,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  // Interactive Likes Store (stored in localStorage)
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('time_cafe_blog_likes');
      return saved ? JSON.parse(saved) : { '1': 48, '2': 62, '3': 37, '4': 54 };
    } catch {
      return { '1': 48, '2': 62, '3': 37, '4': 54 };
    }
  });

  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    setPosts(blogStore.getPosts());
    setMenuItems(menuStore.getItems());

    const unsubBlog = blogStore.subscribe(() => setPosts(blogStore.getPosts()));
    const unsubMenu = menuStore.subscribe(() => setMenuItems(menuStore.getItems()));

    return () => {
      unsubBlog();
      unsubMenu();
    };
  }, []);

  const handleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (hasLiked[postId]) return;

    setLikes((prev) => {
      const next = { ...prev, [postId]: (prev[postId] || 0) + 1 };
      try {
        localStorage.setItem('time_cafe_blog_likes', JSON.stringify(next));
      } catch {}
      return next;
    });

    setHasLiked((prev) => ({ ...prev, [postId]: true }));
  };

  const handleCopyShare = (postTitle: string) => {
    navigator.clipboard.writeText(`${window.location.origin} - Time Cafe Asela Story: ${postTitle}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const categories = ['all', 'Kitchen Secrets', 'Coffee Culture', 'Events', 'Stories'];

  const filteredPosts = posts.filter((post) => {
    const matchesCat =
      selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getFeaturedItem = (itemId?: number) => {
    if (!itemId) return null;
    return menuItems.find((i) => i.id === itemId) || null;
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Blog Section Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-3">
          <TimeCafeLogo size={46} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-3">
          <BookOpen className="w-3.5 h-3.5 text-orange-500" />
          <span>Life at Time Cafe • Stories, Culture &amp; Heritage</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Highland Flavors &amp; Cafe Stories
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Explore our wood-fired pizza techniques, Ethiopian coffee culture, fresh Asela fruit recipes, and vibrant community happenings.
        </p>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1 bg-slate-900 rounded-2xl border border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition capitalize cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Articles' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => {
          const featuredFood = getFeaturedItem(post.featuredItemId);
          const likeCount = likes[post.id] || 0;
          const userLiked = hasLiked[post.id];

          return (
            <article
              key={post.id}
              onClick={() => setActivePost(post)}
              className="glass-card rounded-3xl overflow-hidden border border-slate-800/80 flex flex-col justify-between group cursor-pointer hover:border-orange-500/50 transition duration-300"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-orange-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl border border-slate-800">
                    {post.category}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-black/60 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> {post.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {post.date}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-lg leading-snug group-hover:text-orange-400 transition">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Bottom Interactive Action Row */}
              <div className="p-5 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between text-xs">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={(e) => handleLike(post.id, e)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    userLiked
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Like this story"
                >
                  <Heart className={`w-3.5 h-3.5 ${userLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{likeCount}</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Interactive Order Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (featuredFood && onCustomizeItem) {
                        onCustomizeItem(featuredFood);
                      } else {
                        onOrderNow();
                      }
                    }}
                    className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    <Pizza className="w-3.5 h-3.5" />
                    <span>Order Dish</span>
                  </button>

                  <span className="text-orange-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Official TikTok Videos Showcase */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black border border-slate-700 flex items-center justify-center text-2xl shrink-0">
              🎵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">Official Time Cafe TikTok Highlights</h3>
                <span className="bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  @time_cafe_pizzeria
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Watch our kitchen behind-the-scenes, pizza tosses, and barista pours in Asela
              </p>
            </div>
          </div>

          <a
            href="https://www.tiktok.com/@time_cafe_pizzeria"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Follow on TikTok</span>
            <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIKTOK_VIDEOS.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-950 rounded-2xl border border-slate-800 hover:border-pink-500/50 p-5 flex flex-col justify-between group transition duration-300"
            >
              <div>
                <div className="h-40 bg-gradient-to-br from-slate-900 to-black rounded-xl border border-slate-800/80 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden group-hover:scale-[1.02] transition">
                  <span className="text-3xl mb-2">▶️</span>
                  <span className="text-xs font-bold text-white leading-snug">{video.title}</span>
                  <span className="text-[10px] text-pink-400 mt-1 font-semibold">{video.tag}</span>
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{video.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-850 mt-3 flex items-center justify-between text-xs font-bold text-pink-400">
                <span>Watch Video on TikTok</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Full Article Reader Modal with Interactive Order & Share */}
      {activePost && (
        <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="relative h-56 sm:h-64 shrink-0 bg-slate-950">
              <img
                src={activePost.image}
                alt={activePost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

              <button
                onClick={() => setActivePost(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 flex items-center justify-center transition cursor-pointer shadow-lg border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="bg-orange-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full mb-2 inline-block">
                  {activePost.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {activePost.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 font-medium">
                  <span>By {activePost.author}</span>
                  <span>•</span>
                  <span>{activePost.date}</span>
                  <span>•</span>
                  <span>{activePost.readTime}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
              <p className="text-base text-slate-200 font-medium italic border-l-2 border-orange-500 pl-4 py-1">
                "{activePost.excerpt}"
              </p>
              {activePost.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}

              {/* Interactive Action Bar inside Reader */}
              <div className="mt-8 p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Like in modal */}
                  <button
                    type="button"
                    onClick={() => handleLike(activePost.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      hasLiked[activePost.id]
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked[activePost.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{likes[activePost.id] || 0} Likes</span>
                  </button>

                  {/* Share button */}
                  <button
                    type="button"
                    onClick={() => handleCopyShare(activePost.title)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied Link' : 'Share Story'}</span>
                  </button>
                </div>

                {/* Direct Order Button */}
                <button
                  type="button"
                  onClick={() => {
                    const featured = getFeaturedItem(activePost.featuredItemId);
                    setActivePost(null);
                    if (featured && onCustomizeItem) {
                      onCustomizeItem(featured);
                    } else {
                      onOrderNow();
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Pizza className="w-4 h-4" />
                  <span>Order Now from Time Cafe</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
