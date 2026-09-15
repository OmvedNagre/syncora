import React from 'react';
import { X, Activity, Radio, ShieldCheck, Cpu, Wifi } from 'lucide-react';
import { useWebRTC } from '../../context/WebRTCContext';
import { useSocket } from '../../context/SocketContext';

export const TelemetryModal = ({ isOpen, onClose }) => {
  const { telemetry, localAudioLevel, remoteAudioLevel } = useWebRTC();
  const { room } = useSocket();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="max-w-xl w-full glass-panel border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                WebRTC & Network Telemetry HUD
              </h3>
              <p className="text-xs font-mono text-cyan-400/80">
                Live distributed diagnostics & cryptographic state
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Real-time stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* RTT Ping */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>RTT Ping</span>
              <Wifi size={14} className="text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-cyan-300">
              {telemetry.rtt} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">● Low Latency</div>
          </div>

          {/* Audio Bitrate */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Opus Bitrate</span>
              <Radio size={14} className="text-pink-400" />
            </div>
            <div className="text-2xl font-black font-mono text-pink-300">
              {telemetry.audioBitrate} <span className="text-xs font-normal text-slate-400">kbps</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Adaptive Codec</div>
          </div>

          {/* Packet Loss */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Packet Loss</span>
              <Activity size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-300">
              {telemetry.packetLoss}<span className="text-xs font-normal text-slate-400">%</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">Jitter Buffered</div>
          </div>

          {/* ICE State */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>ICE Status</span>
              <Cpu size={14} className="text-amber-400" />
            </div>
            <div className="text-sm font-bold font-mono text-amber-300 capitalize truncate">
              {telemetry.iceState}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">{telemetry.candidateType}</div>
          </div>
        </div>

        {/* Audio Spectrum Bars */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            DSP Audio Waveforms (Noise Suppression & AGC Active)
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span>Local Mic In:</span>
                <span>{localAudioLevel}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-75 rounded-full"
                  style={{ width: `${localAudioLevel}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span>Remote Stream In:</span>
                <span>{remoteAudioLevel}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-400 transition-all duration-75 rounded-full"
                  style={{ width: `${remoteAudioLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time P2P Architecture breakdown */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
            <Radio size={16} />
            <span>Low-Latency Real-Time Infrastructure</span>
          </div>
          <ul className="text-slate-400 space-y-1 font-mono text-[11px]">
            <li>• Transport: <span className="text-slate-200">WebRTC Data & Audio Channels + Socket.IO</span></li>
            <li>• Audio Engine: <span className="text-slate-200">Opus Fullband with Active Echo Cancellation & Noise Suppression</span></li>
            <li>• Room Limit: <span className="text-slate-200">Strictly 2 Connected Peers (Duo Pair-Programming & Lounge)</span></li>
            <li>• Media Sync: <span className="text-slate-200">Drift-Compensated Timestamp Offset (&lt;250ms alignment)</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};
