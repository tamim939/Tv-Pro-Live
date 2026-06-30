import React, { useEffect, useState } from "react";
import { X, Search, Copy, Check, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface OverlayProps {
  type: "xtream" | "normal";
  url: string;
  onClose: () => void;
}

export default function XtreamOverlay({ type, url, onClose }: OverlayProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      const text = await res.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      
      if (type === "xtream") {
        const codes: any[] = [];
        let current: any = null;
        lines.forEach(line => {
          if (line.startsWith('http')) {
            try {
              const u = new URL(line);
              current = { url: line, host: u.host, server: u.origin, username: u.searchParams.get('username'), password: u.searchParams.get('password'), extras: {} };
              codes.push(current);
            } catch (e) {}
          } else if (current && line.includes(':')) {
            const [k, v] = line.split(':').map(s => s.trim());
            current.extras[k] = v;
          }
        });
        setData(codes);
      } else {
        const entries: any[] = [];
        lines.forEach(line => {
          const urlMatch = line.match(/https?:\/\/[^\s,]+/i);
          if (urlMatch) {
            const url = urlMatch[0];
            const title = line.split(url)[0].replace(/[-:,]+$/,'').trim() || 'Untitled';
            entries.push({ title, url });
          }
        });
        setData(entries);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  const filteredData = data.filter(item => 
    JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-[#080c14] flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-black tracking-widest uppercase">
            {type === "xtream" ? "Xtream Codes" : "M3U Playlists"}
          </h2>
        </div>
        <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-50">
            <div className="w-10 h-10 border-2 border-white/10 border-t-green-500 rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading Data...</span>
          </div>
        ) : filteredData.length > 0 ? (
          filteredData.map((item, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate">
                    {type === "xtream" ? (item.username || item.host) : item.title}
                  </h3>
                  {type === "xtream" && (
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">
                      {item.host}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => handleCopy(item.url, `${i}`)}
                  className={`p-2 rounded-lg transition-all ${copiedId === `${i}` ? "bg-green-500 text-[#080c14]" : "bg-white/5 text-gray-400 hover:text-white"}`}
                >
                  {copiedId === `${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono text-gray-400 break-all leading-relaxed">
                {item.url}
              </div>
              {type === "xtream" && Object.entries(item.extras).length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.entries(item.extras).map(([k, v]: [any, any]) => (
                    <div key={k} className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{k}</p>
                      <p className="text-[10px] font-bold text-gray-300 truncate">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-30 py-20">
            <Search className="w-12 h-12" />
            <span className="text-sm font-bold uppercase tracking-widest">No results found</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
