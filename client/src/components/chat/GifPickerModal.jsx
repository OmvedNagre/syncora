import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'love', label: '💖 Love & Duo' },
  { id: 'coding', label: '👨‍💻 Pair-Coding' },
  { id: 'happy', label: '🎉 Celebrate' },
  { id: 'reaction', label: '😂 Reactions' },
  { id: 'lofi', label: '☕ Chill / Lofi' }
];

export const GifPickerModal = ({ isOpen, onClose, onSelectGif }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchGifs = async () => {
      setLoading(true);
      try {
        const url = `/api/gifs?q=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setGifs(data.gifs || []);
        }
      } catch (err) {
        console.error('Failed to load gifs:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchGifs, 180);
    return () => clearTimeout(timeout);
  }, [isOpen, query, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="max-w-md w-full glass-panel border border-pink-500/30 rounded-3xl p-5 shadow-2xl shadow-pink-500/10 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-sm">
            <Sparkles size={18} />
            <span>Select Animated GIF</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search GIFs (e.g. hug, code, laugh, cheer)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-xs"
            autoFocus
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setQuery('');
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-pink-500/30 text-pink-300 border border-pink-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Finding best GIFs...
            </div>
          ) : gifs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching GIFs found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {gifs.map((gif) => (
                <div
                  key={gif.id}
                  onClick={() => {
                    onSelectGif(gif.url);
                    onClose();
                  }}
                  className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/60 transition-all cursor-pointer bg-slate-950 aspect-video shadow-md hover:scale-[1.02]"
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover group-hover:opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white font-medium truncate">
                      {gif.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
