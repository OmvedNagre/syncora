import React from 'react';
import { Flame, AlertTriangle, XCircle, ShieldAlert, RefreshCw } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const BurnCountdown = () => {
  const { burnState, cancelBurn } = useSocket();

  if (!burnState.isCountingDown && !burnState.isBurned) {
    return null;
  }

  // Room Burned state (Final destruction screen)
  if (burnState.isBurned) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
        <div className="max-w-md w-full glass-panel border-red-500/40 p-8 rounded-3xl text-center space-y-6 shadow-2xl shadow-red-500/20">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Flame size={48} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Room Permanently Shredded
            </h2>
            <p className="text-sm text-slate-400">
              The cryptographic master keys were zeroed from memory. All messages, ephemeral files, shared code, and tasks have been wiped with zero traces.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-xs font-mono text-red-300/80 space-y-1 text-left">
            <div>✓ Memory RAM shredded via crypto.getRandomValues</div>
            <div>✓ WebRTC P2P streams terminated</div>
            <div>✓ Ephemeral files removed from disk</div>
            <div>✓ Room code revoked</div>
          </div>

          <button
            onClick={() => window.location.href = window.location.origin}
            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold transition-all shadow-lg shadow-red-500/30 active:scale-95"
          >
            <RefreshCw size={18} />
            <span>Create New Clean Room</span>
          </button>
        </div>
      </div>
    );
  }

  // Active 10-Second Countdown Overlay
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 burn-active-alarm">
      <div className="max-w-lg w-full glass-panel border-red-500/60 p-8 rounded-3xl text-center space-y-6 shadow-2xl shadow-red-500/40 border-2">
        <div className="flex items-center justify-center space-x-2 text-red-400 font-mono tracking-widest text-xs uppercase font-bold">
          <ShieldAlert size={18} className="animate-bounce" />
          <span>Emergency Self-Destruct Sequence</span>
        </div>

        {/* Large Countdown Ring */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping" />
          <div className="w-32 h-32 rounded-full bg-red-950/80 border-4 border-red-500 flex flex-col items-center justify-center shadow-xl shadow-red-500/50">
            <span className="text-5xl font-black font-mono text-white">
              {burnState.secondsRemaining}
            </span>
            <span className="text-[10px] uppercase font-bold text-red-300">Seconds</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-red-200">
            Initiated by {burnState.initiatedBy || 'Partner'}
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            All chat history, uploaded attachments, collaborative code, and encryption session keys will be permanently destroyed.
          </p>
        </div>

        {/* Abort Button */}
        <div className="pt-2">
          <button
            onClick={cancelBurn}
            className="flex items-center justify-center space-x-2 mx-auto py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/20 text-sm font-semibold transition-all shadow-lg active:scale-95"
          >
            <XCircle size={18} className="text-red-400" />
            <span>Abort Self-Destruct (Cancel)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
