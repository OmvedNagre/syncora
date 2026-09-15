import { roomManager } from '../services/roomManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    // console.log(`Socket connected: ${socket.id}`);

    // Join Room
    socket.on('room:join', ({ roomCode, name, pin, publicKey }, callback) => {
      const result = roomManager.joinRoom(roomCode, {
        socketId: socket.id,
        name,
        pin,
        publicKey
      });

      if (!result.success) {
        return callback && callback({ success: false, error: result.error });
      }

      const { room, member } = result;
      socket.join(room.code);

      // Find partner if present
      const partner = room.members.find(m => m.socketId !== socket.id) || null;

      // Send ack to joiner
      callback && callback({
        success: true,
        room: {
          code: room.code,
          name: room.name,
          theme: room.theme,
          channels: room.channels,
          members: room.members,
          messages: room.messages,
          messagesByChannel: room.messagesByChannel || { general: room.messages },
          voiceParticipants: room.voiceParticipants || {},
          tasks: room.tasks,
          codeSnippet: room.codeSnippet,
          scheduledCalls: room.scheduledCalls,
          mediaState: room.mediaState
        },
        currentMember: member,
        partner
      });

      // Notify all members in space
      socket.to(room.code).emit('partner:joined', {
        partner: member,
        allMembers: room.members
      });
      io.to(room.code).emit('members:updated', {
        members: room.members
      });
    });

    // Member activity broadcast (e.g. "Watching Stream", "In Sandbox")
    socket.on('member:activity', ({ activity }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      const mem = room.members.find(m => m.socketId === socket.id);
      if (mem) {
        mem.activity = activity;
        io.to(room.code).emit('members:updated', { members: room.members });
      }
    });

    // Voice Channel Participation
    socket.on('voice:join-channel', ({ channelId }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      if (!room.voiceParticipants) room.voiceParticipants = {};
      if (!room.voiceParticipants[channelId]) room.voiceParticipants[channelId] = [];

      // Remove from any other voice channel first
      for (const ch of Object.keys(room.voiceParticipants)) {
        room.voiceParticipants[ch] = room.voiceParticipants[ch].filter(id => id !== socket.id);
      }

      if (!room.voiceParticipants[channelId].includes(socket.id)) {
        room.voiceParticipants[channelId].push(socket.id);
      }

      io.to(room.code).emit('voice:participants-updated', {
        channelId,
        voiceParticipants: room.voiceParticipants
      });
    });

    socket.on('voice:leave-channel', ({ channelId }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room || !room.voiceParticipants) return;

      if (channelId && room.voiceParticipants[channelId]) {
        room.voiceParticipants[channelId] = room.voiceParticipants[channelId].filter(id => id !== socket.id);
      } else {
        for (const ch of Object.keys(room.voiceParticipants)) {
          room.voiceParticipants[ch] = room.voiceParticipants[ch].filter(id => id !== socket.id);
        }
      }

      io.to(room.code).emit('voice:participants-updated', {
        channelId,
        voiceParticipants: room.voiceParticipants
      });
    });

    // Chat Message (Encrypted payload or plain, channel-aware)
    socket.on('chat:message', (messageData) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room || room.burned) return;

      const channelId = messageData.channelId || 'general';
      const sender = room.members.find(m => m.socketId === socket.id);
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        channelId,
        senderId: socket.id,
        senderName: sender ? sender.name : 'Unknown',
        senderRole: sender ? sender.role : 'member',
        senderColor: sender ? sender.color : '#5865F2',
        timestamp: Date.now(),
        reactions: {},
        ...messageData
      };

      if (!room.messagesByChannel) room.messagesByChannel = {};
      if (!room.messagesByChannel[channelId]) room.messagesByChannel[channelId] = [];
      room.messagesByChannel[channelId].push(message);
      if (room.messagesByChannel[channelId].length > 200) room.messagesByChannel[channelId].shift();

      // Legacy compatibility
      room.messages.push(message);
      if (room.messages.length > 200) room.messages.shift();

      io.to(room.code).emit('chat:message', message);
    });

    // Chat Typing Indicator
    socket.on('chat:typing', ({ isTyping, channelId = 'general' }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      const sender = room.members.find(m => m.socketId === socket.id);
      socket.to(room.code).emit('chat:typing', {
        isTyping,
        channelId,
        senderId: socket.id,
        senderName: sender ? sender.name : 'A member'
      });
    });

    // Chat Message Reaction
    socket.on('chat:reaction', ({ messageId, emoji, channelId = 'general' }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;

      const channelMsgs = room.messagesByChannel?.[channelId] || room.messages;
      const message = channelMsgs.find(m => m.id === messageId);
      if (message) {
        if (!message.reactions[emoji]) {
          message.reactions[emoji] = [];
        }
        const userIndex = message.reactions[emoji].indexOf(socket.id);
        if (userIndex === -1) {
          message.reactions[emoji].push(socket.id);
        } else {
          message.reactions[emoji].splice(userIndex, 1);
          if (message.reactions[emoji].length === 0) {
            delete message.reactions[emoji];
          }
        }
        io.to(room.code).emit('chat:reaction-updated', {
          messageId,
          channelId,
          reactions: message.reactions
        });
      }
    });

    // WebRTC: Request Voice / Video Call
    socket.on('webrtc:call-request', ({ withVideo = false }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      const caller = room.members.find(m => m.socketId === socket.id);
      socket.to(room.code).emit('webrtc:incoming-call', {
        callerId: socket.id,
        callerName: caller ? caller.name : 'Partner',
        withVideo
      });
    });

    // WebRTC: Accept Incoming Call
    socket.on('webrtc:call-accept', () => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      socket.to(room.code).emit('webrtc:call-accepted', {
        acceptorId: socket.id
      });
    });

    // WebRTC: Decline Call
    socket.on('webrtc:call-decline', () => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      socket.to(room.code).emit('webrtc:call-declined', {
        declinerId: socket.id
      });
    });

    // WebRTC: End Call
    socket.on('webrtc:call-end', () => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      io.to(room.code).emit('webrtc:call-ended');
    });

    // WebRTC Signaling: SDP Offer / Answer / ICE Candidates
    socket.on('webrtc:signal', (payload) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      // Forward signaling payload directly to partner
      socket.to(room.code).emit('webrtc:signal', {
        ...payload,
        senderId: socket.id
      });
    });

    // WebRTC Camera State
    socket.on('webrtc:camera-state', ({ isCameraOn }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      socket.to(room.code).emit('webrtc:camera-state', {
        senderId: socket.id,
        isCameraOn
      });
    });

    // WebRTC Screen share State
    socket.on('webrtc:screenshare-state', ({ isScreenSharing }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      socket.to(room.code).emit('webrtc:screenshare-state', {
        senderId: socket.id,
        isScreenSharing
      });
    });

    // Synchronized Media Player
    socket.on('media:action', (actionData) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;

      room.mediaState = {
        ...room.mediaState,
        ...actionData,
        updatedAt: Date.now(),
        sender: socket.id
      };

      // Broadcast to partner
      socket.to(room.code).emit('media:sync', room.mediaState);
    });

    // Collaborative Code Sandbox Sync
    socket.on('code:change', ({ code, language }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;

      room.codeSnippet = { code, language };
      socket.to(room.code).emit('code:sync', {
        code,
        language,
        senderId: socket.id
      });
    });

    // Code Cursor Position Sync
    socket.on('code:cursor', (cursorPos) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      socket.to(room.code).emit('code:cursor-sync', {
        ...cursorPos,
        senderId: socket.id
      });
    });

    // Code Execution Run Trigger (Sync terminal output to both partners)
    socket.on('code:run-output', (outputData) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      io.to(room.code).emit('code:run-sync', outputData);
    });

    // Duo To-Do List Sync
    socket.on('todo:update', (tasks) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      room.tasks = tasks;
      socket.to(room.code).emit('todo:sync', tasks);
    });

    // Call Scheduling Sync
    socket.on('call:schedule', (callData) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      const scheduledItem = {
        id: `sch_${Date.now()}`,
        ...callData,
        createdBy: socket.id,
        createdAt: Date.now()
      };
      room.scheduledCalls.push(scheduledItem);
      io.to(room.code).emit('call:scheduled-list', room.scheduledCalls);
    });

    // 🔥 Burn Room Protocol: Start 10s Countdown
    socket.on('burn:start', () => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      const initiator = room.members.find(m => m.socketId === socket.id);
      io.to(room.code).emit('burn:countdown-start', {
        initiatedBy: initiator ? initiator.name : 'Partner',
        countdownSeconds: 10
      });
    });

    // 🔥 Burn Room Protocol: Abort/Cancel Countdown
    socket.on('burn:cancel', () => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;
      io.to(room.code).emit('burn:countdown-cancelled');
    });

    // 🔥 Burn Room Protocol: Final Execution & Purge
    socket.on('burn:execute', () => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) return;

      const roomCode = room.code;
      // Broadcast destruction event
      io.to(roomCode).emit('burn:destroyed');

      // Purge all memory & ephemeral files
      roomManager.burnRoom(roomCode, uploadsDir);
    });

    // Disconnect Handling
    socket.on('disconnect', () => {
      const result = roomManager.leaveRoom(socket.id);
      if (result && result.room) {
        socket.to(result.room.code).emit('partner:left', {
          departingMember: result.departingMember,
          remainingMembers: result.room.members
        });
        io.to(result.room.code).emit('members:updated', {
          members: result.room.members
        });
        io.to(result.room.code).emit('voice:participants-updated', {
          voiceParticipants: result.room.voiceParticipants || {}
        });
      }
    });
  });
}
