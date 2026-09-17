import React from 'react';
import { X, ShieldAlert, AlertTriangle, ShieldCheck, Check, Camera, Printer, EyeOff, Lock } from 'lucide-react';
import { SecurityEvent } from '../types';
import { storageService } from '../services/storageService';

interface SecurityDrawerProps {
  isOpen?: boolean;
  logs?: SecurityEvent[];
  events?: SecurityEvent[];
  onClose: () => void;
  onClearLogs?: () => void;
}

export const SecurityDrawer: React.FC<SecurityDrawerProps> = ({
  isOpen = false,
  logs,
  events,
  onClose,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  const displayLogs = logs || events || [];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <ShieldAlert className="w-3.5 h-3.5" /> DRM Protection Engine
            </div>
            <h2 className="text-lg font-bold text-slate-900">Anti-Piracy Shield & Logs</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Defense Features Summary */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Active Defenses
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <Camera className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Screenshot Keyboard Interception</strong>
                  <span className="text-slate-400 text-[11px]">
                    Captures PrintScreen, Cmd+Shift+3/4, Win+Shift+S, and Ctrl+Shift+S, blacking out the screen immediately.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <EyeOff className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Window Focus Loss Masking</strong>
                  <span className="text-slate-400 text-[11px]">
                    When Snipping Tool, OBS, or secondary screen-grabbers pull focus, viewer instantly turns black.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Printer className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Print & Save Suppression</strong>
                  <span className="text-slate-400 text-[11px]">
                    Ctrl+P and Ctrl+S are blocked with @media print CSS hiding document content completely.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Dynamic Forensic Watermarking</strong>
                  <span className="text-slate-400 text-[11px]">
                    Stamps the viewer&apos;s verified identity diagonally across every document, preventing mobile camera leaks.
                  </span>
                </div>
              </div>
            </div>
          </div>

            {/* Intercepted Events Log */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Intercepted Capture Events ({displayLogs.length})
              </h3>
              {displayLogs.length > 0 && onClearLogs && (
                <button
                  onClick={onClearLogs}
                  className="text-[11px] text-slate-400 hover:text-rose-600"
                >
                  Clear history
                </button>
              )}
            </div>

            <div className="space-y-2">
              {displayLogs.length === 0 ? (
                <div className="text-xs text-slate-400 p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                  No unauthorized screenshot or print attempts recorded yet.
                </div>
              ) : (
                displayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-rose-900 font-semibold">
                      <span className="capitalize">{log.action.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">{log.details}</div>
                    <div className="text-[10px] text-slate-400">
                      User: <strong className="text-slate-700">{log.userName}</strong> • File: {log.fileTitle}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
