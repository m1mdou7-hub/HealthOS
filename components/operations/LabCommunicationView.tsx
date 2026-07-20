'use client';

import React, { useState, useMemo } from 'react';
import { LabCase, LabMessage } from './labTypes';
import { Send, FileText, CheckCircle, AlertTriangle, MessageSquare, ShieldCheck, Download, Plus, Sparkles } from 'lucide-react';

interface LabCommunicationViewProps {
  activeCase: LabCase;
  onUpdateCase: (updatedCase: LabCase) => void;
}

export default function LabCommunicationView({ activeCase, onUpdateCase }: LabCommunicationViewProps) {
  const [msgText, setMsgText] = useState('');
  const [msgType, setMsgType] = useState<LabMessage['type']>('Message');
  const [filterType, setFilterType] = useState<string>('All');

  const filteredMessages = useMemo(() => {
    return activeCase.communication.filter(m => filterType === 'All' || m.type === filterType);
  }, [activeCase.communication, filterType]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    const newMessage: LabMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Clinician',
      senderName: 'Dr. Robert Carter',
      text: msgText.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: msgType,
      isApproved: msgType === 'Approval Request' ? false : undefined
    };

    onUpdateCase({
      ...activeCase,
      communication: [...activeCase.communication, newMessage]
    });
    setMsgText('');
  };

  const handleApproveRequest = (msgId: string) => {
    const updatedComm = activeCase.communication.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          isApproved: true
        };
      }
      return m;
    });

    onUpdateCase({
      ...activeCase,
      communication: updatedComm,
      status: 'CAM', // Advance stage automatically on design approval!
      progressPercent: 33
    });
  };

  return (
    <div className="space-y-6 text-zinc-100 text-left">
      <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-tight">Secure Laboratory Communication</h3>
          <p className="text-xs text-zinc-500 font-mono">Secure, HIPAA-compliant chat and prescription audit logs between clinical operatory and lab technician.</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl text-[10px] font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>E2E ENCRYPTED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Chat and Actions (8 columns) */}
        <div className="lg:col-span-8 flex flex-col h-[480px] bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden justify-between">
          
          {/* Header Message Filter Bar */}
          <div className="p-3 bg-zinc-900/60 border-b border-zinc-900 flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Message Filter:</span>
            <div className="flex gap-1.5">
              {['All', 'Message', 'Comment', 'Revision Request', 'Approval Request'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-all ${
                    filterType === t 
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                      : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          {/* Message History Listing */}
          <div id="communication-chat-log" className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
            {filteredMessages.map((msg) => {
              const isClinician = msg.sender === 'Clinician';
              const isSys = msg.sender === 'System';

              return (
                <div
                  key={msg.id}
                  id={`chat-msg-${msg.id}`}
                  className={`flex flex-col ${isClinician ? 'items-end' : 'items-start'} max-w-full`}
                >
                  <div className="flex items-baseline gap-1.5 text-[9px] font-mono text-zinc-500 font-bold mb-0.5">
                    <span>{msg.senderName} ({msg.sender})</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs border ${
                    isClinician 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100 rounded-tr-none' 
                      : 'bg-zinc-900/60 border-zinc-850 text-zinc-200 rounded-tl-none'
                  }`}>
                    
                    {/* Specific card layout for Approval/Revision Requests */}
                    {msg.type === 'Approval Request' && (
                      <div className="space-y-2 border-b border-zinc-900 pb-2 mb-2">
                        <div className="flex items-center gap-1 text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>3D Design Approval Requested</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Please verify crown contour, contact pressure map, and subgingival margins.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          {msg.isApproved ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              Approved & Sent to CAM
                            </span>
                          ) : (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleApproveRequest(msg.id)}
                                id={`approve-design-btn-${msg.id}`}
                                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] font-mono px-3 py-1 rounded cursor-pointer transition-colors"
                              >
                                APPROVE & PROCEED
                              </button>
                              <button
                                onClick={() => alert('Simulating revision request reply draft...')}
                                id={`reject-design-btn-${msg.id}`}
                                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-[10px] font-mono px-3 py-1 rounded cursor-pointer transition-colors"
                              >
                                REQUEST REVISION
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {msg.type === 'Revision Request' && (
                      <div className="flex items-start gap-1.5 text-amber-400 font-semibold mb-1.5 uppercase text-[10px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>REVISION GUIDELINE REQ</span>
                      </div>
                    )}

                    <p className="leading-relaxed font-mono whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {filteredMessages.length === 0 && (
              <div className="py-24 text-center text-zinc-650 italic text-xs font-mono">
                No messaging records for selected filter.
              </div>
            )}
          </div>

          {/* Secure Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900 border-t border-zinc-900 flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              <select
                value={msgType}
                id="msg-type-select"
                onChange={(e) => setMsgType(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400 p-2 rounded-xl outline-none focus:border-emerald-500"
              >
                <option value="Message">Message</option>
                <option value="Comment">Comment</option>
                <option value="Revision Request">Revision</option>
                <option value="Approval Request">Approval Request</option>
              </select>

              <input
                type="text"
                value={msgText}
                id="msg-text-input"
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Secure message to Apex Lab Ceramist..."
                className="flex-1 bg-zinc-950 border border-zinc-800 text-xs rounded-xl px-3 outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-650"
              />
            </div>

            <button
              type="submit"
              id="send-msg-btn"
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </form>

        </div>

        {/* Right: Quick reference attachments list & notes (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Files panel */}
          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-2">
              Case Attachment References
            </span>

            <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
              {activeCase.files.map((file) => (
                <div key={file.id} className="p-2 bg-zinc-900/30 border border-zinc-900 rounded-xl flex justify-between items-center font-mono text-[11px]">
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-200 truncate">{file.name}</p>
                    <p className="text-[9px] text-zinc-500">{file.size} • {file.type}</p>
                  </div>
                  <button
                    onClick={() => alert(`Downloading attachment ${file.name}...`)}
                    id={`download-attachment-btn-${file.id}`}
                    className="p-1.5 text-zinc-400 hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('Simulating secure attachment stream...')}
              id="upload-attachment-btn"
              className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-700 bg-transparent rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-all font-mono text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Attachment</span>
            </button>
          </div>

          <div className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-2xl font-mono text-[10px] text-zinc-500">
            <p className="font-bold block text-zinc-400 mb-1">HIPAA AUDIT STATE:</p>
            <p>All communication lines recorded under PACS secure message log policy. Verification SHA-256 enabled on all attachments.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
