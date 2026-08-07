'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useWorkspaceToast } from './Workspace/useWorkspaceToast';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MessageSquare, Mail, Phone, Video, Pin, File, Megaphone, Send,
  Check, CheckCheck, Search, User, Clock, Plus, X, ChevronRight,
  Paperclip, Smartphone, MoreVertical, Sliders, Sparkles, Inbox,
  Tv, Share2, Trash2, PhoneCall, Volume2, VolumeX, Camera, CameraOff,
  TrendingUp, BarChart2, Activity, Zap, Bell, RefreshCw, ChevronDown,
  ChevronUp, Layout, AlertCircle, Star, BookTemplate, FileText,
  ArrowRight, Play, Pause, ToggleLeft, ToggleRight, Settings,
  Heart, Calendar, Users, Globe, Filter, Download, Edit3, Copy
} from 'lucide-react';

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: 'pat-1', name: 'Arthur Pendragon', type: 'patient', lastMsg: 'Will my milled zirconia crown be fitted by tomorrow noon?', time: '10:45 AM', unread: 2, status: 'online', channel: 'SMS', pinned: true },
  { id: 'pat-2', name: 'Clara Oswald', type: 'patient', lastMsg: 'The intraoral scan feels very smooth! Thank you Dr. Ahmed.', time: '09:30 AM', unread: 0, status: 'offline', channel: 'WhatsApp', pinned: true },
  { id: 'team-1', name: 'Surgical Restorative Team', type: 'team', lastMsg: 'Dr. Sarah: Ready for the guided implant try-in in Chair 3.', time: '10:12 AM', unread: 4, status: 'online', channel: 'Internal Chat', pinned: true },
  { id: 'team-2', name: 'Lab Technicians', type: 'team', lastMsg: 'Barton: Milling machine 4 finished sintering Diana Prince E.Max.', time: '08:15 AM', unread: 0, status: 'online', channel: 'Internal Chat', pinned: false },
  { id: 'pat-3', name: 'Bruce Wayne', type: 'patient', lastMsg: 'Can we schedule an urgent review of the CBCT scan next Monday?', time: 'Yesterday', unread: 1, status: 'offline', channel: 'Email', pinned: false },
  { id: 'pat-4', name: 'Diana Prince', type: 'patient', lastMsg: 'I reviewed the Smile Design digital mockups, looks stellar.', time: '2 days ago', unread: 0, status: 'online', channel: 'WhatsApp', pinned: false },
  { id: 'team-3', name: 'Dr. Sarah Jenkins', type: 'internal', lastMsg: 'Let\'s check the periodontology report for patient Arthur.', time: '3 days ago', unread: 0, status: 'offline', channel: 'Internal Chat', pinned: false }
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
  'team-2': [{ id: 'b1', sender: 'Barton', text: 'Milling machine 4 finished sintering Diana Prince E.Max.', time: '08:15 AM' }],
  'pat-3': [{ id: 'bw1', sender: 'patient', text: 'Can we schedule an urgent review of the CBCT scan next Monday?', time: 'Yesterday' }],
  'pat-4': [{ id: 'dp1', sender: 'patient', text: 'I reviewed the Smile Design digital mockups, looks stellar.', time: '2 days ago' }],
  'team-3': [{ id: 'sj1', sender: 'Dr. Sarah', text: 'Let\'s check the periodontology report for patient Arthur.', time: '3 days ago' }]
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

// Smart templates library
const MESSAGE_TEMPLATES = [
  { id: 't1', category: 'Appointment', title: 'Appointment Confirmation', body: 'Dear {name}, your appointment is confirmed for {date} at our clinic. Please arrive 10 minutes early. Reply CONFIRM to acknowledge.' },
  { id: 't2', category: 'Appointment', title: 'Appointment Reminder', body: 'Reminder: You have an appointment tomorrow. Please contact us at least 24 hours in advance to reschedule if needed.' },
  { id: 't3', category: 'Post-Op', title: 'Post-Surgery Instructions', body: 'Dear {name}, following today\'s procedure: avoid hard foods for 48 hours, apply ice pack 20 min on/off, take prescribed medications as directed. Call us if pain exceeds 7/10.' },
  { id: 't4', category: 'Post-Op', title: 'Post-Op Follow-up', body: 'Dear {name}, checking in after your procedure. How are you feeling? Any swelling, unusual pain or bleeding should be reported immediately.' },
  { id: 't5', category: 'Lab Results', title: 'Lab Results Ready', body: 'Dear {name}, your laboratory results are now available for review. Please schedule a consultation to discuss the findings with your clinician.' },
  { id: 't6', category: 'Lab Results', title: 'Imaging Ready', body: 'Your CBCT scan and digital radiographs have been processed and are ready for review. We will discuss results at your next scheduled visit.' },
  { id: 't7', category: 'Payment', title: 'Payment Due Reminder', body: 'Dear {name}, a balance of {amount} is due for your recent treatment. Please contact our billing department or settle online via patient portal.' },
  { id: 't8', category: 'Custom', title: 'Crown/Prosthesis Ready', body: 'Great news, {name}! Your dental crown/prosthesis has been fabricated and is ready for fitting. Please schedule your placement appointment at your earliest convenience.' },
];

// AI suggestions pool
const AI_SUGGESTIONS = [
  'Dear Arthur, your zirconia crown has been successfully milled and is currently in the polishing and quality control phase. Our laboratory team anticipates completion by 11:00 AM tomorrow. I will personally confirm before your scheduled fitting appointment.',
  'Hello Arthur, I have checked with our laboratory team. Your crown should be ready by noon tomorrow. We will contact you to arrange the fitting appointment. Please ensure you fast for 2 hours prior if local anesthesia is anticipated.',
  'Arthur, your crown fabrication is on schedule. The milling machine completed sintering this morning and the ceramic staining is currently in progress. Estimated completion: tomorrow at 10:00 AM.'
];

// Automation rules
const INITIAL_RULES = [
  { id: 'r1', trigger: 'No patient reply', condition: 'After 24 hours', action: 'Send SMS reminder', channel: 'SMS', enabled: true, runs: 142 },
  { id: 'r2', trigger: 'Appointment confirmed', condition: 'Immediately', action: 'Send WhatsApp confirmation', channel: 'WhatsApp', enabled: true, runs: 89 },
  { id: 'r3', trigger: 'Post-surgery (Day 1)', condition: '24h after procedure', action: 'Send post-op care instructions', channel: 'SMS + Email', enabled: true, runs: 67 },
  { id: 'r4', trigger: 'Lab results uploaded', condition: 'Immediately on upload', action: 'Notify patient via Email', channel: 'Email', enabled: false, runs: 34 },
  { id: 'r5', trigger: 'Payment overdue', condition: 'After 7 days', action: 'Send payment reminder', channel: 'Email + SMS', enabled: true, runs: 28 },
];

// Analytics data
const ANALYTICS_CHANNELS = [
  { name: 'SMS', responseRate: 78, avgTime: '4.2m', messages: 342, color: 'bg-blue-500' },
  { name: 'WhatsApp', responseRate: 91, avgTime: '1.8m', messages: 218, color: 'bg-rose-500' },
  { name: 'Email', responseRate: 54, avgTime: '3.2h', messages: 156, color: 'bg-purple-500' },
  { name: 'Internal', responseRate: 96, avgTime: '0.9m', messages: 489, color: 'bg-amber-500' },
];

const DAILY_MESSAGES = [
  { day: 'Mon', count: 48 }, { day: 'Tue', count: 62 }, { day: 'Wed', count: 91 },
  { day: 'Thu', count: 74 }, { day: 'Fri', count: 83 }, { day: 'Sat', count: 35 }, { day: 'Sun', count: 22 }
];

const PEAK_HOURS = Array.from({ length: 24 }, (_, h) => ({
  hour: h,
  intensity: h >= 9 && h <= 17 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.2
}));

// ─── COMPONENT ────────────────────────────────────────────────────────────
export default function CommunicationWorkspace() {
  type TabType = 'threads' | 'calls' | 'broadcast' | 'announcements' | 'analytics' | 'automation';
  const [activeTab, setActiveTab] = useState<TabType>('threads');
  const [channels, setChannels] = useState(CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('pat-1');
  const [allMessages, setAllMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'patient' | 'team'>('all');
  const [broadcastTarget, setBroadcastTarget] = useState('All Implants Patients');
  const [broadcastMedium, setBroadcastMedium] = useState('SMS (Twilio)');
  const [broadcastText, setBroadcastText] = useState('Friendly update: Your digital crown designs have cleared milling. Booking fittings shortly.');
  const [broadcastHistory, setBroadcastHistory] = useState([
    { id: 'bc-1', campaign: 'Recall Notice Q3', target: 'All Orthodontics', date: 'Jul 10', count: 142, status: 'Delivered' }
  ]);
  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('video');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [clinicalNote, setClinicalNote] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCategory, setTemplateCategory] = useState('All');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [automationRules, setAutomationRules] = useState(INITIAL_RULES);
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const { toastMsg, showToast, triggerToast } = useWorkspaceToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callActive) {
      interval = setInterval(() => setCallSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  const formatCallTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, activeChannelId]);

  const filteredChannels = useMemo(() => channels.filter(ch => {
    const matchSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ch.lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterType === 'all' || ch.type === filterType;
    return matchSearch && matchFilter;
  }), [channels, searchQuery, filterType]);

  const activeChannel = useMemo(() => channels.find(c => c.id === activeChannelId) || channels[0], [channels, activeChannelId]);
  const messagesList = useMemo(() => allMessages[activeChannelId] || [], [allMessages, activeChannelId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setAllMessages(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), { id: `msg-${Date.now()}`, sender: 'doctor', text: inputText, time: 'Just now' }] }));
    setChannels(prev => prev.map(ch => ch.id === activeChannelId ? { ...ch, lastMsg: inputText, time: 'Just now', unread: 0 } : ch));
    setInputText('');
    setAiSuggestion('');
    triggerToast('Message dispatched via secure gateway.');
  };

  const handleAiSuggest = () => {
    setAiSuggesting(true);
    setAiSuggestion('');
    setTimeout(() => {
      const suggestion = AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)];
      setAiSuggestion(suggestion);
      setAiSuggesting(false);
    }, 1800);
  };

  const handleSummarize = () => {
    triggerToast('AI thread summary generated and saved to EHR.');
  };

  const startCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setIsCalling(true);
    setCallSeconds(0);
    triggerToast(`Initializing secure ${type} connection to ${activeChannel.name}...`);
    setTimeout(() => {
      setCallActive(true);
      triggerToast('Call established. HIPAA-compliant WebRTC tunneling active.');
    }, 1500);
  };

  const endCall = () => {
    setIsCalling(false);
    setCallActive(false);
    setCallSeconds(0);
    setIsMuted(false);
    setIsCameraOff(false);
    if (clinicalNote.trim()) {
      triggerToast('Consultation notes saved to EHR.');
    } else {
      triggerToast('Consultation session closed. Call logs saved.');
    }
    setClinicalNote('');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    const newBc = { id: `bc-${Date.now()}`, campaign: `EHR Broadcast [${broadcastTarget}]`, target: broadcastTarget, date: 'Today', count: broadcastTarget.includes('All') ? 350 : 84, status: 'Delivered' };
    setBroadcastHistory([newBc, ...broadcastHistory]);
    setBroadcastText('');
    triggerToast(`Broadcast launched to ${newBc.count} patients.`);
  };

  const applyTemplate = (template: typeof MESSAGE_TEMPLATES[0]) => {
    const filled = template.body
      .replace('{name}', activeChannel.name)
      .replace('{date}', 'July 25, 2026')
      .replace('{amount}', '$1,250.00');
    setInputText(filled);
    setShowTemplates(false);
    triggerToast(`Template "${template.title}" applied.`);
  };

  const toggleRule = (id: string) => {
    setAutomationRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const maxMessages = Math.max(...DAILY_MESSAGES.map(d => d.count));

  // ─── TAB CONFIG ─────────────────────────────────────────────────────────
  const TABS = [
    { id: 'threads',       label: 'Inbox & Chat',       icon: MessageSquare, color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'calls',         label: 'Video & Voice',       icon: PhoneCall,     color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'broadcast',     label: 'Broadcast',           icon: Megaphone,     color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { id: 'analytics',     label: 'Analytics',           icon: BarChart2,     color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20' },
    { id: 'automation',    label: 'Automation',          icon: Zap,           color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { id: 'announcements', label: 'Announcements',       icon: Inbox,         color: 'text-zinc-400',   bg: 'bg-zinc-500/10 border-zinc-500/20' },
  ];

  return (
    <div className="space-y-6 text-zinc-100 relative max-w-[1600px] mx-auto">

      {/* ── Toast ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 end-6 z-50 bg-zinc-950/90 backdrop-blur-xl text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-pop flex items-center gap-2 border border-white/10"
          >
            <Check className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Tabs ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-xl p-3 rounded-3xl border border-white/[0.06]">
        <div className="flex flex-wrap gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/[0.04] relative">
          {TABS.map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabType)}
                className="relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer outline-none"
              >
                {isSel && (
                  <motion.div
                    layoutId="activeCommTabUnderlay"
                    className="absolute inset-0 bg-white/[0.08] rounded-xl border border-white/10 z-0"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-2 ${isSel ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isSel ? 'bg-rose-500/20 text-rose-400 border-rose-500/20' : t.bg + ' ' + t.color}`}>
                    <Icon className="w-3 h-3 shrink-0" />
                  </div>
                  <span className="hidden sm:inline">{t.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xs uppercase font-mono px-2 py-1 rounded bg-black/40 border border-white/[0.06] text-zinc-400">
            Channels: <strong className="text-white">{channels.length}</strong>
          </span>
          <span className="text-2xs uppercase font-mono px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Gateway Live
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          VIDEO / VOICE CALL OVERLAY — CINEMATIC FULL-SCREEN STYLE
          ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCalling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-card"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-950/30 via-transparent to-black/50 pointer-events-none" />
            <div className="absolute top-0 start-1/4 w-64 h-64 bg-rose-600/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-0">

              {/* Video / Avatar Area */}
              <div className="lg:col-span-2 p-8 flex flex-col items-center justify-center min-h-[320px] border-e border-white/[0.06]">
                <div className="relative mb-6">
                  {callType === 'video' && !isCameraOff ? (
                    <div className="w-40 h-40 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/30 to-zinc-900" />
                      <User className="w-16 h-16 text-zinc-600 relative z-10" />
                      <div className="absolute bottom-2 end-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-zinc-900 border-2 border-rose-500/30 flex items-center justify-center relative">
                      <User className="w-16 h-16 text-zinc-400" />
                      {callActive && <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 animate-ping" />}
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">{activeChannel.name}</h3>
                <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">
                  {callType === 'video' ? 'Video Consultation' : 'Voice Consultation'} • WebRTC AES-256
                </p>

                {/* Timer & Status */}
                <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-mono font-bold ${callActive ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                  {callActive ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      {formatCallTime(callSeconds)}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Connecting...
                    </>
                  )}
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-3 mt-8">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/[0.06] border-white/10 text-zinc-400 hover:text-white'}`}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  {callType === 'video' && (
                    <button
                      onClick={() => setIsCameraOff(!isCameraOff)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isCameraOff ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/[0.06] border-white/10 text-zinc-400 hover:text-white'}`}
                    >
                      {isCameraOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                    </button>
                  )}

                  <button
                    onClick={endCall}
                    className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-soft shadow-rose-600/30 transition-all"
                  >
                    <Phone className="w-5 h-5 rotate-[135deg]" />
                  </button>
                </div>
              </div>

              {/* Clinical Notes Sidebar */}
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-3">Live Clinical Notes</h4>
                  <textarea
                    value={clinicalNote}
                    onChange={e => setClinicalNote(e.target.value)}
                    placeholder="Record observations during consultation..."
                    rows={6}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 text-xs text-zinc-200 resize-none outline-none focus:border-rose-500/40 font-sans leading-relaxed"
                  />
                  <p className="text-2xs text-zinc-600 font-mono mt-1">Auto-saved to EHR on call end</p>
                </div>

                {/* Patient Quick Info */}
                <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-2">
                  <h5 className="text-2xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Patient Quick Info</h5>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-zinc-500">Channel</span><span className="text-zinc-200 font-mono">{activeChannel.channel}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Type</span><span className="text-zinc-200 font-mono capitalize">{activeChannel.type}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Status</span>
                      <span className={`font-mono font-bold ${activeChannel.status === 'online' ? 'text-rose-400' : 'text-zinc-500'}`}>{activeChannel.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1: THREADS & CHAT
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'threads' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* Conversations List */}
          <div className="lg:col-span-4 bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-5 space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Conversations</h3>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
                {['all', 'patient', 'team'].map(type => (
                  <button key={type} onClick={() => setFilterType(type as any)}
                    className={`px-2 py-1 text-2xs font-bold font-mono rounded-lg uppercase transition-all ${filterType === type ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search inbox..."
                className="w-full bg-white/[0.04] border border-white/[0.06] ps-9 pe-3 py-2 text-xs rounded-xl outline-none text-white font-mono" />
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1 pe-1">
              {filteredChannels.map(ch => {
                const isSelected = ch.id === activeChannelId;
                return (
                  <div key={ch.id}
                    onClick={() => { setActiveChannelId(ch.id); setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, unread: 0 } : c)); }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 relative ${isSelected ? 'bg-white/[0.06] border-white/[0.10]' : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-300 border border-white/[0.08]">
                        {ch.type === 'team' ? <Share2 className="w-3.5 h-3.5 text-rose-400" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      {ch.status === 'online' && <span className="absolute bottom-0 end-0 w-2 h-2 bg-rose-500 rounded-full border border-black" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                          {ch.pinned && <Pin className="w-2.5 h-2.5 text-zinc-600 shrink-0" />}
                        </div>
                        <span className="text-2xs font-mono text-zinc-600 shrink-0">{ch.time}</span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate leading-snug">{ch.lastMsg}</p>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className={`text-2xs font-bold px-1.5 py-0.5 rounded font-mono border uppercase ${
                          ch.channel === 'WhatsApp' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          ch.channel === 'SMS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          ch.channel === 'Email' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          'bg-white/[0.06] text-zinc-400 border-white/[0.06]'
                        }`}>{ch.channel}</span>
                        {ch.unread > 0 && <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-2xs font-bold flex items-center justify-center">{ch.unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Viewport */}
          <div className="lg:col-span-5 bg-black/20 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-5 flex flex-col min-h-[560px] relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/[0.08]">
                  <User className="w-3.5 h-3.5 text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{activeChannel.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-2xs font-mono text-zinc-500 uppercase">{activeChannel.channel} • Secure TLS</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => startCall('voice')} className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-zinc-400 hover:text-white cursor-pointer transition-all" title="Voice Call">
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => startCall('video')} className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-zinc-400 hover:text-white cursor-pointer transition-all" title="Video Consult">
                  <Video className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleSummarize} className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-zinc-400 hover:text-rose-400 cursor-pointer transition-all" title="AI Summarize Thread">
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-zinc-500">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-2 space-y-3 pe-1">
              {messagesList.map((msg, i) => {
                const isMe = msg.sender === 'doctor' || msg.sender === 'Dr. Ahmed';
                return (
                  <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 space-y-1 ${isMe ? 'bg-rose-500/10 border border-rose-500/20 text-white rounded-be-md' : 'bg-white/[0.04] border border-white/[0.06] text-zinc-100 rounded-bs-md'}`}>
                      {!isMe && <p className="text-2xs font-mono text-zinc-500 font-black uppercase">{msg.sender}</p>}
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 text-2xs text-zinc-600 font-mono">
                        <span>{msg.time}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-rose-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Suggestion Banner */}
            <AnimatePresence>
              {(aiSuggesting || aiSuggestion) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="mb-3 p-3 bg-rose-500/8 border border-rose-500/20 rounded-2xl"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    {aiSuggesting ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-2xs text-zinc-500 font-mono ms-1">AI generating response...</span>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2">
                        <p className="text-xs text-zinc-200 leading-relaxed">{aiSuggestion}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { setInputText(aiSuggestion); setAiSuggestion(''); }} className="text-2xs font-bold text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 cursor-pointer">
                            <Copy className="w-3 h-3" /> Use this reply
                          </button>
                          <button onClick={handleAiSuggest} className="text-2xs text-zinc-500 hover:text-zinc-400 font-mono cursor-pointer">regenerate</button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="border-t border-white/[0.06] pt-3 space-y-2">
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowTemplates(!showTemplates)} className={`p-2.5 border rounded-xl transition-all cursor-pointer ${showTemplates ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-white/[0.04] border-white/[0.06] text-zinc-500 hover:text-white'}`} title="Templates">
                  <BookTemplate className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={handleAiSuggest} disabled={aiSuggesting} className="p-2.5 bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/30 rounded-xl text-zinc-500 hover:text-rose-400 transition-all cursor-pointer" title="AI Suggest Reply">
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder={`Message ${activeChannel.name}...`}
                  className="flex-1 bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-xs rounded-xl outline-none text-white font-sans" />
                <button type="submit" className="p-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl cursor-pointer transition-all">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel: Files + Templates */}
          <div className="lg:col-span-3 space-y-4">
            {/* Template Picker */}
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Smart Templates</span>
                    <button onClick={() => setShowTemplates(false)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['All', 'Appointment', 'Post-Op', 'Lab Results', 'Payment', 'Custom'].map(cat => (
                      <button key={cat} onClick={() => setTemplateCategory(cat)}
                        className={`text-2xs font-bold font-mono px-2 py-0.5 rounded-full border transition-all cursor-pointer ${templateCategory === cat ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-white/[0.04] border-white/[0.06] text-zinc-500'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {MESSAGE_TEMPLATES.filter(t => templateCategory === 'All' || t.category === templateCategory).map(t => (
                      <button key={t.id} onClick={() => applyTemplate(t)}
                        className="w-full text-start p-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-all cursor-pointer group">
                        <p className="text-2xs font-bold text-zinc-200 group-hover:text-white">{t.title}</p>
                        <p className="text-2xs text-zinc-600 truncate mt-0.5">{t.body.substring(0, 60)}...</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shared Files */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-4 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">EHR Shared Media</span>
              <div className="space-y-2">
                {SHARED_FILES.map(file => (
                  <div key={file.id} className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-white text-2xs font-bold font-mono truncate">{file.name}</p>
                      <p className="text-2xs text-zinc-500 mt-0.5">{file.type} • {file.size}</p>
                    </div>
                    <button onClick={() => triggerToast(`Downloading ${file.name}`)} className="p-1.5 bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.06] rounded-lg text-zinc-500 hover:text-rose-400 transition-all cursor-pointer">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Macros */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-4 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">Quick Macros</span>
              <div className="space-y-1.5">
                {['Your surgical guide scan is approved.', 'We are awaiting your implant crown.', 'Please review your consent forms.', 'Your appointment is confirmed.'].map((macro, i) => (
                  <button key={i} onClick={() => setInputText(macro)} className="w-full text-start p-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl text-zinc-400 hover:text-zinc-200 text-2xs transition-all cursor-pointer truncate block font-mono">
                    "{macro}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2: CALLS & VIDEO
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'calls' && (
        <div className="space-y-5">
          {/* Initiate New Call */}
          <div className="p-5 bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl">
            <h3 className="text-sm font-bold text-white mb-4">Initiate Consultation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {channels.filter(c => c.type === 'patient').slice(0, 3).map(ch => (
                <div key={ch.id} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <User className="w-4 h-4 text-zinc-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{ch.name}</p>
                      <p className="text-2xs text-zinc-500 font-mono">{ch.channel}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setActiveChannelId(ch.id); startCall('voice'); }} className="p-2 bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/20 rounded-xl text-zinc-400 hover:text-rose-400 cursor-pointer transition-all">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setActiveChannelId(ch.id); startCall('video'); }} className="p-2 bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/20 rounded-xl text-zinc-400 hover:text-rose-400 cursor-pointer transition-all">
                      <Video className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call History */}
          <div className="p-5 bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Call & Consultation History</h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Secure WebRTC session audit trail.</p>
              </div>
              <button onClick={() => triggerToast('Histories refreshed.')} className="p-2 bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer">
                <RefreshCw className="w-3 h-3" /> Sync
              </button>
            </div>
            <div className="space-y-3">
              {CALL_HISTORY.map(call => (
                <div key={call.id} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${call.status === 'Completed' ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {call.type === 'Video Consult' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{call.name}</h4>
                      <p className="text-2xs text-zinc-500">{call.type} • {call.channel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div><p className="text-2xs text-zinc-600 uppercase">Duration</p><p className="text-zinc-200 font-bold">{call.duration}</p></div>
                    <div><p className="text-2xs text-zinc-600 uppercase">Date/Time</p><p className="text-zinc-300">{call.timestamp}</p></div>
                    <span className={`text-2xs px-2 py-0.5 rounded-full font-bold ${call.status === 'Completed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-zinc-800 text-zinc-500'}`}>{call.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3: BROADCAST ENGINE
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-mono text-xs">
          <div className="lg:col-span-1 p-5 bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Initiate Broadcast Campaign</span>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-zinc-500">Target Segment</label>
                <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.06] p-2.5 rounded-xl text-white outline-none">
                  <option>All Implants Patients</option>
                  <option>All Orthodontics</option>
                  <option>Active Prosthesis Try-ins</option>
                  <option>Periodontal Risk Flags</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-500">Delivery Gateway</label>
                <select value={broadcastMedium} onChange={e => setBroadcastMedium(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.06] p-2.5 rounded-xl text-white outline-none">
                  <option>SMS (Twilio Core)</option>
                  <option>WhatsApp Enterprise</option>
                  <option>Email (SES)</option>
                  <option>All Channels</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-500">Message Payload</label>
                <textarea rows={4} value={broadcastText} onChange={e => setBroadcastText(e.target.value)} required className="w-full bg-white/[0.04] border border-white/[0.06] p-3 rounded-xl text-white outline-none resize-none" />
              </div>
              <button type="submit" className="w-full bg-rose-500 hover:bg-rose-400 text-white py-2.5 rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2">
                <Megaphone className="w-4 h-4" /> Launch Broadcast
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 p-5 bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-3xl space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Dispatch History</span>
            <div className="space-y-3">
              {broadcastHistory.map(bc => (
                <div key={bc.id} className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-start justify-between">
                  <div className="space-y-1">
                    <h5 className="font-bold text-white">{bc.campaign}</h5>
                    <p className="text-2xs text-zinc-500">Target: {bc.target} • {bc.count} endpoints</p>
                  </div>
                  <div className="text-end">
                    <span className="text-2xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">{bc.status}</span>
                    <p className="text-2xs text-zinc-600 mt-1">{bc.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 4: COMMUNICATION ANALYTICS
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Messages', value: '1,205', delta: '+12%', icon: MessageSquare },
              { label: 'Avg Response Time', value: '6.2m', delta: '-18%', icon: Clock },
              { label: 'Active Channels', value: '7', delta: '+1', icon: Activity },
              { label: 'Patient Satisfaction', value: '94%', delta: '+3%', icon: Heart },
            ].map(m => (
              <div key={m.label} className="p-4 bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-zinc-500 uppercase font-mono tracking-wider">{m.label}</span>
                  <m.icon className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{m.value}</p>
                  <p className="text-2xs text-rose-400 font-mono mt-0.5">{m.delta} this week</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Channel Response Rates */}
            <div className="p-5 bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Channel Response Rates</h3>
              <div className="space-y-4">
                {ANALYTICS_CHANNELS.map(ch => (
                  <div key={ch.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${ch.color}`} />
                        <span className="text-zinc-300 font-medium">{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-2xs">
                        <span className="text-zinc-500">{ch.messages} msgs</span>
                        <span className="text-zinc-500">avg: {ch.avgTime}</span>
                        <span className="text-white font-bold">{ch.responseRate}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ch.responseRate}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className={`h-full rounded-full ${ch.color} opacity-80`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Volume Chart */}
            <div className="p-5 bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Daily Message Volume</h3>
              <div className="flex items-end gap-2 h-36">
                {DAILY_MESSAGES.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-2xs text-zinc-600 font-mono">{d.count}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / maxMessages) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="w-full rounded-t-xl bg-rose-500/40 border border-rose-500/20 hover:bg-rose-500/60 transition-colors cursor-default min-h-[4px]"
                    />
                    <span className="text-2xs text-zinc-600 font-mono">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours Heatmap */}
          <div className="p-5 bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Activity Heatmap — Hourly</h3>
            <div className="flex gap-1.5 flex-wrap">
              {PEAK_HOURS.map(h => (
                <div key={h.hour} className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-lg transition-colors"
                    style={{ backgroundColor: `rgba(225,29,72,${h.intensity})`, border: '1px solid rgba(225,29,72,0.1)' }}
                    title={`${h.hour}:00 — ${Math.round(h.intensity * 100)}% activity`}
                  />
                  {h.hour % 4 === 0 && <span className="text-2xs text-zinc-600 font-mono">{h.hour}h</span>}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xs text-zinc-600 font-mono">Low</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
                <div key={v} className="w-5 h-3 rounded" style={{ backgroundColor: `rgba(225,29,72,${v})` }} />
              ))}
              <span className="text-2xs text-zinc-600 font-mono">High</span>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 5: AUTOMATION RULES ENGINE
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'automation' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Automation Rules Engine</h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">Trigger → Condition → Action workflows for patient communication.</p>
            </div>
            <button onClick={() => setShowNewRuleForm(!showNewRuleForm)} className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Rule
            </button>
          </div>

          {/* New Rule Form */}
          <AnimatePresence>
            {showNewRuleForm && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-4 font-mono text-xs">
                  <h4 className="text-sm font-bold text-white">Create New Automation Rule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider text-2xs">🔔 Trigger</label>
                      <select className="w-full bg-white/[0.04] border border-white/[0.06] p-2.5 rounded-xl text-white outline-none">
                        <option>No patient reply</option>
                        <option>Appointment confirmed</option>
                        <option>Post-surgery (Day 1)</option>
                        <option>Lab results uploaded</option>
                        <option>Payment overdue</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider text-2xs">⏱ Condition</label>
                      <select className="w-full bg-white/[0.04] border border-white/[0.06] p-2.5 rounded-xl text-white outline-none">
                        <option>After 24 hours</option>
                        <option>Immediately</option>
                        <option>After 48 hours</option>
                        <option>After 7 days</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider text-2xs">⚡ Action</label>
                      <select className="w-full bg-white/[0.04] border border-white/[0.06] p-2.5 rounded-xl text-white outline-none">
                        <option>Send SMS reminder</option>
                        <option>Send WhatsApp confirmation</option>
                        <option>Send Email notification</option>
                        <option>Create follow-up task</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { triggerToast('Automation rule created and activated.'); setShowNewRuleForm(false); }} className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold cursor-pointer transition-colors">
                      Save Rule
                    </button>
                    <button onClick={() => setShowNewRuleForm(false)} className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] text-zinc-400 rounded-xl cursor-pointer hover:text-white transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rules List */}
          <div className="space-y-3">
            {automationRules.map(rule => (
              <div key={rule.id} className={`p-5 backdrop-blur-xl border rounded-2xl transition-all ${rule.enabled ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-black/20 border-white/[0.04] opacity-60'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Trigger */}
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl shrink-0">
                      <Bell className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                        <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl font-bold">{rule.trigger}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold">{rule.condition}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl font-bold">{rule.action}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-2xs font-mono text-zinc-500">
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{rule.channel}</span>
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{rule.runs} runs</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button onClick={() => toggleRule(rule.id)} className="cursor-pointer shrink-0 mt-0.5">
                    {rule.enabled ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xs font-mono text-rose-400">ON</span>
                        <div className="w-10 h-5 rounded-full bg-rose-500/30 border border-rose-500/40 flex items-center justify-end px-0.5">
                          <div className="w-4 h-4 rounded-full bg-rose-400 shadow" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xs font-mono text-zinc-600">OFF</span>
                        <div className="w-10 h-5 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-start px-0.5">
                          <div className="w-4 h-4 rounded-full bg-zinc-600 shadow" />
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 6: ANNOUNCEMENTS
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'announcements' && (
        <div className="p-5 bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-3xl space-y-5 font-mono text-xs">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">Internal Announcements</span>
          <div className="space-y-3">
            {ANNOUNCEMENTS.map(ann => (
              <div key={ann.id} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                  <span className="text-2xs text-zinc-500 shrink-0">{ann.date}</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">{ann.content}</p>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  <span className="text-2xs text-zinc-600">Published by: <span className="text-zinc-400 font-bold">{ann.author}</span></span>
                  <button className="text-2xs text-rose-400 hover:text-rose-300 cursor-pointer transition-colors">Mark read</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
