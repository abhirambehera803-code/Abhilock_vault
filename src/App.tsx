import React, { useState, useEffect } from 'react';
import { 
  FileText, Image as ImageIcon, Video, Search, Filter, ShieldCheck, 
  Lock, QrCode, Eye, IndianRupee, Sparkles, Users, AlertTriangle, Crown, Trash2, CheckCircle2, Shield
} from 'lucide-react';
import { MediaFile, MediaType, UserProfile, UnlockRecord, SecurityEvent } from './types';
import { storageService, INITIAL_FILES } from './services/storageService';
import { Navbar } from './components/Navbar';
import { FileCard } from './components/FileCard';
import { PaywallModal } from './components/PaywallModal';
import { SecureViewerModal } from './components/SecureViewerModal';
import { UploadModal } from './components/UploadModal';
import { EarningsDrawer } from './components/EarningsDrawer';
import { SecurityDrawer } from './components/SecurityDrawer';
import { ShareModal } from './components/ShareModal';

export default function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [unlocks, setUnlocks] = useState<UnlockRecord[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

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
    }, 4000);
  };

  // Initialize data
  const refreshData = () => {
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

  useEffect(() => {
    refreshData();
  }, []);

  const handleSelectUser = (user: UserProfile) => {
    storageService.setActiveUserId(user.id);
    setActiveUser(user);
    const isAdmin = user.isAdmin || user.role === 'admin' || user.name === 'Abhiram Behera';
    if (isAdmin) {
      showToast(`Switched to Admin (${user.name}) - You can delete and manage all files.`, 'success');
    } else {
      showToast(`Switched to Friend (${user.name}) - Deletion restricted to Admin.`, 'info');
    }
  };

  const handleDeleteFile = (fileToDelete: MediaFile) => {
    if (!activeUser) return;
    const isAdmin = Boolean(activeUser.isAdmin || activeUser.role === 'admin' || activeUser.name === 'Abhiram Behera');
    
    if (!isAdmin) {
      showToast(`Permission Denied: Only Admin (Abhiram Behera) can delete files.`, 'error');
      return;
    }

    storageService.deleteFile(fileToDelete.id);
    refreshData();
    showToast(`File "${fileToDelete.title}" deleted successfully by Admin Abhiram Behera.`, 'success');
  };

  // Group circles list
  const groups = ['all', ...Array.from(new Set(files.map(f => f.groupName)))];

  // Filtering
  const filteredFiles = files.filter(f => {
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
  const userFiles = activeUser ? files.filter(f => f.creatorId === activeUser.id) : [];
  const userFileIds = new Set(userFiles.map(f => f.id));
  const creatorEarnings = unlocks
    .filter(u => userFileIds.has(u.fileId))
    .reduce((sum, u) => sum + u.amountPaid, 0);

  if (!activeUser) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading LockVault...</div>;
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
        creatorEarnings={creatorEarnings}
        blockedAttemptsCount={securityLogs.length}
      />

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Hero Banner with Feature Explanation */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <QrCode className="w-3.5 h-3.5" /> Pay-to-Unlock QR & Anti-Screenshot Protection
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> App Maker: Abhiram Behera
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Share PDFs, Photos & Videos Behind Secure QR Paywalls
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Files are locked behind custom UPI QR payments. When friends tap to open, they scan the QR to pay the set amount. 
              Once unlocked, the file opens in a <strong>hardened anti-screenshot viewer</strong> with personalized forensic watermarks, 
              preventing screen grabs, snipping tool captures, and unauthorized sharing.
            </p>

            {/* Admin vs Friend Role Status Notice */}
            {(activeUser.isAdmin || activeUser.role === 'admin' || activeUser.name === 'Abhiram Behera') ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Admin Mode Active (Abhiram Behera):</strong> You have exclusive permission to delete any file and manage security settings.
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Viewing as <strong>{activeUser.name}</strong> (Friend). File deletion is restricted to Admin (<strong>Abhiram Behera</strong>).
                  </span>
                </div>
                <button
                  onClick={() => {
                    const adminProfile = profiles.find(p => p.name === 'Abhiram Behera' || p.isAdmin);
                    if (adminProfile) handleSelectUser(adminProfile);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shrink-0 transition-colors"
                >
                  Switch to Admin
                </button>
              </div>
            )}

            {/* Quick action bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-slate-200 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Active User: <strong className="text-white font-semibold">{activeUser.name}</strong></span>
              </div>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/25"
              >
                + Share New Locked File
              </button>

              <button
                onClick={() => setIsSecurityOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                How DRM Works
              </button>
            </div>
          </div>
        </div>

        {/* 3. CONTROLS: CATEGORIES, GROUPS & SEARCH */}
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
                <span>All Media</span>
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
                  ({files.filter(f => f.type === 'pdf').length})
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
                  ({files.filter(f => f.type === 'image').length})
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
                <Video className="w-3.5 h-3.5 text-purple-500" />
                <span>Videos</span>
                <span className="text-[10px] text-slate-400">
                  ({files.filter(f => f.type === 'video').length})
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search files, authors, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          {/* Group Circle Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-400 text-[11px] shrink-0 flex items-center gap-1">
              <Users className="w-3 h-3" /> Friend Circles:
            </span>
            {groups.map(grp => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedGroup === grp
                    ? 'bg-emerald-100 text-emerald-800 font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {grp === 'all' ? 'All Circles' : grp}
              </button>
            ))}
          </div>
        </div>

        {/* 4. FILE GRID */}
        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No matching files found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or clear the category filters to browse all shared documents.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedGroup('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredFiles.map(file => {
              const isUnlocked = storageService.isFileUnlockedForUser(file, activeUser.id);
              const isOwner = file.creatorId === activeUser.id;

              return (
                <FileCard
                  key={file.id}
                  file={file}
                  activeUser={activeUser}
                  isUnlocked={isUnlocked}
                  isOwner={isOwner}
                  onOpenPaywall={(f) => setPaywallFile(f)}
                  onOpenViewer={(f) => setViewerFile(f)}
                  onDeleteFile={(f) => handleDeleteFile(f)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER WITH APP MAKER ATTRIBUTION */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>LockVault DRM Platform</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium">v2.4</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Created & Engineered by App Maker <strong className="text-slate-900 font-bold">Abhiram Behera</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-center sm:text-right">
            <div className="text-[11px]">
              <span className="text-slate-400">System Admin: </span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Abhiram Behera (Delete Permissions)
              </span>
            </div>

            {(!activeUser.isAdmin && activeUser.name !== 'Abhiram Behera') ? (
              <button
                onClick={() => {
                  const adminProfile = profiles.find(p => p.name === 'Abhiram Behera' || p.isAdmin);
                  if (adminProfile) handleSelectUser(adminProfile);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to Admin (Abhiram Behera)</span>
              </button>
            ) : (
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Admin Privileges Active</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-sm">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
            toastMessage.type === 'success' 
              ? 'bg-slate-900 text-white border-emerald-500/40' 
              : toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-500/40'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />}
            <p className="text-xs font-medium leading-snug">{toastMessage.text}</p>
          </div>
        </div>
      )}

      {/* 5. MODALS & DRAWERS */}
      {/* Paywall QR Modal */}
      {paywallFile && (
        <PaywallModal
          file={paywallFile}
          activeUser={activeUser}
          onClose={() => setPaywallFile(null)}
          onUnlockSuccess={() => {
            const unlockedTarget = paywallFile;
            setPaywallFile(null);
            refreshData();
            // Automatically open secure viewer once paid!
            setViewerFile(unlockedTarget);
          }}
        />
      )}

      {/* Secure DRM Viewer Modal */}
      {viewerFile && (
        <SecureViewerModal
          file={viewerFile}
          activeUser={activeUser}
          onClose={() => {
            setViewerFile(null);
            refreshData();
          }}
        />
      )}

      {/* Upload File Modal */}
      {isUploadOpen && (
        <UploadModal
          activeUser={activeUser}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={(newFile) => {
            setIsUploadOpen(false);
            refreshData();
            // Open newly uploaded file directly
            setViewerFile(newFile);
          }}
        />
      )}

      {/* Creator Earnings Drawer */}
      {isEarningsOpen && (
        <EarningsDrawer
          activeUser={activeUser}
          files={files}
          unlocks={unlocks}
          profiles={profiles}
          onClose={() => setIsEarningsOpen(false)}
        />
      )}

      {/* Security Logs Drawer */}
      {isSecurityOpen && (
        <SecurityDrawer
          logs={securityLogs}
          onClose={() => setIsSecurityOpen(false)}
          onClearLogs={() => {
            localStorage.removeItem('lockvault_security_logs_v1');
            setSecurityLogs([]);
          }}
        />
      )}

      {/* Share App Link Modal */}
      {isShareOpen && (
        <ShareModal
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
}
