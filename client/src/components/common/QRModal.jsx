import React, { useState } from 'react';
import { X, Copy, Check, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '../../context/SocketContext';

export const QRModal = ({ isOpen, onClose }) => {
  const { room } = useSocket();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !room) return null;

  const roomUrl = `${window.location.origin}?room=${room.code}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="max-w-sm w-full glass-panel border border-pink-500/30 rounded-3xl p-6 shadow-2xl shadow-pink-500/10 text-center space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-sm">
            <Smartphone size={18} />
            <span>Scan to Join DuoSpace</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-xl shadow-black/50">
          <QRCodeSVG
            value={roomUrl}
            size={190}
            bgColor="#ffffff"
            fgColor="#090a0f"
            level="Q"
            includeMargin={false}
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-300">Room Passcode</div>
          <div className="font-mono text-2xl font-black tracking-widest text-cyan-400 bg-slate-900/80 py-1.5 px-4 rounded-xl border border-cyan-500/30 inline-block">
            {room.code}
          </div>
        </div>

        <button
          onClick={copyUrl}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-white/10 transition-all shadow-lg active:scale-95"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Direct Room Link'}</span>
        </button>
      </div>
    </div>
  );
};
