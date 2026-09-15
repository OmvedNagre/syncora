import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { soundEffects } from '../utils/soundEffects';

const SocketContext = createContext(null);

const DEFAULT_CHANNELS = [
  { id: 'general', name: 'general', type: 'text', topic: 'General discussion and hangout' },
  { id: 'ideas', name: 'ideas-and-links', type: 'text', topic: 'Brainstorms, links, and snippets' },
  { id: 'music-media', name: 'music-jam', type: 'text', topic: 'Share beats, tracks, and media' },
  { id: 'lounge-voice', name: 'Lounge Voice', type: 'voice', topic: 'Open drop-in voice & video lounge' },
  { id: 'focus-room', name: 'Focus Pod', type: 'voice', topic: 'Deep work & quiet co-working' },
  { id: 'watch-party', name: 'Watch Party', type: 'activity', subType: 'media', topic: 'Synchronized cinema & video streaming' },
  { id: 'code-sandbox', name: 'Pair Sandbox', type: 'activity', subType: 'code', topic: 'Real-time collaborative code workspace' },
  { id: 'tasks', name: 'Tasks & Sprints', type: 'activity', subType: 'todo', topic: 'Shared team checklist and sprints' }
];

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [allMembers, setAllMembers] = useState([]);

  // Channels & Navigation
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('general');
  const [activeVoiceChannel, setActiveVoiceChannel] = useState(null);
  const [voiceParticipants, setVoiceParticipants] = useState({});

  // Real-time Chat state: messages organized by channel
  const [messagesByChannel, setMessagesByChannel] = useState({
    general: [],
    ideas: [],
    'music-media': []
  });
  const [messages, setMessages] = useState([]); // active channel messages mirror
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { [channelId]: senderName }

  // Collaborative Code Sandbox state
  const [codeDoc, setCodeDoc] = useState({
    code: `// Welcome to DuoSpace v2 Collaborative Sandbox\n// Low latency, live collaborative editing & execution.\n\nfunction launchSanctuary() {\n  return "✨ DuoSpace v2 is online!";\n}\n\nconsole.log(launchSanctuary());\n`,
    language: 'javascript'
  });
  const [terminalOutput, setTerminalOutput] = useState(null);

  // Media sync state
  const [mediaState, setMediaState] = useState({
    type: 'youtube',
    videoId: 'jfKfPfyJRdk',
    isPlaying: false,
    currentTime: 0,
    updatedAt: Date.now()
  });

  // Duo Tasks state
  const [tasks, setTasks] = useState([]);

  // Scheduled Calls state
  const [scheduledCalls, setScheduledCalls] = useState([]);

  // Room Burn state
  const [burnState, setBurnState] = useState({
    isCountingDown: false,
    initiatedBy: '',
    secondsRemaining: 10,
    isBurned: false
  });

  const burnTimerRef = useRef(null);

  useEffect(() => {
    const newSocket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Update current messages view when active channel changes or messagesByChannel updates
  useEffect(() => {
    const currentList = messagesByChannel[activeChannelId] || [];
    setMessages(currentList);
  }, [activeChannelId, messagesByChannel]);

  // Set up listeners once socket is connected
  useEffect(() => {
    if (!socket) return;

    // Member Joined
    socket.on('partner:joined', ({ partner: newPartner, allMembers: updatedList }) => {
      setPartner(newPartner);
      if (updatedList) setAllMembers(updatedList);
      if (room) {
        setRoom(prev => prev ? { ...prev, members: updatedList || prev.members } : null);
      }
    });

    // Members list updated
    socket.on('members:updated', ({ members: updatedMembers }) => {
      setAllMembers(updatedMembers);
      if (room) {
        setRoom(prev => prev ? { ...prev, members: updatedMembers } : null);
      }
      const other = updatedMembers.find(m => m.socketId !== socket.id) || null;
      setPartner(other);
    });

    // Member Left
    socket.on('partner:left', ({ remainingMembers }) => {
      if (remainingMembers) {
        setAllMembers(remainingMembers);
        const other = remainingMembers.find(m => m.socketId !== socket.id) || null;
        setPartner(other);
      }
    });

    // Voice participants updated
    socket.on('voice:participants-updated', ({ voiceParticipants: vp }) => {
      if (vp) setVoiceParticipants(vp);
    });

    // Incoming Message (channel-aware)
    socket.on('chat:message', (message) => {
      const channelId = message.channelId || 'general';
      setMessagesByChannel(prev => {
        const existing = prev[channelId] || [];
        return {
          ...prev,
          [channelId]: [...existing, message]
        };
      });

      if (message.senderId !== socket.id) {
        soundEffects.playMessageChime();
      }
    });

    // Typing indicator
    socket.on('chat:typing', ({ isTyping, channelId = 'general', senderName }) => {
      setTypingUsers(prev => ({
        ...prev,
        [channelId]: isTyping ? senderName : null
      }));
      setPartnerTyping(isTyping);
    });

    // Reaction updated
    socket.on('chat:reaction-updated', ({ messageId, channelId = 'general', reactions }) => {
      setMessagesByChannel(prev => {
        const currentList = prev[channelId] || [];
        return {
          ...prev,
          [channelId]: currentList.map(m => m.id === messageId ? { ...m, reactions } : m)
        };
      });
    });

    // Code sync
    socket.on('code:sync', ({ code, language, senderId }) => {
      if (senderId !== socket.id) {
        setCodeDoc({ code, language });
      }
    });

    // Code execution terminal sync
    socket.on('code:run-sync', (outputData) => {
      setTerminalOutput(outputData);
    });

    // Media sync
    socket.on('media:sync', (newMediaState) => {
      setMediaState(newMediaState);
    });

    // Tasks sync
    socket.on('todo:sync', (updatedTasks) => {
      setTasks(updatedTasks);
    });

    // Scheduled calls sync
    socket.on('call:scheduled-list', (calls) => {
      setScheduledCalls(calls);
    });

    // Burn countdown started
    socket.on('burn:countdown-start', ({ initiatedBy, countdownSeconds }) => {
      soundEffects.startBurnAlarm();
      setBurnState({
        isCountingDown: true,
        initiatedBy,
        secondsRemaining: countdownSeconds,
        isBurned: false
      });

      let remaining = countdownSeconds;
      if (burnTimerRef.current) clearInterval(burnTimerRef.current);

      burnTimerRef.current = setInterval(() => {
        remaining -= 1;
        setBurnState(prev => ({ ...prev, secondsRemaining: remaining }));

        if (remaining <= 0) {
          clearInterval(burnTimerRef.current);
          socket.emit('burn:execute');
        }
      }, 1000);
    });

    // Burn cancelled
    socket.on('burn:countdown-cancelled', () => {
      soundEffects.stopBurnAlarm();
      if (burnTimerRef.current) clearInterval(burnTimerRef.current);
      setBurnState({
        isCountingDown: false,
        initiatedBy: '',
        secondsRemaining: 10,
        isBurned: false
      });
    });

    // Burn executed
    socket.on('burn:destroyed', () => {
      soundEffects.stopBurnAlarm();
      if (burnTimerRef.current) clearInterval(burnTimerRef.current);
      setBurnState({
        isCountingDown: false,
        initiatedBy: '',
        secondsRemaining: 0,
        isBurned: true
      });
      setMessagesByChannel({});
      setMessages([]);
      setTasks([]);
      setRoom(null);
    });

    return () => {
      socket.off('partner:joined');
      socket.off('members:updated');
      socket.off('partner:left');
      socket.off('voice:participants-updated');
      socket.off('chat:message');
      socket.off('chat:typing');
      socket.off('chat:reaction-updated');
      socket.off('code:sync');
      socket.off('code:run-sync');
      socket.off('media:sync');
      socket.off('todo:sync');
      socket.off('call:scheduled-list');
      socket.off('burn:countdown-start');
      socket.off('burn:countdown-cancelled');
      socket.off('burn:destroyed');
    };
  }, [socket, room]);

  // Join Room Action
  const joinRoom = async (roomCode, userName = '', pin = '') => {
    if (!socket) return { success: false, error: 'Socket not connected' };

    return new Promise((resolve) => {
      socket.emit(
        'room:join',
        {
          roomCode,
          name: userName,
          pin
        },
        (res) => {
          if (res.success) {
            setRoom(res.room);
            setCurrentUser(res.currentMember);
            setAllMembers(res.room.members || [res.currentMember]);
            if (res.room.channels) setChannels(res.room.channels);
            if (res.room.voiceParticipants) setVoiceParticipants(res.room.voiceParticipants);
            setTasks(res.room.tasks || []);
            setScheduledCalls(res.room.scheduledCalls || []);
            if (res.room.codeSnippet) setCodeDoc(res.room.codeSnippet);
            if (res.room.mediaState) setMediaState(res.room.mediaState);
            if (res.partner) setPartner(res.partner);

            // Channel messages initialization
            const initialMap = res.room.messagesByChannel || { general: res.room.messages || [] };
            setMessagesByChannel(initialMap);
            setMessages(initialMap['general'] || []);

            resolve({ success: true, room: res.room, user: res.currentMember });
          } else {
            resolve({ success: false, error: res.error });
          }
        }
      );
    });
  };

  // Switch Active Channel
  const switchChannel = (channelId) => {
    setActiveChannelId(channelId);
  };

  // Join Voice Channel
  const joinVoiceChannel = (channelId) => {
    soundEffects.playCallConnected();
    setActiveVoiceChannel(channelId);
    if (socket && room) {
      socket.emit('voice:join-channel', { channelId });
    }
  };

  // Leave Voice Channel
  const leaveVoiceChannel = (returnToText = true) => {
    soundEffects.playCallEnded();
    if (socket && room && activeVoiceChannel) {
      socket.emit('voice:leave-channel', { channelId: activeVoiceChannel });
    }
    setActiveVoiceChannel(null);
    if (returnToText && (activeChannelId === 'lounge-voice' || activeChannelId === 'focus-room')) {
      setActiveChannelId('general');
    }
  };

  // Update Member Activity
  const updateActivity = (activity) => {
    if (socket && room) {
      socket.emit('member:activity', { activity });
    }
  };

  // Send Message (Channel-aware with reply support)
  const sendMessage = ({ content = '', type = 'text', fileData = null, channelId = activeChannelId, replyTo = null }) => {
    if (!socket || !room) return;

    const payload = {
      channelId,
      type,
      fileData,
      content,
      replyTo
    };

    socket.emit('chat:message', payload);
  };

  // Typing
  const setTyping = (isTyping, channelId = activeChannelId) => {
    if (socket && room) {
      socket.emit('chat:typing', { isTyping, channelId });
    }
  };

  // Reaction
  const toggleReaction = (messageId, emoji, channelId = activeChannelId) => {
    if (socket && room) {
      socket.emit('chat:reaction', { messageId, emoji, channelId });
    }
  };

  // Code Update
  const updateCode = (code, language = codeDoc.language) => {
    setCodeDoc({ code, language });
    if (socket && room) {
      socket.emit('code:change', { code, language });
    }
  };

  // Code Run Broadcast
  const broadcastCodeOutput = (outputData) => {
    if (socket && room) {
      socket.emit('code:run-output', outputData);
    }
  };

  // Media Action (Play/Pause/Seek/Change)
  const updateMedia = (actionData) => {
    setMediaState(prev => ({ ...prev, ...actionData }));
    if (socket && room) {
      socket.emit('media:action', actionData);
    }
  };

  // Tasks Update
  const updateTasks = (newTasks) => {
    setTasks(newTasks);
    if (socket && room) {
      socket.emit('todo:update', newTasks);
    }
  };

  // Schedule Call
  const scheduleCall = (callData) => {
    if (socket && room) {
      socket.emit('call:schedule', callData);
    }
  };

  // Burn Room Actions
  const initiateBurn = () => {
    if (socket && room) {
      socket.emit('burn:start');
    }
  };

  const cancelBurn = () => {
    if (socket && room) {
      socket.emit('burn:cancel');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        room,
        currentUser,
        partner,
        allMembers,
        channels,
        activeChannelId,
        activeVoiceChannel,
        voiceParticipants,
        messagesByChannel,
        messages,
        partnerTyping,
        typingUsers,
        codeDoc,
        terminalOutput,
        mediaState,
        tasks,
        scheduledCalls,
        burnState,
        joinRoom,
        switchChannel,
        joinVoiceChannel,
        leaveVoiceChannel,
        updateActivity,
        sendMessage,
        setTyping,
        toggleReaction,
        updateCode,
        broadcastCodeOutput,
        updateMedia,
        updateTasks,
        scheduleCall,
        initiateBurn,
        cancelBurn
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
