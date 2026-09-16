# User Flows & Interactive Scenarios

This document outlines the core end-to-end user scenarios and interaction models in Syncora.

---

## Scenario 1: Instant Space Creation & Onboarding
1. **Landing Page**:
   - User enters their Display Name (e.g. `Alex`) and clicks **Create Sanctuary** (or enters a room code to join an existing space).
   - Alternatively, user can pick an avatar, color accent, or click **Generate Random Name**.
2. **Instant Space Initialization**:
   - The server creates a fresh in-memory space with a code formatted like `SYN-K7M2`.
   - The user lands directly into `#general` with no password prompts, email verification, or registration forms.
3. **Inviting Collaborators**:
   - User clicks the **Copy Code** pill in the top header or the `+` button on the SpaceRail to copy the invite link or display the QR code.
   - Collaborator opens the link, enters their nickname, and appears instantly in the room's Member Sidebar.

---

## Scenario 2: Discord-Style Drop-In Voice & Video Lounge
1. **Joining Voice**:
   - User clicks `Lounge Voice` in the channel sidebar.
   - The browser prompts for microphone permissions (if not yet granted).
   - Syncora synthesizes an upward A-major harmonic chime.
   - The user enters the Voice Stage, which displays large participant cards, live duration (`00:01`, `00:02`...), and active mute/deafen controls.
2. **Toggling Camera & Screen Share**:
   - Clicking the 📹 Camera button turns on the user's webcam; their avatar tile transforms into a live video feed with an overlay name badge.
   - Clicking the 🖥️ Screen Share button prompts for window/screen selection; once shared, a center-stage self-preview cinema displays the shared stream with a `LIVE` tag.
3. **Background Voice Persistence**:
   - While still connected to `Lounge Voice`, the user clicks `#general` or `Pair Sandbox`.
   - The Voice Stage is replaced by the chosen viewport, while the **bottom-left Voice Connected block** keeps voice controls (Camera, Screen Share, Mute, Disconnect, Diagnostics) accessible at all times.
4. **Inspecting Dynamic Telemetry**:
   - Hovering over the green WiFi icon shows a tooltip with live latency (`31 ms`).
   - Clicking the graph button opens the **Connection Popover**:
     - Shows dynamic cluster code (e.g. `c-bom01-2adc16d8`).
     - Shows dynamic minute-by-minute timeline markers (`2:53 AM`, `2:54 AM`, `2:55 AM`, `2:56 AM`).
     - Shows real-time SVG ping sparkline showing the transition from 0 ms to active connection.
5. **Disconnecting from Voice**:
   - User clicks the red Disconnect button on either the top header, the bottom-left widget, or the center stage dock.
   - The descending disconnect chime plays.
   - Hardware tracks (mic, camera, screen) immediately stop.
   - The user is automatically transitioned back to `#general`.

---

## Scenario 3: Real-Time Chat & Threaded Quoting
1. **Sending Messages & Files**:
   - User types in the bottom input bar of `#general` with Markdown formatting support.
   - Dropping images or files directly into the window triggers an ephemeral upload preview.
2. **Replying with Context**:
   - User hovers over any message in the feed.
   - A floating action bar appears with emoji reactions and a **Reply** button.
   - Clicking Reply pins a **Reply Context Banner** above the input: `Replying to @Sarah: "Check out this PR..."`.
   - Submitting the reply displays a curved connector line `↳ @Sarah "Check out this PR..."` above the message, maintaining conversational context without fragmented thread panels.

---

## Scenario 4: Collaborative Pair Sandbox & Code Execution
1. **Opening the Sandbox**:
   - User clicks `Pair Sandbox` under the Activities category.
   - A full-bleed code editor opens with syntax highlighting and line numbers.
2. **Multi-Language Execution**:
   - Users switch between JavaScript, Python 3, or TypeScript.
   - Typing synchronizes character-by-character across all peers in the space.
   - Clicking **Run Code** executes the code and streams output to the synchronized terminal console below.
3. **Slide-Out Drawer**:
   - If peers want to discuss code while looking at the editor, they click the chat icon in the top right to open the **Slide-Out Chat Drawer** without shrinking the editor.

---

## Scenario 5: Synchronized Watch Party
1. **Selecting Media**:
   - User clicks `Watch Party` under Activities.
   - Paste a direct MP4, HLS, or YouTube URL, or click one of the pre-configured lo-fi / chill study presets.
2. **Frame-Accurate Synchronization**:
   - Play, pause, and seek events are broadcast via `media:sync` to keep all participants watching at the exact same millisecond.
3. **Floating Reactions**:
   - Viewers can send floating animated emojis (🔥, ❤️, 👏, 🍿) that float up the cinema viewport.

---

## Scenario 6: The Ephemeral "Burn Sanctuary" Protocol
1. **Triggering Burn**:
   - The space creator clicks the flame icon at the bottom of the SpaceRail (`Burn Space`).
   - A confirmation dialog warns that all room state and chat history will be shredded permanently.
2. **Synchronized 10-Second Alarm**:
   - A pulsing 880Hz / 440Hz alarm sound plays across all connected clients.
   - A full-screen apocalyptic countdown overlay appears on every participant's screen (`Destruction in 10... 9... 8...`).
3. **Total Shredding**:
   - At 0, the server deletes the room from memory maps, unlinks ephemeral files, and forcefully terminates all sockets.
   - All participants are redirected to the homepage with a confirmation notice: `Sanctuary was shredded. Zero traces remain.`
