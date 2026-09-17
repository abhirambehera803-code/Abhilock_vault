import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, MessageSquare, Shield, Sparkles, User, Crown, 
  CheckCircle2, FileText, Bell, Zap, CornerDownRight 
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';

interface LiveChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLiveConnected: boolean;
}

export const LiveChatDrawer: React.FC<LiveChatDrawerProps> = ({
  isOpen,
  onClose,
  activeUser,
  messages,
  onSendMessage,
  isLiveConnected,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await onSendMessage(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const quickReplies = [
    'Bhai notes upload ho gaye kya?',
    'Maine QR scan karke pay kar diya! ✅',
    'Ekdum mast handwritten notes hain! 💯',
    'Naya PDF turant open ho gaya!',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Group Live Discussion</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isLiveConnected 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  {isLiveConnected ? 'LIVE SYNC' : 'Connecting...'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Real-time updates & study chat with all friends
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live status notice */}
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real-time connected as: <strong className="text-emerald-950">{activeUser.name}</strong></span>
          </div>
          {activeUser.isAdmin && (
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 text-[10px] font-bold">
              Admin
            </span>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
          {messages.map((msg) => {
            const isMe = msg.senderId === activeUser.id;
            const isSystem = msg.systemEvent;

            if (isSystem) {
              return (
                <div key={msg.id} className="p-2.5 rounded-xl bg-slate-900 text-slate-100 text-xs border border-slate-800 shadow-sm flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-emerald-400">Live System Broadcast</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5 font-medium leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img 
                  src={msg.senderAvatar} 
                  alt={msg.senderName} 
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-1 shrink-0" 
                />

                <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-1.5 text-[10px] ${isMe ? 'flex-row-reverse text-slate-500' : 'text-slate-500'}`}>
                    <span className="font-semibold text-slate-800">{msg.senderName}</span>
                    {msg.senderRole === 'admin' && (
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-emerald-400 text-[9px] font-bold">
                        Admin
                      </span>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div 
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm' 
                        : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick chip responses */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickReplies.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(chip)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-slate-600 whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Live message likho doston ke liye..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-sm transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
