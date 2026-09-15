import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSocket } from './SocketContext';
import { soundEffects } from '../utils/soundEffects';

const WebRTCContext = createContext(null);

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export const WebRTCProvider = ({ children }) => {
  const { socket, room, currentUser, partner, activeVoiceChannel } = useSocket();

  // Call status: 'idle' | 'calling' | 'incoming' | 'connected'
  const [callStatus, setCallStatus] = useState('idle');
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [voiceSessionNode, setVoiceSessionNode] = useState('');
  const [connectedAtTimestamp, setConnectedAtTimestamp] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Audio visualizer frequency data
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState(0);

  // Audio Devices
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('');

  // Live Telemetry Stats (Engineering HUD)
  const [telemetry, setTelemetry] = useState({
    rtt: 0,
    audioBitrate: 0,
    packetLoss: 0,
    iceState: 'disconnected',
    candidateType: 'direct / stun'
  });

  // Streams
  const [remoteScreenStream, setRemoteScreenStream] = useState(null);
  const [localScreenStream, setLocalScreenStream] = useState(null);
  const [remoteCameraStream, setRemoteCameraStream] = useState(null);
  const [localCameraStream, setLocalCameraStream] = useState(null);
  const [remoteCameraActive, setRemoteCameraActive] = useState(false);
  const [remoteScreenActive, setRemoteScreenActive] = useState(false);

  // Refs
  const peerConnRef = useRef(null);
  const localStreamRef = useRef(null);
  const localCameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const durationTimerRef = useRef(null);
  const statsTimerRef = useRef(null);

  // Audio Context & Analyser nodes
  const audioCtxRef = useRef(null);
  const localAnalyserRef = useRef(null);
  const remoteAnalyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Refresh audio device list
  const refreshAudioDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter(d => d.kind === 'audioinput');
      const outputs = devices.filter(d => d.kind === 'audiooutput');
      setAudioInputDevices(inputs);
      setAudioOutputDevices(outputs);
      if (inputs.length > 0 && !selectedAudioInput) {
        setSelectedAudioInput(inputs[0].deviceId);
      }
      if (outputs.length > 0 && !selectedAudioOutput) {
        setSelectedAudioOutput(outputs[0].deviceId);
      }
    } catch (e) {
      console.warn('enumerateDevices warning:', e);
    }
  };

  // Automatically connect audio, request mic permissions, and start timer when joining a voice channel
  useEffect(() => {
    if (activeVoiceChannel) {
      const cluster = Math.floor(Math.random() * 8 + 1).toString().padStart(2, '0');
      const hexSession = Math.random().toString(16).substring(2, 10);
      setVoiceSessionNode(`c-bom${cluster}-${hexSession}`);
      setConnectedAtTimestamp(Date.now());
      setCallStatus('connected');
      startCallTimer();
      initVoiceAudio();
    } else {
      setVoiceSessionNode('');
      setConnectedAtTimestamp(null);
      cleanupCall();
      setCallStatus('idle');
    }
  }, [activeVoiceChannel]);

  // Initialize WebRTC socket listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming call request
    socket.on('webrtc:incoming-call', ({ callerId, callerName, withVideo }) => {
      setIncomingCallData({ callerId, callerName, withVideo });
      setCallStatus('incoming');
      soundEffects.startIncomingRingtone();
    });

    // Caller receives acceptance -> initiate Offer
    socket.on('webrtc:call-accepted', async () => {
      soundEffects.playCallConnected();
      setCallStatus('connected');
      startCallTimer();
      await initiatePeerOffer();
    });

    // Callee declined
    socket.on('webrtc:call-declined', () => {
      soundEffects.stopIncomingRingtone();
      soundEffects.playCallEnded();
      cleanupCall();
      setCallStatus('idle');
    });

    // Partner ended call
    socket.on('webrtc:call-ended', () => {
      soundEffects.playCallEnded();
      cleanupCall();
      setCallStatus('idle');
    });

    // Camera state changes from remote peers
    socket.on('webrtc:camera-state', ({ isCameraOn }) => {
      setRemoteCameraActive(isCameraOn);
      if (!isCameraOn) {
        setRemoteCameraStream(null);
      }
    });

    // Screen sharing notifications from remote peers
    socket.on('webrtc:screenshare-state', ({ isScreenSharing }) => {
      setRemoteScreenActive(isScreenSharing);
      if (!isScreenSharing) {
        setRemoteScreenStream(null);
      }
    });

    // WebRTC Signaling messages
    socket.on('webrtc:signal', async (data) => {
      const { type, candidate, sdp } = data;

      if (type === 'offer') {
        await handleReceiveOffer(sdp);
      } else if (type === 'answer') {
        await handleReceiveAnswer(sdp);
      } else if (type === 'candidate' && candidate) {
        if (peerConnRef.current) {
          try {
            await peerConnRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      }
    });

    return () => {
      socket.off('webrtc:incoming-call');
      socket.off('webrtc:call-accepted');
      socket.off('webrtc:call-declined');
      socket.off('webrtc:call-ended');
      socket.off('webrtc:camera-state');
      socket.off('webrtc:screenshare-state');
      socket.off('webrtc:signal');
    };
  }, [socket]);

  // Create or retrieve RTCPeerConnection
  const getOrCreatePeerConnection = () => {
    if (peerConnRef.current) return peerConnRef.current;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc:signal', {
          type: 'candidate',
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      setTelemetry(prev => ({ ...prev, iceState: pc.connectionState }));
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteStream) return;

      if (event.track.kind === 'audio') {
        setupRemoteAudioAnalyser(remoteStream);
        const remoteAudioEl = new Audio();
        remoteAudioEl.srcObject = remoteStream;
        remoteAudioEl.autoplay = true;
      } else if (event.track.kind === 'video') {
        // Track whether this is screen or camera
        if (remoteScreenActive) {
          setRemoteScreenStream(remoteStream);
        } else {
          setRemoteCameraStream(remoteStream);
        }
      }
    };

    peerConnRef.current = pc;
    startStatsMonitoring(pc);
    return pc;
  };

  // Setup local audio analyser for speaking ring
  const setupLocalAudioAnalyser = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      localAnalyserRef.current = analyser;

      startAudioVisualizerLoop();
    } catch (e) {
      console.warn('Audio analyser setup:', e);
    }
  };

  // Setup remote audio analyser
  const setupRemoteAudioAnalyser = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      remoteAnalyserRef.current = analyser;
    } catch (e) {
      console.warn('Remote audio analyser setup:', e);
    }
  };

  const startAudioVisualizerLoop = () => {
    if (animationFrameRef.current) return;

    const dataArray = new Uint8Array(32);
    const updateLevels = () => {
      if (localAnalyserRef.current) {
        localAnalyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
        setLocalAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
      }
      if (remoteAnalyserRef.current) {
        remoteAnalyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
        setRemoteAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
      }
      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();
  };

  // Start Call Timer (Ticks every 1 second)
  const startCallTimer = () => {
    setCallDuration(0);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    durationTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Initialize Voice Audio and prompt for browser permissions
  const initVoiceAudio = async (preferredDeviceId) => {
    try {
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      };

      if (preferredDeviceId) {
        audioConstraints.deviceId = { exact: preferredDeviceId };
      }

      // This requests microphone permission from the browser
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false
      });

      localStreamRef.current = stream;
      setupLocalAudioAnalyser(stream);
      await refreshAudioDevices();

      const pc = getOrCreatePeerConnection();
      stream.getTracks().forEach(track => {
        const senders = pc.getSenders();
        const existing = senders.find(s => s.track && s.track.kind === 'audio');
        if (existing) {
          existing.replaceTrack(track);
        } else {
          pc.addTrack(track, stream);
        }
      });

      // If other peers in room, send offer
      if (partner) {
        await initiatePeerOffer();
      }
    } catch (err) {
      console.warn('Microphone permission request:', err);
    }
  };

  // Toggle Camera / Video Calling
  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn off camera
      if (localCameraStreamRef.current) {
        localCameraStreamRef.current.getTracks().forEach(t => t.stop());
        localCameraStreamRef.current = null;
      }
      setLocalCameraStream(null);
      setIsCameraOn(false);

      if (socket && room) {
        socket.emit('webrtc:camera-state', { isCameraOn: false });
      }

      // Stop video track in PC if active
      if (peerConnRef.current) {
        const videoSender = peerConnRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          peerConnRef.current.removeTrack(videoSender);
        }
      }
    } else {
      // Turn on camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        localCameraStreamRef.current = stream;
        setLocalCameraStream(stream);
        setIsCameraOn(true);

        const videoTrack = stream.getVideoTracks()[0];
        const pc = getOrCreatePeerConnection();
        const senders = pc.getSenders();
        const existingSender = senders.find(s => s.track && s.track.kind === 'video');

        if (existingSender) {
          existingSender.replaceTrack(videoTrack);
        } else {
          pc.addTrack(videoTrack, stream);
        }

        if (socket && room) {
          socket.emit('webrtc:camera-state', { isCameraOn: true });
        }

        videoTrack.onended = () => {
          setIsCameraOn(false);
          setLocalCameraStream(null);
          localCameraStreamRef.current = null;
          if (socket && room) {
            socket.emit('webrtc:camera-state', { isCameraOn: false });
          }
        };

        if (partner) {
          await initiatePeerOffer();
        }
      } catch (err) {
        console.warn('Camera access denied or failed:', err);
        alert('Could not access camera: ' + err.message);
      }
    }
  };

  // Change input microphone device
  const changeAudioInput = async (deviceId) => {
    setSelectedAudioInput(deviceId);
    await initVoiceAudio(deviceId);
  };

  // Change output headphones/speakers
  const changeAudioOutput = async (deviceId) => {
    setSelectedAudioOutput(deviceId);
  };

  // Telemetry Monitor (RTT, Bitrate, Loss)
  const startStatsMonitoring = (pc) => {
    if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    let prevBytes = 0;
    let prevTimestamp = Date.now();

    statsTimerRef.current = setInterval(async () => {
      if (!pc || pc.connectionState !== 'connected') return;

      try {
        const stats = await pc.getStats();
        let currentRtt = 22;
        let currentBitrate = 32;
        let currentLoss = 0;

        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.currentRoundTripTime) {
            currentRtt = Math.round(report.currentRoundTripTime * 1000);
          }
          if (report.type === 'inbound-rtp' && report.kind === 'audio') {
            const now = Date.now();
            const timeDiff = (now - prevTimestamp) / 1000;
            if (timeDiff > 0 && report.bytesReceived) {
              const byteDiff = report.bytesReceived - prevBytes;
              currentBitrate = Math.round((byteDiff * 8) / (timeDiff * 1000));
              prevBytes = report.bytesReceived;
              prevTimestamp = now;
            }
            if (report.packetsLost && report.packetsReceived) {
              currentLoss = Math.round((report.packetsLost / (report.packetsLost + report.packetsReceived)) * 100);
            }
          }
        });

        setTelemetry({
          rtt: currentRtt || 18,
          audioBitrate: Math.max(16, currentBitrate || 32),
          packetLoss: currentLoss,
          iceState: pc.connectionState,
          candidateType: 'P2P STUN'
        });
      } catch (e) {}
    }, 1500);
  };

  // Action: Request Voice Call (1-on-1 manual ringing)
  const requestCall = async () => {
    if (!socket || !partner) return;

    try {
      await initVoiceAudio();
      setCallStatus('calling');
      socket.emit('webrtc:call-request', { withVideo: false });
    } catch (err) {
      alert('Microphone access required to make a voice call: ' + err.message);
    }
  };

  // Action: Accept Incoming Call
  const acceptCall = async () => {
    soundEffects.stopIncomingRingtone();
    soundEffects.playCallConnected();

    try {
      await initVoiceAudio();
      setCallStatus('connected');
      startCallTimer();

      if (socket) {
        socket.emit('webrtc:call-accept');
      }
    } catch (err) {
      alert('Microphone access required to accept voice call: ' + err.message);
      declineCall();
    }
  };

  // Action: Decline Call
  const declineCall = () => {
    soundEffects.stopIncomingRingtone();
    if (socket) {
      socket.emit('webrtc:call-decline');
    }
    setCallStatus('idle');
    setIncomingCallData(null);
  };

  // Initiate SDP Offer
  const initiatePeerOffer = async () => {
    const pc = getOrCreatePeerConnection();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc:signal', {
        type: 'offer',
        sdp: offer
      });
    } catch (err) {
      console.error('Failed to create offer:', err);
    }
  };

  // Handle Received Offer
  const handleReceiveOffer = async (offerSdp) => {
    const pc = getOrCreatePeerConnection();
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc:signal', {
        type: 'answer',
        sdp: answer
      });
    } catch (err) {
      console.error('Failed to handle offer:', err);
    }
  };

  // Handle Received Answer
  const handleReceiveAnswer = async (answerSdp) => {
    const pc = peerConnRef.current;
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
      } catch (err) {
        console.error('Failed to handle answer:', err);
      }
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    } else {
      setIsMuted(prev => !prev);
    }
  };

  // Toggle Deafen
  const toggleDeafen = () => {
    setIsDeafened(prev => !prev);
  };

  // Toggle Screen Sharing (Discord-style: local screen preview + remote broadcast)
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setLocalScreenStream(null);
      setIsScreenSharing(false);

      if (socket && room) {
        socket.emit('webrtc:screenshare-state', { isScreenSharing: false });
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            frameRate: 30
          },
          audio: true
        });

        screenStreamRef.current = stream;
        setLocalScreenStream(stream);
        setIsScreenSharing(true);

        const videoTrack = stream.getVideoTracks()[0];
        const pc = getOrCreatePeerConnection();
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');

        if (sender) {
          sender.replaceTrack(videoTrack);
        } else {
          pc.addTrack(videoTrack, stream);
        }

        if (socket && room) {
          socket.emit('webrtc:screenshare-state', { isScreenSharing: true });
        }

        videoTrack.onended = () => {
          setIsScreenSharing(false);
          setLocalScreenStream(null);
          screenStreamRef.current = null;
          if (socket && room) {
            socket.emit('webrtc:screenshare-state', { isScreenSharing: false });
          }
        };
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    }
  };

  // Clean up all call streams and peer connection
  const cleanupCall = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localCameraStreamRef.current) {
      localCameraStreamRef.current.getTracks().forEach(t => t.stop());
      localCameraStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (peerConnRef.current) {
      peerConnRef.current.close();
      peerConnRef.current = null;
    }

    setIncomingCallData(null);
    setRemoteScreenStream(null);
    setLocalScreenStream(null);
    setRemoteCameraStream(null);
    setLocalCameraStream(null);
    setIsCameraOn(false);
    setIsScreenSharing(false);
    setCallDuration(0);
    setLocalAudioLevel(0);
    setRemoteAudioLevel(0);
    setVoiceSessionNode('');
    setConnectedAtTimestamp(null);
  };

  // End Call
  const endCall = () => {
    soundEffects.playCallEnded();
    if (socket) {
      socket.emit('webrtc:call-end');
    }
    cleanupCall();
    setCallStatus('idle');
  };

  return (
    <WebRTCContext.Provider
      value={{
        callStatus,
        incomingCallData,
        voiceSessionNode,
        connectedAtTimestamp,
        isMuted,
        isDeafened,
        isScreenSharing,
        isCameraOn,
        callDuration,
        localAudioLevel,
        remoteAudioLevel,
        telemetry,
        remoteScreenStream,
        localScreenStream,
        remoteCameraStream,
        localCameraStream,
        remoteCameraActive,
        audioInputDevices,
        audioOutputDevices,
        selectedAudioInput,
        selectedAudioOutput,
        changeAudioInput,
        changeAudioOutput,
        refreshAudioDevices,
        requestCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleDeafen,
        toggleCamera,
        toggleScreenShare
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
