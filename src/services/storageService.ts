import { MediaFile, UserProfile, UnlockRecord, SecurityEvent } from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user_abhiram',
    name: 'Abhiram Behera',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    upiId: 'abhiram.behera@okaxis',
    role: 'admin',
    isAdmin: true,
    isCurrentUser: true,
  },
  {
    id: 'user_amit',
    name: 'Amit Verma',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    upiId: 'amit.verma@upi',
    role: 'friend',
  },
  {
    id: 'user_priya',
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    upiId: 'priya.patel@paytm',
    role: 'friend',
  },
  {
    id: 'user_rohit',
    name: 'Rohit Singh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    upiId: 'rohit.singh@ybl',
    role: 'friend',
  },
];

export const INITIAL_FILES: MediaFile[] = [
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
    creatorId: 'user_amit',
    creatorName: 'Amit Verma',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    creatorUpiId: 'amit.verma@upi',
    createdAt: '3 days ago',
    groupName: 'Goa Vacay Boys',
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
    creatorId: 'user_priya',
    creatorName: 'Priya Patel',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorUpiId: 'priya.patel@paytm',
    createdAt: 'Just now',
    groupName: 'Creative Content Creators',
    antiScreenshot: true,
    watermarkEnabled: true,
    allowForwarding: false,
    unlockCount: 1,
  }
];

const STORAGE_KEYS = {
  FILES: 'lockvault_files_v1',
  PROFILES: 'lockvault_profiles_v1',
  ACTIVE_USER_ID: 'lockvault_active_user_id',
  UNLOCKS: 'lockvault_unlocks_v1',
  SECURITY_LOGS: 'lockvault_security_logs_v1',
};

// Safe memory fallback for older browsers, private windows, and restricted webviews
const memoryCache: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // Fall back silently to memory cache
  }
  return memoryCache[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    memoryCache[key] = value;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // In incognito or quota exceeded, in-memory store continues safely
  }
}

// Initial unlocks for realism
const INITIAL_UNLOCKS: UnlockRecord[] = [
  {
    fileId: 'file_dsa_notes',
    userId: 'user_amit',
    amountPaid: 49,
    unlockedAt: '2026-09-10 14:30',
    transactionRef: 'UPI/625481902847'
  },
  {
    fileId: 'file_goa_photos',
    userId: 'user_abhiram',
    amountPaid: 29,
    unlockedAt: '2026-09-11 09:12',
    transactionRef: 'UPI/982371625482'
  }
];

export const storageService = {
  // Sync files from server (accessible across all devices and friends)
  async fetchServerFiles(): Promise<MediaFile[]> {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const serverFiles: MediaFile[] = await res.json();
        if (Array.isArray(serverFiles) && serverFiles.length > 0) {
          safeSetItem(STORAGE_KEYS.FILES, JSON.stringify(serverFiles));
          return serverFiles;
        }
      }
    } catch {
      // Fallback to local storage if server is still starting
    }
    return this.getFiles();
  },

  getFiles(): MediaFile[] {
    try {
      const data = safeGetItem(STORAGE_KEYS.FILES);
      if (!data) {
        safeSetItem(STORAGE_KEYS.FILES, JSON.stringify(INITIAL_FILES));
        return INITIAL_FILES;
      }
      const files: MediaFile[] = JSON.parse(data);
      // Seamless migration: update any old mock references to App Maker Abhiram Behera
      let modified = false;
      const updatedFiles = files.map(file => {
        if (file.creatorName === 'Rahul Sharma' || file.creatorId === 'user_rahul') {
          modified = true;
          return {
            ...file,
            creatorName: 'Abhiram Behera',
            creatorId: 'user_abhiram',
            creatorUpiId: 'abhiram.behera@okaxis',
          };
        }
        return file;
      });
      if (modified) {
        this.saveFiles(updatedFiles);
      }
      return updatedFiles;
    } catch {
      return INITIAL_FILES;
    }
  },

  saveFiles(files: MediaFile[]): void {
    try {
      safeSetItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    } catch {
      // ignore
    }
  },

  async addFile(file: MediaFile): Promise<void> {
    const files = this.getFiles();
    files.unshift(file);
    this.saveFiles(files);

    // Save to server backend so friends on any device receive this file immediately
    try {
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(file),
      });
    } catch (err) {
      console.warn('Network notice: File saved locally, server sync error:', err);
    }
  },

  async deleteFile(fileId: string, adminPin: string = '6969'): Promise<void> {
    const files = this.getFiles().filter(f => f.id !== fileId);
    this.saveFiles(files);
    // Clean up associated unlocks
    try {
      const unlocks = this.getUnlocks().filter(u => u.fileId !== fileId);
      safeSetItem(STORAGE_KEYS.UNLOCKS, JSON.stringify(unlocks));
    } catch {
      // ignore
    }

    // Call server to delete permanently from central database
    try {
      await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
        },
      });
    } catch (err) {
      console.warn('Server delete error:', err);
    }
  },

  getProfiles(): UserProfile[] {
    try {
      const data = safeGetItem(STORAGE_KEYS.PROFILES);
      if (!data) {
        safeSetItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
        return INITIAL_PROFILES;
      }
      const loaded: UserProfile[] = JSON.parse(data);
      // Migrate old profile to Abhiram Behera (App Maker & Admin)
      let needsSave = false;
      const migrated = loaded.map(p => {
        if (p.id === 'user_rahul' || p.name === 'Rahul Sharma') {
          needsSave = true;
          return {
            ...p,
            id: 'user_abhiram',
            name: 'Abhiram Behera',
            upiId: 'abhiram.behera@okaxis',
            role: 'admin' as const,
            isAdmin: true,
            isCurrentUser: true,
          };
        }
        if (p.name === 'Abhiram Behera' && (!p.isAdmin || p.role !== 'admin')) {
          needsSave = true;
          return {
            ...p,
            role: 'admin' as const,
            isAdmin: true,
          };
        }
        return p;
      });

      // Ensure Abhiram Behera exists as admin
      const hasAbhiram = migrated.some(p => p.name === 'Abhiram Behera');
      if (!hasAbhiram) {
        migrated.unshift(INITIAL_PROFILES[0]);
        needsSave = true;
      }

      if (needsSave) {
        safeSetItem(STORAGE_KEYS.PROFILES, JSON.stringify(migrated));
      }
      return migrated;
    } catch {
      return INITIAL_PROFILES;
    }
  },

  getActiveUserId(): string {
    try {
      const saved = safeGetItem(STORAGE_KEYS.ACTIVE_USER_ID);
      if (saved && saved !== 'user_rahul') return saved;
    } catch {
      // fallback
    }
    return INITIAL_PROFILES[0].id;
  },

  setActiveUserId(id: string): void {
    try {
      safeSetItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
    } catch {
      // ignore
    }
  },

  getActiveUser(): UserProfile {
    const profiles = this.getProfiles();
    const activeId = this.getActiveUserId();
    return profiles.find(p => p.id === activeId) || profiles[0];
  },

  getUnlocks(): UnlockRecord[] {
    try {
      const data = safeGetItem(STORAGE_KEYS.UNLOCKS);
      if (!data) {
        safeSetItem(STORAGE_KEYS.UNLOCKS, JSON.stringify(INITIAL_UNLOCKS));
        return INITIAL_UNLOCKS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_UNLOCKS;
    }
  },

  recordUnlock(fileId: string, userId: string, amountPaid: number, transactionRef: string): void {
    try {
      const unlocks = this.getUnlocks();
      const exists = unlocks.some(u => u.fileId === fileId && u.userId === userId);
      if (!exists) {
        unlocks.unshift({
          fileId,
          userId,
          amountPaid,
          unlockedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
          transactionRef
        });
        safeSetItem(STORAGE_KEYS.UNLOCKS, JSON.stringify(unlocks));

        // Increment file counter
        const files = this.getFiles();
        const fileIndex = files.findIndex(f => f.id === fileId);
        if (fileIndex >= 0) {
          files[fileIndex].unlockCount += 1;
          this.saveFiles(files);
        }
      }
    } catch {
      // ignore
    }
  },

  isFileUnlockedForUser(file: MediaFile, userId: string): boolean {
    // Creator always has free access
    if (file.creatorId === userId) return true;
    // Free files are unlocked
    if (file.price === 0) return true;
    const unlocks = this.getUnlocks();
    return unlocks.some(u => u.fileId === file.id && u.userId === userId);
  },

  getSecurityLogs(): SecurityEvent[] {
    try {
      const data = safeGetItem(STORAGE_KEYS.SECURITY_LOGS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    try {
      const logs = this.getSecurityLogs();
      logs.unshift({
        ...event,
        id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      // Keep max 50
      if (logs.length > 50) logs.pop();
      safeSetItem(STORAGE_KEYS.SECURITY_LOGS, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }
};
