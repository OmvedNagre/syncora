import React from 'react';
import { Phone, PhoneOff, UserCheck } from 'lucide-react';
import { useWebRTC } from '../../context/WebRTCContext';

export const CallRequestModal = () => {
  const { callStatus, incomingCallData, acceptCall, declineCall } = useWebRTC();

  if (callStatus !== 'incoming' || !incomingCallData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-soft-pulse">
      <div className="max-w-sm w-full glass-panel border border-cyan-500/50 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
            <Phone size={36} className="animate-bounce" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">
            Incoming Voice Call
          </div>
          <h3 className="text-xl font-bold text-white">
            {incomingCallData.callerName || 'Partner'}
          </h3>
          <p className="text-xs text-slate-400">
            Requesting encrypted peer-to-peer audio connection
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 pt-2">
          {/* Decline */}
          <button
            onClick={declineCall}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 font-semibold text-xs transition-all active:scale-95"
          >
            <PhoneOff size={16} />
            <span>Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={acceptCall}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
          >
            <Phone size={16} />
            <span>Accept Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
