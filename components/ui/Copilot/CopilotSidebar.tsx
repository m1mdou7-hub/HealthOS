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
            className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-zinc-950 border-l border-zinc-900/90 z-50 shadow-2xl flex flex-col text-left"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-zinc-900/80 bg-zinc-900/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">Clinical AI Copilot</h4>
                  <p className="text-[10px] text-zinc-400">Decision-Support Engine</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Patient summary badge */}
            <div className="p-3 bg-purple-950/15 border-b border-purple-500/10 flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400">Active Record:</span>
              <span className="text-purple-300 font-bold">{activePatientName}</span>
            </div>

            {/* Conversation history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] font-mono text-zinc-500 mb-1">
                    {msg.role === 'user' ? 'Dentist' : 'Copilot'}
                  </span>
                  <div
                    className={`p-3 rounded-2xl max-w-[90%] text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none font-sans'
                        : 'bg-zinc-900 text-zinc-300 border border-zinc-850 rounded-tl-none font-mono'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-mono text-zinc-500 mb-1">Copilot</span>
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-850 rounded-tl-none text-xs flex items-center gap-2 text-purple-400 font-mono animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                    Milling clinical correlations...
                  </div>
                </div>
              )}
            </div>

            {/* Quick reply templates */}
            <div className="p-2 border-t border-zinc-900/60 bg-zinc-900/10 flex flex-wrap gap-1.5">
              <button
                onClick={() => onInputChange("Are there any medical alerts, allergic indicators, or contraindications I should be aware of?")}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-[9px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Review Medical Alerts
              </button>
              <button
                onClick={() => onInputChange("Review medications and list contraindications for local anesthetics.")}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-[9px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Anesthetic Risks
              </button>
              <button
                onClick={() => onInputChange("Review the existing clinical notes history and summarize patient progression.")}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-[9px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Case Progress
              </button>
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950">
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
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-500/50"
                />
                <button
                  disabled={loading || !input.trim()}
                  onClick={handleSend}
                  className="absolute right-2 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white transition-all active:scale-95"
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
