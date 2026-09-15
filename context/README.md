# Syncora Project Context & Architecture Documentation

## Executive Overview
**Syncora** (formerly *DuoSpace*) is an ephemeral, real-time collaboration sanctuary inspired by Discord's spacious, clean multi-channel architecture. It eliminates the cramped, cluttered 2-person split-screen dashboards of traditional pair-programming apps and replaces them with dedicated, airy viewports designed for small groups, creative teams, and pair hackers (up to 25 members per sanctuary).

---

## Core Vision & Design Perspective

### 1. The "Anti-Clutter" Shift (v1 → v2)
- **Previous Model (DuoSpace v1)**: A single view where a video player, to-do list, code editor, and text chat were all crammed onto one screen simultaneously. Users felt overwhelmed by visual noise and cramped layouts.
- **Current Perspective (Syncora v2)**: Clear separation of concerns. Every activity has a **dedicated, expansive viewport**:
  - `#general`, `#ideas-and-links`, `#music-jam` for rich text discussions.
  - `Lounge Voice` and `Focus Pod` for low-latency WebRTC audio/video stages.
  - `Watch Party` for full-width synchronized cinema.
  - `Pair Sandbox` for an expansive, tabbed collaborative IDE.
  - `Tasks & Sprints` for an uncluttered team checklist and milestone tracker.

### 2. The Discord Communication Philosophy
Instead of ad-hoc communication widgets, Syncora adopts the industry standard **Discord Communication Method**:
- Drop-in/drop-out voice lounge lifecycle with speaking aura rings.
- Bottom-left persistent Voice Connected status block with real-time ping indicator and quick action dock.
- Dynamic connection diagnostics popover showing live ping sparklines, server node codes, and network stats.
- Clean disconnect behavior: leaving voice automatically returns the user to `#general` with an audible disconnect cue.
- Inline message replies with quote previews and reply banners.
- Native video calling and self-preview screen sharing.

---

## Context Documentation Index
1. [OVERVIEW.md](./OVERVIEW.md): Comprehensive project vision, key metrics, and terminology.
2. [ARCHITECTURE.md](./ARCHITECTURE.md): Full technical architecture (Client, Server, Signaling, WebRTC Mesh, and Audio Engines).
3. [DISCORD_COMMUNICATION_METHOD.md](./DISCORD_COMMUNICATION_METHOD.md): In-depth guide to the Discord communication UX and signaling mechanics.
4. [COMPONENT_MAP.md](./COMPONENT_MAP.md): Detailed component breakdown across the codebase.
5. [PERSPECTIVE_AND_DESIGN_DECISIONS.md](./PERSPECTIVE_AND_DESIGN_DECISIONS.md): Architectural decisions, rationale, design tokens, and aesthetic choices.
6. [CHANGELOG_AND_HISTORY.md](./CHANGELOG_AND_HISTORY.md): Chronological history of milestones from project inception to current state.


---
*Created dynamically for Syncora Sanctuary — Ephemeral Real-Time Collaboration.*
