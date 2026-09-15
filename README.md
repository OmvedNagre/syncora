# Syncora ⚡

> **Ephemeral, real-time collaboration sanctuary inspired by Discord's multi-channel architecture.**  
> Spin up a private space with categorized channels, WebRTC voice & video stages, synchronized media player, collaborative code sandbox, and team task sprints — zero sign-up required.

---

## ✨ Features

- **Categorized Multi-Channel Workspace**:
  - **Text Channels**: `#general`, `#ideas-and-links`, `#music-jam` with inline message replies, rich markdown, file attachments, and GIF picker.
  - **Voice & Video Lounges**: Low-latency WebRTC mesh audio/video (`Lounge Voice`, `Focus Pod`) with dynamic Web Audio API speaking rings, native webcam calling, and self-preview screen sharing.
  - **Discord-Style Voice Lifecycle**: Bottom-left persistent voice status dock, real-time connection diagnostics with ping sparkline, and audio cue feedback.
  - **Synchronized Cinema**: Shared media player with sub-second sync across all participants, preset quick-picks, and collapsible theater chat.
  - **Collaborative Code Sandbox**: Live multi-language editor (JavaScript, Python 3, TypeScript) with remote execution and synchronized console output.
  - **Team Task Sprints**: Collaborative todo checklist with member assignment, completion progress bar, filter pills, and confetti celebrations.
- **Privacy First & Ephemeral**:
  - Zero permanent database logs or trackers.
  - **10-Second Burn Protocol**: Instant irreversible room shredding that wipes memory, active sockets, and uploads.
- **Cross-Platform**:
  - Web application (React + Vite + Socket.IO)
  - Desktop application via Electron wrapper.

---

## 🛠️ Tech Stack

- **Client**: React 18, Vite, Lucide Icons, Canvas-Confetti, WebRTC, Web Audio API
- **Server**: Node.js, Express, Socket.IO, Multer, REST APIs
- **Desktop**: Electron
- **Security**: Ephemeral in-memory state, WebRTC DTLS/SRTP, AES-GCM room isolation

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm (v9 or newer)

### Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/OmvedNagre/syncora.git
cd syncora
npm run install:all
```

### Development

Run both the backend server and frontend client concurrently:

```bash
npm run dev
```

- **Client**: [http://localhost:5173](http://localhost:5173)
- **Server**: [http://localhost:3001](http://localhost:3001)

### Desktop App (Electron)

```bash
npm run dev:electron
```

---

## 📖 Architecture & Design Documentation

Comprehensive architectural design docs are available in the [`context/`](./context) directory:
- [Overview](./context/OVERVIEW.md)
- [System Architecture](./context/ARCHITECTURE.md)
- [Discord Communication Method](./context/DISCORD_COMMUNICATION_METHOD.md)
- [Component Map](./context/COMPONENT_MAP.md)
- [Design Decisions & Tokens](./context/PERSPECTIVE_AND_DESIGN_DECISIONS.md)
- [Changelog & History](./context/CHANGELOG_AND_HISTORY.md)

---

## 📄 License

MIT License. Built for real-time collaboration.
