'use client';
import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, HeartHandshake, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: currentInput }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:
            currentInput.includes('SOAP') ? 'soap' :
            currentInput.includes('Clinical Findings') ? 'clinical_findings' :
            currentInput.includes('Treatment Suggestions') ? 'treatment_plan' :
            currentInput.includes('Patient Education') ? 'patient_education' :
            currentInput.includes('Referral Letter') ? 'referral_letter' :
            currentInput.includes('Lab Prescription') ? 'lab_prescription' :
            currentInput.includes('Progress Notes') ? 'progress_notes' :
            currentInput.includes('Follow-up Actions') ? 'follow_up' :
            'copilot',
          prompt: currentInput,
          // Sending complete history as additional context if supported
          history: messages,
        }),
      });

      if (!response.ok || !response.body) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        assistantResponse += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[600px] rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between overflow-hidden">
      {/* Output area */}
      <div
        ref={scrollRef}
        className="flex-1 p-6 flex flex-col overflow-y-auto space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="p-4 bg-purple-500/15 text-purple-400 rounded-2xl">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">HealthOS Clinical Assistant Online</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Ask a question like: "Summarize Patient Carter's latest hematology panel," or "Outline potential drug interactions for metformin."
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-50 rounded-br-none'
                        : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 rounded-bl-none prose prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800'
                    }`}
                  >
                    {/* Basic markdown rendering (could be replaced with react-markdown) */}
                    <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full justify-start"
              >
                <div className="max-w-[80%] p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-sm">Synthesizing clinical data...</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input field */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-zinc-950/40">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your clinical query here..."
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Prompts */}
        {messages.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Generate SOAP Note",
              "Clinical Findings Summary",
              "Treatment Suggestions",
              "Patient Education Draft",
              "Draft Referral Letter",
              "Draft Lab Prescription",
              "Draft Progress Notes",
              "Suggest Follow-up Actions"
            ].map(prompt => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
