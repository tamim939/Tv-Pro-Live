import React, { useEffect, useState, useMemo } from "react";
import { Search, Grid, List, Heart, Tv, Radio, Globe, Menu, X, Share2, Info, MessageCircle, ExternalLink, Play, FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Channel } from "./types";
import { M3U_URLS, ALLOWED_CHANNELS, CUSTOM_CHANNELS, BLACKLIST_CHANNELS, XTREAM_URL, NORMAL_URL, APP_LOGO, TELEGRAM_URL, AD_LINKS, FACEBOOK_URL } from "./config";
import { parseM3U, normalizeGroup, channelToSlug } from "./utils";
import Splash from "./components/Splash";
import Player from "./components/Player";
import VisitorCounter from "./components/VisitorCounter";
import XtreamOverlay from "./components/XtreamOverlay";

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("Sports");
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem("lz_fav") || "[]"));
  const [showMenu, setShowMenu] = useState(false);
  const [overlayConfig, setOverlayConfig] = useState<{ type: "xtream" | "normal"; url: string } | null>(null);
  const [clickedChannels, setClickedChannels] = useState<Set<string>>(new Set());

  // Load Data
  useEffect(() => {
    // Production protections
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    const loadData = async () => {
      try {
        const channelPromises = M3U_URLS.map(async (url) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return [];
            const text = await res.text();
            const parsed = parseM3U(text);
            
            // Filter allowed channels AND exclude blacklisted ones
            return parsed.filter(c => {
              const nameLower = c.name.toLowerCase();
              const isAllowed = ALLOWED_CHANNELS.some(allowed => nameLower.includes(allowed.toLowerCase()));
              const isBlacklisted = BLACKLIST_CHANNELS.some(black => nameLower === black.toLowerCase() || nameLower.includes(black.toLowerCase()));
              return isAllowed && !isBlacklisted;
            });
          } catch (e) { return []; }
        });

        const allChannelsRaw = await Promise.all(channelPromises);
        
        // Filter custom channels too
        const filteredCustom = CUSTOM_CHANNELS.filter(c => {
          const nameLower = c.name.toLowerCase();
          return !BLACKLIST_CHANNELS.some(black => nameLower === black.toLowerCase() || nameLower.includes(black.toLowerCase()));
        });

        let allChannels = [...filteredCustom, ...allChannelsRaw.flat()];

        // Unique channels by name to avoid duplicates like T Sports appearing twice
        const finalChannels: Channel[] = [];
        const seenNames = new Set();
        
        // Find T Sports and move it to the beginning of the list if it exists
        // We look for it from the M3U (bottom part of allChannels) first as requested
        let tSports: Channel | null = null;
        for (let i = allChannels.length - 1; i >= 0; i--) {
          if (allChannels[i].name.toLowerCase() === "t sports") {
            tSports = allChannels.splice(i, 1)[0];
            break;
          }
        }
        
        if (tSports) {
          finalChannels.push(tSports);
          seenNames.add("t sports");
        }

        allChannels.forEach(c => {
          const lower = c.name.toLowerCase();
          if (!seenNames.has(lower)) {
            finalChannels.push(c);
            seenNames.add(lower);
          }
        });

        setChannels(finalChannels);

        // Set initial channel
        if (finalChannels.length > 0) {
          const hash = decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
          const found = finalChannels.find(c => channelToSlug(c.name) === hash);
          const initialChannel = found || finalChannels[0];
          
          // Pre-mark as clicked so auto-play works without ad on load
          const newClicked = new Set([initialChannel.name]);
          setClickedChannels(newClicked);
          setCurrentChannel(initialChannel);
        }

      } catch (e) {
        console.error("Data load failed", e);
      } finally {
        setLoading(false);
        setTimeout(() => setShowSplash(false), 2000);
      }
    };

    loadData();

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const categories = useMemo(() => {
    return ["Sports"];
  }, []);

  const filteredChannels = useMemo(() => {
    let source = channels;
    
    if (activeCategory === "Favorites") {
      source = channels.filter(c => favorites.includes(c.name));
    }

    if (!searchQuery) return source;
    
    return source.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, activeCategory, searchQuery, favorites]);

  const toggleFavorite = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavs = favorites.includes(name) 
      ? favorites.filter(f => f !== name) 
      : [...favorites, name];
    setFavorites(newFavs);
    localStorage.setItem("lz_fav", JSON.stringify(newFavs));
  };

  const handleChannelSelect = (ch: Channel, bypassAd = false) => {
    if (!bypassAd && !clickedChannels.has(ch.name)) {
      const randomAd = AD_LINKS[Math.floor(Math.random() * AD_LINKS.length)];
      window.open(randomAd, "_blank");
      
      const newClicked = new Set(clickedChannels);
      newClicked.add(ch.name);
      setClickedChannels(newClicked);
      return;
    }

    setCurrentChannel(ch);
    window.location.hash = channelToSlug(ch.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-gray-100 font-sans selection:bg-green-500/30 selection:text-green-300">
      <AnimatePresence>
        {showSplash && <Splash />}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-[100] bg-[#080c14]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Tv className="w-5 h-5 text-white fill-current" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-widest uppercase">
              Tv<span className="text-green-500"> Pro Live</span>
            </h1>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-400 transition-colors" />
              <input
                type="text"
                placeholder="Search live channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-green-500/50 focus:ring-4 focus:ring-green-500/5 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <VisitorCounter />
            <button 
              onClick={() => setShowMenu(true)}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-8">
        {/* Player Section */}
        <div className="flex flex-col gap-4">
          <Player 
            channel={currentChannel} 
            onPrev={() => {
              const idx = channels.indexOf(currentChannel!);
              if (idx > 0) handleChannelSelect(channels[idx - 1], true);
            }}
            onNext={() => {
              const idx = channels.indexOf(currentChannel!);
              if (idx < channels.length - 1) handleChannelSelect(channels[idx + 1], true);
            }}
          />
          
          {/* Now Playing Bar */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-600/20 to-transparent border-l-4 border-green-500 rounded-r-2xl">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex gap-0.5 items-end h-3">
                {[0.4, 0.8, 0.5, 0.9].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["30%", "100%", "50%", "80%", "30%"] }}
                    transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: "linear" }}
                    className="w-0.5 bg-green-500 rounded-full"
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest whitespace-nowrap">Now Playing</span>
              <span className="text-sm font-bold text-white truncate">{currentChannel?.name || "Select a channel"}</span>
            </div>
            {currentChannel?.logo && (
              <img src={currentChannel.logo} className="h-6 w-auto object-contain opacity-60" alt="" />
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-6">
          {/* Category Bar */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2">
                {["Sports", "Favorites"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeCategory === cat 
                      ? "bg-green-500 text-[#080c14] shadow-lg shadow-green-500/20" 
                      : "bg-white/5 text-gray-400 border border-white/5 hover:border-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/5 text-gray-500 border border-white/5"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/5 text-gray-500 border border-white/5"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {categories.length > 0 && activeCategory !== "Live" && activeCategory !== "Explore" && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeCategory === cat 
                      ? "bg-white/20 text-white" 
                      : "bg-white/5 text-gray-500 border border-white/5 hover:border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Mobile */}
          <div className="md:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm"
              />
            </div>
          </div>

          {/* Grid */}
          <div className={viewMode === "grid" 
            ? "grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4" 
            : "flex flex-col gap-2"
          }>
            {filteredChannels.map((ch, idx) => (
              <motion.div
                layout
                key={`${ch.name}-${idx}`}
                onClick={() => handleChannelSelect(ch)}
                className={`group cursor-pointer relative ${
                  viewMode === "grid" 
                  ? "flex flex-col bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all active:scale-95" 
                  : "flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-3 hover:bg-white/10 transition-all active:scale-98"
                } ${currentChannel?.name === ch.name ? "ring-2 ring-green-500/50 bg-green-500/5 border-green-500/20" : ""}`}
              >
                <div className={viewMode === "grid" ? "aspect-video relative bg-black/40" : "w-16 h-12 relative bg-black/40 rounded-xl overflow-hidden flex-shrink-0"}>
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    {ch.logo ? (
                      <img src={ch.logo} className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500" alt="" />
                    ) : (
                      <Tv className="w-6 h-6 text-white/10" />
                    )}
                  </div>
                  
                  {/* Overlay Badges */}
                  {viewMode === "grid" && (
                    <>
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black uppercase tracking-wider text-white/60">
                        {normalizeGroup(ch.group)}
                      </div>
                      <button 
                        onClick={(e) => toggleFavorite(ch.name, e)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${favorites.includes(ch.name) ? "bg-green-500 text-[#080c14]" : "bg-black/40 text-white/40 hover:text-white"}`}
                      >
                        <Heart className={`w-3 h-3 ${favorites.includes(ch.name) ? "fill-current" : ""}`} />
                      </button>
                    </>
                  )}
                </div>

                <div className={viewMode === "grid" ? "p-3 flex flex-col gap-1" : "flex-1 overflow-hidden"}>
                  <h4 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-green-400 transition-colors uppercase tracking-tight">
                    {ch.name}
                  </h4>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest truncate">
                    {normalizeGroup(ch.group)} • LIVE
                  </p>
                </div>

                {currentChannel?.name === ch.name && viewMode === "grid" && (
                  <div className="absolute inset-0 bg-green-500/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/40">
                      <Play className="w-5 h-5 text-[#080c14] fill-current translate-x-0.5" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {filteredChannels.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-4 opacity-40">
                <Search className="w-12 h-12" />
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-black uppercase tracking-widest">No channels found</h3>
                  <p className="text-sm font-medium">Try a different search or category</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Telegram Promo */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <a 
          href={TELEGRAM_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex items-center justify-between p-6 bg-gradient-to-br from-[#0088cc]/20 to-transparent border border-[#0088cc]/20 rounded-3xl overflow-hidden transition-all hover:bg-[#0088cc]/25"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0088cc] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0088cc]/20">
              <MessageCircle className="w-6 h-6 text-white fill-current" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Join Our Community</h3>
              <p className="text-sm font-medium text-gray-400">Get updates, new channels & requests on Telegram</p>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </a>
      </div>

      <footer className="border-t border-white/5 py-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-3 grayscale opacity-30">
            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
              <Tv className="w-4 h-4 text-black fill-current" />
            </div>
            <h2 className="text-lg font-black tracking-widest uppercase text-gray-500">Tv Pro Live</h2>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold">Developed by</span>
            <span className="text-white text-2xl font-black tracking-[0.1em] uppercase">Tamim Hasan</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <a 
              href={FACEBOOK_URL} 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Follow on</span>
                <span className="text-xs font-black text-gray-200 uppercase tracking-wider">Facebook</span>
              </div>
            </a>
            <a 
              href={TELEGRAM_URL} 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center group-hover:bg-blue-400/20 transition-colors">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Join our</span>
                <span className="text-xs font-black text-gray-200 uppercase tracking-wider">Telegram</span>
              </div>
            </a>
          </div>

          <p className="text-[10px] leading-relaxed text-gray-600 max-w-sm uppercase tracking-wider font-bold">
            All stream links are collected from publicly available sources. We do not host any content. 
            For personal & educational use only.
          </p>
        </div>
      </footer>

      {/* Menu Drawer */}
      <AnimatePresence>
        {overlayConfig && (
          <XtreamOverlay 
            type={overlayConfig.type} 
            url={overlayConfig.url} 
            onClose={() => setOverlayConfig(null)} 
          />
        )}
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 z-[201] bg-[#0d121c] border-l border-white/5 shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h2 className="text-lg font-black tracking-widest uppercase">MENU</h2>
                <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {[
                  { icon: FileText, label: "Xtream Codes", onClick: () => { setOverlayConfig({ type: "xtream", url: XTREAM_URL }); setShowMenu(false); } },
                  { icon: Download, label: "M3U Playlists", onClick: () => { setOverlayConfig({ type: "normal", url: NORMAL_URL }); setShowMenu(false); } },
                  { icon: MessageCircle, label: "Telegram Support", href: TELEGRAM_URL },
                  { icon: Share2, label: "Share App", onClick: () => { if (navigator.share) navigator.share({ title: "Tv Pro Live", url: window.location.origin }); } },
                  { icon: Info, label: "About", href: "#" }
                ].map((item, i) => (
                  item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group cursor-pointer w-full text-left"
                    >
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-green-500/10 group-hover:text-green-400 transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">{item.label}</span>
                    </a>
                  ) : (
                    <button
                      key={i}
                      onClick={item.onClick}
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group cursor-pointer w-full text-left"
                    >
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-green-500/10 group-hover:text-green-400 transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">{item.label}</span>
                    </button>
                  )
                ))}
              </div>

              <div className="p-6 border-t border-white/5">
                <p className="text-[10px] font-bold text-gray-600 text-center uppercase tracking-widest">
                  Tv Pro Live v1.0.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
