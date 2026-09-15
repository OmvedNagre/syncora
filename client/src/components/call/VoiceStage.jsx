import React, { useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Headphones,
  HeadphoneOff, 
  Monitor,
  MonitorOff, 
  PhoneOff, 
  Radio, 
  Crown,
  Video,
  VideoOff,
  Users
} from 'lucide-react';
import { useWebRTC } from '../../context/WebRTCContext';
import { useSocket } from '../../context/SocketContext';

export const VoiceStage = () => {
  const { 
    callDuration, 
    isMuted, 
    isDeafened, 
    isScreenSharing, 
    isCameraOn,
    localAudioLevel, 
    remoteAudioLevel,
    remoteScreenStream,
    localScreenStream,
    remoteCameraStream,
    localCameraStream,
    remoteCameraActive,
    toggleMute, 
    toggleDeafen, 
    toggleCamera,
    toggleScreenShare, 
    endCall 
  } = useWebRTC();

  const { 
    currentUser, 
    partner,
    allMembers, 
    activeVoiceChannel, 
    voiceParticipants,
    joinVoiceChannel,
    leaveVoiceChannel 
  } = useSocket();

  const screenVideoRef = useRef(null);
  const localCamVideoRef = useRef(null);
  const remoteCamVideoRef = useRef(null);

  const activeScreenStream = remoteScreenStream || localScreenStream;
  const isMyScreenShare = Boolean(localScreenStream);

  // Attach active screen stream
  useEffect(() => {
    if (screenVideoRef.current && activeScreenStream) {
      screenVideoRef.current.srcObject = activeScreenStream;
    }
  }, [activeScreenStream]);

  // Attach local camera stream
  useEffect(() => {
    if (localCamVideoRef.current && localCameraStream) {
      localCamVideoRef.current.srcObject = localCameraStream;
    }
  }, [localCameraStream, isCameraOn]);

  // Attach remote camera stream
  useEffect(() => {
    if (remoteCamVideoRef.current && remoteCameraStream) {
      remoteCamVideoRef.current.srcObject = remoteCameraStream;
    }
  }, [remoteCameraStream, remoteCameraActive]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isConnected = Boolean(activeVoiceChannel);

  // Get active voice participants or all room members as fallback
  const channelKey = activeVoiceChannel || 'lounge-voice';
  const participants = (voiceParticipants[channelKey]?.length > 0)
    ? allMembers.filter(m => voiceParticipants[channelKey].includes(m.socketId))
    : (isConnected ? [currentUser] : []);

  const handleDisconnect = () => {
    leaveVoiceChannel(true); // Return to #general
    endCall();
  };

  // If user navigated to a voice channel view but is NOT currently connected to voice:
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#111214] select-none p-6 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-3xl bg-[#2b2d31] border border-white/10 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/10">
          <Radio size={40} />
        </div>

        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl font-bold text-white">
            {channelKey === 'focus-room' ? 'Focus Pod' : 'Lounge Voice'}
          </h2>
          <p className="text-xs text-discord-muted leading-relaxed">
            {participants.length > 0
              ? `${participants.length} creator${participants.length > 1 ? 's are' : ' is'} currently hanging out in this channel.`
              : 'Nobody is currently in this voice channel. Drop in and start talking!'}
          </p>
        </div>

        {/* Existing participants in this channel */}
        {participants.length > 0 && (
          <div className="flex items-center space-x-2 p-2 rounded-2xl bg-[#1e1f22] border border-white/5">
            {participants.map(m => (
              <div
                key={m.socketId}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-[#1e1f22]"
                style={{ backgroundColor: m.color || '#5865F2' }}
                title={m.name}
              >
                {m.name.charAt(0)}
              </div>
            ))}
          </div>
        )}

        {/* Join Voice Button */}
        <button
          onClick={() => joinVoiceChannel(channelKey)}
          className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#23a55a] hover:bg-[#1f9350] text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all active:scale-95"
        >
          <Radio size={18} />
          <span>Connect to Voice</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-[#111214] select-none p-6 overflow-hidden">
      {/* Voice Channel Top Stage Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>{activeVoiceChannel === 'focus-room' ? 'Focus Pod' : 'Lounge Voice'}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live WebRTC Low Latency
              </span>
            </h2>
            <p className="text-xs text-discord-muted font-mono">
              {participants.length} connected • Duration: {formatDuration(callDuration)}
            </p>
          </div>
        </div>
      </div>

      {/* Center Stage: Screen Share or Participant Grid */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-y-auto">
        {activeScreenStream ? (
          /* Live Screen Share Theater */
          <div className="w-full max-w-5xl flex flex-col items-center space-y-4 my-auto">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col group">
              <video 
                ref={screenVideoRef}
                autoPlay 
                playsInline 
                muted={isMyScreenShare} // mute local audio loopback
                className="w-full h-full object-contain bg-black"
              />

              {/* Status Badge overlay */}
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 flex items-center space-x-2 border border-white/10 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-semibold">
                  {isMyScreenShare 
                    ? 'You are sharing your screen (Live Preview)' 
                    : `${partner?.name || 'Partner'}'s Live Screen Stream`}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/30 text-red-300 text-[10px] font-bold uppercase tracking-wider">
                  LIVE
                </span>
              </div>

              {/* Stop Share overlay button on hover */}
              {isMyScreenShare && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={toggleScreenShare}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg transition-colors"
                  >
                    <MonitorOff size={14} />
                    <span>Stop Sharing</span>
                  </button>
                </div>
              )}
            </div>

            {/* Compact Participant Ribbon below screen share */}
            <div className="flex items-center justify-center space-x-4 overflow-x-auto w-full py-1">
              {participants.map((member) => {
                const isMe = member.socketId === currentUser?.socketId;
                const isSpeaking = isMe ? localAudioLevel > 15 : remoteAudioLevel > 15;
                const isMemberMuted = isMe ? isMuted : false;
                const hasCamera = isMe ? isCameraOn : remoteCameraActive;

                return (
                  <div
                    key={member.socketId}
                    className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#2b2d31] border transition-all ${
                      isSpeaking ? 'border-emerald-500 shadow-[0_0_12px_rgba(35,165,90,0.4)]' : 'border-white/5'
                    }`}
                  >
                    <div className="relative">
                      <div 
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                          isSpeaking ? 'speaking-ring' : ''
                        }`}
                        style={{ backgroundColor: member.color || '#5865F2' }}
                      >
                        {member.name?.charAt(0) || 'M'}
                      </div>
                      {isMemberMuted && (
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-red-500 text-white">
                          <MicOff size={10} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-discord-header truncate max-w-[120px]">
                      {member.name} {isMe && '(You)'}
                    </span>
                    {hasCamera && <Video size={12} className="text-emerald-400" title="Camera Active" />}
                    {member.role === 'owner' && <Crown size={12} className="text-amber-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Voice & Video Participant Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl my-auto">
            {participants.map((member) => {
              const isMe = member.socketId === currentUser?.socketId;
              const isSpeaking = isMe ? localAudioLevel > 15 : remoteAudioLevel > 15;
              const isMemberMuted = isMe ? isMuted : false;
              const hasCamera = isMe ? (isCameraOn && localCameraStream) : (remoteCameraActive && remoteCameraStream);

              return (
                <div 
                  key={member.socketId}
                  className={`relative flex flex-col items-center justify-center rounded-3xl bg-[#2b2d31] border transition-all duration-200 aspect-square overflow-hidden ${
                    isSpeaking 
                      ? 'border-emerald-500 shadow-[0_0_25px_rgba(35,165,90,0.3)]' 
                      : 'border-white/5 hover:border-white/10 shadow-xl'
                  }`}
                >
                  {hasCamera ? (
                    /* Live Camera Video Feed */
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                      <video
                        ref={isMe ? localCamVideoRef : remoteCamVideoRef}
                        autoPlay
                        playsInline
                        muted={isMe} // mute self audio
                        className={`w-full h-full object-cover ${isMe ? '-scale-x-100' : ''}`} // mirror self camera
                      />

                      {/* Participant Name Badge over Video */}
                      <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                        {isMemberMuted ? (
                          <MicOff size={12} className="text-red-400" />
                        ) : (
                          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                        )}
                        <span>{member.name} {isMe && '(You)'}</span>
                        {member.role === 'owner' && <Crown size={12} className="text-amber-400 ml-0.5" />}
                      </div>
                    </div>
                  ) : (
                    /* Avatar with Speaking Ring */
                    <div className="flex flex-col items-center justify-center p-8 w-full h-full">
                      <div className="relative mb-4">
                        <div 
                          className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl transition-transform ${
                            isSpeaking ? 'speaking-ring scale-105' : ''
                          }`}
                          style={{ backgroundColor: member.color || '#5865F2' }}
                        >
                          {member.name?.charAt(0) || 'M'}
                        </div>

                        {/* Mute badge overlay */}
                        {isMemberMuted && (
                          <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#f23f43] text-white shadow-lg border-2 border-[#2b2d31]">
                            <MicOff size={14} />
                          </div>
                        )}
                      </div>

                      {/* Member Name */}
                      <div className="flex items-center space-x-1.5 text-center">
                        <span className="font-bold text-sm text-discord-header truncate max-w-[140px]">
                          {member.name} {isMe && '(You)'}
                        </span>
                        {member.role === 'owner' && (
                          <Crown size={14} className="text-amber-400 shrink-0" title="Space Owner" />
                        )}
                      </div>

                      {/* Status */}
                      <span className="text-[11px] text-discord-muted font-mono mt-1">
                        {isSpeaking ? (
                          <span className="text-emerald-400 font-bold">Speaking...</span>
                        ) : isMemberMuted ? (
                          <span className="text-red-400">Muted</span>
                        ) : (
                          <span>Connected</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Modern Discord Voice & Video Control Dock */}
      <div className="flex items-center justify-center pt-3 pb-2 select-none shrink-0">
        <div className="glass-panel px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center space-x-3 sm:space-x-4 backdrop-blur-2xl">
          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-xl border transition-all ${
              isCameraOn 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30 shadow-md shadow-emerald-500/20' 
                : 'bg-[#313338] text-discord-header border-white/10 hover:bg-[#383a40]'
            }`}
            title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-xl border transition-all ${
              isScreenSharing 
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30 shadow-md shadow-cyan-500/20' 
                : 'bg-[#313338] text-discord-header border-white/10 hover:bg-[#383a40]'
            }`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-xl border transition-all ${
              isMuted 
                ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' 
                : 'bg-[#313338] text-discord-header border-white/10 hover:bg-[#383a40]'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Deafen Button */}
          <button
            onClick={toggleDeafen}
            className={`p-3 rounded-xl border transition-all ${
              isDeafened 
                ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' 
                : 'bg-[#313338] text-discord-header border-white/10 hover:bg-[#383a40]'
            }`}
            title={isDeafened ? 'Undeafen' : 'Deafen'}
          >
            {isDeafened ? <HeadphoneOff size={20} /> : <Headphones size={20} />}
          </button>

          {/* Red Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="p-3 rounded-xl bg-[#f23f43] hover:bg-[#da373b] text-white shadow-lg shadow-red-500/30 transition-all active:scale-95 ml-2"
            title="Disconnect from Voice & Return to Chat"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
