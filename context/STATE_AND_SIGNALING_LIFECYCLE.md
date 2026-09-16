# State Management & Real-Time Signaling Lifecycle

This document provides an exhaustive breakdown of the state lifecycles, event contracts, and signaling mechanics powering Syncora.

---

## 1. Socket.IO Event Schema & Routing

All real-time coordination runs through `/server/src/socket/socketHandler.js` over an authenticated room socket namespace.

### Room & Member Events
| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `room:join` | Client → Server | `{ roomCode, user }` | Joins the ephemeral room roomCode. |
| `room:joined` | Server → Client | `{ room, currentUser }` | Hydrates initial room state, active members, and channels. |
| `room:member-joined` | Server → Broadcast | `{ user, allMembers }` | Notifies peers of a new entrant. |
| `room:member-left` | Server → Broadcast | `{ socketId, allMembers }` | Handles peer disconnection or navigation exit. |

### Multi-Channel Chat Events
| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `chat:message` | Client → Server | `{ channelId, text, replyTo, fileUrl, fileName, fileType }` | Dispatches message to a specific channel. |
| `chat:message` | Server → Room | `{ id, channelId, sender, text, replyTo, timestamp, reactions }` | Broadcasts new message to all channel subscribers. |
| `chat:typing` | Client → Server | `{ channelId, isTyping }` | Emits typing state indicator. |
| `chat:typing-update`| Server → Room | `{ channelId, typingUsers }` | Broadcasts typing users list for the active channel. |
| `chat:reaction` | Client → Server | `{ messageId, emoji, channelId }` | Adds or removes a reaction emoji. |

### Voice & WebRTC Signaling Events
| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `voice:join-channel` | Client → Server | `{ channelId }` | Joins a voice lounge (`lounge-voice` or `focus-room`). |
| `voice:leave-channel`| Client → Server | `{ channelId }` | Leaves the active voice lounge. |
| `voice:channel-update`| Server → Room | `{ voiceParticipants }` | Broadcasts voice presence map across all rooms. |
| `webrtc:signal` | Client ↔ Client | `{ targetSocketId, signal: { type, sdp, candidate } }` | Relays SDP offers, answers, and ICE candidates. |
| `webrtc:camera-state`| Client → Room | `{ channelId, isCameraOn }` | Synchronizes webcam broadcast status. |
| `webrtc:screenshare-state`| Client → Room | `{ channelId, isScreenSharing }` | Synchronizes screen share broadcast status. |

### Collaborative Activity Events
| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `media:sync` | Client ↔ Room | `{ action: 'play'\|'pause'\|'seek', currentTime, url }` | Keeps cinema player in tight frame sync. |
| `code:sync` | Client ↔ Room | `{ code, language }` | Synchronizes code buffer in the Pair Sandbox. |
| `code:run-sync` | Client ↔ Room | `{ output, isRunning }` | Broadcasts terminal execution output to all peers. |
| `tasks:update` | Client ↔ Room | `{ tasks }` | Synchronizes milestone checklist state. |
| `burn:start` | Client → Server | `{ seconds: 10 }` | Triggers synchronized destruction countdown. |
| `burn:execute` | Server → Room | `{ message: "Room destroyed" }` | Forces all clients to wipe and redirects to home. |

---

## 2. WebRTC PeerConnection Lifecycle

```
[ Alice (Caller) ]                                            [ Bob (Receiver) ]
        |                                                              |
        |--- 1. voice:join-channel('lounge-voice') ------------------->|
        |<-- 2. voice:channel-update (Alice added) --------------------|
        |                                                              |
        |=== Alice initiates WebRTC connection ========================|
        |--- 3. getUserMedia({ audio: true, video: isCameraOn }) ----->|
        |--- 4. createOffer() -> setLocalDescription() ----------------|
        |--- 5. webrtc:signal (type: 'offer', sdp) ------------------->|
        |                                                              |
        |                                     6. setRemoteDescription(offer)
        |                                     7. createAnswer() -> setLocalDescription()
        |<-- 8. webrtc:signal (type: 'answer', sdp) -------------------|
        |                                                              |
        | 9. setRemoteDescription(answer)                              |
        |<=== 10. ICE Candidates exchanged (webrtc:signal) ===========>|
        |                                                              |
        |<================ 11. Low-Latency Audio/Video ===============>|
        |<================ 12. Web Audio Analyser Halo ===============>|
```

### Voice Speaking Halo Engine (Web Audio API)
Each connected peer stream (and the local microphone stream) is tapped using browser `AudioContext`:
1. `audioContext.createMediaStreamSource(stream)` attaches to the incoming audio track.
2. `audioContext.createAnalyser()` computes fast Fourier transform (FFT) frequency data.
3. A 60 FPS animation loop reads `getByteFrequencyData()`, calculates Root Mean Square (RMS) volume, and produces a normalized level from 0 to 100.
4. When `level > 15`, a green speaking aura (`box-shadow: 0 0 0 3px #23a55a`) activates around the user's avatar.

---

## 3. Disconnect & Cleanup Lifecycle

When the user clicks the Disconnect button in either the top header, the center stage, or the bottom-left Voice Connected widget:
1. **Track Teardown**:
   - `localStream.getTracks().forEach(t => t.stop())` terminates microphone input hardware.
   - `localCameraStream.getTracks().forEach(t => t.stop())` powers off the webcam LED.
   - `localScreenStream.getTracks().forEach(t => t.stop())` closes display capture.
2. **PeerConnection Reset**:
   - Peer connections are closed and references set to `null`.
   - Audio analysers and ticker intervals are cleared.
3. **Sound Playback**:
   - `soundEffects.playCallEnded()` synthesizes the descending pitch chime (`440Hz -> 220Hz`).
4. **Auto-Navigation to `#general`**:
   - `setActiveChannelId('general')` smoothly returns the user back to the primary text channel.
   - Signaling emits `voice:leave-channel` to remove the user from the stage presence map.
