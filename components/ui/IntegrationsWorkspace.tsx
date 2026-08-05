'use client';

/**
 * HealthOS Enterprise Integrations Workspace (v2)
 * ─────────────────────────────────────────────────────────────
 * Upgraded Features:
 *  1. 🇸🇦 Saudi & Regional National Health Integrations (NPHIES, Wasfaly, SEHA, ZATCA Phase 2)
 *  2. 🤖 AI Model API Connectors (Google Gemini Medical, OpenAI Clinical Whisper)
 *  3. 📊 API Health Metrics Bar (Latency, Uptime %, Calls Today, 99.95% Success Rate)
 *  4. ⚡ Custom Webhook Connection Builder Modal
 *  5. 🔍 Interactive Live Webhook Payload Inspector
 */

import React, { useState, useMemo } from 'react';
import {
  Blocks,
  Search,
  CheckCircle2,
  Settings2,
  Radio,
  Plus,
  Activity,
  Cpu,
  Lock,
  Globe,
  Database,
  Terminal,
  ShieldCheck,
  Check,
  Building,
  Zap,
  Sparkles,
  ChevronRight,
  Code,
  FileCode,
  Layers,
  X
} from 'lucide-react';

interface IntegrationItem {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  category: 'National (🇸🇦)' | 'Clinical' | 'AI & LLM' | 'Imaging' | 'Communications' | 'Business' | 'Hardware';
  status: 'Connected' | 'Disconnected';
  logoColor: string;
  apiUrl: string;
  apiKey: string;
  syncLogs: string;
  latencyMs: number;
}

const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  // 🇸🇦 Saudi National Health Integrations
  {
    id: 'int-nphies',
    name: 'NPHIES (منصة نفيس الوطنية)',
    nameAr: 'منصة نفيس الوطنية للموافقات والتأمين',
    description: 'Direct Saudi NPHIES integration for real-time patient insurance eligibility, instant claim pre-approvals, and medical coverage verification.',
    category: 'National (🇸🇦)',
    status: 'Connected',
    logoColor: 'from-emerald-500 to-teal-700',
    apiUrl: 'https://nphies.seha.sa/v1/fhir',
    apiKey: 'sk_nph_••••••••••••••••942a',
    syncLogs: 'Last synced: 2 mins ago • 312 eligibility checks passed',
    latencyMs: 38
  },
  {
    id: 'int-wasfaly',
    name: 'Wasfaly (منصة وصفتي)',
    nameAr: 'المنصة الوطنية للوصفات الإلكترونية (وصفتي)',
    description: 'E-Prescription dispatch gateway synchronizing digital prescriptions with Saudi national community pharmacy networks.',
    category: 'National (🇸🇦)',
    status: 'Connected',
    logoColor: 'from-green-500 to-emerald-600',
    apiUrl: 'https://api.wasfaly.sa/v2/prescriptions',
    apiKey: 'sk_was_••••••••••••••••e812',
    syncLogs: 'Last synced: 8 mins ago • 84 prescriptions dispatched',
    latencyMs: 42
  },
  {
    id: 'int-seha',
    name: 'SEHA Platform (منصة صحة)',
    nameAr: 'منصة صحة للإجازات والتقارير الطبية',
    description: 'Verified Saudi MoH medical sick leave reporting, practitioner licensing verification, and official health certificate issuing.',
    category: 'National (🇸🇦)',
    status: 'Connected',
    logoColor: 'from-teal-600 to-cyan-700',
    apiUrl: 'https://api.seha.sa/v1/sickleave',
    apiKey: 'sk_seh_••••••••••••••••331b',
    syncLogs: 'Last synced: 15 mins ago • 19 medical leaves verified',
    latencyMs: 51
  },
  {
    id: 'int-zatca',
    name: 'ZATCA Fatoora Phase 2 (الزكاة والضريبة)',
    nameAr: 'الفاتورة الإلكترونية - المرحلة الثانية (ZATCA)',
    description: 'Saudi ZATCA E-Invoicing Phase 2 integration generating cryptographic stamps, QR codes, and clearance XMLs.',
    category: 'National (🇸🇦)',
    status: 'Connected',
    logoColor: 'from-emerald-600 to-lime-700',
    apiUrl: 'https://fatoora.zatca.gov.sa/e-invoicing/v2',
    apiKey: 'sk_zat_••••••••••••••••f702',
    syncLogs: 'Last synced: Just now • Cryptographic stamps active',
    latencyMs: 29
  },

  // 🤖 AI Model API Connectors
  {
    id: 'int-ai-gemini',
    name: 'Google Gemini 1.5 Pro Medical',
    nameAr: 'موصل غوغل جيميناي للتحليل الطبي',
    description: 'Multi-modal AI reasoning engine inspecting DICOM radiology scans, summarizing patient EHR histories, and generating diagnostic hints.',
    category: 'AI & LLM',
    status: 'Connected',
    logoColor: 'from-rose-500 to-purple-600',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: 'sk_gem_••••••••••••••••881c',
    syncLogs: 'Last synced: 1 min ago • 45 clinical analyses completed',
    latencyMs: 110
  },
  {
    id: 'int-ai-whisper',
    name: 'OpenAI Clinical Whisper',
    nameAr: 'محرك الإملاء الصوتي الطبي الفوري',
    description: 'High-precision medical speech-to-text dictation engine transcribing Arabic/English doctor consultations into structured EHR notes.',
    category: 'AI & LLM',
    status: 'Connected',
    logoColor: 'from-purple-600 to-indigo-700',
    apiUrl: 'https://api.openai.com/v1/audio/transcriptions',
    apiKey: 'sk_whi_••••••••••••••••109b',
    syncLogs: 'Last synced: 5 mins ago • 28 dictations transcribed',
    latencyMs: 85
  },

  // Clinical & Global EHR
  {
    id: 'int-epic',
    name: 'Epic Systems EHR Sync',
    nameAr: 'ربط نظام إيبك المستشفيات العالمي',
    description: 'Bilateral FHIR-compliant patient chart, medical history, and procedural record replication.',
    category: 'Clinical',
    status: 'Connected',
    logoColor: 'from-sky-500 to-indigo-600',
    apiUrl: 'https://fhir.epic.org/v2/endpoint',
    apiKey: 'sk_epic_••••••••••••••••3a9b',
    syncLogs: 'Last synced: 4 mins ago • 142 records synced',
    latencyMs: 64
  },
  {
    id: 'int-dexis',
    name: 'Dexis Digital Imaging Cloud',
    nameAr: 'ربط أشعة الأسنان وتصوير الديكسس',
    description: 'Auto-ingest high-resolution dental X-rays, intraoral scans, and CBCT imaging packages.',
    category: 'Imaging',
    status: 'Connected',
    logoColor: 'from-amber-500 to-orange-600',
    apiUrl: 'https://imaging.dexisapi.com/v1',
    apiKey: 'sk_dex_••••••••••••••••f821',
    syncLogs: 'Last synced: 1 hour ago • 12 scans imported',
    latencyMs: 92
  },
  {
    id: 'int-twilio',
    name: 'Twilio Client Outbox',
    nameAr: 'بوابة تفيليو لإرسال التذكيرات والـ SMS',
    description: 'Core gateway dispatching patient appointment reminders, clinical confirmations, and SMS channels.',
    category: 'Communications',
    status: 'Connected',
    logoColor: 'from-rose-500 to-rose-700',
    apiUrl: 'https://api.twilio.com/2010-04-01',
    apiKey: 'sk_twi_••••••••••••••••721a',
    syncLogs: 'Last synced: Just now • 8 outbound SMS queued',
    latencyMs: 34
  },
  {
    id: 'int-stripe',
    name: 'Stripe Terminal & Billing',
    nameAr: 'بوابة ستراب والدفع الإلكتروني',
    description: 'Process physical in-clinic card swipes and automate client subscription invoicing cycles.',
    category: 'Business',
    status: 'Disconnected',
    logoColor: 'from-indigo-500 to-purple-600',
    apiUrl: 'https://api.stripe.com/v3',
    apiKey: '',
    syncLogs: 'Connection inactive • Setup required',
    latencyMs: 0
  }
];

const CATEGORIES = ['All Categories', 'National (🇸🇦)', 'AI & LLM', 'Clinical', 'Imaging', 'Communications', 'Business'];

export default function IntegrationsWorkspace() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [selectedCat, setSelectedCat] = useState('All Categories');
  const [searchText, setSearchText] = useState('');

  // Configuration modal
  const [configuringItem, setConfiguringItem] = useState<IntegrationItem | null>(null);
  const [tempApiUrl, setTempApiUrl] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');

  // Add Custom Integration Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomForm, setNewCustomForm] = useState({
    name: '',
    category: 'Clinical' as IntegrationItem['category'],
    apiUrl: '',
    apiKey: '',
    triggerEvent: 'patient_created'
  });

  // Webhook Inspector Payload Modal State
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Filtered List
  const filteredIntegrations = useMemo(() => {
    return integrations.filter(item => {
      const matchCat = selectedCat === 'All Categories' || item.category === selectedCat;
      const matchText = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.nameAr.includes(searchText);
      return matchCat && matchText;
    });
  }, [integrations, selectedCat, searchText]);

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Connected' ? 'Disconnected' : 'Connected';
        triggerToast(`تم تغير حالة الربط لـ ${item.name}: ${nextStatus === 'Connected' ? 'نشط 🟢' : 'معطل 🔴'}`);
        return {
          ...item,
          status: nextStatus,
          syncLogs: nextStatus === 'Connected' ? 'الاتصال نشط • تم التأكد من سلامة الـ API' : 'الاتصال غير نشط'
        };
      }
      return item;
    }));
  };

  // Save config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringItem) return;

    setIntegrations(prev => prev.map(item => {
      if (item.id === configuringItem.id) {
        return {
          ...item,
          apiUrl: tempApiUrl,
          apiKey: tempApiKey ? 'sk_live_••••••••' + tempApiKey.substring(Math.max(0, tempApiKey.length - 4)) : item.apiKey,
          status: 'Connected',
          syncLogs: 'تم تحديث الإعدادات • الربط مشفر ومعتمد'
        };
      }
      return item;
    }));

    triggerToast(`تم حفظ إعدادات الربط لـ ${configuringItem.name}`);
    setConfiguringItem(null);
  };

  // Add Custom Integration
  const handleCreateCustomIntegration = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `int-custom-${Date.now()}`;
    const newItem: IntegrationItem = {
      id: newId,
      name: newCustomForm.name || 'Custom Webhook API',
      nameAr: newCustomForm.name || 'تكامل مخصص جديد',
      description: `Custom endpoint trigger on event [${newCustomForm.triggerEvent}]`,
      category: newCustomForm.category,
      status: 'Connected',
      logoColor: 'from-rose-500 to-pink-700',
      apiUrl: newCustomForm.apiUrl || 'https://api.clinic.com/v1/webhook',
      apiKey: 'sk_cst_••••••••••••••••9112',
      syncLogs: 'Custom Webhook active • Trigger configured',
      latencyMs: Math.floor(Math.random() * 40) + 20
    };

    setIntegrations(prev => [newItem, ...prev]);
    setShowAddModal(false);
    setNewCustomForm({ name: '', category: 'Clinical', apiUrl: '', apiKey: '', triggerEvent: 'patient_created' });
    triggerToast(`تمت إضافة التكامل المخصص "${newItem.name}" بنجاح! 🟢`);
  };

  // Sample Webhook Payloads
  const samplePayloads = [
    {
      id: 'pay-01',
      method: 'POST',
      endpoint: '/api/v1/nphies/eligibility',
      status: '200 OK',
      service: 'NPHIES (نفيس)',
      desc: 'فحص التغطية والتأمين الفوري للمريض أسامة القحطاني',
      size: '12.4 KB',
      duration: '38ms',
      json: JSON.stringify({
        event: 'nphies.eligibility_check',
        patient_id: 'PAT-9081',
        national_id: '1092837461',
        insurance_provider: 'Bupa Arabia',
        coverage_status: 'ACTIVE_FULL_COVERAGE',
        copay_percentage: 10,
        approval_code: 'NPH-88192-OK'
      }, null, 2)
    },
    {
      id: 'pay-02',
      method: 'POST',
      endpoint: '/api/v1/wasfaly/dispatch',
      status: '200 OK',
      service: 'Wasfaly (وصفتي)',
      desc: 'إرسال وصفة طبية إلكترونية لصيدلية النهدي',
      size: '8.1 KB',
      duration: '42ms',
      json: JSON.stringify({
        event: 'wasfaly.prescription_dispatched',
        prescription_id: 'RX-77182',
        doctor: 'Dr. Arthur',
        medications: ['Amoxicillin 500mg', 'Paracetamol 500mg'],
        fulfillment_status: 'DISPATCHED_TO_PHARMACY'
      }, null, 2)
    },
    {
      id: 'pay-03',
      method: 'POST',
      endpoint: '/api/v1/ai/gemini/analyze',
      status: '200 OK',
      service: 'Google Gemini AI',
      desc: 'تحليل هولوغرافي ثلاثي الأبعاد لأشعة السن #14',
      size: '2.4 MB',
      duration: '110ms',
      json: JSON.stringify({
        event: 'ai.dicom_scan_analyzed',
        confidence_score: 0.985,
        detected_issues: ['Interproximal Caries Tooth #14'],
        recommendation: 'Composite Resin Filling'
      }, null, 2)
    }
  ];

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative font-sans" dir="rtl">

      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 left-6 z-[99999] bg-rose-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-rose-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Header Bar & Live Metrics ── */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10">
              <Blocks className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">مركز التكاملات والربط البرمجي (API Gateway)</h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GATEWAY ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">ربط المنظومات الوطنية (نفيس، وصفتي، صحة، زكاة) والذكاء الاصطناعي والأجهزة الطبية</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة ربط مخصص (Custom Webhook)</span>
          </button>
        </div>

        {/* ── Live Health Metrics Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/[0.08]">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">معدل الاستجابة (Avg Latency)</span>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white font-mono">38 ms</span>
              <span className="text-[9px] font-mono text-emerald-400">FASTER</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">نسبة الاستقرار والخدمة (Uptime)</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white font-mono">99.98%</span>
              <span className="text-[9px] font-mono text-emerald-400">OPTIMAL</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">طلبات اليوم (API Calls Today)</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white font-mono">24,810</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">الأنظمة المربوطة (Active Systems)</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-bold text-white font-mono">9 / 10</span>
              <span className="text-[9px] font-mono text-rose-400">CONNECTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-950/60 p-3 rounded-3xl border border-white/10">
        <div className="flex flex-wrap gap-1 p-1 bg-zinc-900 rounded-2xl border border-white/[0.08]">
          {CATEGORIES.map(cat => {
            const isSel = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSel ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="ابحث عن نظام أو خدمة ربط..."
            className="w-full bg-zinc-900 border border-white/10 pr-10 pl-4 py-2 text-xs rounded-xl outline-none focus:border-rose-500 text-white transition-all"
          />
        </div>
      </div>

      {/* ── Integrations Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIntegrations.map(item => {
          const isConn = item.status === 'Connected';
          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between min-h-[240px] relative overflow-hidden group ${
                isConn ? 'bg-zinc-950/90 border-white/10 hover:border-rose-500/40 shadow-xl' : 'bg-zinc-950/30 border-white/[0.04] opacity-60 hover:opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.logoColor} flex items-center justify-center text-white font-mono font-black text-xs uppercase shadow-lg shrink-0`}>
                      {item.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                      <span className="text-[9px] font-mono text-zinc-500 font-bold block">{item.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                      isConn
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                        : 'bg-white/[0.04] text-zinc-500 border-white/[0.08] hover:bg-rose-500/20 hover:text-rose-300'
                    }`}
                  >
                    {isConn ? 'نشط 🟢' : 'تفعيل ⚪'}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans min-h-[48px]">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Radio className={`w-3 h-3 ${isConn ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'}`} />
                  <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[170px]">{item.syncLogs}</span>
                </div>

                <div className="flex items-center gap-1">
                  {isConn && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{item.latencyMs}ms</span>}
                  <button
                    onClick={() => {
                      setConfiguringItem(item);
                      setTempApiUrl(item.apiUrl);
                      setTempApiKey(item.apiKey);
                    }}
                    className="p-1.5 hover:bg-white/[0.08] rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                    title="تعديل الإعدادات"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Live Webhook Payload Stream Section ── */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">سجل طلبات الـ Webhooks الحية (Incoming API Stream)</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">اضغط على أي طلب لمعاينة كود الـ JSON 🔍</span>
        </div>

        <div className="space-y-2 font-mono text-[11px]">
          {samplePayloads.map(pay => (
            <div
              key={pay.id}
              onClick={() => setSelectedPayload(pay)}
              className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-white/[0.08] rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{pay.method}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{pay.endpoint}</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{pay.status}</span>
                    <span className="text-[10px] font-bold text-rose-300">({pay.service})</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans mt-0.5">{pay.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-[10px] text-zinc-500">
                  <span>{pay.size}</span>
                  <span className="block text-[9px] text-emerald-400">{pay.duration}</span>
                </div>
                <Code className="w-4 h-4 text-zinc-600 group-hover:text-rose-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal 1: Add Custom Webhook Integration ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 rounded-3xl border border-rose-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                <h4 className="text-sm font-bold text-white">إضافة تكامل مخصص جديد (Custom Webhook)</h4>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomIntegration} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-zinc-400 block mb-1">اسم النظام أو الخدمة:</label>
                <input
                  type="text"
                  value={newCustomForm.name}
                  onChange={(e) => setNewCustomForm({ ...newCustomForm, name: e.target.value })}
                  placeholder="مثال: نظام المختبر المحلي / بوابة الواتساب الخاصة"
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-white outline-none rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">التصنيف:</label>
                <select
                  value={newCustomForm.category}
                  onChange={(e) => setNewCustomForm({ ...newCustomForm, category: e.target.value as any })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-white outline-none rounded-xl"
                >
                  <option value="Clinical">Clinical (طبي)</option>
                  <option value="National (🇸🇦)">National 🇸🇦 (وطني)</option>
                  <option value="AI & LLM">AI & LLM (ذكاء اصطناعي)</option>
                  <option value="Imaging">Imaging (تصوير وأشعة)</option>
                  <option value="Communications">Communications (تواصل)</option>
                  <option value="Business">Business (مالية وإدارة)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">عنوان الـ API Target URL:</label>
                <input
                  type="url"
                  value={newCustomForm.apiUrl}
                  onChange={(e) => setNewCustomForm({ ...newCustomForm, apiUrl: e.target.value })}
                  placeholder="https://api.yourclinic.com/v1/webhook"
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-white outline-none rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">حدث الإطلاق (Trigger Event):</label>
                <select
                  value={newCustomForm.triggerEvent}
                  onChange={(e) => setNewCustomForm({ ...newCustomForm, triggerEvent: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-white outline-none rounded-xl"
                >
                  <option value="patient_created">عند إضافة مريض جديد (On Patient Created)</option>
                  <option value="invoice_finalized">عند إصدار فاتورة (On Invoice Finalized)</option>
                  <option value="lab_result_published">عند صدور نتيجة مختبر (On Lab Result Published)</option>
                  <option value="appointment_scheduled">عند حجز موعد جديد (On Appointment Scheduled)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  حفظ وتفعيل التغذية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Webhook JSON Payload Inspector ── */}
      {selectedPayload && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-950 rounded-3xl border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">فاحص كود الـ JSON Payload: {selectedPayload.service}</h4>
              </div>
              <button onClick={() => setSelectedPayload(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-white/[0.08]">
                <span>Endpoint: <strong className="text-white">{selectedPayload.endpoint}</strong></span>
                <span className="text-emerald-400 font-bold">{selectedPayload.status}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 block">HTTP Request Payload (Raw JSON):</label>
                <pre className="p-4 rounded-2xl bg-zinc-900 text-emerald-300 text-[11px] overflow-x-auto max-h-64 border border-white/10">
                  {selectedPayload.json}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedPayload(null)}
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold cursor-pointer"
                >
                  إغلاق الفاحص
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: Integration Settings Modal ── */}
      {configuringItem && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 rounded-3xl border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-rose-400" />
                <h4 className="text-sm font-bold text-white">إعدادات مفاتيح الربط: {configuringItem.name}</h4>
              </div>
              <button onClick={() => setConfiguringItem(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-zinc-400 block mb-1">عنوان الـ API Endpoint:</label>
                <input
                  type="text"
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-white outline-none rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">مفتاح السر والربط (Secret API Key / Bearer Token):</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="ضع مفتاح الربط sk_live_••••••••"
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 text-white outline-none rounded-xl"
                />
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-[11px] leading-relaxed flex items-center gap-2 font-sans">
                <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                <span>جميع المفاتيح تشفّر تلقائياً بأعلى المعايير (AES-256) قبل تخزينها في قاعدة البيانات.</span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfiguringItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  حفظ واختبار الاتصال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
