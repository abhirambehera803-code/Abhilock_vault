import React, { useState } from 'react';
import { 
  X, ShieldAlert, ShieldCheck, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, 
  FileText, Image as ImageIcon, Video, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { MediaFile, UserProfile } from '../types';
import { useAntiScreenshot } from '../hooks/useAntiScreenshot';

interface SecureViewerModalProps {
  file: MediaFile;
  activeUser: UserProfile;
  onClose: () => void;
}

export const SecureViewerModal: React.FC<SecureViewerModalProps> = ({
  file,
  activeUser,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showWatermarkDetails, setShowWatermarkDetails] = useState(true);

  // Hook intercepts screenshot keys, snipping tool blur, window focus loss, print dialogue
  const { isShieldActive, shieldReason, dismissShield, violationCount, triggerShield } = useAntiScreenshot({
    enabled: file.antiScreenshot,
    fileTitle: file.title,
    userName: activeUser.name,
  });

  const totalPages = file.pdfPages ? file.pdfPages.length : (file.pageCount || 1);
  const currentTimestamp = new Date().toLocaleString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Dynamic user watermark string
  const watermarkText = `LICENSED TO: ${activeUser.name.toUpperCase()} • ID: ${activeUser.id} • ${currentTimestamp} • STRICTLY CONFIDENTIAL - DO NOT SHARE`;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden drm-protected-content"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* 1. BLACKOUT / CAPTURE DEFENSE SHIELD (Appears instantly when screenshot, snipping tool, or blur is detected) */}
      {isShieldActive && (
        <div className="absolute inset-0 z-50 bg-black/98 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-100 backdrop-blur-3xl">
          <div className="max-w-md p-6 bg-slate-900 border-2 border-rose-600/80 rounded-2xl shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-rose-950/60 border border-rose-500 rounded-2xl flex items-center justify-center mx-auto text-rose-400 animate-pulse">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div>
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                Security Alert #{violationCount}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Screenshot / Screen Capture Blocked!
              </h3>
              <p className="text-xs text-rose-300/90 mt-1 font-mono">
                {shieldReason || 'Screen capture or recording tool detected.'}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              This document is protected by <strong className="text-white">LockVault DRM</strong>. 
              Screenshotting, snipping, recording, and printing are prohibited to protect the creator&apos;s copyright. 
              This incident has been logged with your verified identity (<span className="text-emerald-400 font-semibold">{activeUser.name}</span>).
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={dismissShield}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
              >
                I Understand - Resume Protected View
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors"
              >
                Exit Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEWER TOP BAR */}
      <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
            {file.type === 'pdf' ? <FileText className="w-4 h-4" /> : file.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate flex items-center gap-2">
              <span>{file.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3" /> Anti-Screenshot Active
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              Licensed to <strong className="text-slate-200">{activeUser.name}</strong> ({activeUser.id}) • Non-Transferable
            </p>
          </div>
        </div>

        {/* Action controls (Zoom & Navigation) */}
        <div className="flex items-center gap-2">
          {file.type === 'pdf' && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg text-xs">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-slate-300 font-mono text-[11px]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg text-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
              className="p-1 text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(175, prev + 15))}
              className="p-1 text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Test Shield Button (Allows tester to simulate screenshot detection) */}
          <button
            onClick={() => triggerShield('Simulated screenshot attempt test.', 'screenshot_attempt')}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-amber-800/40 transition-colors"
            title="Test Anti-Screenshot blackout trigger"
          >
            <AlertTriangle className="w-3 h-3" /> Test Shield
          </button>

          {/* Watermark toggle */}
          <button
            onClick={() => setShowWatermarkDetails(!showWatermarkDetails)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            title={showWatermarkDetails ? 'Watermark overlay visible' : 'Watermark dimmed'}
          >
            {showWatermarkDetails ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Close Viewer */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 transition-colors"
            title="Close Protected Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. MAIN PROTECTED CANVAS WITH DYNAMIC FORENSIC WATERMARK OVERLAY */}
      <div className="relative flex-1 overflow-auto bg-slate-950 p-4 sm:p-8 flex items-center justify-center">
        {/* Dynamic Watermark Grid Overlay - Diagonal forensic tracking lines */}
        {file.watermarkEnabled && showWatermarkDetails && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex flex-col justify-around opacity-25">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="whitespace-nowrap font-mono text-xs sm:text-sm font-bold text-slate-400 tracking-widest -rotate-12 translate-x-[-10%]"
              >
                {watermarkText} &nbsp;&nbsp; • &nbsp;&nbsp; {watermarkText}
              </div>
            ))}
          </div>
        )}

        {/* Center Content Renderer */}
        <div 
          className="relative z-20 transition-transform duration-150 ease-out"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
        >
          {/* TYPE A: PDF DOCUMENT VIEWER */}
          {file.type === 'pdf' && (
            <div className="w-[320px] sm:w-[580px] md:w-[680px] min-h-[820px] bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-2xl border border-slate-200 font-sans relative overflow-hidden">
              {/* Document Header Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    ACADEMIC & PEER STUDY CIRCLE • {file.groupName.toUpperCase()}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                    {file.title}
                  </h2>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Authored by <span className="font-semibold text-slate-800">{file.creatorName}</span> • Verified Document Hash: LV-98172
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded border border-emerald-300">
                    ORIGINAL LICENSED COPY
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>

              {/* Page Content */}
              <div className="prose max-w-none text-slate-800 text-sm leading-relaxed space-y-4 font-mono whitespace-pre-line">
                {file.pdfPages && file.pdfPages[currentPage - 1] ? (
                  file.pdfPages[currentPage - 1]
                ) : (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 border-b pb-1 font-sans">
                      Section {currentPage}: Comprehensive Concepts & Frameworks
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-slate-700 font-sans">
                      {file.description}
                    </p>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 mt-4">
                      <code>
                        // Algorithm Optimization Invariant (Page {currentPage})<br/>
                        const secureHash = DRM.verifyToken(&apos;{file.id}&apos;, &apos;{activeUser.id}&apos;);<br/>
                        assert(secureHash.isValid === true, &apos;Access granted under peer license&apos;);<br/>
                        return calculateShortestPath(nodes, edges);
                      </code>
                    </div>
                    <p className="text-xs text-slate-600 mt-4 font-sans">
                      Notice: This material was prepared exclusively for verified members of {file.groupName}. Unauthorized reproduction or capture triggers immediate account deauthorization.
                    </p>
                  </div>
                )}
              </div>

              {/* Document Page Footer */}
              <div className="absolute bottom-6 left-8 right-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>LockVault DRM Protected Document</span>
                <span>Page {currentPage} / {totalPages}</span>
                <span>UID: {activeUser.id}</span>
              </div>
            </div>
          )}

          {/* TYPE B: HIGH-RES PHOTO VIEWER */}
          {file.type === 'image' && (
            <div className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center relative">
              <img
                src={file.contentUrl || file.previewUrl}
                alt={file.title}
                className="max-h-[75vh] w-auto rounded-xl shadow-2xl object-contain border border-slate-800 pointer-events-none"
                draggable={false}
              />
              <div className="mt-3 text-xs text-slate-400 font-mono text-center">
                High-Resolution Media • Anti-Inspect & Save Disabled
              </div>
            </div>
          )}

          {/* TYPE C: SECURE VIDEO PLAYER */}
          {file.type === 'video' && (
            <div className="w-[320px] sm:w-[600px] md:w-[760px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
              <video
                src={file.contentUrl}
                controls
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                className="w-full aspect-video bg-black object-contain"
                poster={file.previewUrl}
              >
                Your browser does not support HTML5 video.
              </video>
              <div className="p-3 bg-slate-900 text-xs text-slate-400 flex items-center justify-between">
                <span>{file.title} ({file.duration || 'Video'})</span>
                <span className="text-[10px] text-emerald-400 font-mono">DRM Encrypted Stream</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. VIEWER BOTTOM SECURITY STATUS BAR */}
      <div className="h-10 bg-slate-900/90 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3" />
            DRM Shield Armed
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">Snipping tool & PrintScreen listeners active</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400">Violations: <strong className={violationCount > 0 ? 'text-rose-400' : 'text-slate-300'}>{violationCount}</strong></span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-slate-300">Session #{activeUser.id.replace('user_', '')}</span>
        </div>
      </div>
    </div>
  );
};
