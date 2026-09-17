import React from 'react';
import { ShieldCheck, Plus, IndianRupee, Users, Lock, ShieldAlert, ChevronDown, Share2, Crown, Shield, MessageSquare, Zap } from 'lucide-react';
import { UserProfile } from '../types';


interface NavbarProps {
  activeUser: UserProfile;
  profiles: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenUpload: () => void;
  onOpenEarnings: () => void;
  onOpenSecurityLogs: () => void;
  onOpenShare: () => void;
  onOpenLiveChat?: () => void;
  creatorEarnings: number;
  blockedAttemptsCount: number;
  isLiveConnected?: boolean;
  isVerifiedAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeUser,
  profiles,
  onSelectUser,
  onOpenUpload,
  onOpenEarnings,
  onOpenSecurityLogs,
  onOpenShare,
  onOpenLiveChat,
  creatorEarnings,
  blockedAttemptsCount,
  isLiveConnected = true,
  isVerifiedAdmin = false,
  onOpenAdminLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">LockVault</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Anti-Piracy DRM
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isLiveConnected 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                  {isLiveConnected ? 'LIVE' : 'SYNCING'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Pay-to-Unlock Media & Anti-Screenshot Share</p>
            </div>
          </div>

          {/* Center Info / Live Chat / Earnings pill */}
          <div className="hidden md:flex items-center gap-3">
            {onOpenLiveChat && (
              <button
                onClick={onOpenLiveChat}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                title="Open live chat and updates"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat & Updates</span>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </button>
            )}

            <button
              onClick={onOpenEarnings}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium transition-colors"
              title="View your creator earnings from file unlocks"
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Earnings: <strong className="font-bold">₹{creatorEarnings}</strong></span>
            </button>

            <button
              onClick={onOpenSecurityLogs}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
              title="View anti-screenshot interception logs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Security Shield: <span className="font-semibold text-amber-700">{blockedAttemptsCount} blocked</span></span>
            </button>
          </div>

          {/* Right actions: Profile Switcher & Upload Button */}
          <div className="flex items-center gap-3">
            {/* Friend profile switcher dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition-colors">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    {activeUser.name}
                    {(activeUser.isAdmin && isVerifiedAdmin) ? (
                      <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> Admin (Verified)
                      </span>
                    ) : activeUser.role === 'creator' ? (
                      <span className="text-[10px] bg-slate-800 text-white px-1 rounded">Creator</span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded">Friend</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[110px]">{activeUser.upiId}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 hidden group-hover:block hover:block z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> Switch User Profile
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Test Roles</span>
                </div>
                <div className="px-3 pb-2 text-[11px] text-slate-500">
                  Switch between Admin and Friend profiles:
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {profiles.map(profile => {
                    const isProfileAdmin = profile.isAdmin || profile.role === 'admin' || profile.name === 'Abhiram Behera';
                    return (
                      <button
                        key={profile.id}
                        onClick={() => {
                          if (isProfileAdmin && !isVerifiedAdmin && onOpenAdminLogin) {
                            onOpenAdminLogin();
                          } else {
                            onSelectUser(profile);
                          }
                        }}
                        className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                          profile.id === activeUser.id ? 'bg-emerald-50/60 font-medium' : ''
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          {isProfileAdmin && (
                            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full ring-1 ring-white">
                              <Crown className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-800 flex items-center justify-between gap-1">
                            <span className="truncate font-semibold">{profile.name}</span>
                            {profile.id === activeUser.id ? (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>
                            ) : isProfileAdmin ? (
                              <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1 rounded">Admin</span>
                            ) : null}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                            <span className="truncate font-mono">{profile.upiId}</span>
                            <span className="text-[9px] text-slate-500 shrink-0">
                              {isProfileAdmin ? 'Admin (PIN Protected)' : 'Friend / Viewer'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 pt-2 px-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Only verified <strong>Admin (Abhiram Behera)</strong> can delete files.</span>
                </div>
              </div>
            </div>

            {/* Mobile live chat trigger */}
            {onOpenLiveChat && (
              <button
                onClick={onOpenLiveChat}
                className="md:hidden p-2 rounded-xl bg-emerald-600 text-white shadow-sm"
                title="Live Discussion"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}

            {/* Share App Link Button */}
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
              title="Share app website link with friends"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Share Link</span>
            </button>

            {/* Upload & Lock File Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Upload & Set Paywall</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

