# Project History & Changelog

## Milestone 1: DuoSpace v1 (Initial Prototype)
- Implemented a 2-person peer-to-peer workspace.
- Crammed chat, code editor, synchronized YouTube, and to-do list onto a single screen.
- WebRTC 1-to-1 audio calling with direct peer signaling.

---

## Milestone 2: The v2 Transformation (Discord-Inspired Architecture)
- **User Feedback**: The interface was too clustered and cramped. The user requested abandoning the rigid 2-person model in favor of a clean, spacious Discord-style layout.
- **4-Column Layout**:
  - `SpaceRail` (72px leftmost guild rail with `SYN` logo pill and telemetry triggers).
  - `ChannelSidebar` (240px categorized channels: Text, Voice, Activities, with user bar).
  - `ChannelHeader` (48px top bar with channel name, topic, copy room pill, and voice button).
  - `MemberSidebar` (240px collapsible member panel with Discord profile popovers).
  - Dynamic Full Viewports for Chat, Voice Stage, Watch Party, Pair Sandbox, and Tasks.
- **Backend Expansion**: Expanded room capacity from 2 to 25 members in `roomManager.js`, added multi-channel message stores, and tracking for voice lounge participants.

---

## Milestone 3: Voice Channel Polish & Diagnostics
- **Live Duration Ticker**: Fixed timer synchronization so duration counts up from `00:01` immediately upon joining voice.
- **Microphone Permissions & Device Selectors**: Added auto-requesting mic permissions and Input (Mic) / Output (Headphones) selectors in Settings with a live volume meter.
- **Self Screen Share**: Enabled local screen stream capture so users can view their own screen share in the stage theater alongside peer cards.

---

## Milestone 4: Full Discord Communication Method
- **Video Calling in VC**: Added webcam toggle that transforms participant tiles into live mirrored video streams with name badges and speaking indicators.
- **Seamless VC Exit**: Disconnecting from voice automatically navigates back to `#general`, plays a procedural disconnect chime, and disposes of media tracks so the user is never stuck on a disconnected screen.
- **Inline Chat Replies**: Added floating hover bar reply button, quote previews above input, and `↳ @User "..."` quote lines in the message feed.

---

## Milestone 5: Bottom-Left Voice Connected Widget & Dynamic Popover
- **Removed Letterbox Buttons**: Cleaned up the VoiceStage header by removing redundant `Turn On Camera` and `Share Screen` buttons.
- **Bottom-Left Voice Connected Block**: Added persistent widget above the user bar with green WiFi icon, hover ping tooltip (`32 ms`), and 4 action buttons (Camera, Screen Share, Activities, Connection).
- **Dynamic Attached Connection Popover**:
  - Anchored directly on the bottom-left above the widget with a downward pointer caret.
  - Dynamic cluster code (e.g. `c-bom01-2adc16d8`, `c-bom06-72a42e4a`) freshly generated on every voice session.
  - Dynamic minute-by-minute X-axis timeline (`2:53 AM`, `2:54 AM`, `2:55 AM`, `2:56 AM`) advancing in real-time.
  - Real-time SVG ping curve with 0 ms before connect and step jump to ~31 ms after connect, with 40/20/0 Y-axis markers.

---

## Milestone 6: Rebranding to Syncora
- Renamed desktop project directory to `/Users/omvednagre/Desktop/Syncora`.
- Maintained symlink compatibility (`/Users/omvednagre/Desktop/DuoSpace -> /Users/omvednagre/Desktop/Syncora`).
- Updated `package.json` to `syncora-workspace`, page title to `Syncora`, logo pill to `SYN`, room code prefix to `SYN-XXXX`, and sanctuary titles to `Syncora Sanctuary`.

