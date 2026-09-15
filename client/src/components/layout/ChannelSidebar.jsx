import React, { useState } from 'react';
import { 
  Hash, 
  Volume2, 
  ChevronDown, 
  ChevronRight, 
  Settings, 
  Mic, 
  MicOff, 
  Headphones, 
  HeadphoneOff, 
  Tv, 
  Code2, 
  CheckSquare, 
  Flame, 
  QrCode, 
  Copy, 
  Check, 
  PhoneOff,
  Radio,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Rocket,
  Activity,
  Wifi
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../context/WebRTCContext';
import { ConnectionPopover } from '../call/ConnectionPopover';

export const ChannelSidebar = ({ onOpenQR, onOpenTelemetry, onOpenSettings }) => {
  const { 
    room, 
    currentUser, 
    allMembers, 
    channels, 
    activeChannelId, 
    switchChannel, 
    activeVoiceChannel, 
    joinVoiceChannel, 
    leaveVoiceChannel, 
    voiceParticipants, 
    initiateBurn 
  } = useSocket();

  const { 
    isMuted, 
    isDeafened, 
    toggleMute, 
    toggleDeafen, 
    isCameraOn,
    toggleCamera,
    isScreenSharing,
    toggleScreenShare,
    telemetry,
    callStatus, 
    endCall 
  } = useWebRTC();

  const [isConnectionOpen, setIsConnectionOpen] = useState(false);
  const [isPingHovered, setIsPingHovered] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const textChannels = channels.filter(c => c.type === 'text');
  const voiceChannels = channels.filter(c => c.type === 'voice');
  const activityChannels = channels.filter(c => c.type === 'activity');

  const handleChannelClick = (ch) => {
    switchChannel(ch.id);
    if (ch.type === 'voice' && activeVoiceChannel !== ch.id) {
      joinVoiceChannel(ch.id);
    }
  };

  return (
    <aside 
      aria-label="Channels sidebar"
      className="w-60 bg-discord-sidebar flex flex-col select-none shrink-0 border-r border-black/20"
    >
      {/* Space Header with Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
          className="w-full h-12 px-4 border-b border-black/30 flex items-center justify-between font-bold text-discord-header hover:bg-discord-hover transition-colors shadow-sm"
        >
          <span className="truncate tracking-tight text-sm font-semibold">
            {room?.name || 'Syncora Sanctuary'}
          </span>
          <ChevronDown 
            size={18} 
            className={`text-discord-muted transition-transform duration-200 ${isHeaderMenuOpen ? 'rotate-180 text-white' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isHeaderMenuOpen && (
          <div className="absolute top-13 left-2 right-2 z-50 bg-[#111214] border border-white/10 rounded-lg p-1.5 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2.5 py-1.5 text-[11px] text-discord-muted font-mono flex items-center justify-between">
              <span>ROOM CODE</span>
              <button 
                onClick={copyRoomCode} 
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <span>{room?.code}</span>
                {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>

            <div className="h-[1px] bg-white/10 my-1" />

            <button
              onClick={() => { setIsHeaderMenuOpen(false); onOpenQR(); }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded text-xs text-discord-normal hover:bg-[#5865f2] hover:text-white transition-colors"
            >
              <span>Invite Friends & QR</span>
              <QrCode size={15} />
            </button>

            <button
              onClick={() => { setIsHeaderMenuOpen(false); onOpenTelemetry(); }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded text-xs text-discord-normal hover:bg-[#5865f2] hover:text-white transition-colors"
            >
              <span>Relay & Telemetry HUD</span>
              <Radio size={15} />
            </button>

            <div className="h-[1px] bg-white/10 my-1" />

            <button
              onClick={() => { setIsHeaderMenuOpen(false); initiateBurn(); }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded text-xs text-[#f23f43] hover:bg-[#f23f43] hover:text-white transition-colors font-medium"
            >
              <span>Burn & Shred Space</span>
              <Flame size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Channels List Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* TEXT CHANNELS CATEGORY */}
        <div>
          <button
            onClick={() => toggleCategory('text')}
            className="w-full flex items-center px-1 py-1 text-[11px] font-bold text-discord-muted hover:text-discord-normal uppercase tracking-wider transition-colors"
          >
            {collapsedCategories['text'] ? <ChevronRight size={12} className="mr-1" /> : <ChevronDown size={12} className="mr-1" />}
            <span>Text Channels</span>
          </button>

          {!collapsedCategories['text'] && (
            <div className="mt-1 space-y-0.5">
              {textChannels.map((ch) => {
                const isActive = activeChannelId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleChannelClick(ch)}
                    className={`w-full flex items-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors group ${
                      isActive 
                        ? 'bg-[#3f4248] text-white' 
                        : 'text-discord-muted hover:bg-[#35373c] hover:text-discord-normal'
                    }`}
                  >
                    <Hash size={16} className={`mr-2 shrink-0 ${isActive ? 'text-white' : 'text-discord-muted group-hover:text-discord-normal'}`} />
                    <span className="truncate">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* VOICE CHANNELS CATEGORY */}
        <div>
          <button
            onClick={() => toggleCategory('voice')}
            className="w-full flex items-center px-1 py-1 text-[11px] font-bold text-discord-muted hover:text-discord-normal uppercase tracking-wider transition-colors"
          >
            {collapsedCategories['voice'] ? <ChevronRight size={12} className="mr-1" /> : <ChevronDown size={12} className="mr-1" />}
            <span>Voice & Stages</span>
          </button>

          {!collapsedCategories['voice'] && (
            <div className="mt-1 space-y-0.5">
              {voiceChannels.map((ch) => {
                const isActive = activeChannelId === ch.id;
                const isConnected = activeVoiceChannel === ch.id;
                const participants = voiceParticipants[ch.id] || [];
                const participantMembers = allMembers.filter(m => participants.includes(m.socketId));

                return (
                  <div key={ch.id}>
                    <button
                      onClick={() => handleChannelClick(ch)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-colors group ${
                        isActive 
                          ? 'bg-[#3f4248] text-white' 
                          : 'text-discord-muted hover:bg-[#35373c] hover:text-discord-normal'
                      }`}
                    >
                      <div className="flex items-center truncate">
                        <Volume2 size={16} className={`mr-2 shrink-0 ${isActive || isConnected ? 'text-emerald-400' : 'text-discord-muted group-hover:text-discord-normal'}`} />
                        <span className="truncate">{ch.name}</span>
                      </div>
                      {isConnected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </button>

                    {/* Connected Users under voice channel */}
                    {participantMembers.length > 0 && (
                      <div className="pl-6 py-1 space-y-1">
                        {participantMembers.map((m) => (
                          <div key={m.socketId} className="flex items-center space-x-2 text-[11px] text-discord-normal px-1 py-0.5 rounded hover:bg-white/5">
                            <div 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                              style={{ backgroundColor: m.color || '#5865F2' }}
                            >
                              {m.name.charAt(0)}
                            </div>
                            <span className="truncate max-w-[120px]">{m.name}</span>
                            {m.role === 'owner' && <span title="Space Owner">👑</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIVITIES & WORKSPACE CATEGORY */}
        <div>
          <button
            onClick={() => toggleCategory('activity')}
            className="w-full flex items-center px-1 py-1 text-[11px] font-bold text-discord-muted hover:text-discord-normal uppercase tracking-wider transition-colors"
          >
            {collapsedCategories['activity'] ? <ChevronRight size={12} className="mr-1" /> : <ChevronDown size={12} className="mr-1" />}
            <span>Activities & Apps</span>
          </button>

          {!collapsedCategories['activity'] && (
            <div className="mt-1 space-y-0.5">
              {activityChannels.map((ch) => {
                const isActive = activeChannelId === ch.id;
                let Icon = Tv;
                if (ch.subType === 'code') Icon = Code2;
                if (ch.subType === 'todo') Icon = CheckSquare;

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleChannelClick(ch)}
                    className={`w-full flex items-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors group ${
                      isActive 
                        ? 'bg-[#3f4248] text-white' 
                        : 'text-discord-muted hover:bg-[#35373c] hover:text-discord-normal'
                    }`}
                  >
                    <Icon size={16} className={`mr-2 shrink-0 ${
                      isActive 
                        ? ch.subType === 'code' ? 'text-cyan-400' : ch.subType === 'todo' ? 'text-indigo-400' : 'text-pink-400'
                        : 'text-discord-muted group-hover:text-discord-normal'
                    }`} />
                    <span className="truncate">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active Voice Connected Bar (Shown when user is connected to a voice channel) */}
      {activeVoiceChannel && (
        <div className="relative px-3 py-2.5 bg-[#111214] border-t border-black/20 select-none">
          {/* Attached Connection Popover (Discord Image 5) */}
          <ConnectionPopover 
            isOpen={isConnectionOpen} 
            onClose={() => setIsConnectionOpen(false)} 
          />

          {/* Top Row: Signal Icon, Status & Disconnect (Discord Image 4) */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 overflow-hidden">
              {/* Green Signal icon with hover ping tooltip */}
              <div 
                className="relative cursor-pointer"
                onMouseEnter={() => setIsPingHovered(true)}
                onMouseLeave={() => setIsPingHovered(false)}
                onClick={() => setIsConnectionOpen(!isConnectionOpen)}
              >
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                  <Wifi size={16} className="animate-pulse" />
                </div>

                {/* Hover Speech-Bubble Tooltip: "32 ms" */}
                {isPingHovered && !isConnectionOpen && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#111214] text-[10px] font-mono font-bold text-white shadow-xl border border-white/10 whitespace-nowrap z-30 pointer-events-none">
                    <span>{telemetry?.rtt > 0 ? telemetry.rtt : 32} ms</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#111214] border-r border-b border-white/10 rotate-45" />
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div 
                className="flex flex-col overflow-hidden cursor-pointer"
                onClick={() => setIsConnectionOpen(!isConnectionOpen)}
              >
                <span className="text-xs font-bold text-emerald-400 hover:underline leading-tight">
                  Voice Connected
                </span>
                <span className="text-[10px] text-discord-muted truncate max-w-[125px]">
                  {activeVoiceChannel === 'focus-room' ? 'Focus Pod' : 'Lounge Voice'} / {room?.name || 'Sanctuary'}
                </span>
              </div>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => {
                leaveVoiceChannel(true);
                endCall();
              }}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-discord-muted hover:text-red-400 transition-colors shrink-0"
              title="Disconnect from Voice"
            >
              <PhoneOff size={16} />
            </button>
          </div>

          {/* Bottom Row: 4 sleek action buttons (Camera, Screen Share, Activities, Connection) */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* Camera Button */}
            <button
              onClick={toggleCamera}
              className={`flex items-center justify-center p-2 rounded-lg text-xs transition-all ${
                isCameraOn
                  ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40'
                  : 'bg-[#2b2d31] hover:bg-[#35373c] text-discord-normal hover:text-white border border-white/5'
              }`}
              title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
            </button>

            {/* Screen Share Button */}
            <button
              onClick={toggleScreenShare}
              className={`flex items-center justify-center p-2 rounded-lg text-xs transition-all ${
                isScreenSharing
                  ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/40'
                  : 'bg-[#2b2d31] hover:bg-[#35373c] text-discord-normal hover:text-white border border-white/5'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              {isScreenSharing ? <MonitorOff size={16} /> : <Monitor size={16} />}
            </button>

            {/* Activities & Watch Party Button */}
            <button
              onClick={() => switchChannel('watch-party')}
              className={`flex items-center justify-center p-2 rounded-lg text-xs transition-all ${
                activeChannelId === 'watch-party'
                  ? 'bg-[#5865F2]/25 text-[#5865F2] border border-[#5865F2]/40'
                  : 'bg-[#2b2d31] hover:bg-[#35373c] text-discord-normal hover:text-white border border-white/5'
              }`}
              title="Start Watch Party Activity"
            >
              <Rocket size={16} />
            </button>

            {/* Connection Diagnostics HUD Popover Toggle */}
            <button
              onClick={() => setIsConnectionOpen(!isConnectionOpen)}
              className={`flex items-center justify-center p-2 rounded-lg text-xs transition-all ${
                isConnectionOpen
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#2b2d31] hover:bg-[#35373c] text-discord-normal hover:text-white border border-white/5'
              }`}
              title="RTC Connection Diagnostics"
            >
              <Activity size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Discord Iconic Bottom User Bar */}
      <div className="h-14 bg-discord-userbar px-2.5 flex items-center justify-between border-t border-black/20">
        {/* User Info */}
        <div 
          onClick={onOpenSettings}
          className="flex items-center space-x-2 p-1 -ml-1 rounded hover:bg-discord-hover transition-colors cursor-pointer max-w-[130px]"
        >
          <div className="relative">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0"
              style={{ backgroundColor: currentUser?.color || '#5865F2' }}
            >
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            {/* Online Status Dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#23a55a] border-2 border-[#232428]" />
          </div>

          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-discord-header truncate leading-tight">
              {currentUser?.name || 'Creator'}
            </span>
            <span className="text-[10px] text-discord-muted truncate font-mono">
              {currentUser?.role === 'owner' ? '👑 Owner' : '#1001'}
            </span>
          </div>
        </div>

        {/* User Quick Controls: Mic, Deafen, Settings */}
        <div className="flex items-center space-x-0.5">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded hover:bg-discord-hover transition-colors ${isMuted ? 'text-[#f23f43]' : 'text-discord-muted hover:text-discord-header'}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button
            onClick={toggleDeafen}
            className={`p-1.5 rounded hover:bg-discord-hover transition-colors ${isDeafened ? 'text-[#f23f43]' : 'text-discord-muted hover:text-discord-header'}`}
            title={isDeafened ? 'Undeafen' : 'Deafen'}
          >
            {isDeafened ? <HeadphoneOff size={18} /> : <Headphones size={18} />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded hover:bg-discord-hover text-discord-muted hover:text-discord-header transition-colors"
            title="User & Sanctuary Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
