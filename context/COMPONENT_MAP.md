# Component & File Map

## Client Components (`client/src/`)

### Layout Components (`components/layout/`)
- **`SpaceRail.jsx`**: 72px leftmost rail housing the gradient `SYN` brand button, active room indicator pill, Invite (`+`) button, Telemetry trigger, and Burn Space button.
- **`ChannelSidebar.jsx`**: 240px sidebar organizing channels by category (Text, Voice, Activities), housing the Voice Connected bar, and the bottom user profile bar.
- **`ChannelHeader.jsx`**: 48px top bar with channel icon, topic, room code copy pill, voice connect/disconnect toggle, and member list toggle.
- **`MemberSidebar.jsx`**: 240px collapsible right panel grouping members by Owner and Online status with Discord profile popover support.
- **`SpaceLayout.jsx`**: Main flex shell orchestrating the 4-column layout and active views.

### Call & Voice Stage Components (`components/call/`)
- **`VoiceStage.jsx`**: Central voice lounge stage showing live duration counter, participant grid with speaking rings, live camera streams, and screen share theater.
- **`ConnectionPopover.jsx`**: Attached bottom-left Discord popover with live SVG ping chart, dynamic minute timeline, server node ID, and network telemetry.
- **`VoiceCallHUD.jsx`**: Floating mini-bar for background call controls.
- **`CallRequestModal.jsx`**: Modal for direct peer call invitations.
- **`CallScheduler.jsx`**: Calendar scheduler for future sync sessions.

### Chat & Messaging Components (`components/chat/`)
- **`ChatContainer.jsx`**: Main chat stream with channel welcome hero, avatar blocks, floating emoji/reply hover bars, replied quote lines, and drag-and-drop file upload.
- **`GifPickerModal.jsx`**: Tenor GIF search modal with trending categories.

### Media & Activity Components (`components/media/`, `code/`, `todo/`)
- **`WatchTogether.jsx`**: Cinema theater player with preset video stream buttons, floating reaction particles, and slide-out Theater Chat drawer.
- **`CodeSandbox.jsx`**: Collaborative IDE with language selector (JavaScript, Python 3, TypeScript), execution output terminal, and slide-out chat drawer.
- **`DuoTodoList.jsx`**: Milestone checklist board with task completion progress bar, filter pills, and confetti animations.

### Common Modals (`components/common/`)
- **`SettingsModal.jsx`**: User profile configuration and Voice & Device settings (Microphone dropdown, Headphones dropdown, live volume test meter).
- **`QRModal.jsx`**: QR code modal for mobile invite sharing.
- **`TelemetryModal.jsx`**: Engineering HUD for deep WebRTC diagnostics.

### State & Utilities
- **`context/SocketContext.jsx`**: Socket.IO room management, multi-channel messages, and member presence.
- **`context/WebRTCContext.jsx`**: Audio/video streams, device enumeration, live RTT telemetry, and dynamic session nodes.
- **`utils/soundEffects.js`**: Procedural Web Audio API sound synthesizer (message chimes, connection chimes, disconnect tones, burn sirens).

---

## Server Components (`server/src/`)
- **`index.js`**: Express server bootstrap and Socket.IO initialization on port `5001`.
- **`services/roomManager.js`**: In-memory room state registry (`SYN-XXXX`, 25-member capacity, default channels, voice participants).
- **`socket/socketHandler.js`**: Event handlers for chat, voice channels, WebRTC signaling, activities, and room burn countdown.
- **`routes/api.js`**: REST endpoints (`POST /api/rooms`, `GET /api/rooms/:code`, `POST /api/upload`).

