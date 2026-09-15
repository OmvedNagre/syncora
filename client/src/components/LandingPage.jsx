import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  ArrowRight, 
  KeyRound, 
  Radio, 
  Hash, 
  Volume2
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const LandingPage = () => {
  const { joinRoom } = useSocket();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [userName, setUserName] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check URL query parameters for ?room=DUO-XXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      setRoomCode(code.toUpperCase());
      setActiveTab('join');
    }
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: userName || 'Founder',
          spaceName: spaceName.trim() || 'Syncora Sanctuary',
          pin: pin.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        const joinRes = await joinRoom(data.room.code, userName || 'Founder', pin.trim());
        if (!joinRes.success) {
          setErrorMessage(joinRes.error || 'Failed to enter space');
        }
      } else {
        setErrorMessage(data.error || 'Failed to create space');
      }
    } catch (err) {
      setErrorMessage('Server connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setErrorMessage('Please enter a valid room code');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await joinRoom(roomCode.trim().toUpperCase(), userName || 'Creator', pin.trim());
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to join space');
      }
    } catch (err) {
      setErrorMessage('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-[#1e1f22]">
      {/* Dynamic ambient lighting orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5865F2]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Container */}
      <div className="relative z-10 max-w-xl w-full space-y-8 my-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] text-xs font-mono tracking-wider shadow-lg shadow-indigo-500/10">
            <Radio size={12} className="animate-pulse" />
            <span>Syncora v2 • Clean Multi-Channel Sanctuary</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300">
            Syncora
          </h1>

          <p className="text-sm text-discord-muted max-w-md mx-auto leading-relaxed">
            The Discord-inspired real-time collaboration sanctuary. Dedicated spaces for categorized text channels, live drop-in voice stages, synchronized cinema, and pair sandbox.
          </p>
        </div>

        {/* Action Glass Card */}
        <div className="bg-[#2b2d31] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#1e1f22] border border-white/5">
            <button
              onClick={() => { setActiveTab('create'); setErrorMessage(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-[#5865F2] text-white shadow-md'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              Create New Space
            </button>
            <button
              onClick={() => { setActiveTab('join'); setErrorMessage(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'join'
                  ? 'bg-[#5865F2] text-white shadow-md'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              Join Existing Space
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-discord-header block mb-1.5">
                  Your Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex (Founder)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-2xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-discord-header block mb-1.5">
                  Space Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Syncora Sanctuary or Dev Team Pod"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-2xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-discord-header block mb-1.5">
                  Space Passcode / PIN (Optional)
                </label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-discord-muted" />
                  <input
                    type="password"
                    placeholder="Leave blank for open invite code"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs tracking-wide shadow-xl shadow-indigo-500/25 disabled:opacity-50 transition-all active:scale-95"
              >
                <span>{loading ? 'Generating Space...' : 'Launch Sanctuary Space'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-discord-header block mb-1.5">
                  Space / Room Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. DUO-CS5A"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono uppercase tracking-widest text-cyan-300 placeholder:normal-case placeholder:tracking-normal"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-discord-header block mb-1.5">
                  Your Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Taylor"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-2xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-discord-header block mb-1.5">
                  Space PIN (If required)
                </label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-discord-muted" />
                  <input
                    type="password"
                    placeholder="Enter PIN if host configured one"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !roomCode.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs tracking-wide shadow-xl shadow-indigo-500/25 disabled:opacity-50 transition-all active:scale-95"
              >
                <span>{loading ? 'Connecting...' : 'Enter Space'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Feature Highlights */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#1e1f22] border border-white/5">
              <Hash size={16} className="text-[#5865F2] mx-auto mb-1" />
              <div className="text-[10px] font-bold text-discord-header">Discord Format</div>
              <div className="text-[9px] text-discord-muted">Channels & Roles</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1e1f22] border border-white/5">
              <Volume2 size={16} className="text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-discord-header">Voice Stages</div>
              <div className="text-[9px] text-discord-muted">Low Latency P2P</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1e1f22] border border-white/5">
              <Flame size={16} className="text-red-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-discord-header">Burn Protocol</div>
              <div className="text-[9px] text-discord-muted">Memory Shredding</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
