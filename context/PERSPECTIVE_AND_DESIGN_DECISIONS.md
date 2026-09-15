# Design Perspective & Architectural Decisions

This document outlines the core principles, perspectives, and design decisions maintained throughout the development of Syncora.

---

## 1. The Core Perspective: Dedicated Viewports vs. Cluttered Dashboards

### The Problem in Traditional Tools
Many pair-programming apps attempt to squeeze a code editor, a video stream, a task list, and a chat window into a single 1080p screen. The result is visual fatigue:
- Code editors only get 400px of horizontal width, causing excessive horizontal scrolling.
- Video players are shrunk down to postage-stamp size.
- Chat messages wrap every 3 words.

### The Syncora Solution
Syncora adopts the **Discord Workspace Perspective**:
- **Categorized Navigation**: A dedicated 240px channel sidebar keeps navigation instantaneous without consuming work canvas space.
- **Full-Bleed Viewports**:
  - When you are writing code, the IDE occupies 100% of the main canvas.
  - When you are watching videos, the cinema player occupies full HD width.
  - When you are on voice, the stage displays spacious participant cards with live camera feeds and screen sharing.
- **Collapsible Drawers**: Secondary features (like chat during a movie or coding session) slide out as smooth drawers rather than permanently stealing screen width.

---

## 2. Discord Design System & Aesthetic Tokens

Syncora uses custom CSS variables and utility classes aligned with Discord's dark mode design language:

| Design Token | Hex / Value | Purpose |
| :--- | :--- | :--- |
| `--discord-rail` | `#1e1f22` | Deepest background for the 72px leftmost guild rail. |
| `--discord-sidebar` | `#2b2d31` | Channel navigation sidebar. |
| `--discord-main` | `#313338` | Main content canvas (chat, stage, cinema). |
| `--discord-userbar` | `#232428` | Bottom profile bar. |
| `--discord-blurple` | `#5865F2` | Brand accents, primary buttons, and active tabs. |
| `--discord-green` | `#23a55a` | Online status indicators and speaking halos (`#23a55a`). |
| `--discord-red` | `#f23f43` | Disconnect buttons and burn alerts. |

---

## 3. Web Audio Procedural Sound Synthesizer (`soundEffects.js`)

### Perspective
Using MP3 or WAV audio assets causes latency, network buffering, and potential 404 errors. 

### Implementation
All audio cues in Syncora are synthesized **procedurally in real-time** using native browser `AudioContext` and `OscillatorNode`:
- **Message Chime**: Gentle D5 → A5 sine ramp (`0.12s`).
- **Voice Connect**: Harmonic A-Major triad (440Hz, 554Hz, 659Hz).
- **Voice Disconnect**: Descending pitch ramp (440Hz → 220Hz).
- **Task Success**: C-Major upward arpeggio (C, E, G, C).
- **Burn Countdown**: Pulsed 880Hz / 440Hz alarm siren.

---

## 4. Ephemeral Security & Zero-Persistence Guarantee

### Perspective
Collaboration sanctuaries should feel disposable, private, and secure:
- **RAM-Only State**: All messages, channels, tasks, and room configurations live in `RoomManager` memory maps. No MongoDB, PostgreSQL, or disk logging.
- **Shred Protocol**: The Space Owner can initiate a 10-second synchronized burn. When the countdown completes, memory is zeroed out, socket connections are forcefully terminated, and ephemeral files are deleted from the server.

