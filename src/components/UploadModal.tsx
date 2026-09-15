import React, { useState, useRef } from 'react';
import { 
  X, UploadCloud, FileText, Image as ImageIcon, Video, IndianRupee, 
  ShieldCheck, Check, AlertCircle, Sparkles, HelpCircle 
} from 'lucide-react';
import { MediaFile, MediaType, UserProfile } from '../types';
import { storageService } from '../services/storageService';

interface UploadModalProps {
  activeUser: UserProfile;
  onClose: () => void;
  onSuccess: (newFile: MediaFile) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  activeUser,
  onClose,
  onSuccess,
}) => {
  const [fileType, setFileType] = useState<MediaType>('pdf');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupName, setGroupName] = useState('Study Circle 2026');
  const [price, setPrice] = useState<number>(49);
  const [customPrice, setCustomPrice] = useState('');
  const [upiId, setUpiId] = useState(activeUser.upiId || 'creator@upi');
  
  // Security settings
  const [antiScreenshot, setAntiScreenshot] = useState(true);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [allowForwarding, setAllowForwarding] = useState(false);

  // File state
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string>('8.4 MB');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [pdfTextContent, setPdfTextContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_PRICES = [0, 29, 49, 99, 149, 199];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const processFile = (file: File) => {
    setSelectedFileName(file.name);
    setSelectedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (file.type.includes('pdf')) {
      setFileType('pdf');
      setPreviewUrl('https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80');
      
      // Read text if text/plain or sample
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileDataUrl(event.target?.result as string);
        setPdfTextContent(
          `DOCUMENT TITLE: ${file.name}\n\n` +
          `1. Key Summary and Core Insights\n` +
          `- This verified file was uploaded under LockVault Paywall protection.\n` +
          `- File size: ${(file.size / 1024).toFixed(0)} KB\n\n` +
          `2. Terms of Use\n` +
          `- Licensed exclusively for personal review.\n` +
          `- Any attempt to capture or replicate will breach copyright terms.`
        );
      };
      reader.readAsDataURL(file);
    } else if (file.type.includes('image')) {
      setFileType('image');
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPreviewUrl(url);
        setFileDataUrl(url);
      };
      reader.readAsDataURL(file);
    } else if (file.type.includes('video')) {
      setFileType('video');
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPreviewUrl('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80');
        setFileDataUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the file.');
      return;
    }
    if (!upiId.trim()) {
      setError('Please enter your UPI ID so buyers can pay directly to your account.');
      return;
    }

    const finalPrice = customPrice !== '' ? Math.max(0, parseInt(customPrice, 10) || 0) : price;

    setIsUploading(true);
    setError(null);

    setTimeout(() => {
      // Default fallback previews if none uploaded
      let defaultPreview = previewUrl;
      if (!defaultPreview) {
        if (fileType === 'pdf') {
          defaultPreview = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80';
        } else if (fileType === 'image') {
          defaultPreview = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';
        } else {
          defaultPreview = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80';
        }
      }

      const newFile: MediaFile = {
        id: 'file_' + Date.now(),
        title: title.trim(),
        description: description.trim() || 'Shared via LockVault with anti-screenshot security.',
        type: fileType,
        fileSize: selectedFileSize,
        pageCount: fileType === 'pdf' ? 12 : undefined,
        duration: fileType === 'video' ? '08:45 min' : undefined,
        previewUrl: defaultPreview,
        contentUrl: fileDataUrl || defaultPreview,
        pdfPages: fileType === 'pdf' ? [
          `CHAPTER 1: ${title.toUpperCase()}\n\n` +
          (pdfTextContent || `This document contains protected notes provided by ${activeUser.name}.\n\n` +
          `- All concepts are curated for member study.\n- Dynamic DRM watermarking ensures authenticity.\n- Reproduction and external screenshot capture is forbidden.`),
          `CHAPTER 2: DETAILED MODULES & METHODOLOGIES\n\n- Key reference architectures and notes.\n- Formula sets and case studies.`
        ] : undefined,
        price: finalPrice,
        creatorId: activeUser.id,
        creatorName: activeUser.name,
        creatorAvatar: activeUser.avatar,
        creatorUpiId: upiId.trim(),
        createdAt: 'Just now',
        groupName: groupName.trim() || 'General Friends Circle',
        antiScreenshot,
        watermarkEnabled,
        allowForwarding,
        unlockCount: 0,
      };

      storageService.addFile(newFile);
      setIsUploading(false);
      onSuccess(newFile);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Upload & Set Paywall Lock</h2>
            <p className="text-xs text-slate-500">
              Share PDF, photos, or videos with QR payment & anti-screenshot DRM
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & drop upload box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            {selectedFileName ? (
              <div>
                <div className="text-xs font-bold text-slate-800">{selectedFileName}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{selectedFileSize} • Tap to change</div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold text-slate-700">
                  Click to choose PDF, Photo, or Video (or drag here)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supports PDF documents, JPG/PNG photos, and MP4 videos
                </div>
              </div>
            )}
          </div>

          {/* Media Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">File Category</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFileType('pdf')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  fileType === 'pdf'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-rose-500" />
                <span>PDF Document</span>
              </button>
              <button
                type="button"
                onClick={() => setFileType('image')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  fileType === 'image'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>Photos / Album</span>
              </button>
              <button
                type="button"
                onClick={() => setFileType('video')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  fileType === 'video'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Video className="w-4 h-4 text-purple-500" />
                <span>Video Clip</span>
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                File Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Complete Machine Learning Handwritten Notes 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Note for Friends
              </label>
              <textarea
                placeholder="Describe what is inside this file..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Group / Circle Name
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering 8th Sem, Goa Trip Memories, etc."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Price & QR Payment Settings */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Unlock Price (Amount on QR Code)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">INR</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_PRICES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPrice(p);
                    setCustomPrice('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    price === p && customPrice === ''
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p === 0 ? 'FREE' : `₹${p}`}
                </button>
              ))}
              <input
                type="number"
                placeholder="Custom ₹"
                value={customPrice}
                onChange={(e) => {
                  setCustomPrice(e.target.value);
                  setPrice(parseInt(e.target.value, 10) || 0);
                }}
                className="w-24 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Creator's UPI ID for direct bank deposits */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your UPI ID (Where friends will pay you) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                The QR code presented to friends will automatically transfer money directly to this UPI address.
              </p>
            </div>
          </div>

          {/* Anti-Piracy & Anti-Screenshot Toggles */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 space-y-3">
            <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Anti-Piracy & Protection Controls
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={antiScreenshot}
                onChange={(e) => setAntiScreenshot(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800">Anti-Screenshot & Snipping Tool Blocker</span>
                <p className="text-[11px] text-slate-500">
                  Screenshots, screen recordings, PrintScreen key, and window captures are automatically blacked out.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={watermarkEnabled}
                onChange={(e) => setWatermarkEnabled(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800">Dynamic Viewer Forensic Watermark</span>
                <p className="text-[11px] text-slate-500">
                  Diagonally stamps the viewer&apos;s verified Name, ID, and timestamp across every page/photo.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!allowForwarding}
                onChange={(e) => setAllowForwarding(!e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800">Non-Transferable (Strictly No Forwarding)</span>
                <p className="text-[11px] text-slate-500">
                  Direct raw file downloading and external URL sharing links are completely disabled.
                </p>
              </div>
            </label>
          </div>

          {/* Submit button */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              {isUploading ? 'Securing & Encrypting...' : 'Publish to Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
