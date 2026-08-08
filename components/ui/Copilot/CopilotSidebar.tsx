import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePatientName: string;
  messages: Message[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  input: string;
  onInputChange: (val: string) => void;
}

export function CopilotSidebar({
  isOpen,
  onClose,
  activePatientName,
  messages,
  loading,
  onSendMessage,
  input,
  onInputChange
}: CopilotSidebarProps) {
  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSendMessage(input);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          <motion.div
            id="ai-copilot-sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 end-0 h-full w-full max-w-[380px] card-elevated border-s z-50 shadow-pop flex flex-col text-start rounded-none"
            style={{ borderLeft: '1px solid var(--velvet-border-strong)' }}
          >
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between relative overflow-hidden header-shimmer" style={{ borderBottom: '1px solid var(--velvet-border)', background: 'var(--velvet-surface-2)' }}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg flex items-center justify-center" style={{ background: 'var(--velvet-accent-glow2)', color: 'var(--velvet-accent)', border: '1px solid var(--velvet-border-strong)', boxShadow: '0 0 16px var(--velvet-accent-glow2)' }}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono" style={{ color: 'var(--velvet-text)' }}>Clinical AI Copilot</h4>
                  <p className="text-2xs" style={{ color: 'var(--velvet-text-muted)' }}>Decision-Support Engine</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="btn-ghost p-1.5 rounded-lg transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Patient summary badge */}
            <div className="p-3 flex items-center justify-between text-2xs font-mono" style={{ background: 'var(--velvet-accent-glow2)', borderBottom: '1px solid var(--velvet-border-strong)' }}>
              <span style={{ color: 'var(--velvet-text-muted)' }}>Active Record:</span>
              <span className="badge badge-success font-bold">{activePatientName}</span>
            </div>

            {/* Conversation history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-2xs font-mono mb-1" style={{ color: 'var(--velvet-text-muted)' }}>
                    {msg.role === 'user' ? 'Dentist' : 'Copilot'}
                  </span>
                  <div
                    className={`p-3 rounded-3xl max-w-[90%] text-xs leading-relaxed whitespace-pre-wrap shadow-soft ${
                      msg.role === 'user'
                        ? 'btn-primary rounded-te-none font-sans'
                        : 'card-elevated rounded-ts-none font-mono'
                    }`}
                    style={msg.role === 'user' ? {} : { color: 'var(--velvet-text-sub)' }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start">
                  <span className="text-2xs font-mono mb-1" style={{ color: 'var(--velvet-text-muted)' }}>Copilot</span>
                  <div className="p-3 rounded-3xl card-elevated rounded-ts-none text-xs flex items-center gap-2 font-mono animate-pulse" style={{ color: 'var(--velvet-accent)' }}>
                    <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'var(--velvet-accent)' }} />
                    <span className="h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0.2s]" style={{ background: 'var(--velvet-accent)' }} />
                    <span className="h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0.4s]" style={{ background: 'var(--velvet-accent)' }} />
                    Milling clinical correlations...
                  </div>
                </div>
              )}
            </div>

            {/* Quick reply templates */}
            <div className="p-2 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid var(--velvet-border)', background: 'var(--velvet-surface-2)' }}>
              <button
                onClick={() => onInputChange("Are there any medical alerts, allergic indicators, or contraindications I should be aware of?")}
                className="btn-secondary px-2 py-1 text-2xs"
              >
                Review Medical Alerts
              </button>
              <button
                onClick={() => onInputChange("Review medications and list contraindications for local anesthetics.")}
                className="btn-secondary px-2 py-1 text-2xs"
              >
                Anesthetic Risks
              </button>
              <button
                onClick={() => onInputChange("Review the existing clinical notes history and summarize patient progression.")}
                className="btn-secondary px-2 py-1 text-2xs"
              >
                Case Progress
              </button>
            </div>

            {/* Input Form */}
            <div className="p-4" style={{ borderTop: '1px solid var(--velvet-border)', background: 'var(--velvet-surface-solid)' }}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask clinical questions about patient..."
                  className="w-full ps-3 pe-10 py-2.5 rounded-xl text-xs"
                />
                <button
                  disabled={loading || !input.trim()}
                  onClick={handleSend}
                  className="absolute end-2 p-1.5 rounded-lg btn-primary disabled:opacity-40 text-white transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
