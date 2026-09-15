import React from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Monitor, 
  MonitorOff, 
  PhoneOff, 
  Maximize2 
} from 'lucide-react';
import { useWebRTC } from '../../context/WebRTCContext';
import { useSocket } from '../../context/SocketContext';

export const VoiceCallHUD = ({ onOpenScreenViewer }) => {
  const { 
    callStatus, 
    callDuration, 
    isMuted, 
    isDeafened, 
    isScreenSharing, 
    localAudioLevel, 
    remoteAudioLevel,
    remoteScreenStream,
    toggleMute, 
    toggleDeafen, 
    toggleScreenShare, 
    endCall 
  } = useWebRTC();
  const { partner } = useSocket();

  if (callStatus !== 'connected') return null;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
      <div className="glass-panel px-6 py-3 rounded-2xl border border-white/15 shadow-2xl shadow-black/80 flex items-center space-x-6 backdrop-blur-2xl">
        {/* Call Info & Duration */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md"
              style={{ backgroundColor: partner?.color || '#ec4899' }}
            >
              {partner?.name?.charAt(0) || 'P'}
            </div>
            {/* Audio wave indicator ring */}
            <div 
              className="absolute -inset-1 rounded-2xl border-2 border-pink-400/50 transition-transform duration-75"
              style={{ transform: `scale(${1 + (remoteAudioLevel / 100) * 0.4})` }}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-white leading-none">
              {partner?.name || 'Partner'}
            </span>
            <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider mt-1">
              {formatDuration(callDuration)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-7 w-[1px] bg-white/10" />

        {/* Audio Waveform miniature */}
        <div className="hidden sm:flex items-center space-x-1 h-6">
          {[20, 45, 80, 60, 30, 70, 40].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(4, (localAudioLevel / 100) * h)}px`,
                opacity: localAudioLevel > 10 ? 1 : 0.3
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Mic */}
          <button
            onClick={toggleMute}
            className={`p-2.5 rounded-xl border transition-all ${
              isMuted 
                ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' 
                : 'bg-slate-800/80 text-slate-200 border-white/10 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Deafen */}
          <button
            onClick={toggleDeafen}
            className={`p-2.5 rounded-xl border transition-all ${
              isDeafened 
                ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' 
                : 'bg-slate-800/80 text-slate-200 border-white/10 hover:bg-slate-700'
            }`}
            title={isDeafened ? 'Undeafen' : 'Deafen Speaker'}
          >
            {isDeafened ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-2.5 rounded-xl border transition-all ${
              isScreenSharing 
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-md shadow-cyan-500/20' 
                : 'bg-slate-800/80 text-slate-200 border-white/10 hover:bg-slate-700'
            }`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            {isScreenSharing ? <MonitorOff size={16} /> : <Monitor size={16} />}
          </button>

          {/* View Partner Screen if available */}
          {remoteScreenStream && (
            <button
              onClick={onOpenScreenViewer}
              className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40 hover:bg-pink-500/30 transition-all animate-pulse"
              title="View Partner's Shared Screen"
            >
              <Maximize2 size={16} />
            </button>
          )}

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all active:scale-95 ml-2"
            title="End Call"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
