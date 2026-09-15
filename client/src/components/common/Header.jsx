import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Flame, 
  Phone, 
  PhoneCall, 
  Activity, 
  QrCode, 
  Copy, 
  Check, 
  Laptop, 
  Sparkles,
  Users
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../context/WebRTCContext';

export const Header = ({ currentMode, setMode, onOpenQR, onOpenTelemetry, onScheduleCall }) => {
  const { room, currentUser, partner, initiateBurn } = useSocket();
  const { callStatus, requestCall, endCall } = useWebRTC();
  const [copied, setCopied] = useState(false);

  const copyRoomLink = () => {
    const url = window.location.origin + '?room=' + room.code;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="glass-panel sticky top-0 z-40 px-5 py-3 border-b border-white/10 flex items-center justify-between shadow-2xl backdrop-blur-xl">
      {/* Brand & Room Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-[2px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 text-base tracking-wider">
              DS
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                DuoSpace
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Real-Time Pair Sanctuary
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Room:</span>
              <span className="font-mono font-bold text-cyan-300 tracking-wider bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/30">
                {room?.code}
              </span>
              <button 
                onClick={copyRoomLink}
                className="hover:text-cyan-400 transition-colors p-1 rounded hover:bg-white/5"
                title="Copy Room Link"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <button 
                onClick={onOpenQR}
                className="hover:text-pink-400 transition-colors p-1 rounded hover:bg-white/5"
                title="Show QR Code"
              >
                <QrCode size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Mode Switcher (Lounge vs Dev) */}
      <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10 shadow-inner">
        <button
          onClick={() => setMode('lounge')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentMode === 'lounge'
              ? 'bg-gradient-to-r from-pink-500/20 to-indigo-500/20 text-pink-300 border border-pink-500/30 shadow-md shadow-pink-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} className={currentMode === 'lounge' ? 'text-pink-400' : ''} />
          <span>Lounge Mode</span>
        </button>

        <button
          onClick={() => setMode('dev')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentMode === 'dev'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Laptop size={14} className={currentMode === 'dev' ? 'text-cyan-400' : ''} />
          <span>Pair-Dev Sandbox</span>
        </button>
      </div>

      {/* Right Controls: Partner presence, Voice Call, Telemetry, Burn */}
      <div className="flex items-center space-x-3">
        {/* Partner status badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
          <div className="relative">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: partner ? (partner.color || '#ec4899') : '#64748b' }}
            />
            {partner && (
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: partner.color || '#ec4899' }}
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-200 truncate max-w-[100px]">
              {partner ? partner.name : 'Waiting for Partner...'}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center space-x-1">
              {partner ? (
                <span className="text-emerald-400 font-mono">● Online & Synced</span>
              ) : (
                <span>Share link to pair</span>
              )}
            </span>
          </div>
        </div>

        {/* Telemetry trigger */}
        <button
          onClick={onOpenTelemetry}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-mono text-cyan-400 transition-colors shadow-sm"
          title="Open WebRTC & Network Telemetry HUD"
        >
          <Activity size={13} className="text-cyan-400 animate-pulse" />
          <span className="hidden lg:inline text-[11px]">Telemetry</span>
        </button>

        {/* Voice Call Button */}
        {callStatus === 'idle' ? (
          <button
            onClick={requestCall}
            disabled={!partner}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-lg transition-all ${
              partner
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Phone size={13} />
            <span>Voice Call</span>
          </button>
        ) : callStatus === 'calling' ? (
          <button
            onClick={endCall}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse"
          >
            <PhoneCall size={13} />
            <span>Calling...</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>In Call</span>
          </div>
        )}

        {/* 🔥 Burn Room Button */}
        <button
          onClick={initiateBurn}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 shadow-lg shadow-red-500/10 transition-all active:scale-95"
          title="Permanently self-destruct this room, chat, files, and crypto keys"
        >
          <Flame size={14} className="text-red-400 animate-bounce" />
          <span className="hidden sm:inline">Burn Room</span>
        </button>
      </div>
    </header>
  );
};
