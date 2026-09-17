import React from 'react';
import { X, IndianRupee, Users, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MediaFile, UnlockRecord, UserProfile } from '../types';

interface EarningsDrawerProps {
  isOpen?: boolean;
  activeUser: UserProfile;
  files?: MediaFile[];
  unlocks?: UnlockRecord[];
  profiles?: UserProfile[];
  onClose: () => void;
}

export const EarningsDrawer: React.FC<EarningsDrawerProps> = ({
  isOpen = false,
  activeUser,
  files = [],
  unlocks = [],
  profiles = [],
  onClose,
}) => {
  if (!isOpen) return null;

  // Find all files created by the active user
  const userFiles = (files || []).filter(f => f.creatorId === activeUser.id);
  const userFileIds = new Set(userFiles.map(f => f.id));

  // Find all unlocks on this creator's files
  const creatorUnlocks = (unlocks || []).filter(u => userFileIds.has(u.fileId));

  // Calculate total earnings
  const totalEarned = creatorUnlocks.reduce((sum, u) => sum + u.amountPaid, 0);

  const getProfile = (userId: string) => {
    return (profiles || []).find(p => p.id === userId);
  };

  const getFile = (fileId: string) => {
    return (files || []).find(f => f.id === fileId);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" /> Creator Dashboard
            </div>
            <h2 className="text-lg font-bold text-slate-900">Your Paywall Earnings</h2>
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
          {/* Revenue Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Total Revenue Collected
            </div>
            <div className="text-3xl font-black tracking-tight text-white flex items-center mt-1">
              <IndianRupee className="w-7 h-7 text-emerald-400" />
              <span>{totalEarned}</span>
              <span className="text-xs font-normal text-slate-400 ml-2">Direct via UPI</span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Paid Unlocks</span>
                <strong className="text-slate-200 text-sm">{creatorUnlocks.length} unlocks</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Registered UPI ID</span>
                <strong className="text-emerald-400 font-mono text-[11px] truncate block">{activeUser.upiId}</strong>
              </div>
            </div>
          </div>

          {/* Published Paywalled Files */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              Your Monitored Files ({userFiles.length})
            </h3>
            <div className="space-y-2">
              {userFiles.length === 0 ? (
                <div className="text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-xl border border-slate-200">
                  You haven&apos;t uploaded any files yet. Tap &apos;Upload&apos; to set up your first QR paywall.
                </div>
              ) : (
                userFiles.map(file => (
                  <div
                    key={file.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-slate-800 truncate">{file.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Price: ₹{file.price}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">{file.unlockCount} paid</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-700 bg-white px-2 py-1 rounded border">
                      ₹{file.price * file.unlockCount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Unlocks / Transactions Log */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              Recent Friend Payments
            </h3>
            <div className="space-y-2">
              {creatorUnlocks.length === 0 ? (
                <div className="text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-xl border border-slate-200">
                  No unlock transactions recorded yet for your files.
                </div>
              ) : (
                creatorUnlocks.map((rec, idx) => {
                  const payer = getProfile(rec.userId);
                  const file = getFile(rec.fileId);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={payer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={payer?.name || 'User'}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate flex items-center gap-1">
                            {payer?.name || 'Friend'}
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {file?.title || 'Protected File'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {rec.transactionRef} • {rec.unlockedAt}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          +₹{rec.amountPaid}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
