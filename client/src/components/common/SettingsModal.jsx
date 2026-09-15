import React, { useState, useEffect } from 'react';
import { X, User, Shield, Volume2, Mic, Headphones, Sparkles } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../context/WebRTCContext';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { currentUser } = useSocket();
  const { 
    audioInputDevices, 
    audioOutputDevices, 
    selectedAudioInput, 
    selectedAudioOutput, 
    changeAudioInput, 
    changeAudioOutput, 
    refreshAudioDevices,
    localAudioLevel 
  } = useWebRTC();

  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState(currentUser?.name || '');

  useEffect(() => {
    if (isOpen) {
      refreshAudioDevices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-[#313338] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row h-[520px]">
        {/* Left Settings Tabs Sidebar */}
        <div className="w-full md:w-52 bg-[#2b2d31] p-4 flex flex-col border-b md:border-b-0 md:border-r border-black/20 shrink-0">
          <div className="text-[11px] font-bold text-discord-muted uppercase tracking-wider mb-2 px-2">
            User Settings
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'profile' ? 'bg-[#3f4248] text-white font-bold' : 'text-discord-normal hover:bg-[#35373c]'
              }`}
            >
              <User size={15} />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => { setActiveTab('voice'); refreshAudioDevices(); }}
              className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'voice' ? 'bg-[#3f4248] text-white font-bold' : 'text-discord-normal hover:bg-[#35373c]'
              }`}
            >
              <Volume2 size={15} />
              <span>Voice & Audio</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'privacy' ? 'bg-[#3f4248] text-white font-bold' : 'text-discord-normal hover:bg-[#35373c]'
              }`}
            >
              <Shield size={15} />
              <span>Privacy & Crypto</span>
            </button>
          </div>
        </div>

        {/* Right Settings Content Area */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-discord-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>

          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">My Space Profile</h3>
                <p className="text-xs text-discord-muted">Personalize how others in DuoSpace see you.</p>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-[#2b2d31] border border-white/5">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg"
                  style={{ backgroundColor: currentUser?.color || '#5865F2' }}
                >
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{currentUser?.name}</h4>
                  <span className="text-xs text-discord-muted font-mono">{currentUser?.role === 'owner' ? '👑 Space Owner' : 'Space Member'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-discord-muted">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Voice & Device Settings</h3>
                <p className="text-xs text-discord-muted">Configure input microphones and output headphones.</p>
              </div>

              {/* Input Device (Microphone) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-discord-muted flex items-center space-x-1.5">
                  <Mic size={14} className="text-emerald-400" />
                  <span>Input Device (Microphone)</span>
                </label>
                <select
                  value={selectedAudioInput}
                  onChange={(e) => changeAudioInput(e.target.value)}
                  className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-discord-header focus:outline-none focus:border-[#5865F2]"
                >
                  {audioInputDevices.length === 0 ? (
                    <option value="">Default System Microphone</option>
                  ) : (
                    audioInputDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Microphone ${i + 1}`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Output Device (Headphones) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-discord-muted flex items-center space-x-1.5">
                  <Headphones size={14} className="text-cyan-400" />
                  <span>Output Device (Headphones / Speakers)</span>
                </label>
                <select
                  value={selectedAudioOutput}
                  onChange={(e) => changeAudioOutput(e.target.value)}
                  className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-discord-header focus:outline-none focus:border-[#5865F2]"
                >
                  {audioOutputDevices.length === 0 ? (
                    <option value="">Default System Output</option>
                  ) : (
                    audioOutputDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Speaker / Headphone ${i + 1}`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Mic Test / Live Input Audio Visualizer */}
              <div className="p-4 rounded-xl bg-[#2b2d31] border border-white/5 space-y-2">
                <div className="flex justify-between text-xs text-discord-normal">
                  <span className="font-semibold">Microphone Live Input Level</span>
                  <span className={`font-mono font-bold ${localAudioLevel > 15 ? 'text-emerald-400' : 'text-discord-muted'}`}>
                    {localAudioLevel > 15 ? 'Speaking' : 'Quiet'} ({localAudioLevel}%)
                  </span>
                </div>
                <div className="h-2.5 bg-[#1e1f22] rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-75"
                    style={{ width: `${Math.max(2, localAudioLevel)}%` }}
                  />
                </div>
                <span className="text-[10px] text-discord-muted block">
                  Echo Cancellation & WebRTC P2P Noise Suppression are actively running.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">Privacy & Cryptographic Security</h3>
                <p className="text-xs text-discord-muted">Zero-knowledge relay with client-side shredding.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#2b2d31] border border-white/5 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                  <Shield size={16} />
                  <span>Ephemeral Memory Store</span>
                </div>
                <p className="text-xs text-discord-muted leading-relaxed">
                  No chat messages or uploaded media are persisted on permanent databases. When the Burn Room protocol is triggered, all data in memory and uploaded buffers are irreversibly cryptoshredded.
                </p>
              </div>
            </div>
          )}

          {/* Close / Done Button */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
