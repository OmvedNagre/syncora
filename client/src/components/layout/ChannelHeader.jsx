import React, { useState } from 'react';
import { 
  Hash, 
  Volume2, 
  Tv, 
  Code2, 
  CheckSquare, 
  Users, 
  QrCode, 
  Activity, 
  Copy, 
  Check, 
  Radio
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../context/WebRTCContext';

export const ChannelHeader = ({ 
  isMemberListOpen, 
  onToggleMemberList, 
  onOpenQR, 
  onOpenTelemetry 
}) => {
  const { 
    room, 
    channels, 
    activeChannelId, 
    activeVoiceChannel, 
    joinVoiceChannel, 
    leaveVoiceChannel 
  } = useSocket();

  const { endCall } = useWebRTC();

  const [copied, setCopied] = useState(false);

  const currentChannel = channels.find(c => c.id === activeChannelId) || {
    id: 'general',
    name: 'general',
    type: 'text',
    topic: 'Syncora Sanctuary'
  };

  const copyRoomLink = () => {
    const url = window.location.origin + '?room=' + room?.code;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let ChannelIcon = Hash;
  if (currentChannel.type === 'voice') ChannelIcon = Volume2;
  if (currentChannel.subType === 'media') ChannelIcon = Tv;
  if (currentChannel.subType === 'code') ChannelIcon = Code2;
  if (currentChannel.subType === 'todo') ChannelIcon = CheckSquare;

  return (
    <header className="h-12 px-4 border-b border-black/30 bg-discord-main flex items-center justify-between shadow-sm select-none shrink-0 z-20">
      {/* Left: Channel Name & Topic */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex items-center space-x-2 text-discord-header">
          <ChannelIcon size={20} className="text-discord-muted shrink-0" />
          <span className="font-bold text-sm truncate tracking-tight">
            {currentChannel.name}
          </span>
        </div>

        {/* Separator */}
        <div className="hidden sm:block h-4 w-[1px] bg-white/10 shrink-0" />

        {/* Topic */}
        <span className="hidden sm:block text-xs text-discord-muted truncate max-w-sm">
          {currentChannel.topic || 'Welcome to this space!'}
        </span>
      </div>

      {/* Right: Quick Action Tools */}
      <div className="flex items-center space-x-2">
        {/* Room Code Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#202225] border border-white/5 text-xs text-discord-muted font-mono">
          <span>Room:</span>
          <span className="text-cyan-300 font-bold">{room?.code}</span>
          <button 
            onClick={copyRoomLink} 
            className="hover:text-white transition-colors p-0.5"
            title="Copy room invite link"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
        </div>

        {/* Voice Channel Quick Connect (if not already in voice) */}
        {activeVoiceChannel ? (
          <button
            onClick={() => {
              leaveVoiceChannel(true);
              endCall();
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-colors"
            title="In Voice Channel (Click to Disconnect)"
          >
            <Radio size={13} className="animate-pulse" />
            <span className="hidden lg:inline">In Voice</span>
          </button>
        ) : (
          <button
            onClick={() => joinVoiceChannel('lounge-voice')}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded bg-[#35373c] hover:bg-[#5865f2] text-discord-normal hover:text-white transition-colors text-xs font-medium"
            title="Quick connect to Lounge Voice"
          >
            <Volume2 size={14} />
            <span>Join Voice</span>
          </button>
        )}

        {/* Telemetry HUD Button */}
        <button
          onClick={onOpenTelemetry}
          className="p-1.5 rounded hover:bg-discord-hover text-discord-muted hover:text-discord-header transition-colors"
          title="Network & RTC Telemetry HUD"
        >
          <Activity size={18} />
        </button>

        {/* Invite / QR Modal Button */}
        <button
          onClick={onOpenQR}
          className="p-1.5 rounded hover:bg-discord-hover text-discord-muted hover:text-discord-header transition-colors"
          title="Share Invite & QR Code"
        >
          <QrCode size={18} />
        </button>

        {/* Toggle Member Sidebar Button */}
        <button
          onClick={onToggleMemberList}
          className={`p-1.5 rounded transition-colors ${
            isMemberListOpen 
              ? 'text-white bg-discord-hover' 
              : 'text-discord-muted hover:text-discord-header hover:bg-discord-hover'
          }`}
          title={isMemberListOpen ? 'Hide Member List' : 'Show Member List'}
        >
          <Users size={18} />
        </button>
      </div>
    </header>
  );
};
