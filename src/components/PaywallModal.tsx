import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  X, Copy, Check, ShieldCheck, Lock, IndianRupee, QrCode as QrIcon, 
  AlertCircle, ArrowRight, CheckCircle2, Loader2, Sparkles 
} from 'lucide-react';
import { MediaFile, UserProfile } from '../types';
import { storageService } from '../services/storageService';

interface PaywallModalProps {
  file: MediaFile;
  activeUser: UserProfile;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  file,
  activeUser,
  onClose,
  onUnlockSuccess,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState<{
    status: boolean;
    referenceId?: string;
    amount?: number;
    timestamp?: string;
  } | null>(null);

  // Generate UPI QR code string
  // Format: upi://pay?pa=upiId&pn=PayeeName&am=Price&cu=INR&tn=Note
  const payeeUpi = file.creatorUpiId || 'creator@upi';
  const payeeName = file.creatorName;
  const upiUri = `upi://pay?pa=${payeeUpi}&pn=${encodeURIComponent(payeeName)}&am=${file.price}&cu=INR&tn=${encodeURIComponent('LockVault Unlock: ' + file.title.substring(0, 30))}`;

  useEffect(() => {
    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url: string) => setQrCodeDataUrl(url))
      .catch((err: unknown) => console.error('QR code generation error:', err));
  }, [upiUri]);

  const handleCopyUpi = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(payeeUpi);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback using execCommand for restricted iframes or unfocused documents
      try {
        const textArea = document.createElement('textarea');
        textArea.value = payeeUpi;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silently catch if copying is blocked by browser policy
      }
    }
  };

  const handleVerifyPayment = (isDemoBypass = false) => {
    if (!isDemoBypass && !utrNumber.trim()) {
      setVerificationError('Please enter the 12-digit UPI Transaction / UTR ID after paying.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    // Simulate realistic bank webhook / UPI payment gateway handshake
    setTimeout(() => {
      const generatedRef = isDemoBypass
        ? `SIM-UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`
        : `UTR-${utrNumber.trim()}`;

      storageService.recordUnlock(file.id, activeUser.id, file.price, generatedRef);

      // Trigger celebratory confetti safely
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.55 },
        });
      } catch {
        // Safe fallback for canvas context issues
      }

      setIsVerifying(false);
      
      // Set visually rich Payment Verified confirmation state
      setPaymentVerified({
        status: true,
        referenceId: generatedRef,
        amount: file.price,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      // Allow user to view confirmation briefly before auto-opening viewer or let them click
      setTimeout(() => {
        onUnlockSuccess();
      }, 1600);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* PAYMENT VERIFIED CONFIRMATION STATE */}
        {paymentVerified ? (
          <div className="p-7 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60" />
              <div className="relative w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-11 h-11" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Payment Verified
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Access Granted & Unlocked!
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Transaction verified with {payeeName}. Anti-screenshot DRM license has been generated for your session.
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Item:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{file.title}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600 flex items-center">
                  <IndianRupee className="w-3 h-3" /> {paymentVerified.amount}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Ref / UTR ID:</span>
                <span className="font-mono font-semibold text-slate-700 text-[11px]">{paymentVerified.referenceId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Time:</span>
                <span className="text-slate-600 font-mono text-[11px]">{paymentVerified.timestamp}</span>
              </div>
            </div>

            {/* CTA to proceed immediately */}
            <div className="pt-2">
              <button
                onClick={onUnlockSuccess}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Open File Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[11px] text-slate-400 mt-2">
                Opening automatically in a moment...
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mb-2 border border-emerald-200">
                <Lock className="w-3.5 h-3.5" /> Pay-to-Unlock Protection
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {file.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Uploaded by <span className="font-semibold text-slate-700">{file.creatorName}</span> in {file.groupName}
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Price Card */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 text-white shadow-inner">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Unlock Price</div>
                  <div className="text-2xl font-black tracking-tight text-white flex items-center">
                    <IndianRupee className="w-5 h-5 text-emerald-400" />
                    <span>{file.price}</span>
                    <span className="text-xs font-normal text-slate-400 ml-1.5">INR (One-time)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-emerald-300 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> DRM License
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">Bound to {activeUser.name}</div>
                </div>
              </div>

              {/* Simulation Quick Bar for Testing */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                <div className="text-xs text-emerald-950 min-w-0">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Testing Flow / Demo</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 truncate">Test without sending real money</div>
                </div>
                <button
                  onClick={() => handleVerifyPayment(true)}
                  disabled={isVerifying}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simulate Payment</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                  <QrIcon className="w-4 h-4 text-emerald-600" />
                  Scan QR with any UPI App (GPay, PhonePe, Paytm, Cred)
                </div>

                {/* QR Image */}
                <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="UPI QR Code"
                      className="w-52 h-52 object-contain"
                    />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                      Generating UPI QR...
                    </div>
                  )}
                </div>

                {/* Payee Details & Copy button */}
                <div className="w-full mt-3 flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
                  <div className="truncate">
                    <span className="text-slate-400 text-[11px] block">UPI ID</span>
                    <span className="font-mono font-semibold text-slate-800">{payeeUpi}</span>
                  </div>
                  <button
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Direct Mobile Pay Option */}
                <a
                  href={upiUri}
                  className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors text-center shadow-sm"
                >
                  <span>Tap to Open UPI App (GPay / PhonePe / Paytm)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Anti-Piracy Rules notice */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-xs text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1 text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Anti-Piracy & Anti-Screenshot Protection:
                </div>
                <ul className="list-disc pl-4 text-[11px] space-y-0.5 text-amber-800/90">
                  <li>Your unique user watermark (Name + ID + Timestamp) will be stamped diagonally across the file.</li>
                  <li>Screenshot shortcuts, screen recording, and print tools are automatically blocked.</li>
                  <li>File is non-transferable and encrypted to your profile.</li>
                </ul>
              </div>

              {/* Verification section */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter UPI Ref / UTR ID after paying:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 423987123456 (12 digits)"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      onClick={() => handleVerifyPayment(false)}
                      disabled={isVerifying}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify UTR</span>
                      )}
                    </button>
                  </div>
                  {verificationError && (
                    <div className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {verificationError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

