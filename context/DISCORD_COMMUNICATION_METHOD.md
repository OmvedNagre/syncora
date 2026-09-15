# Discord Communication Method & Lifecycle

This document explains the Discord-inspired communication architecture implemented across Syncora.

---

## 1. Voice Channel Lifecycle

### Joining Voice
1. **Trigger**: User clicks any voice channel in the sidebar (`Lounge Voice` or `Focus Pod`) or clicks **Join Voice** in the top navigation header.
2. **Audio Cue**: Synthesizes and plays the three-tone A-Major connect chime (`soundEffects.playCallConnected()`).
3. **Permissions**: Immediately requests microphone access via `navigator.mediaDevices.getUserMedia({ audio: true })`.
4. **Visual Indicators**:
   - The channel sidebar mounts the persistent **Voice Connected** bar above the user bar.
   - The user's avatar appears under the active voice channel with speaking rings.
   - The central viewport switches to the `VoiceStage` with live duration counter incrementing upward.
   - A unique dynamic voice cluster code is generated (e.g. `c-bom01-2adc16d8`).

### Speaking Aura Rings
- When talking, `localStream` feeds into a 64-FFT `AnalyserNode`.
- When the average audio level exceeds 15%, the `.speaking-ring` CSS class activates, rendering an animated green pulse halo (`#23a55a`) around the user's avatar.

### Disconnecting from Voice
- **Clean Return**: Disconnecting (via the red handset button in the floating dock, sidebar widget, or header) calls `leaveVoiceChannel(true)`.
- **Automatic Navigation**: If the user was viewing the voice stage, the app **automatically navigates back to `#general`**, ensuring the user is never stranded on a disconnected `00:00` screen.
- **Track Disposal**: All microphone, camera, and screen sharing tracks are stopped (`track.stop()`), closing the peer connection and clearing memory.
- **Sound Cue**: Procedurally plays the falling-pitch disconnect tone (`soundEffects.playCallEnded()`).

---

## 2. Bottom-Left Voice Connected Widget & Popover

### Sidebar Widget
Positioned directly above the user bar (identical to Discord):
- **Top Row**:
  - Green WiFi signal icon with a hover speech-bubble tooltip displaying current latency (e.g. `31 ms`).
  - Channel name and sanctuary subtitle (`Lounge Voice / Syncora Sanctuary`).
  - Quick disconnect handset button.
- **Action Dock (4 Buttons)**:
  1. 📹 **Camera Toggle**: turns webcam on/off.
  2. 🖥️ **Screen Share**: starts/stops display media stream with self-preview.
  3. 🚀 **Activities**: quick jump to Watch Party.
  4. 📈 **Connection HUD**: toggles the attached Connection popover.

### Attached Connection Popover
Directly anchored to the bottom-left above the Voice Connected block:
- **Dynamic Session Node Code**: Generates a fresh cluster ID on every connection (`c-bom[cluster]-[session]`).
- **Dynamic Per-Minute X-Axis**: Computes 4 timeline markers (e.g. `2:53 AM`, `2:54 AM`, `2:55 AM`, `2:56 AM`) that automatically advance with the system clock.
- **Dynamic Ping Curve**: Draws an SVG sparkline showing `0 ms` prior to connection and a stepped jump to active ping (`~31 ms`) at the connection timestamp.
- **Y-Axis Markers**: Labeled `40`, `20`, and `0` on the right side of the graph.
- **Diagnostics**: Displays average ping, last ping, packet loss rate, and `Debug` / `Upload Logs` buttons.
- **Security Footer**: 🔒 `End-to-end encrypted` status.

---

## 3. Video Calling & Self-Preview Screen Share

### Video Calling
- Toggling the camera turns on the webcam stream and transforms the participant's stage tile into a mirrored live video stream.
- An overlay badge on the video tile displays the participant's name, speaking dot, and mute status.

### Self-Preview Screen Share
- When sharing screen, the stream is captured via `getDisplayMedia` and stored in `localScreenStream`.
- The user can view their own live screen in the center stage theater with a `LIVE` tag and a hover `Stop Sharing` button. Local audio is muted to prevent acoustic feedback.

---

## 4. Discord-Style Inline Chat Replies

- **Hover Action Bar**: Hovering over any message in `#general`, `#ideas-and-links`, or `#music-jam` reveals quick emojis and a **Reply** button (`Reply` icon).
- **Reply Context Banner**: Clicking Reply pins a banner above the chat input: `Replying to @Username: "message snippet..."` with an `(X)` cancel button.
- **Message Quote Line**: The sent reply displays Discord's curved arrow: `↳ @Username "quoted message..."` directly above the new message.

