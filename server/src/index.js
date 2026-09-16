import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api.js';
import { setupSocketHandlers } from './socket/socketHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with broad CORS for dev flexibility
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e8 // 100 MB buffer for binary transfers
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach API Routes
app.use('/api', apiRouter);

// Health Check JSON
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    service: 'Syncora Zero-Knowledge Relay',
    activeConnections: io.engine.clientsCount
  });
});

// Root Developer & Relay Dashboard
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Syncora — Relay & Backend Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #07080d;
      color: #f3f4f6;
      font-family: 'Outfit', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-x: hidden;
    }
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      opacity: 0.25;
    }
    .orb-1 { width: 450px; height: 450px; background: #06b6d4; top: 10%; left: 15%; }
    .orb-2 { width: 450px; height: 450px; background: #ec4899; bottom: 10%; right: 15%; }
    .card {
      position: relative;
      z-index: 10;
      max-width: 680px;
      width: 100%;
      background: rgba(18, 20, 29, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      padding: 40px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.1);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }
    h1 {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -1px;
      line-height: 1.15;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #38bdf8 0%, #ffffff 50%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn-launch {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 16px 28px;
      border-radius: 16px;
      background: linear-gradient(135deg, #06b6d4 0%, #6366f1 50%, #ec4899 100%);
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.4);
      margin-bottom: 30px;
    }
    .btn-launch:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(236, 72, 153, 0.4);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: rgba(10, 12, 18, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 16px;
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      margin-bottom: 4px;
    }
    .stat-val {
      font-size: 15px;
      font-weight: 700;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }
    .api-list {
      background: rgba(7, 8, 13, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #94a3b8;
    }
    .api-title {
      font-size: 11px;
      color: #38bdf8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 10px;
    }
    .api-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .api-item:last-child { border-bottom: none; }
    .method { color: #34d399; font-weight: 600; }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="card">
    <div class="badge">
      <div class="dot"></div>
      <span>RELAY ENGINE ONLINE (PORT 5001)</span>
    </div>
    <h1>Syncora Backend</h1>
    <p>Zero-Knowledge Ephemeral Relay, WebRTC Signaling Hub, and Isolated Code Runner are operational.</p>
    
    <a href="http://localhost:5173" class="btn-launch">
      <span>⚡ Open Syncora Web App (Port 5173)</span>
      <span>→</span>
    </a>

    <div class="grid">
      <div class="stat-card">
        <div class="stat-label">Signaling Hub</div>
        <div class="stat-val" style="color: #38bdf8;">WebSocket / STUN</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Security Protocol</div>
        <div class="stat-val" style="color: #34d399;">ECDH + AES-256 E2EE</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Code Sandbox</div>
        <div class="stat-val" style="color: #f472b6;">Node.js / Python3</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Burn Protocol</div>
        <div class="stat-val" style="color: #fb7185;">10s Cryptoshred</div>
      </div>
    </div>

    <div class="api-list">
      <div class="api-title">Active API Services</div>
      <div class="api-item"><span><span class="method">POST</span> /api/rooms</span><span>Create 2-peer room</span></div>
      <div class="api-item"><span><span class="method">GET</span> /api/rooms/:code</span><span>Room verification & PIN</span></div>
      <div class="api-item"><span><span class="method">POST</span> /api/upload</span><span>Ephemeral file upload (25MB)</span></div>
      <div class="api-item"><span><span class="method">GET</span> /api/gifs</span><span>Tenor / Curated GIF search</span></div>
      <div class="api-item"><span><span class="method">POST</span> /api/execute</span><span>Isolated code execution</span></div>
      <div class="api-item"><span><span class="method">GET</span> /health</span><span>Relay JSON health status</span></div>
    </div>
  </div>
</body>
</html>`);
});

// Setup Socket.IO real-time handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 5001;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [SYNCORA SERVER ERROR] Port ${PORT} is already in use by another process.`);
    console.error(`👉 Run: kill -9 $(lsof -ti :${PORT}) to free port ${PORT}, or set PORT in your .env\n`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Syncora Relay Server Running on Port ${PORT}`);
  console.log(`WebSocket & WebRTC Signaling Ready`);
  console.log(`Ephemeral Relay Active`);
  console.log(`========================================`);
});

