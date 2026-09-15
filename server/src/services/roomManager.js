import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// In-memory Room State Registry
class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> RoomObject
    this.socketToRoom = new Map(); // socketId -> roomCode
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SYN-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom({ pin = '', creatorName = 'Founder', theme = 'midnight', spaceName = 'Syncora Sanctuary' }) {
    let roomCode = this.generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode();
    }

    const defaultChannels = [
      { id: 'general', name: 'general', type: 'text', topic: 'General discussion and hangout' },
      { id: 'ideas', name: 'ideas-and-links', type: 'text', topic: 'Brainstorms, links, and snippets' },
      { id: 'music-media', name: 'music-jam', type: 'text', topic: 'Share beats, tracks, and media' },
      { id: 'lounge-voice', name: 'Lounge Voice', type: 'voice', topic: 'Open drop-in voice & video lounge' },
      { id: 'focus-room', name: 'Focus Pod', type: 'voice', topic: 'Deep work & quiet co-working' },
      { id: 'watch-party', name: 'Watch Party', type: 'activity', subType: 'media', topic: 'Synchronized cinema & video streaming' },
      { id: 'code-sandbox', name: 'Pair Sandbox', type: 'activity', subType: 'code', topic: 'Real-time collaborative code workspace' },
      { id: 'tasks', name: 'Tasks & Sprints', type: 'activity', subType: 'todo', topic: 'Shared team checklist and sprints' }
    ];

    const room = {
      code: roomCode,
      name: spaceName,
      pin: pin ? String(pin).trim() : null,
      theme,
      createdAt: Date.now(),
      burned: false,
      maxMembers: 25,
      channels: defaultChannels,
      activeVoiceChannel: null,
      voiceParticipants: {
        'lounge-voice': [],
        'focus-room': []
      },
      members: [], // [ { socketId, peerId, name, role: 'owner' | 'member', color, avatar, publicKey, activity } ]
      messages: [], // legacy fallback
      messagesByChannel: {
        'general': [],
        'ideas': [],
        'music-media': []
      },
      files: [], // Ephemeral files metadata
      tasks: [
        { id: '1', title: 'Welcome to DuoSpace v2!', status: 'done', assignedTo: 'all', createdAt: Date.now() },
        { id: '2', title: 'Join Lounge Voice or test Screen Share', status: 'todo', assignedTo: 'all', createdAt: Date.now() },
        { id: '3', title: 'Start a Watch Party with synchronized stream', status: 'todo', assignedTo: 'all', createdAt: Date.now() }
      ],
      codeSnippet: {
        language: 'javascript',
        code: `// Welcome to DuoSpace v2 Collaborative Sandbox\n// Edit simultaneously with low latency and real-time execution.\n\nfunction launchSanctuary(team) {\n  return \`🚀 Ready to build something epic with \${team.length} creators!\`;\n}\n\nconsole.log(launchSanctuary(["Creator 1", "Creator 2"]));\n`
      },
      scheduledCalls: [],
      mediaState: {
        type: 'youtube',
        videoId: 'jfKfPfyJRdk', // Default relaxing lofi stream
        isPlaying: false,
        currentTime: 0,
        updatedAt: Date.now(),
        sender: null
      }
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(roomCode) {
    if (!roomCode) return null;
    return this.rooms.get(roomCode.toUpperCase().trim());
  }

  getRoomBySocket(socketId) {
    const code = this.socketToRoom.get(socketId);
    return code ? this.rooms.get(code) : null;
  }

  joinRoom(roomCode, { socketId, name, pin, publicKey }) {
    const code = roomCode?.toUpperCase()?.trim();
    const room = this.rooms.get(code);

    if (!room) {
      return { success: false, error: 'Space does not exist or has expired.' };
    }

    if (room.burned) {
      return { success: false, error: 'This Space has been burned and destroyed.' };
    }

    // Check PIN if room is protected
    if (room.pin && room.pin !== String(pin).trim()) {
      return { success: false, error: 'Invalid Space PIN.' };
    }

    // Check if socket already in room
    const existingIndex = room.members.findIndex(m => m.socketId === socketId);
    if (existingIndex !== -1) {
      room.members[existingIndex].name = name || room.members[existingIndex].name;
      if (publicKey) room.members[existingIndex].publicKey = publicKey;
      return { success: true, room, member: room.members[existingIndex] };
    }

    // Capacity check: small team spaces up to maxMembers (default 25)
    if (room.members.length >= (room.maxMembers || 25)) {
      return { success: false, error: 'Space is full (Maximum capacity reached).' };
    }

    const isFirstMember = room.members.length === 0;
    const role = isFirstMember ? 'owner' : 'member';
    
    // Distinct vibrant color palette
    const AVATAR_COLORS = [
      '#5865F2', // Discord Blurple
      '#06b6d4', // Cyan
      '#ec4899', // Pink
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#8b5cf6', // Violet
      '#3b82f6', // Blue
      '#f43f5e'  // Rose
    ];
    const color = AVATAR_COLORS[room.members.length % AVATAR_COLORS.length];

    const member = {
      socketId,
      peerId: socketId,
      name: name?.trim() || `Member ${room.members.length + 1}`,
      role, // 'owner' | 'member'
      color,
      publicKey: publicKey || null,
      joinedAt: Date.now(),
      status: 'online',
      activity: null // e.g. { type: 'chat', label: 'In #general' }
    };

    room.members.push(member);
    this.socketToRoom.set(socketId, code);

    return { success: true, room, member };
  }

  leaveRoom(socketId) {
    const code = this.socketToRoom.get(socketId);
    if (!code) return null;

    this.socketToRoom.delete(socketId);
    const room = this.rooms.get(code);
    if (!room) return null;

    const departingMember = room.members.find(m => m.socketId === socketId);
    room.members = room.members.filter(m => m.socketId !== socketId);

    // Also remove from any active voice participants
    if (room.voiceParticipants) {
      for (const chId of Object.keys(room.voiceParticipants)) {
        room.voiceParticipants[chId] = room.voiceParticipants[chId].filter(id => id !== socketId);
      }
    }

    // If owner left and there are other members, assign next member as owner
    if (departingMember?.role === 'owner' && room.members.length > 0) {
      room.members[0].role = 'owner';
    }

    return { room, departingMember };
  }

  burnRoom(roomCode, uploadsDir) {
    const code = roomCode?.toUpperCase()?.trim();
    const room = this.rooms.get(code);
    if (!room) return false;

    room.burned = true;

    // Purge ephemeral files associated with this room
    if (uploadsDir && Array.isArray(room.files)) {
      for (const file of room.files) {
        try {
          const filePath = path.join(uploadsDir, file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error(`Error deleting file ${file.filename}:`, err);
        }
      }
    }

    // Wipe room contents from memory
    room.messages = [];
    room.tasks = [];
    room.files = [];
    room.codeSnippet = { language: 'javascript', code: '' };
    room.scheduledCalls = [];

    // Remove from registry after a short delay so connected sockets can receive burn ack
    setTimeout(() => {
      this.rooms.delete(code);
    }, 15000);

    return true;
  }
}

export const roomManager = new RoomManager();
