import React, { useState } from 'react';
import { 
  Lock, Unlock, FileText, Image as ImageIcon, Video, IndianRupee, 
  ShieldCheck, Eye, Sparkles, UserCheck, X, ZoomIn, Layers, ChevronRight,
  HelpCircle, ShieldAlert, Trash2, Crown
} from 'lucide-react';
import { MediaFile, UserProfile } from '../types';

interface FileCardProps {
  file: MediaFile;
  activeUser: UserProfile;
  isUnlocked: boolean;
  isOwner: boolean;
  isVerifiedAdmin?: boolean;
  onOpenPaywall: (file: MediaFile) => void;
  onOpenViewer: (file: MediaFile) => void;
  onDeleteFile?: (file: MediaFile) => void;
  onPromptAdminPin?: () => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  activeUser,
  isUnlocked,
  isOwner,
  isVerifiedAdmin = false,
  onOpenPaywall,
  onOpenViewer,
  onDeleteFile,
  onPromptAdminPin,
}) => {
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isAdminUser = Boolean(
    activeUser.isAdmin || 
    activeUser.role === 'admin' || 
    activeUser.name === 'Abhiram Behera'
  );

  const canPerformAdminDelete = isAdminUser && isVerifiedAdmin;

  const handleAction = () => {
    if (isOwner || isUnlocked) {
      onOpenViewer(file);
    } else {
      onOpenPaywall(file);
    }
  };

  // Extract snippet for realistic PDF page 1 preview
  const getPdfPreviewSnippet = () => {
    if (file.pdfPages && file.pdfPages.length > 0 && file.pdfPages[0]) {
      const raw = file.pdfPages[0];
      const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const heading = lines[0] || `CHAPTER 1: ${file.title.toUpperCase()}`;
      const bodyLines = lines.slice(1, 6);
      return { heading, bodyLines };
    }
    return {
      heading: `CHAPTER 1: ${file.title.toUpperCase()}`,
      bodyLines: [
        '1. Verified Subject Materials & Formula Breakdown',
        '- Comprehensive revision concepts and structured notes.',
        '- Curated exclusively for verified study circle members.',
        '- Anti-screenshot DRM security armed.'
      ]
    };
  };

  const pdfSnippet = file.type === 'pdf' ? getPdfPreviewSnippet() : null;

  return (
    <>
      <div 
        className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col relative"
      >
        {/* Thumbnail Area with Watermarked & Blurred Previews */}
        <div 
          onClick={() => {
            if (isOwner || isUnlocked) {
              onOpenViewer(file);
            } else {
              setShowSampleModal(true);
            }
          }}
          className="relative aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer select-none"
        >
          {/* A. UNLOCKED OR OWNER VIEW */}
          {(isUnlocked || isOwner) ? (
            <div className="w-full h-full relative">
              <img
                src={file.previewUrl}
                alt={file.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] text-emerald-300 border border-emerald-500/30">
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {isOwner ? 'Your Upload' : 'Licensed to You'}
                </span>
                <span className="text-[10px] text-slate-400">Anti-Screenshot Armed</span>
              </div>
            </div>
          ) : file.type === 'pdf' ? (
            /* B. LOCKED PDF PAGE PREVIEW THUMBNAIL (Realistic Document Page with Blur & Watermark Stamp) */
            <div className="w-full h-full relative p-2.5 sm:p-3 flex items-center justify-center bg-slate-900">
              {/* Darkened blurred backdrop image */}
              <img
                src={file.previewUrl}
                alt={file.title}
                className="absolute inset-0 w-full h-full object-cover opacity-15 filter blur-sm scale-105"
              />

              {/* Realistic Document Sheet */}
              <div className="relative w-full h-full max-w-[270px] bg-white rounded-lg shadow-lg border border-slate-200/90 p-2.5 flex flex-col justify-between overflow-hidden">
                {/* Document Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-800 truncate max-w-[130px]">
                      {file.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 shrink-0">
                    Page 1 of {file.pageCount || 1}
                  </span>
                </div>

                {/* Document Body Snippet with Controlled Optical Blur */}
                <div className="relative flex-1 overflow-hidden py-0.5">
                  <div className="text-[8px] leading-tight text-slate-600 space-y-1 filter blur-[1.2px] select-none">
                    <div className="font-extrabold text-[9px] text-slate-900 uppercase tracking-tight">
                      {pdfSnippet?.heading}
                    </div>
                    {pdfSnippet?.bodyLines.slice(0, 3).map((line, idx) => (
                      <p key={idx} className="line-clamp-1 opacity-85">
                        {line}
                      </p>
                    ))}
                    {/* Simulated document lines */}
                    <div className="pt-0.5 space-y-1 opacity-60">
                      <div className="h-1 bg-slate-300 rounded w-11/12" />
                      <div className="h-1 bg-slate-200 rounded w-full" />
                      <div className="h-1 bg-slate-300 rounded w-4/5" />
                    </div>
                  </div>

                  {/* Prominent Diagonal Watermark Stamp */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="transform -rotate-12 px-2.5 py-1 bg-rose-500/10 border-2 border-dashed border-rose-500/70 rounded-md text-center backdrop-blur-[0.5px] shadow-sm">
                      <div className="text-[9px] font-black tracking-widest text-rose-600 uppercase font-mono leading-none">
                        SAMPLE PREVIEW
                      </div>
                      <div className="text-[7.5px] font-bold text-rose-700 mt-0.5 leading-none">
                        PAGE 1 • UNLOCK FOR ₹{file.price}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Sheet Footer */}
                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-500">
                    <Eye className="w-2.5 h-2.5 text-slate-400" /> Tap to inspect
                  </span>
                  <span className="font-mono text-[8px]">Page 1 / {file.pageCount || 1}</span>
                </div>
              </div>
            </div>
          ) : file.type === 'image' ? (
            /* C. LOCKED IMAGE THUMBNAIL (Controlled Blur + Diagonal Repeating Watermark Pattern) */
            <div className="w-full h-full relative overflow-hidden">
              <img
                src={file.previewUrl}
                alt={file.title}
                className="w-full h-full object-cover filter blur-[3.5px] brightness-90 transition-transform duration-300 group-hover:scale-105"
              />

              {/* Repeating Diagonal Watermark Pattern */}
              <div className="absolute inset-0 flex flex-col justify-around pointer-events-none opacity-45 select-none overflow-hidden rotate-[-15deg] scale-125">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="whitespace-nowrap text-[10px] font-mono font-black text-white tracking-widest drop-shadow">
                    SAMPLE PREVIEW • LOCKVAULT PROTECTED • SAMPLE PREVIEW • LOCKVAULT
                  </div>
                ))}
              </div>

              {/* Center Watermark Stamp Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 pointer-events-none">
                <div className="px-3 py-1.5 bg-slate-950/75 border border-white/20 rounded-xl text-center backdrop-blur-md shadow-lg">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white tracking-wide">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Watermarked Preview</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">
                    Pay ₹{file.price} to unlock full HD
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* D. LOCKED VIDEO THUMBNAIL */
            <div className="w-full h-full relative overflow-hidden">
              <img
                src={file.previewUrl}
                alt={file.title}
                className="w-full h-full object-cover filter blur-[3px] brightness-85 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-emerald-400 mb-1.5 shadow-lg">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="px-2.5 py-1 bg-slate-900/80 rounded-lg text-[10px] font-bold text-white backdrop-blur-md">
                  Locked Video Clip • {file.duration}
                </div>
              </div>
            </div>
          )}

          {/* Media type indicator badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold border border-white/10 z-10">
            {file.type === 'pdf' && <FileText className="w-3 h-3 text-rose-400" />}
            {file.type === 'image' && <ImageIcon className="w-3 h-3 text-blue-400" />}
            {file.type === 'video' && <Video className="w-3 h-3 text-purple-400" />}
            <span className="uppercase font-mono">{file.type}</span>
            {file.pageCount && <span className="text-slate-300">• {file.pageCount} pgs</span>}
            {file.duration && <span className="text-slate-300">• {file.duration}</span>}
          </div>

          {/* Price tag on top right */}
          <div className="absolute top-2.5 right-2.5 z-10">
            {file.price > 0 ? (
              <div className="flex items-center gap-0.5 px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold shadow-md">
                <IndianRupee className="w-3 h-3" />
                <span>{file.price}</span>
              </div>
            ) : (
              <div className="px-2 py-0.5 rounded-lg bg-slate-800/90 text-emerald-300 text-[11px] font-bold">
                FREE
              </div>
            )}
          </div>

          {/* Quick Peek Hint Chip (shown when locked) */}
          {!isUnlocked && !isOwner && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSampleModal(true);
              }}
              className="absolute bottom-2.5 right-2.5 z-10 px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 border border-white/15 backdrop-blur-md transition-transform active:scale-95 shadow-md"
            >
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>Preview Sample</span>
            </button>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Group / Channel Tag */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
              <span className="font-semibold text-slate-600 truncate max-w-[180px] bg-slate-100 px-2 py-0.5 rounded-md">
                {file.groupName}
              </span>
              <span className="text-slate-400 text-[10px] font-mono">{file.fileSize}</span>
            </div>

            {/* Title */}
            <h3 
              onClick={handleAction}
              className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
            >
              {file.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {file.description}
            </p>
          </div>

          {/* Creator Info & Action */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={file.creatorAvatar}
                  alt={file.creatorName}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                />
                <span className="text-slate-700 font-medium text-xs truncate">
                  {file.creatorName}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">{file.createdAt}</span>
            </div>

            {/* Action Buttons */}
            {isOwner ? (
              <button
                type="button"
                onClick={() => onOpenViewer(file)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>Owner Access • View File</span>
              </button>
            ) : isUnlocked ? (
              <button
                type="button"
                onClick={() => onOpenViewer(file)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-200" />
                <span>Open Protected File</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview Sample</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenPaywall(file)}
                  className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pay ₹{file.price}</span>
                </button>
              </div>
            )}

            {/* Admin Delete Action Bar (Strictly available ONLY to verified Admin - Abhiram Behera) */}
            {canPerformAdminDelete ? (
              <div className="pt-2.5 border-t border-rose-100 flex items-center justify-between bg-rose-50/70 -mx-4 -mb-4 px-4 py-2 mt-2 rounded-b-2xl">
                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700">
                  <Crown className="w-3 h-3 text-rose-600" />
                  <span>Admin Privilege</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                  title="Admin: Delete this file permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            ) : isAdminUser && !isVerifiedAdmin && onPromptAdminPin ? (
              <div className="pt-2.5 border-t border-amber-100 flex items-center justify-between bg-amber-50/70 -mx-4 -mb-4 px-4 py-2 mt-2 rounded-b-2xl">
                <span className="text-[10px] text-amber-800 font-medium">Admin actions locked</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPromptAdminPin();
                  }}
                  className="px-2 py-0.5 bg-slate-900 text-emerald-400 rounded-md text-[10px] font-bold hover:bg-slate-800 transition-colors"
                >
                  Enter PIN
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ADMIN DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                <Crown className="w-3 h-3" /> Admin Only Privilege
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Delete This File?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800 font-semibold">&ldquo;{file.title}&rdquo;</strong>?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Author:</span>
                <span className="font-semibold text-slate-700">{file.creatorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Action performed by:</span>
                <span className="font-semibold text-emerald-700">Abhiram Behera (Admin)</span>
              </div>
              <div className="pt-1 text-[10px] text-rose-600 font-medium">
                • This file will be permanently removed for all friends.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteFile?.(file);
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAMPLE PREVIEW MODAL (Inspecting blurred & watermarked preview before unlocking) */}
      {showSampleModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowSampleModal(false)}
        >
          <div 
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Sample Preview
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      (Blurred & Watermarked)
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {file.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Watermarked Preview Area */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-slate-100/60">
              {file.type === 'pdf' ? (
                /* PDF Page 1 Preview Inspection Sheet */
                <div className="relative bg-white rounded-xl shadow-md border border-slate-200 p-6 sm:p-8 overflow-hidden font-serif">
                  {/* Watermark Diagonal Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="transform -rotate-12 px-6 py-3 bg-rose-500/10 border-2 border-dashed border-rose-500/70 rounded-xl text-center backdrop-blur-[0.5px]">
                      <div className="text-lg sm:text-xl font-black tracking-widest text-rose-600 uppercase font-mono">
                        SAMPLE PREVIEW ONLY
                      </div>
                      <div className="text-xs font-bold text-rose-700 mt-1">
                        PAY ₹{file.price} TO UNLOCK ALL {file.pageCount || 1} PAGES
                      </div>
                      <div className="text-[10px] font-mono text-rose-500 mt-0.5">
                        DO NOT DISTRIBUTE • LOCKVAULT DRM
                      </div>
                    </div>
                  </div>

                  {/* Document Content Header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          {file.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {file.groupName} • Prepared by {file.creatorName}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                      Page 1 of {file.pageCount || 1}
                    </span>
                  </div>

                  {/* Blurred Body Text with Readable Headings */}
                  <div className="space-y-3 filter blur-[1.2px] select-none text-slate-700">
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1">
                      {pdfSnippet?.heading}
                    </h4>

                    {pdfSnippet?.bodyLines.map((line, idx) => (
                      <p key={idx} className="text-xs leading-relaxed">
                        {line}
                      </p>
                    ))}

                    <div className="pt-2 space-y-2 opacity-70">
                      <div className="h-2 bg-slate-300 rounded w-11/12" />
                      <div className="h-2 bg-slate-200 rounded w-full" />
                      <div className="h-2 bg-slate-300 rounded w-4/5" />
                      <div className="h-2 bg-slate-200 rounded w-10/12" />
                    </div>
                  </div>

                  {/* Sheet Footnote */}
                  <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>LockVault Paywall Preview System</span>
                    <span>Document Page 1 (Sample)</span>
                  </div>
                </div>
              ) : (
                /* Image Preview Inspection */
                <div className="relative rounded-xl overflow-hidden shadow-md bg-slate-900 border border-slate-300 aspect-[16/10]">
                  <img
                    src={file.previewUrl}
                    alt={file.title}
                    className="w-full h-full object-cover filter blur-[4px] brightness-90"
                  />

                  {/* Diagonal Repeating Watermark */}
                  <div className="absolute inset-0 flex flex-col justify-around pointer-events-none select-none overflow-hidden rotate-[-15deg] scale-125">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="whitespace-nowrap text-xs sm:text-sm font-mono font-black text-white/80 tracking-widest drop-shadow text-center">
                        SAMPLE PREVIEW • LICENSED VIA LOCKVAULT • PAY ₹{file.price} TO UNLOCK
                      </div>
                    ))}
                  </div>

                  {/* Center Stamp */}
                  <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                    <div className="px-4 py-2 bg-slate-950/80 border border-white/20 rounded-xl text-center backdrop-blur-md shadow-xl">
                      <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>Watermarked Preview Sample</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Unlock to view full resolution original
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informational reassurance notice */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-950">Verify Content Before Unlocking</div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    This watermarked sample preview lets you confirm the authenticity of this {file.type === 'pdf' ? `${file.pageCount || 1}-page PDF document` : 'file'} before paying. 
                    Once unlocked, you will get full high-resolution access with anti-screenshot protection.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer / CTA */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Unlock Price: <strong className="text-slate-900 text-sm font-bold">₹{file.price}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSampleModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close Preview
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSampleModal(false);
                    onOpenPaywall(file);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Pay ₹{file.price} to Unlock Full File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

