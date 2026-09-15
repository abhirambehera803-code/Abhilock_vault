import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, KeyRound, Crown } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError(null);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newPin = [...pin];
      newPin[index] = '';
      setPin(newPin);
      setError(null);
      return;
    }

    const digit = cleaned[cleaned.length - 1];
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(null);

    // Auto-advance to next input
    if (index < 3 && digit) {
      inputRefs[index + 1].current?.focus();
    }

    // If all 4 digits filled, verify automatically
    const fullPin = newPin.join('');
    if (fullPin.length === 4) {
      verifyPin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'Enter') {
      const fullPin = pin.join('');
      if (fullPin.length === 4) {
        verifyPin(fullPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted) {
      const newPin = ['', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newPin[i] = pasted[i];
      }
      setPin(newPin);
      if (pasted.length === 4) {
        verifyPin(pasted);
      } else if (inputRefs[pasted.length]) {
        inputRefs[pasted.length].current?.focus();
      }
    }
  };

  const verifyPin = async (enteredPin: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      // Direct fast local check combined with server API verification
      if (enteredPin === '6969') {
        // Correct Admin PIN
        setTimeout(() => {
          setIsVerifying(false);
          onSuccess();
        }, 200);
        return;
      }

      // Try server verification if online
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin }),
      }).catch(() => null);

      if (res && res.ok) {
        setIsVerifying(false);
        onSuccess();
      } else {
        setIsVerifying(false);
        setError('Incorrect Admin Security PIN. Access denied.');
        setPin(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch {
      setIsVerifying(false);
      setError('Incorrect Admin Security PIN. Access denied.');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900 text-emerald-400 text-[11px] font-bold">
            <Crown className="w-3 h-3" /> App Maker Authentication
          </div>

          <h3 className="text-lg font-black text-slate-900">
            Admin Verification
          </h3>
          <p className="text-xs text-slate-500 max-w-[260px] mx-auto leading-relaxed">
            Enter the 4-digit Security PIN to authenticate as <strong className="text-slate-800">Abhiram Behera</strong>.
          </p>
        </div>

        {/* PIN Input Boxes */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={pin[index]}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying}
                autoComplete="off"
                className={`w-12 h-14 text-center text-2xl font-bold rounded-2xl border-2 transition-all outline-none bg-slate-50 text-slate-900 ${
                  error
                    ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500'
                    : pin[index]
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 focus:border-emerald-500 focus:bg-white'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Restricted Access Notice</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Only verified Admin can access master document controls and manage uploads. All friends must pay via Paywall to open files.
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => verifyPin(pin.join(''))}
              disabled={isVerifying || pin.join('').length < 4}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              {isVerifying ? (
                <span className="animate-pulse">Verifying...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify PIN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
