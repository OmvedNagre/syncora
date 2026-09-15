import React, { useRef, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { useWebRTC } from '../../context/WebRTCContext';

export const ScreenShareView = ({ isOpen, onClose }) => {
  const { remoteScreenStream } = useWebRTC();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && remoteScreenStream) {
      videoRef.current.srcObject = remoteScreenStream;
    }
  }, [remoteScreenStream, isOpen]);

  if (!isOpen || !remoteScreenStream) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="w-full max-w-5xl glass-panel border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/10 flex flex-col max-h-[90vh]">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-200">
              Partner's Live Screen Stream (P2P Low Latency)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (videoRef.current?.requestFullscreen) {
                  videoRef.current.requestFullscreen();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              title="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden p-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};
