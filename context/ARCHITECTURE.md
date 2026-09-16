# Technical Architecture

## 1. System Topology

```
+---------------------------------------------------------------------------------+
|                                 SYNCORA CLIENT                                  |
|                                                                                 |
|  +----------------+  +-------------------+  +--------------------------------+  |
|  | SpaceRail      |  | ChannelSidebar    |  | Main Dynamic Viewport          |  |
|  | - Sanctuary SYN |  | - Text Channels   |  | - ChatContainer                |  |
|  | - Room Pill    |  | - Voice Channels  |  | - VoiceStage                   |  |
|  | - Telemetry    |  | - Activities      |  | - WatchTogether (Cinema)       |  |
|  | - Burn Trigger |  | - Voice Connected |  | - CodeSandbox (IDE)            |  |
|  |                |  | - User Bar        |  | - DuoTodoList (Tasks)          |  |
|  +----------------+  +-------------------+  +--------------------------------+  |
|                                                                                 |
|  [ SocketContext ] <---------------------> [ WebRTCContext ]                    |
|  - Room State & Multi-Channel              - RTCPeerConnection                  |
|  - Real-time Socket.IO Events              - Web Audio Analyser (Voice Halos)   |
|  - Ephemeral Message Store                 - Local & Remote Media Streams       |
+---------------------------------------------------------------------------------+
                                      |
                       WebSocket / Signaling / REST
                                      |
+---------------------------------------------------------------------------------+
|                                 SYNCORA SERVER                                  |
|                                                                                 |
|  [ Express API ]                           [ Socket.IO Server ]                 |
|  - POST /api/rooms                         - chat:message (multi-channel)       |
|  - GET /api/rooms/:code                    - voice:join-channel / leave-channel |
|  - POST /api/upload (ephemeral)            - webrtc:signal / camera-state       |
|                                            - code:sync & run-sync               |
|                                            - media:sync & action                |
|                                            - burn:start / execute               |
|                                                                                 |
|  [ In-Memory RoomManager ]                                                      |
|  - Map<roomCode, RoomObject>                                                    |
|  - Map<socketId, roomCode>                                                      |
|  - Zero Persistent Disk DB (Pure Ephemeral RAM)                                 |
+---------------------------------------------------------------------------------+
```

---

## 2. Client-Side Context Architecture

### `SocketContext.jsx`
The primary state hub for application-level data and socket events:
- `room`: Active room configuration (`code`, `name`, `theme`, `channels`, `members`).
- `currentUser` / `allMembers`: Current user info and full list of space members.
- `activeChannelId`: Active view ID (e.g. `'general'`, `'lounge-voice'`, `'watch-party'`).
- `activeVoiceChannel`: Active voice lounge ID (`'lounge-voice'` | `'focus-room'` | `null`).
- `voiceParticipants`: Map of connected socket IDs per voice channel.
- `messagesByChannel`: Segmented message dictionary keyed by channel ID.
- `typingUsers`: Map of currently typing usernames per channel.
- `mediaState`, `codeDoc`, `terminalOutput`, `tasks`: Synced app activity states.

### `WebRTCContext.jsx`
The low-latency real-time voice, video, and screen-sharing engine:
- `RTCPeerConnection`: Handles audio, camera video, and screen share RTP streams.
- `voiceSessionNode`: Dynamically generated voice cluster ID (e.g. `c-bom01-2adc16d8`).
- `connectedAtTimestamp`: Exact timestamp when voice connected (for dynamic sparkline).
- `isCameraOn` / `localCameraStream`: Webcam capture stream and toggle.
- `isScreenSharing` / `localScreenStream`: Display media capture stream with self-preview.
- `localAudioLevel` / `remoteAudioLevel`: Real-time 0–100% volume metrics from `AnalyserNode` for the green speaking halo (`speaking-ring`).
- `telemetry`: Round-trip time (RTT), Opus bitrate, packet loss, and ICE connection state.

---

## 3. Server-Side Architecture

### `roomManager.js`
The ephemeral registry storing all active spaces in RAM:
- Room codes follow the prefix `SYN-XXXX` (random 4-character alphanumeric uppercase).
- Expanded from legacy 2-member limit to **25 members** per room.
- Automatically initializes default Discord channels:
  - Text: `general`, `ideas`, `music-media`
  - Voice: `lounge-voice`, `focus-room`
  - Activities: `watch-party`, `code-sandbox`, `tasks`
- Manages `voiceParticipants` lists to ensure accurate member presence.

### `socketHandler.js`
The event router:
- Handles channel-aware messaging with `replyTo` metadata support.
- Broadcasts voice join/leave presence changes across all clients in the room.
- Routes WebRTC signaling messages (`offer`, `answer`, `candidate`, `camera-state`, `screenshare-state`).
- Coordinates 10-second synchronized Burn countdown and room destruction.

