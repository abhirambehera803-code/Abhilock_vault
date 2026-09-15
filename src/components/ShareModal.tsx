import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Share2, MessageCircle, ExternalLink, Globe } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Always ensure we share the public shared URL (ais-pre-), not private dev container (ais-dev-)
  const appUrl = (() => {
    const defaultPublicUrl = 'https://ais-pre-ijcinp3xuvit3mee2d5s2k-228540282179.asia-southeast1.run.app';
    if (typeof window === 'undefined') return defaultPublicUrl;
    const host = window.location.host;
    if (host.includes('ais-dev-')) {
      return `https://${host.replace('ais-dev-', 'ais-pre-')}`;
    }
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return defaultPublicUrl;
    }
    return window.location.origin;
  })();

  useEffect(() => {
    QRCode.toDataURL(appUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url: string) => setQrCodeUrl(url))
      .catch((err: unknown) => console.error(err));
  }, [appUrl]);

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(appUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error();
      }
    } catch {
      try {
        const input = document.createElement('input');
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Hey dost! LockVault par maine notes & media share kiya hai. Yahan se open kar sakte ho:\n${appUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Share with Friends</h3>
              <p className="text-[11px] text-slate-500">Send app link to open on phone or laptop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* QR code to scan directly from mobile */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-600 mb-2">
              Scan from Phone Camera to Open:
            </div>
            <div className="p-2 bg-white rounded-xl shadow border border-slate-200">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="App Website QR" className="w-40 h-40 object-contain" />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">Loading...</div>
              )}
            </div>
          </div>

          {/* Crucial Activation Instructions */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Zaroori Step: Public Link Active Karein
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Agar dosto ke phone me <b>"Error: Page not found"</b> dikhe, toh AI Studio ke top right bar me <b>"Share"</b> button par click karke public link publish karein. Uske baad link turant active ho jayega!
            </p>
          </div>

          {/* Universal compatibility note */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-[11px] text-emerald-800">
            <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Universal Link:</span> Android, iPhone, Chrome & WhatsApp me direct open hota hai.
            </div>
          </div>

          {/* Copy URL field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shareable Website URL:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 truncate select-all">
                {appUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp Share</span>
            </button>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-all text-center"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Test in Browser</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
