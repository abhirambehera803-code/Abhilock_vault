import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Image as ImageIcon, Video, Search, Filter, ShieldCheck, 
  Lock, QrCode, Eye, IndianRupee, Sparkles, Users, AlertTriangle, Crown, 
  Trash2, CheckCircle2, Shield, MessageSquare, Zap, Radio
} from 'lucide-react';
import { MediaFile, MediaType, UserProfile, UnlockRecord, SecurityEvent, ChatMessage } from './types';
import { storageService, INITIAL_FILES } from './services/storageService';
import { Navbar } from './components/Navbar';
import { FileCard } from './components/FileCard';
import { PaywallModal } from './components/PaywallModal';
import { SecureViewerModal } from './components/SecureViewerModal';
import { UploadModal } from './components/UploadModal';
import { EarningsDrawer } from './components/EarningsDrawer';
import { SecurityDrawer } from './components/SecurityDrawer';
import { ShareModal } from './components/ShareModal';
import { AdminPinModal } from './components/AdminPinModal';
import { LiveChatDrawer } from './components/LiveChatDrawer';
import { QuickDropZone } from './components/QuickDropZone';

export default function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [unlocks, setUnlocks] = useState<UnlockRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Real-time synchronization state
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  // Admin PIN verification state (Secret PIN: 6969)
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('lockvault_admin_verified') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminPinOpen, setIsAdminPinOpen] = useState(false);

  // Filters & Search
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Modals & Drawers
  const [paywallFile, setPaywallFile] = useState<MediaFile | null>(null);
  const [viewerFile, setViewerFile] = useState<MediaFile | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEarningsOpen, setIsEarningsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Initial load
  const refreshLocalData = () => {
    const loadedProfiles = storageService.getProfiles();
    const currentActive = storageService.getActiveUser();
    const loadedFiles = storageService.getFiles();
    const loadedUnlocks = storageService.getUnlocks();
    const loadedLogs = storageService.getSecurityLogs();

    setProfiles(loadedProfiles);
    setActiveUser(currentActive);
    setFiles(loadedFiles);
    setUnlocks(loadedUnlocks);
    setSecurityLogs(loadedLogs);
  };

  // 1. Initial boot: fetch latest files & messages from server
  useEffect(() => {
    refreshLocalData();

    // Fetch live files from server
    storageService.fetchServerFiles().then((serverFiles) => {
      if (serverFiles && serverFiles.length > 0) {
        setFiles(serverFiles);
      }
    });

    // Fetch live messages from server
    storageService.fetchServerMessages().then((serverMsgs) => {
      if (serverMsgs && serverMsgs.length > 0) {
        setMessages(serverMsgs);
      }
    });
  }, []);

  // 2. Real-time Live Synchronization via Server-Sent Events (SSE) + Auto-Reconnect
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/live-stream');

        eventSource.onopen = () => {
          setIsLiveConnected(true);
        };

        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);

            if (data.type === 'NEW_FILE' && data.file) {
              setFiles((prev) => {
                const exists = prev.some((f) => f.id === data.file.id);
                if (exists) return prev;
                return [data.file, ...prev];
              });
              showToast(`📄 Naya Document "${data.file.title}" website pe live upload ho gaya!`, 'success');
            } else if (data.type === 'FILE_DELETED' && data.fileId) {
              setFiles((prev) => prev.filter((f) => f.id !== data.fileId));
              showToast('🗑️ Ek document Admin dwara remove kar diya gaya.', 'info');
            } else if (data.type === 'NEW_MESSAGE' && data.message) {
              setMessages((prev) => {
                const exists = prev.some((m) => m.id === data.message.id);
                if (exists) return prev;
                return [...prev, data.message];
              });
            } else if (data.type === 'NEW_UNLOCK' && data.record) {
              setUnlocks((prev) => {
                const exists = prev.some(
                  (u) => u.fileId === data.record.fileId && u.userId === data.record.userId
                );
                if (exists) return prev;
                return [data.record, ...prev];
              });
              setFiles((prev) =>
                prev.map((f) => (f.id === data.record.fileId ? { ...f, unlockCount: (f.unlockCount || 0) + 1 } : f))
              );
            }
          } catch (err) {
            // Ignore parse errors on keepalive comments
          }
        };

        eventSource.onerror = () => {
          setIsLiveConnected(false);
          eventSource?.close();
          // Reconnect in 3 seconds
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch {
        setIsLiveConnected(false);
      }
    };

    connectSSE();

    // Fallback periodic sync every 4 seconds to guarantee all friends see new documents
    const pollInterval = setInterval(async () => {
      try {
        const [latestFiles, latestMsgs] = await Promise.all([
          storageService.fetchServerFiles(),
          storageService.fetchServerMessages(),
        ]);
        if (latestFiles && latestFiles.length > 0) {
          setFiles(latestFiles);
        }
        if (latestMsgs && latestMsgs.length > 0) {
          setMessages(latestMsgs);
        }
      } catch {
        // quiet
      }
    }, 4000);

    return () => {
      eventSource?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
    };
  }, []);

  // Profile Switching & Admin PIN Guard
  const handleSelectUser = (user: UserProfile) => {
    const isTargetAdmin = user.isAdmin || user.role === 'admin' || user.name === 'Abhiram Behera';

    if (isTargetAdmin && !isVerifiedAdmin) {
      // Prompt secret PIN before allowing Admin switch
      setIsAdminPinOpen(true);
      return;
    }

    storageService.setActiveUserId(user.id);
    setActiveUser(user);

    if (isTargetAdmin && isVerifiedAdmin) {
      showToast(`Admin Mode Active (${user.name}) - Master Controls Enabled.`, 'success');
    } else {
      showToast(`Switched to (${user.name}) - Paywall active for friends.`, 'info');
    }
  };

  const handleAdminPinSuccess = () => {
    setIsVerifiedAdmin(true);
    try {
      sessionStorage.setItem('lockvault_admin_verified', 'true');
    } catch {
      // ignore
    }

    // Set active user to Abhiram Behera
    const adminProfile = profiles.find((p) => p.name === 'Abhiram Behera' || p.isAdmin);
    if (adminProfile) {
      storageService.setActiveUserId(adminProfile.id);
      setActiveUser(adminProfile);
    }
    setIsAdminPinOpen(false);
    showToast('Admin Abhiram Behera Authenticated! Master controls unlocked.', 'success');
  };

  const handleDeleteFile = async (fileToDelete: MediaFile) => {
    if (!activeUser) return;
    const canDelete = isVerifiedAdmin && Boolean(activeUser.isAdmin || activeUser.role === 'admin' || activeUser.name === 'Abhiram Behera');

    if (!canDelete) {
      showToast('Permission Denied: Only verified Admin (Abhiram Behera) can delete files.', 'error');
      setIsAdminPinOpen(true);
      return;
    }

    await storageService.deleteFile(fileToDelete.id, '6969');
    setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
    showToast(`File "${fileToDelete.title}" deleted successfully by Admin Abhiram Behera.`, 'success');
  };

  // Real-time Chat message sender
  const handleSendMessage = async (text: string) => {
    if (!activeUser) return;
    await storageService.sendServerMessage({
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderAvatar: activeUser.avatar,
      senderRole: activeUser.isAdmin && isVerifiedAdmin ? 'admin' : activeUser.role,
      text,
    });
  };

  // Instant File Upload callback
  const handleFileUploaded = (newFile: MediaFile) => {
    setFiles((prev) => [newFile, ...prev.filter((f) => f.id !== newFile.id)]);
  };

  // Group circles list
  const groups = ['all', ...Array.from(new Set(files.map((f) => f.groupName)))];

  // Filtering
  const filteredFiles = files.filter((f) => {
    const matchesType = selectedType === 'all' || f.type === selectedType;
    const matchesGroup = selectedGroup === 'all' || f.groupName === selectedGroup;
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesGroup && matchesSearch;
  });

  // Calculate creator earnings for the active user
  const userFiles = activeUser ? files.filter((f) => f.creatorId === activeUser.id) : [];
  const userFileIds = new Set(userFiles.map((f) => f.id));
  const creatorEarnings = unlocks
    .filter((u) => userFileIds.has(u.fileId))
    .reduce((sum, u) => sum + u.amountPaid, 0);

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <p className="text-sm">Connecting to LockVault Live Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <Navbar
        activeUser={activeUser}
        profiles={profiles}
        onSelectUser={handleSelectUser}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenEarnings={() => setIsEarningsOpen(true)}
        onOpenSecurityLogs={() => setIsSecurityOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenLiveChat={() => setIsLiveChatOpen(true)}
        creatorEarnings={creatorEarnings}
        blockedAttemptsCount={securityLogs.length}
        isLiveConnected={isLiveConnected}
        isVerifiedAdmin={isVerifiedAdmin}
        onOpenAdminLogin={() => setIsAdminPinOpen(true)}
      />

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Real-time sync status pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
            <span className="font-semibold text-slate-800">
              {isLiveConnected ? 'Real-Time Sync Active' : 'Connecting to Live Server...'}
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">
              Abhiram Behera dwara banaya gaya Paywall & DRM System
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiveChatOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Group Live Chat ({messages.length})</span>
            </button>

            {isVerifiedAdmin && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" /> Admin Verified
              </span>
            )}
          </div>
        </div>

        {/* Hero Banner with Feature Explanation */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <QrCode className="w-3.5 h-3.5" /> Pay-to-Unlock QR Code Paywall
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> App Maker: Abhiram Behera
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Real-Time Document & PDF Sharing with UPI QR Paywall
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Main yahan koi bhi PDF ya document chodunga to turant website pe sabhi doston ko live dikhai dega. 
              <strong> Jisne document upload kiya hai usko chod ke baki sabhi doston ko QR code scan karke paise dekar document open karna padega.</strong>
            </p>

            {/* Admin status notice */}
            {isVerifiedAdmin && (activeUser.isAdmin || activeUser.name === 'Abhiram Behera') ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Admin Mode Active (Abhiram Behera):</strong> Aap kisi bhi document ko delete ya manage kar sakte hain.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsVerifiedAdmin(false);
                    try {
                      sessionStorage.removeItem('lockvault_admin_verified');
                    } catch {}
                    const friend = profiles.find((p) => p.name !== 'Abhiram Behera') || profiles[1];
                    if (friend) handleSelectUser(friend);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg shrink-0"
                >
                  Friend View (Test Paywall)
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Viewing as <strong>{activeUser.name}</strong> (Friend). Dusre creators ke documents open karne ke liye QR scan karke pay karna hoga.
                  </span>
                </div>
                <button
                  onClick={() => setIsAdminPinOpen(true)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shrink-0 transition-colors"
                >
                  Admin Login (Abhiram)
                </button>
              </div>
            )}

            {/* Quick action bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsLiveChatOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Doston Se Baat Karo</span>
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
              >
                + Custom Upload Modal
              </button>

              <button
                onClick={() => setIsShareOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
              >
                Website Link Doston Ko Bhejo
              </button>
            </div>
          </div>
        </div>

        {/* 3. INSTANT DOCUMENT & PDF DROP ZONE */}
        <QuickDropZone
          activeUser={activeUser}
          onFileUploaded={handleFileUploaded}
          onShowToast={showToast}
        />

        {/* 4. CONTROLS: CATEGORIES, GROUPS & SEARCH */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Type selector tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedType === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>All Documents</span>
                <span className="text-[10px] bg-slate-700/50 text-white px-1.5 py-0.5 rounded-md">
                  {files.length}
                </span>
              </button>

              <button
                onClick={() => setSelectedType('pdf')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedType === 'pdf'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span>PDF Notes</span>
                <span className="text-[10px] text-slate-400">
                  ({files.filter((f) => f.type === 'pdf').length})
                </span>
              </button>

              <button
                onClick={() => setSelectedType('image')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedType === 'image'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Photos</span>
                <span className="text-[10px] text-slate-400">
                  ({files.filter((f) => f.type === 'image').length})
                </span>
              </button>

              <button
                onClick={() => setSelectedType('video')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedType === 'video'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-amber-500" />
                <span>Videos</span>
                <span className="text-[10px] text-slate-400">
                  ({files.filter((f) => f.type === 'video').length})
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, creator or circle..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Group / Circle filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Circles:
            </span>
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedGroup === grp
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {grp === 'all' ? 'All Circles' : grp}
              </button>
            ))}
          </div>
        </div>

        {/* 5. FILES GRID */}
        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Koi Document Nahi Mila</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upar diye gaye Quick Drop Box me koi bhi PDF ya file chodo, turant upload ho jayega!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredFiles.map((file) => {
              // ACCESS RESTRICTION RULE:
              // "Aur joo documents chodega usko chod ke baki sab ko qr main paise dee kar documents open karna padega"
              const isOwner = file.creatorId === activeUser.id || (isVerifiedAdmin && activeUser.isAdmin);
              const isUnlocked = isOwner || storageService.isFileUnlockedForUser(file, activeUser.id, isVerifiedAdmin && activeUser.isAdmin);

              return (
                <FileCard
                  key={file.id}
                  file={file}
                  activeUser={activeUser}
                  isUnlocked={isUnlocked}
                  isOwner={isOwner}
                  isVerifiedAdmin={isVerifiedAdmin}
                  onOpenPaywall={(f) => setPaywallFile(f)}
                  onOpenViewer={(f) => setViewerFile(f)}
                  onDeleteFile={(f) => handleDeleteFile(f)}
                  onPromptAdminPin={() => setIsAdminPinOpen(true)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Real-time Live Chat Pill Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsLiveChatOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xl border border-slate-700 transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Live Baat Karo</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px]">
                {messages.length}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Doston se live chat</div>
          </div>
        </button>
      </div>

      {/* MODALS */}
      {paywallFile && (
        <PaywallModal
          file={paywallFile}
          activeUser={activeUser}
          onClose={() => setPaywallFile(null)}
          onUnlockSuccess={() => {
            const unlocked = paywallFile;
            setPaywallFile(null);
            refreshLocalData();
            showToast(`Document "${unlocked.title}" unlocked successfully! Opening protected viewer...`, 'success');
            setTimeout(() => {
              setViewerFile(unlocked);
            }, 300);
          }}
        />
      )}

      {viewerFile && (
        <SecureViewerModal
          file={viewerFile}
          activeUser={activeUser}
          onClose={() => setViewerFile(null)}
          onLogSecurityEvent={(event) => {
            storageService.logSecurityEvent(event);
            setSecurityLogs(storageService.getSecurityLogs());
          }}
        />
      )}

      {isUploadOpen && (
        <UploadModal
          activeUser={activeUser}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={(newFile) => {
            setIsUploadOpen(false);
            handleFileUploaded(newFile);
            showToast(`"${newFile.title}" uploaded! Live broadcasted to all friends.`, 'success');
          }}
        />
      )}

      <EarningsDrawer
        isOpen={isEarningsOpen}
        onClose={() => setIsEarningsOpen(false)}
        activeUser={activeUser}
        files={files}
        unlocks={unlocks}
        profiles={profiles}
      />

      <SecurityDrawer
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        logs={securityLogs}
        events={securityLogs}
        onClearLogs={() => setSecurityLogs([])}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <AdminPinModal
        isOpen={isAdminPinOpen}
        onClose={() => setIsAdminPinOpen(false)}
        onSuccess={handleAdminPinSuccess}
      />

      <LiveChatDrawer
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
        activeUser={activeUser}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLiveConnected={isLiveConnected}
      />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-500/40'
                : toastMessage.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-500/40'
                : 'bg-slate-900 text-slate-200 border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
