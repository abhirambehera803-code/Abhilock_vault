export type MediaType = 'pdf' | 'image' | 'video';

export type UserRole = 'admin' | 'creator' | 'friend';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  upiId: string;
  role: UserRole;
  isAdmin?: boolean;
  isCurrentUser?: boolean;
}

export interface MediaFile {
  id: string;
  title: string;
  description: string;
  type: MediaType;
  fileSize: string;
  pageCount?: number;
  duration?: string;
  previewUrl: string; // Thumb or cover
  contentUrl?: string; // Full content data URL or blob
  pdfPages?: string[]; // Multiple sample pages for rich PDF view
  price: number; // in INR (₹), 0 = free
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorUpiId: string;
  createdAt: string;
  groupName: string;
  // Security settings
  antiScreenshot: boolean;
  watermarkEnabled: boolean;
  allowForwarding: boolean;
  // Analytics
  unlockCount: number;
}

export interface UnlockRecord {
  fileId: string;
  userId: string;
  amountPaid: number;
  unlockedAt: string;
  transactionRef: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  userName: string;
  fileTitle: string;
  action: 'screenshot_attempt' | 'screen_recording_detected' | 'print_blocked' | 'window_unfocused';
  details: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: UserRole;
  text: string;
  timestamp: string;
  systemEvent?: boolean;
}

