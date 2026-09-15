import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { roomManager } from '../services/roomManager.js';
import { executeCode } from '../services/codeRunner.js';
import { searchGifs } from '../services/gifProxy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `duo_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

export const apiRouter = express.Router();

// Create Room
apiRouter.post('/rooms', (req, res) => {
  const { pin, creatorName, theme, spaceName } = req.body;
  const room = roomManager.createRoom({ pin, creatorName, theme, spaceName });
  res.json({
    success: true,
    room: {
      code: room.code,
      name: room.name,
      pinRequired: !!room.pin,
      theme: room.theme,
      createdAt: room.createdAt
    }
  });
});

// Check Room Status
apiRouter.get('/rooms/:code', (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found or burned' });
  }

  res.json({
    success: true,
    room: {
      code: room.code,
      pinRequired: !!room.pin,
      burned: room.burned,
      memberCount: room.members.length,
      isFull: room.members.length >= 2,
      theme: room.theme
    }
  });
});

// Upload Ephemeral File / Image / GIF
apiRouter.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const { roomCode } = req.body;
  const fileData = {
    id: `file_${Date.now()}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: `/api/files/${req.file.filename}`,
    uploadedAt: Date.now()
  };

  const room = roomManager.getRoom(roomCode);
  if (room) {
    room.files.push(fileData);
  }

  res.json({
    success: true,
    file: fileData
  });
});

// Serve Ephemeral File
apiRouter.get('/files/:filename', (req, res) => {
  const filepath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ success: false, error: 'File not found or expired' });
  }
  res.sendFile(filepath);
});

// Search GIFs
apiRouter.get('/gifs', async (req, res) => {
  const { q = '', category = '' } = req.query;
  const gifs = await searchGifs(q, category);
  res.json({ success: true, gifs });
});

// Isolated Code Execution Endpoint
apiRouter.post('/execute', async (req, res) => {
  const { language, code } = req.body;
  const result = await executeCode({ language, code });
  res.json({ success: true, result });
});
