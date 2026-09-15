import React, { useState, useRef } from 'react';
import { 
  Tv, 
  Send, 
  MessageSquare
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { ChatContainer } from '../chat/ChatContainer';

const PRESETS = [
  { label: '☕ Lofi Chill', id: '5qap5aO4i9A' },
  { label: '🌌 Synthwave Live', id: '4xDzrJKXOOY' },
  { label: '🌧️ Cozy Rainy Cafe', id: 'DWcJFNfaw90' },
  { label: '🚀 Earth from Space', id: '21X5lGlDOfg' }
];

export const WatchTogether = () => {
  const { mediaState, updateMedia, allMembers } = useSocket();
  const [urlInput, setUrlInput] = useState('');
  const [reactions, setReactions] = useState([]);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const containerRef = useRef(null);

  // Extract YouTube ID from URL or return raw ID
  const extractVideoId = (input) => {
    if (!input) return '5qap5aO4i9A';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : input.trim();
  };

  const handleLoadVideo = (e) => {
    e?.preventDefault();
    const id = extractVideoId(urlInput);
    if (id) {
      updateMedia({
        videoId: id,
        isPlaying: true,
        currentTime: 0
      });
      setUrlInput('');
    }
  };

  const handleSelectPreset = (id) => {
    updateMedia({
      videoId: id,
      isPlaying: true,
      currentTime: 0
    });
  };

  const triggerFloatingReaction = (emoji) => {
    const id = Date.now() + Math.random();
    const newReaction = {
      id,
      emoji,
      left: Math.floor(Math.random() * 70) + 15
    };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2500);
  };

  return (
    <div className="relative flex h-full bg-[#111214] select-none overflow-hidden">
      {/* Main Spacious Cinema Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Cinema Stage Header */}
        <div className="h-12 px-6 border-b border-white/5 flex items-center justify-between bg-discord-main shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <Tv size={16} />
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-discord-header">
                Synchronized Theater
              </span>
              <span className="block text-[10px] text-discord-muted font-mono">
                Real-time synchronized video stream • {allMembers.length} Watching
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Floating Reactions Bar */}
            <div className="hidden sm:flex items-center space-x-1 bg-[#1e1f22] px-2.5 py-1 rounded-full border border-white/10 shadow-inner">
              {['❤️', '🔥', '🍿', '✨', '👏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => triggerFloatingReaction(emoji)}
                  className="text-xs hover:scale-125 transition-transform p-0.5"
                  title={`Send floating ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Toggle Slide-out Chat Drawer */}
            <button
              onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isChatDrawerOpen 
                  ? 'bg-[#5865F2] text-white shadow-md shadow-indigo-500/20' 
                  : 'bg-[#2b2d31] hover:bg-[#35373c] text-discord-normal'
              }`}
              title="Toggle Live Chat Drawer"
            >
              <MessageSquare size={14} />
              <span className="hidden md:inline">Theater Chat</span>
            </button>
          </div>
        </div>

        {/* Video Player Display Container */}
        <div 
          ref={containerRef}
          className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-0"
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${mediaState.videoId || '5qap5aO4i9A'}?autoplay=1&enablejsapi=1`}
            title="DuoSpace Synced Player"
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          {/* Floating Live Reactions Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {reactions.map((r) => (
              <div
                key={r.id}
                className="absolute text-4xl animate-float-up pointer-events-none"
                style={{
                  left: `${r.left}%`,
                  bottom: '12%'
                }}
              >
                {r.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Media Controls & URL Input Bar */}
        <div className="p-4 border-t border-white/5 bg-discord-sidebar shrink-0 space-y-3">
          {/* Quick presets */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-discord-muted font-bold uppercase tracking-wider whitespace-nowrap">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                  mediaState.videoId === p.id
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm'
                    : 'bg-[#1e1f22] text-discord-normal border-white/5 hover:border-white/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom YouTube URL Form */}
          <form onSubmit={handleLoadVideo} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Paste YouTube Video URL or Video ID to watch together..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 glass-input px-3.5 py-2 rounded-xl text-xs"
            />
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold text-xs shadow-md shadow-red-500/20 disabled:opacity-40 transition-all active:scale-95 shrink-0"
            >
              <Send size={13} />
              <span>Sync Stream</span>
            </button>
          </form>
        </div>
      </div>

      {/* Slide-out Live Chat Drawer */}
      {isChatDrawerOpen && (
        <div className="w-80 border-l border-white/10 flex flex-col h-full bg-discord-main shadow-2xl shrink-0 animate-in slide-in-from-right duration-200">
          <ChatContainer channelId="general" />
        </div>
      )}

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          100% { transform: translateY(-240px) scale(1.4); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
