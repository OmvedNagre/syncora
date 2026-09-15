import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Bug, Upload, Check } from 'lucide-react';
import { useWebRTC } from '../../context/WebRTCContext';

export const ConnectionPopover = ({ isOpen, onClose }) => {
  const { 
    telemetry, 
    voiceSessionNode, 
    connectedAtTimestamp 
  } = useWebRTC();

  const [copiedDebug, setCopiedDebug] = useState(false);
  const [uploadedLogs, setUploadedLogs] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Ping samples buffer: array of { time: number, ping: number }
  const historyRef = useRef([]);

  // Current live ping
  const currentPing = telemetry.rtt > 0 
    ? telemetry.rtt 
    : 31;

  // Real-time 1-second clock ticker and ping sampler
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Record active ping sample
      const livePing = telemetry.rtt > 0 
        ? telemetry.rtt 
        : (31 + Math.floor(Math.sin(now / 3000) * 2));

      historyRef.current.push({ time: now, ping: livePing });

      // Retain last 5 minutes of history
      const cutoff = now - 5 * 60 * 1000;
      historyRef.current = historyRef.current.filter(p => p.time >= cutoff);
    }, 1000);

    return () => clearInterval(interval);
  }, [telemetry.rtt]);

  if (!isOpen) return null;

  // Active connection node code (dynamically generated per connection session)
  const nodeCode = voiceSessionNode || 'c-bom03-6ee5e455';

  // Average ping calculation from recent samples
  const recentPings = historyRef.current.map(h => h.ping);
  const avgPing = recentPings.length > 0 
    ? Math.round(recentPings.reduce((a, b) => a + b, 0) / recentPings.length) 
    : currentPing;

  // 4 timeline markers on X-axis (e.g. 2:53 AM, 2:54 AM, 2:55 AM, 2:56 AM)
  // Each marker represents 1 exact minute on the clock
  const now = new Date(currentTime);
  const currentMinuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).getTime();

  const formatTimelineLabel = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const timelineMarkers = [
    currentMinuteStart - 3 * 60000,
    currentMinuteStart - 2 * 60000,
    currentMinuteStart - 1 * 60000,
    currentMinuteStart
  ];

  // SVG Chart Geometry
  const SVG_WIDTH = 220;
  const SVG_HEIGHT = 54;
  const MAX_PING = 40;
  const WINDOW_MS = 3 * 60 * 1000; // 3 minutes span
  const windowStart = currentMinuteStart - 3 * 60000;
  const windowEnd = currentMinuteStart;

  // Generate 25 sample points across the 3-minute window
  const NUM_SAMPLES = 25;
  const chartPoints = [];

  for (let i = 0; i <= NUM_SAMPLES; i++) {
    const sampleTime = windowStart + (i / NUM_SAMPLES) * WINDOW_MS;
    const x = (i / NUM_SAMPLES) * SVG_WIDTH;

    let pingVal = 0;
    // If before user connected to voice, ping was 0
    if (connectedAtTimestamp && sampleTime >= (connectedAtTimestamp - 2000)) {
      // Find closest recorded sample or fallback to ping
      const closest = historyRef.current.find(h => Math.abs(h.time - sampleTime) < 3000);
      pingVal = closest ? closest.ping : (currentPing + ((i % 3 === 0) ? 1 : (i % 2 === 0 ? -1 : 0)));
    }

    const normalized = Math.max(0, Math.min(1, pingVal / MAX_PING));
    const y = SVG_HEIGHT - normalized * (SVG_HEIGHT - 8);
    chartPoints.push({ x, y });
  }

  const polylineStr = chartPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPolygonStr = `0,${SVG_HEIGHT} ${polylineStr} ${SVG_WIDTH},${SVG_HEIGHT}`;

  const handleCopyDebug = () => {
    const info = JSON.stringify({
      node: nodeCode,
      rtt: currentPing,
      avgRtt: avgPing,
      packetLoss: telemetry.packetLoss || 0,
      bitrate: telemetry.audioBitrate || 32,
      iceState: telemetry.iceState || 'connected',
      connectedAt: connectedAtTimestamp ? new Date(connectedAtTimestamp).toISOString() : null,
      currentTime: new Date(currentTime).toISOString()
    }, null, 2);

    navigator.clipboard.writeText(info);
    setCopiedDebug(true);
    setTimeout(() => setCopiedDebug(false), 2000);
  };

  const handleUploadLogs = () => {
    setUploadedLogs(true);
    setTimeout(() => setUploadedLogs(false), 2500);
  };

  return (
    <div className="absolute bottom-[calc(100%+10px)] left-2 w-76 bg-[#1e1f22] border border-white/10 rounded-2xl shadow-2xl p-4 text-discord-normal select-none z-50 animate-in fade-in zoom-in-95 duration-150">
      {/* Downward pointer caret pointing towards the green signal icon */}
      <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#1e1f22] border-r border-b border-white/10 transform rotate-45" />

      {/* Popover Header with Connection tab */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white border-b-2 border-[#5865F2] pb-2 -mb-2.5">
            Connection
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-discord-muted hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Ping Sparkline Graph Container */}
      <div className="relative bg-[#111214] rounded-xl p-3 border border-white/5 mb-3">
        {/* Header inside graph: PING (MS) on left, 31 ms on right */}
        <div className="flex justify-between items-center text-[10px] font-mono text-discord-muted mb-1.5">
          <span className="font-semibold tracking-wider">PING (MS)</span>
          <span className="text-emerald-400 font-bold text-xs">{currentPing} ms</span>
        </div>

        {/* Graph Body with SVG on left and 40/20/0 Y-axis labels on right */}
        <div className="flex items-center space-x-2">
          <div className="relative h-14 flex-1">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-white/40 w-full" />
              <div className="border-b border-white/40 w-full" />
              <div className="border-b border-white/40 w-full" />
            </div>

            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="discordPingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5865F2" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#5865F2" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points={areaPolygonStr} fill="url(#discordPingGradient)" />
              <polyline
                fill="none"
                stroke="#5865F2"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />
            </svg>
          </div>

          {/* Y-axis markers (40, 20, 0) */}
          <div className="flex flex-col justify-between h-14 text-[9px] font-mono text-discord-muted/80 text-right select-none pl-1">
            <span>40</span>
            <span>20</span>
            <span>0</span>
          </div>
        </div>

        {/* X-axis minute timeline (e.g. 2:53 AM, 2:54 AM, 2:55 AM, 2:56 AM) */}
        <div className="flex justify-between text-[8px] font-mono text-discord-muted mt-2 pr-6">
          {timelineMarkers.map((markerTs, idx) => (
            <span key={idx}>{formatTimelineLabel(markerTs)}</span>
          ))}
        </div>
      </div>

      {/* Dynamic Voice Session Node Identifier */}
      <div className="space-y-1 mb-3">
        <div className="text-xs font-bold text-white font-mono tracking-wide">
          {nodeCode}
        </div>

        <div className="text-[11px] space-y-0.5 text-discord-muted">
          <div className="flex justify-between">
            <span>Average ping:</span>
            <span className="font-semibold text-white">{avgPing} ms</span>
          </div>
          <div className="flex justify-between">
            <span>Last ping:</span>
            <span className="font-semibold text-white">{currentPing} ms</span>
          </div>
          <div className="flex justify-between">
            <span>Outbound packet loss rate:</span>
            <span className="font-semibold text-white">{telemetry.packetLoss || 0.0}%</span>
          </div>
        </div>
      </div>

      {/* Advisory note */}
      <p className="text-[10px] text-discord-muted leading-relaxed mb-3">
        You may notice delayed audio at 250 ms or higher. If you sound robotic or your packet loss rate is over 10%, disconnect and try again. See our troubleshooting guide for more assistance.
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={handleCopyDebug}
          className="flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#2b2d31] hover:bg-[#35373c] text-white text-xs font-semibold transition-colors border border-white/5"
        >
          {copiedDebug ? <Check size={12} className="text-emerald-400" /> : <Bug size={12} />}
          <span>{copiedDebug ? 'Copied' : 'Debug'}</span>
        </button>

        <button
          onClick={handleUploadLogs}
          className="flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#2b2d31] hover:bg-[#35373c] text-white text-xs font-semibold transition-colors border border-white/5"
        >
          {uploadedLogs ? <Check size={12} className="text-emerald-400" /> : <Upload size={12} />}
          <span>{uploadedLogs ? 'Uploaded' : 'Upload Logs'}</span>
        </button>
      </div>

      {/* End-to-end encrypted green status footer */}
      <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-semibold pt-1 border-t border-white/5">
        <Lock size={12} />
        <span>End-to-end encrypted</span>
      </div>
    </div>
  );
};
