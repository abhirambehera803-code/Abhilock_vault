import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Shield, Zap, Sparkles, Loader2 } from 'lucide-react';
import { MediaFile, UserProfile } from '../types';
import { storageService } from '../services/storageService';

interface QuickDropZoneProps {
  activeUser: UserProfile;
  onFileUploaded: (file: MediaFile) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const QuickDropZone: React.FC<QuickDropZoneProps> = ({
  activeUser,
  onFileUploaded,
  onShowToast,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadName, setCurrentUploadName] = useState('');
  const [customPrice, setCustomPrice] = useState('49');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processAndUploadFile = async (file: File) => {
    setIsProcessing(true);
    setCurrentUploadName(file.name);
    setUploadProgress(20);

    const priceNum = Math.max(0, parseInt(customPrice, 10) || 49);
    const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.includes('image');
    const isVideo = file.type.includes('video');

    const fileType: 'pdf' | 'image' | 'video' = isPdf ? 'pdf' : (isVideo ? 'video' : 'image');

    // Read file as Data URL
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 70) + 20;
        setUploadProgress(percent);
      }
    };

    reader.onload = async (event) => {
      setUploadProgress(90);
      const dataUrl = event.target?.result as string;

      // Extract cleaned title
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();

      const newMediaFile: MediaFile = {
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: cleanTitle || 'Uploaded Document',
        description: `Verified document uploaded by ${activeUser.name}. Protected with LockVault QR paywall and anti-screenshot DRM.`,
        type: fileType,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        pageCount: isPdf ? 14 : undefined,
        duration: isVideo ? '10:00 min' : undefined,
        previewUrl: isPdf 
          ? 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80'
          : (isImage ? dataUrl : 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80'),
        contentUrl: dataUrl,
        pdfPages: isPdf ? [
          `CHAPTER 1: ${cleanTitle.toUpperCase()}\n\n` +
          `Document: ${file.name}\n` +
          `File Size: ${(file.size / 1024).toFixed(0)} KB\n` +
          `Uploaded by: ${activeUser.name}\n\n` +
          `- Verified personal study resource shared under LockVault DRM.\n` +
          `- Screenshot, printing, and recording are strictly prohibited.\n` +
          `- Real-time synchronization active across all friends.`,
          `CHAPTER 2: DETAILED MODULES & NOTES\n\n- Comprehensive revision points and formulas.\n- Peer verified content.`
        ] : undefined,
        price: priceNum,
        creatorId: activeUser.id,
        creatorName: activeUser.name,
        creatorAvatar: activeUser.avatar,
        creatorUpiId: activeUser.upiId || 'abhiram.behera@okaxis',
        createdAt: 'Just now',
        groupName: 'Batch 2026 Friends Circle',
        antiScreenshot: true,
        watermarkEnabled: true,
        allowForwarding: false,
        unlockCount: 0,
      };

      try {
        await storageService.addFile(newMediaFile);
        setUploadProgress(100);
        setTimeout(() => {
          setIsProcessing(false);
          setUploadProgress(0);
          onFileUploaded(newMediaFile);
          onShowToast(`"${cleanTitle}" turant upload ho gaya! Sabhi doston ke paas live pahunch chuka hai.`, 'success');
        }, 400);
      } catch {
        setIsProcessing(false);
        setUploadProgress(0);
        onShowToast('Upload me samasya aayi. Dobara prayas karein.', 'error');
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full mb-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.mp4,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all p-6 sm:p-8 text-center overflow-hidden ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01] shadow-xl ring-4 ring-emerald-500/20'
            : 'border-slate-300 hover:border-emerald-500 hover:bg-white bg-slate-100/70 shadow-sm'
        }`}
      >
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {isProcessing ? (
          <div className="space-y-4 py-3 max-w-md mx-auto animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                Uploading & Broadcasting: {currentUploadName}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Real-time server sync... {uploadProgress}%
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Live PDF & Document Drop</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Koi bhi PDF ya Document yahan <span className="text-emerald-600">Chodo ya Click Karo</span>
              </h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1 leading-relaxed">
                Yahan drop karte hi document turant website pe upload hoga aur sabhi doston ke paas live pahunch jayega! Aapke alawa baki sab QR scan karke pay karke hi open kar payenge.
              </p>
            </div>

            {/* Price configuration bar */}
            <div 
              className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-slate-500 pl-2 font-medium">Paywall Unlock Price:</span>
              <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900">₹</span>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-12 bg-transparent text-slate-900 font-bold text-xs focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 pr-2">
                (Aapka document aapke liye free, doston ke liye paywall)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
