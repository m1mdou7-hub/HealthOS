'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Video,
  Pin,
  File,
  Megaphone,
  Send,
  Check,
  CheckCheck,
  Search,
  User,
  Clock,
  Plus,
  X,
  ChevronRight,
  Image,
  Paperclip,
  Smartphone,
  MoreVertical,
  Sliders,
  Sparkles,
  Inbox,
  Tv,
  Share2,
  Trash2,
  PhoneCall,
  Volume2
} from 'lucide-react';

// --- MOCK DATA ---
const CHANNELS = [
  { id: 'pat-1', name: 'Arthur Pendragon', type: 'patient', lastMsg: 'Will my milled zirconia crown be fitted by tomorrow noon?', time: '10:45 AM', unread: 2, status: 'online', channel: 'SMS', pinned: true },
  { id: 'pat-2', name: 'Clara Oswald', type: 'patient', lastMsg: 'The intraoral scan feels very smooth! Thank you Dr. Ahmed.', time: '09:30 AM', unread: 0, status: 'offline', channel: 'WhatsApp', pinned: true },
  { id: 'team-1', name: 'Surgical Restorative Team', type: 'team', lastMsg: 'Dr. Sarah: Ready for the guided implant try-in in Chair 3.', time: '10:12 AM', unread: 4, status: 'online', channel: 'Internal Chat', pinned: true },
  { id: 'team-2', name: 'Lab Technicians', type: 'team', lastMsg: 'Barton: Milling machine 4 finished sintering Diana Prince E.Max.', time: '08:15 AM', unread: 0, status: 'online', channel: 'Internal Chat', pinned: false },
  { id: 'pat-3', name: 'Bruce Wayne', type: 'patient', lastMsg: 'Can we schedule an urgent review of the CBCT scan next Monday?', time: 'Yesterday', unread: 1, status: 'offline', channel: 'Email', pinned: false },
  { id: 'pat-4', name: 'Diana Prince', type: 'patient', lastMsg: 'I reviewed the Smile Design digital mockups, looks stellar.', time: '2 days ago', unread: 0, status: 'online', channel: 'WhatsApp', pinned: false },
  { id: 'team-3', name: 'Dr. Sarah Jenkins', type: 'internal', lastMsg: 'Let’s check the periodontology report for patient Arthur.', time: '3 days ago', unread: 0, status: 'offline', channel: 'Internal Chat', pinned: false }
];

const INITIAL_MESSAGES: Record<string, any[]> = {
  'pat-1': [
    { id: 'm1', sender: 'patient', text: 'Hello, I completed my teeth cleaning and wanted to check on the prosthetic crown.', time: '10:14 AM' },
    { id: 'm2', sender: 'doctor', text: 'Hello Arthur, the design is currently in our laboratory milling queue. It is being fabricated using translucent multi-layered zirconia.', time: '10:20 AM' },
    { id: 'm3', sender: 'patient', text: 'Will my milled zirconia crown be fitted by tomorrow noon?', time: '10:45 AM' }
  ],
  'team-1': [
    { id: 't1', sender: 'Dr. Sarah', text: 'Morning everyone. We have 4 complex implant arches today.', time: '08:30 AM' },
    { id: 't2', sender: 'Dr. Ahmed', text: 'Make sure the DICOM imports and intraoral scans are loaded on the operatory displays.', time: '08:45 AM' },
    { id: 't3', sender: 'Hygienist Jenkins', text: 'Loaded. SprintRay printer has been preheated for denture surgical guides.', time: '09:00 AM' },
    { id: 't4', sender: 'Dr. Sarah', text: 'Dr. Ahmed: Ready for the guided implant try-in in Chair 3.', time: '10:12 AM' }
  ],
  'pat-2': [
    { id: 'c1', sender: 'doctor', text: 'Clara, your intraoral scan exports are verified. Setting up exocad alignments.', time: '09:15 AM' },
    { id: 'c2', sender: 'patient', text: 'The intraoral scan feels very smooth! Thank you Dr. Ahmed.', time: '09:30 AM' }
  ],
  'team-2': [
    { id: 'b1', sender: 'Barton', text: 'Milling machine 4 finished sintering Diana Prince E.Max.', time: '08:15 AM' }
  ],
  'pat-3': [
    { id: 'bw1', sender: 'patient', text: 'Can we schedule an urgent review of the CBCT scan next Monday?', time: 'Yesterday' }
  ],
  'pat-4': [
    { id: 'dp1', sender: 'patient', text: 'I reviewed the Smile Design digital mockups, looks stellar.', time: '2 days ago' }
  ],
  'team-3': [
    { id: 'sj1', sender: 'Dr. Sarah', text: 'Let’s check the periodontology report for patient Arthur.', time: '3 days ago' }
  ]
};

const CALL_HISTORY = [
  { id: 'call-1', name: 'Arthur Pendragon', type: 'Voice Call', duration: '12m 45s', timestamp: 'Today, 10:00 AM', status: 'Completed', channel: 'Twilio Cloud Voice' },
  { id: 'call-2', name: 'Bruce Wayne', type: 'Video Consult', duration: '45m 12s', timestamp: 'Yesterday, 02:30 PM', status: 'Completed', channel: 'WebRTC Secure Video' },
  { id: 'call-3', name: 'Diana Prince', type: 'Video Consult', duration: '18m 00s', timestamp: '2 days ago, 11:00 AM', status: 'Missed', channel: 'WebRTC Secure Video' }
];

const ANNOUNCEMENTS = [
  { id: 'ann-1', title: 'HIPAA Audits Completed', content: 'Our annual structural cybersecurity audit has concluded with a 100% compliance index score.', date: 'July 15, 2026', author: 'Compliance Director' },
  { id: 'ann-2', title: 'System Maintenance Window', content: 'On-site CAD/CAM server backup will take place this Sunday at 02:00 AM UTC. Expect minor latency.', date: 'July 14, 2026', author: 'IT Operations' }
];

const SHARED_FILES = [
  { id: 'f-1', name: 'Arthur_Pendragon_CBCT_Arch.dcm', size: '48.2 MB', type: 'DICOM', date: 'Jul 16' },
  { id: 'f-2', name: 'Diana_Prince_SmileDesign_3D.stl', size: '14.5 MB', type: 'STL Scan', date: 'Jul 15' },
  { id: 'f-3', name: 'Treatment_Acceptance_Warranty.pdf', size: '1.2 MB', type: 'PDF Document', date: 'Jul 12' }
];

export default function CommunicationWorkspace() {
  const [activeTab, setActiveTab] = useState<'threads' | 'calls' | 'broadcast' | 'announcements'>('threads');
  const [channels, setChannels] = useState(CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('pat-1');
  const [allMessages, setAllMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'patient' | 'team'>('all');

  // Broadcast campaign states
  const [broadcastTarget, setBroadcastTarget] = useState('All Implants Patients');
  const [broadcastMedium, setBroadcastMedium] = useState('SMS (Twilio)');
  const [broadcastText, setBroadcastText] = useState('Friendly update: Your digital crown designs have cleared milling. Booking fittings shortly.');
  const [broadcastHistory, setBroadcastHistory] = useState([
    { id: 'bc-1', campaign: 'Recall Notice Q3', target: 'All Orthodontics', date: 'Jul 10', count: 142, status: 'Delivered' }
  ]);

  // Video/Voice consultation preview states
  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState('00:00');

  // Success notifications toast
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Filter channels
  const filteredChannels = useMemo(() => {
    return channels.filter(ch => {
      const matchSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ch.lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterType === 'all' || ch.type === filterType;
      return matchSearch && matchFilter;
    });
  }, [channels, searchQuery, filterType]);

  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === activeChannelId) || channels[0];
  }, [channels, activeChannelId]);

  const messagesList = useMemo(() => {
    return allMessages[activeChannelId] || [];
  }, [allMessages, activeChannelId]);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      text: inputText,
      time: 'Just now'
    };

    setAllMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage]
    }));

    // Update last message in channels list
    setChannels(prev => prev.map(ch => {
      if (ch.id === activeChannelId) {
        return { ...ch, lastMsg: inputText, time: 'Just now', unread: 0 };
      }
      return ch;
    }));

    setInputText('');
    triggerToast('Message dispatched across authorized proxy gateway.');
  };

  // Launch simulated video/voice call
  const startCall = () => {
    setIsCalling(true);
    triggerToast(`Initializing secure connection to ${activeChannel.name}...`);
    setTimeout(() => {
      setCallActive(true);
      triggerToast('Call established. Secured with HIPAA-compliant WebRTC tunneling.');
    }, 1500);
  };

  const endCall = () => {
    setIsCalling(false);
    setCallActive(false);
    triggerToast('Consultation session closed. Call summary logs saved to EHR.');
  };

  // Trigger patient broadcase
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    const newBc = {
      id: `bc-${Date.now()}`,
      campaign: `EHR Broadcast [${broadcastTarget}]`,
      target: broadcastTarget,
      date: 'Today',
      count: broadcastTarget.includes('All') ? 350 : 84,
      status: 'Delivered'
    };

    setBroadcastHistory([newBc, ...broadcastHistory]);
    setBroadcastText('');
    triggerToast(`Broadcast launched successfully to ${newBc.count} patients.`);
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Toast Warning */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500/30">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-900">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-850">
          {[
            { id: 'threads', label: '1. Communication Inbox & Chat', icon: MessageSquare },
            { id: 'calls', label: '2. Call & Video Consultation', icon: PhoneCall },
            { id: 'broadcast', label: '3. Patient Broadcast Engine', icon: Megaphone },
            { id: 'announcements', label: '4. Internal Announcements', icon: Inbox }
          ].map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                id={`btn-tab-${t.id}`}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  isSel ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-zinc-950 border border-zinc-850 text-zinc-400">
            Total Channels: <strong className="text-white">{channels.length}</strong>
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Gateway: Operational
          </span>
        </div>
      </div>

      {/* CALL CONSOLE OVERLAY PANEL */}
      {isCalling && (
        <div className="p-6 rounded-2xl bg-zinc-950 border-2 border-emerald-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Phone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono">HIPAA Consult Active</p>
              <h4 className="text-lg font-bold text-white">{activeChannel.name}</h4>
              <p className="text-xs text-emerald-400 font-mono">
                {callActive ? 'Connected • AES-256 Tunneled Session' : 'Ringing patient device...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-mono flex items-center gap-2 hover:bg-zinc-800">
              <Volume2 className="w-4 h-4" /> Mute Mic
            </button>
            <button 
              onClick={endCall}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs font-mono cursor-pointer transition-all"
            >
              Hang up
            </button>
          </div>
        </div>
      )}

      {/* RENDERING SECTIONS */}
      {activeTab === 'threads' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Thread List - 4 Cols */}
          <div className="lg:col-span-4 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4 flex flex-col justify-start">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Conversations</h3>
              
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                {['all', 'patient', 'team'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-2 py-1 text-[10px] font-bold font-mono rounded-lg uppercase transition-all ${
                      filterType === type ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Search box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inbox & files..."
                className="w-full bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2 text-xs rounded-xl outline-none focus:border-emerald-500 text-white transition-all font-mono"
              />
            </div>

            {/* Thread items container */}
            <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1">
              {filteredChannels.map(ch => {
                const isSelected = ch.id === activeChannelId;
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setActiveChannelId(ch.id);
                      setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, unread: 0 } : c));
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 relative ${
                      isSelected 
                        ? 'bg-zinc-900/80 border-zinc-800' 
                        : 'bg-zinc-950/20 border-transparent hover:bg-zinc-900/30'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                        {ch.type === 'team' ? <Share2 className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4" />}
                      </div>
                      {ch.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-zinc-950" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                          {ch.pinned && <Pin className="w-3 h-3 text-zinc-500 shrink-0" />}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 shrink-0">{ch.time}</span>
                      </div>

                      <p className="text-[11px] text-zinc-400 truncate leading-snug">{ch.lastMsg}</p>

                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono border uppercase ${
                          ch.channel === 'WhatsApp' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          ch.channel === 'SMS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          ch.channel === 'Email' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          'bg-zinc-850 text-zinc-400 border-zinc-800'
                        }`}>
                          {ch.channel}
                        </span>

                        {ch.unread > 0 && (
                          <span className="w-4.5 h-4.5 bg-emerald-500 text-zinc-950 rounded-full text-[9px] font-bold font-mono flex items-center justify-center">
                            {ch.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Viewport - 5 Cols */}
          <div className="lg:col-span-5 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 flex flex-col justify-between min-h-[550px]">
            {/* Target Info Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{activeChannel.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{activeChannel.channel} Channel</span>
                    <span className="text-zinc-700 font-mono text-[10px]">•</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Secure TLS Port</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={startCall}
                  className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-300 cursor-pointer"
                  title="Voice Consult via Twilio"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={startCall}
                  className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-300 cursor-pointer"
                  title="Video Consultation"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-500 cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Viewport bubbles */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {messagesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 font-mono">
                  <MessageSquare className="w-8 h-8 mb-2 stroke-1" />
                  <p className="text-xs">No transaction history in this channel.</p>
                </div>
              ) : (
                messagesList.map((msg, i) => {
                  const isMe = msg.sender === 'doctor' || msg.sender === 'Dr. Ahmed';
                  return (
                    <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 ${
                        isMe 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-white rounded-br-none' 
                          : 'bg-zinc-950 border border-zinc-900 text-zinc-100 rounded-bl-none'
                      }`}>
                        {!isMe && (
                          <p className="text-[9px] font-mono text-zinc-500 font-black uppercase mb-0.5">{msg.sender}</p>
                        )}
                        <p className="text-xs leading-relaxed select-text font-sans">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 text-[8px] text-zinc-500 font-mono">
                          <span>{msg.time}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Composer Box */}
            <form onSubmit={handleSendMessage} className="border-t border-zinc-900 pt-3 flex gap-2">
              <button 
                type="button"
                className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Attach diagnostic file / photo"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Dispatch message to ${activeChannel.name}...`}
                className="flex-1 bg-zinc-950 border border-zinc-850 px-4 py-2 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono"
              />

              <button 
                type="submit"
                className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Files & Meta Hub - 3 Cols */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Shared files repo */}
            <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">EHR Shared Media</span>
              
              <div className="space-y-2.5">
                {SHARED_FILES.map(file => (
                  <div key={file.id} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-bold font-mono truncate">{file.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{file.type} • {file.size}</p>
                    </div>
                    <button 
                      onClick={() => triggerToast(`Downloading shared asset ${file.name}`)}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                    >
                      ↓
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick response macros template */}
            <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-3.5 font-mono text-xs">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Authorized Clinical Macros</span>
              
              <div className="space-y-1.5">
                {[
                  'Your surgical guide scan is approved.',
                  'We are awaiting your dental implant crown.',
                  'Please review your online consent forms.'
                ].map((macro, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(macro)}
                    className="w-full text-left p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 text-[11px] truncate block"
                  >
                    "{macro}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Completed Call & Video Consult Histories</h3>
              <p className="text-[11px] text-zinc-500 font-mono">Audit record of tele-dentistry WebRTC diagnostic streams.</p>
            </div>
            <button 
              onClick={() => triggerToast('Consultation histories refreshed.')}
              className="p-2 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl text-xs font-mono"
            >
              Sync History
            </button>
          </div>

          <div className="space-y-3">
            {CALL_HISTORY.map(call => (
              <div key={call.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    call.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {call.type === 'Video Consult' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{call.name}</h4>
                    <p className="text-[10px] text-zinc-500">{call.type} • {call.channel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">Duration</p>
                    <p className="text-zinc-300 font-bold">{call.duration}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">Date/Time</p>
                    <p className="text-zinc-300">{call.timestamp}</p>
                  </div>
                  <div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                      call.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {call.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          {/* Form Composer */}
          <div className="lg:col-span-1 p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Initiate EHR Broadcast Campaign</span>
            
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-500">Target Patient Demographic Segment</label>
                <select 
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-white outline-none"
                >
                  <option>All Implants Patients</option>
                  <option>All Orthodontics</option>
                  <option>Active Prosthesis Try-ins</option>
                  <option>Periodontal Risk Flags</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500">Gateway Medium Delivery</label>
                <select 
                  value={broadcastMedium}
                  onChange={(e) => setBroadcastMedium(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-white outline-none"
                >
                  <option>SMS (Twilio Core Service)</option>
                  <option>WhatsApp Enterprise Service</option>
                  <option>Email Portal Delivery (SES)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500">Message Content Payload</label>
                <textarea 
                  rows={4}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-3 rounded-xl text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-2.5 rounded-xl font-bold font-mono cursor-pointer transition-colors"
              >
                Launch Unified Broadcast
              </button>
            </form>
          </div>

          {/* Historical Logs */}
          <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Broadcast Dispatch Records</span>
            
            <div className="space-y-3">
              {broadcastHistory.map(bc => (
                <div key={bc.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-start justify-between">
                  <div className="space-y-1">
                    <h5 className="font-bold text-white">{bc.campaign}</h5>
                    <p className="text-[10px] text-zinc-500">Target Group: {bc.target} • Dispatched to {bc.count} patient endpoints</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {bc.status}
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-1">{bc.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-5 font-mono text-xs">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">Internal Announcements Dashboard</span>
          
          <div className="space-y-3">
            {ANNOUNCEMENTS.map(ann => (
              <div key={ann.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                  <span className="text-[10px] text-zinc-500">{ann.date}</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">{ann.content}</p>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 font-black">Published by: {ann.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
