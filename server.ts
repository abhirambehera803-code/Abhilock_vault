import express, { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parsers with 50mb limit for PDF and media uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Data directory for persistent storage across devices
const DATA_DIR = path.join(process.cwd(), 'data');
const FILES_PATH = path.join(DATA_DIR, 'files.json');
const UNLOCKS_PATH = path.join(DATA_DIR, 'unlocks.json');
const MESSAGES_PATH = path.join(DATA_DIR, 'messages.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed files authored by App Maker Abhiram Behera
const INITIAL_SEED_FILES = [
  {
    id: 'file_dsa_notes',
    title: 'DSA & System Design Master Handwritten Notes 2026',
    description: 'Complete revision notes with dynamic programming algorithms, graph models, and scalable architectures. Strictly for group study.',
    type: 'pdf',
    fileSize: '14.2 MB',
    pageCount: 38,
    previewUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
    price: 49,
    creatorId: 'user_abhiram',
    creatorName: 'Abhiram Behera',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    creatorUpiId: 'abhiram.behera@okaxis',
    createdAt: 'Today, 2:15 PM',
    groupName: 'Batch 2026 Placement Squad',
    antiScreenshot: true,
    watermarkEnabled: true,
    allowForwarding: false,
    unlockCount: 3,
    pdfPages: [
      'CHAPTER 1: ADVANCED GRAPH ALGORITHMS\n\n1. Dijkstra’s Algorithm Implementation\n- Priority Queue Min-Heap approach: Time complexity O((V + E) log V)\n- Used in network routing protocols, GPS navigation, and shortest-path computation.\n- Key invariant: Nodes extracted from the min-heap have already reached their minimum distance.',
      'CHAPTER 2: DYNAMIC PROGRAMMING FORMULAS\n\n- State Definition: dp[i][w] represents max profit from first i items within weight capacity w.\n- Recurrence Relation:\n  dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])\n- Space Optimization: Use 1D array traversed backwards from W to wt[i-1].',
      'CHAPTER 3: DISTRIBUTED CACHING & CONSISTENCY\n\n- CAP Theorem nuances in high-traffic applications.\n- Redis clustering and sharding algorithms with consistent hashing rings.\n- Cache invalidation strategies: Write-through vs Write-back vs Cache-aside pattern.'
    ]
  },
  {
    id: 'file_exam_cheatsheet',
    title: 'Financial Modeling & Stock Valuation Formulas (Cheat Sheet)',
    description: 'DCF valuation, WACC calculations, EBITDA bridge, and investment banking interview cheat sheet.',
    type: 'pdf',
    fileSize: '8.6 MB',
    pageCount: 16,
    previewUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
    price: 99,
    creatorId: 'user_abhiram',
    creatorName: 'Abhiram Behera',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    creatorUpiId: 'abhiram.behera@okaxis',
    createdAt: 'Yesterday',
    groupName: 'Finance Study Hub',
    antiScreenshot: true,
    watermarkEnabled: true,
    allowForwarding: false,
    unlockCount: 5,
    pdfPages: [
      'VALUATION ESSENTIALS: DISCOUNTED CASH FLOW (DCF)\n\n1. Free Cash Flow to Firm (FCFF):\n   FCFF = EBIT * (1 - Tax Rate) + D&A - CapEx - Change in Net Working Capital.\n\n2. Weighted Average Cost of Capital (WACC):\n   WACC = (E/V * Re) + (D/V * Rd * (1 - T))\n   Where Re = Rf + Beta * (Rm - Rf) via Capital Asset Pricing Model (CAPM).',
      'TERMINAL VALUE CALCULATION\n\n- Gordon Growth Method: TV = [FCFF(n) * (1 + g)] / (WACC - g)\n- Exit Multiple Method: TV = Projected Year N EBITDA * Benchmark Industry EV/EBITDA Multiple.\n- Sensitivity Tables: Always test WACC (+/- 50 bps) against perpetual growth rate g (+/- 25 bps).'
    ]
  },
  {
    id: 'file_goa_photos',
    title: 'Goa Trip 2026 - Secret Villa & Sunset High-Res Album',
    description: 'Uncompressed RAW/4K photos from our private cliffside villa party and beach cruise.',
    type: 'image',
    fileSize: '48.5 MB',
    previewUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
    price: 29,
    creatorId: 'user_abhiram',
    creatorName: 'Abhiram Behera',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    creatorUpiId: 'abhiram.behera@okaxis',
    createdAt: '3 days ago',
    groupName: 'Goa Vacay Friends',
    antiScreenshot: true,
    watermarkEnabled: true,
    allowForwarding: false,
    unlockCount: 2,
  },
  {
    id: 'file_video_editing',
    title: 'Exclusive Cinematic Video Editing & Color Grading Masterclass',
    description: 'Secret LUTs walkthrough and premier pro breakdown for our short film project.',
    type: 'video',
    fileSize: '124 MB',
    duration: '14:20 min',
    previewUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    price: 149,
    creatorId: 'user_abhiram',
    creatorName: 'Abhiram Behera',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    creatorUpiId: 'abhiram.behera@okaxis',
    createdAt: 'Just now',
    groupName: 'Creative Content Creators',
    antiScreenshot: true,
    watermarkEnabled: true,
    allowForwarding: false,
    unlockCount: 1,
  }
];

const INITIAL_MESSAGES = [
  {
    id: 'msg_welcome_1',
    senderId: 'user_abhiram',
    senderName: 'Abhiram Behera (Admin)',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    senderRole: 'admin',
    text: 'Namaste doston! Maine latest DSA aur financial notes yahan website pe share kar diye hain. QR scan karke pay karo aur turant unlock karo!',
    timestamp: 'Just now',
    systemEvent: false,
  },
  {
    id: 'msg_welcome_2',
    senderId: 'system',
    senderName: 'LockVault Live System',
    senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    text: '⚡ Live synchronization active. Kisi bhi document ko drag/drop karo, wo turant sabhi doston ke screens pe live dikhega!',
    timestamp: 'Just now',
    systemEvent: true,
  }
];

// Helper functions for reading/writing persistent data
function readStoredFiles(): any[] {
  try {
    if (fs.existsSync(FILES_PATH)) {
      const data = fs.readFileSync(FILES_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading files.json:', err);
  }
  writeStoredFiles(INITIAL_SEED_FILES);
  return INITIAL_SEED_FILES;
}

function writeStoredFiles(files: any[]): void {
  try {
    fs.writeFileSync(FILES_PATH, JSON.stringify(files, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing files.json:', err);
  }
}

function readStoredUnlocks(): any[] {
  try {
    if (fs.existsSync(UNLOCKS_PATH)) {
      const data = fs.readFileSync(UNLOCKS_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading unlocks.json:', err);
  }
  return [];
}

function writeStoredUnlocks(unlocks: any[]): void {
  try {
    fs.writeFileSync(UNLOCKS_PATH, JSON.stringify(unlocks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing unlocks.json:', err);
  }
}

function readStoredMessages(): any[] {
  try {
    if (fs.existsSync(MESSAGES_PATH)) {
      const data = fs.readFileSync(MESSAGES_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading messages.json:', err);
  }
  writeStoredMessages(INITIAL_MESSAGES);
  return INITIAL_MESSAGES;
}

function writeStoredMessages(messages: any[]): void {
  try {
    fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing messages.json:', err);
  }
}

// In-memory data synced with disk
let memoryFiles = readStoredFiles();
let memoryUnlocks = readStoredUnlocks();
let memoryMessages = readStoredMessages();

// Server-Sent Events (SSE) subscribers for real-time live synchronization
const sseClients: Response[] = [];

function broadcastEvent(eventData: any) {
  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Keep-alive heartbeat every 15s to prevent cloud proxy disconnects
setInterval(() => {
  const pingPayload = `: keep-alive\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(pingPayload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}, 15000);

// API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    filesCount: memoryFiles.length,
    activeSubscribers: sseClients.length
  });
});

// SSE Real-time live synchronization endpoint
app.get('/api/live-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send immediate initial sync
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', serverTime: new Date().toISOString(), filesCount: memoryFiles.length })}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// 1. GET all files (accessible to all friends & visitors)
app.get('/api/files', (req, res) => {
  res.json(memoryFiles);
});

// 2. POST upload new file (instant upload & realtime broadcast to all friends)
app.post('/api/files', (req, res) => {
  try {
    const file = req.body;
    if (!file || !file.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newFile = {
      ...file,
      id: file.id || 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: file.createdAt || 'Just now',
      unlockCount: file.unlockCount || 0,
      price: typeof file.price === 'number' ? file.price : 49,
    };

    // Prepend new file so newest appears first
    memoryFiles = [newFile, ...memoryFiles.filter(f => f.id !== newFile.id)];
    writeStoredFiles(memoryFiles);

    // Broadcast file to all connected friends instantly
    broadcastEvent({ type: 'NEW_FILE', file: newFile });

    // Also auto-post a live chat announcement
    const announceMsg = {
      id: 'msg_ann_' + Date.now(),
      senderId: 'system',
      senderName: 'LockVault Live Alert',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      text: `📄 Naya Document Upload Hua: "${newFile.title}" (${newFile.type.toUpperCase()}) by ${newFile.creatorName}! Baki sab QR se ₹${newFile.price} deke unlock kar sakte hain.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systemEvent: true,
    };
    memoryMessages.push(announceMsg);
    if (memoryMessages.length > 100) memoryMessages.shift();
    writeStoredMessages(memoryMessages);
    broadcastEvent({ type: 'NEW_MESSAGE', message: announceMsg });

    res.status(201).json(newFile);
  } catch (err: any) {
    console.error('Failed to save file:', err);
    res.status(500).json({ error: 'Server failed to save file' });
  }
});

// 3. DELETE file (Admin only - secret PIN 6969 verified)
app.delete('/api/files/:id', (req, res) => {
  const { id } = req.params;
  const adminPin = req.headers['x-admin-pin'] as string;

  if (adminPin !== '6969') {
    return res.status(403).json({ error: 'Access Denied: Only Admin Abhiram Behera can delete files.' });
  }

  const deletedFile = memoryFiles.find(f => f.id === id);
  memoryFiles = memoryFiles.filter(f => f.id !== id);
  writeStoredFiles(memoryFiles);

  memoryUnlocks = memoryUnlocks.filter(u => u.fileId !== id);
  writeStoredUnlocks(memoryUnlocks);

  // Broadcast deletion to all users live
  broadcastEvent({ type: 'FILE_DELETED', fileId: id });

  if (deletedFile) {
    const delMsg = {
      id: 'msg_del_' + Date.now(),
      senderId: 'system',
      senderName: 'Admin Alert',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      text: `🗑️ Document "${deletedFile.title}" was removed by Admin Abhiram Behera.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systemEvent: true,
    };
    memoryMessages.push(delMsg);
    writeStoredMessages(memoryMessages);
    broadcastEvent({ type: 'NEW_MESSAGE', message: delMsg });
  }

  res.json({ success: true, message: 'File permanently deleted by Admin' });
});

// 4. POST verify admin PIN (Secret: 6969)
app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (pin === '6969') {
    res.json({ success: true, role: 'admin', adminName: 'Abhiram Behera' });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect PIN. Access denied.' });
  }
});

// 5. GET & POST Unlocks
app.get('/api/unlocks', (req, res) => {
  res.json(memoryUnlocks);
});

app.post('/api/unlocks', (req, res) => {
  const record = req.body;
  if (!record || !record.fileId || !record.userId) {
    return res.status(400).json({ error: 'Invalid unlock record' });
  }

  const existingIndex = memoryUnlocks.findIndex(
    u => u.fileId === record.fileId && u.userId === record.userId
  );

  if (existingIndex >= 0) {
    memoryUnlocks[existingIndex] = record;
  } else {
    memoryUnlocks.push(record);
  }
  writeStoredUnlocks(memoryUnlocks);

  // Increment unlockCount on file
  const targetFile = memoryFiles.find(f => f.id === record.fileId);
  if (targetFile) {
    targetFile.unlockCount = (targetFile.unlockCount || 0) + 1;
    writeStoredFiles(memoryFiles);
  }

  // Broadcast unlock event to update live stats across all friends
  broadcastEvent({ type: 'NEW_UNLOCK', record, fileId: record.fileId });

  res.status(201).json({ success: true, record });
});

// 6. Live Chat Messages ("Live baat karne kaa")
app.get('/api/messages', (req, res) => {
  res.json(memoryMessages);
});

app.post('/api/messages', (req, res) => {
  try {
    const { senderId, senderName, senderAvatar, senderRole, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const newMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId: senderId || 'guest',
      senderName: senderName || 'Friend',
      senderAvatar: senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      senderRole: senderRole || 'friend',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systemEvent: false,
    };

    memoryMessages.push(newMsg);
    if (memoryMessages.length > 100) memoryMessages.shift();
    writeStoredMessages(memoryMessages);

    // Broadcast message to all active users live
    broadcastEvent({ type: 'NEW_MESSAGE', message: newMsg });

    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post message' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LockVault Live Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
