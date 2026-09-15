import React from 'react';
import { 
  Plus, 
  Activity, 
  Flame
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const SpaceRail = ({ onOpenQR, onOpenTelemetry }) => {
  const { room, isConnected, initiateBurn } = useSocket();

  return (
    <nav 
      aria-label="Server rail"
      className="w-[72px] bg-discord-rail flex flex-col items-center py-3 select-none shrink-0 z-30 border-r border-white/5"
    >
      {/* Home / Sanctuary Brand Icon */}
      <div className="relative group mb-2 flex items-center justify-center w-full">
        {/* Active Pill indicator */}
        <div className="guild-pill h-10 -left-1 group-hover:h-5 transition-all" />

        <button 
          className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25 transition-all duration-200 group-hover:shadow-indigo-500/40 active:translate-y-0.5"
          title="Syncora Sanctuary"
        >
          <span className="tracking-wider text-xs font-black">SYN</span>
        </button>
      </div>

      {/* Guild Separator Line */}
      <div className="w-8 h-[2px] bg-white/10 rounded-full my-1.5" />

      {/* Active Space Guild Icon */}
      <div className="relative group mb-2 flex items-center justify-center w-full">
        <div className="guild-pill h-10 -left-1 group-hover:h-8 transition-all" />

        <button 
          className="w-12 h-12 rounded-[16px] bg-[#35373c] hover:bg-[#5865f2] text-white flex flex-col items-center justify-center font-bold text-xs shadow-md transition-all duration-200 border border-white/5"
          title={`${room?.name || 'Syncora Room'} (${room?.code || ''})`}
        >
          <span className="font-mono text-[13px] tracking-tight text-cyan-300 group-hover:text-white">
            {room?.code?.slice(4) || 'V2'}
          </span>
          <span className="text-[9px] uppercase tracking-tighter opacity-70">
            SPACE
          </span>
        </button>

        {/* Space notification badge */}
        <div className="absolute top-0 right-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1e1f22] rounded-full" />
      </div>

      {/* Add / Join New Space Button */}
      <div className="relative group mb-2 flex items-center justify-center w-full">
        <button 
          onClick={onOpenQR}
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#23a55a] text-[#23a55a] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm group-hover:shadow-emerald-500/30"
          title="Invite Partner or Join Space"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Explore / Templates Button */}
      <div className="relative group mb-2 flex items-center justify-center w-full">
        <button 
          onClick={onOpenTelemetry}
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#5865f2] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
          title="Network Telemetry & WebRTC Stats"
        >
          <Activity size={20} className={isConnected ? 'text-cyan-400' : 'text-slate-500'} />
        </button>
      </div>

      {/* Spacer to push controls to bottom */}
      <div className="flex-1" />

      {/* Bottom Burn Space Trigger */}
      <div className="relative group mb-3 flex items-center justify-center w-full">
        <button
          onClick={initiateBurn}
          className="w-11 h-11 rounded-[22px] hover:rounded-[14px] bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 flex items-center justify-center transition-all duration-200 shadow-lg shadow-red-500/10 active:scale-95"
          title="Burn Room (Self-destruct entire Space & shred data)"
        >
          <Flame size={18} className="animate-pulse" />
        </button>
      </div>

      {/* Relay Health Dot */}
      <div className="flex items-center justify-center py-1">
        <div 
          className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#23a55a] shadow-[0_0_8px_#23a55a]' : 'bg-[#f23f43]'}`} 
          title={isConnected ? 'Relay Engine: Connected & Encrypted' : 'Connecting to Relay...'}
        />
      </div>
    </nav>
  );
};
