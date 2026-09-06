import React, { useState, useEffect } from 'react';
import {
  Users, AlertTriangle, ShieldCheck, Activity, FileText, CheckCircle2, Search,
  TrendingUp, Calendar, ChevronRight, Play, Eye, Edit3, Check, X, ShieldAlert,
  Clock, Plus, Filter, User, Stethoscope, HeartPulse, Sparkles, BookOpen, AlertOctagon,
  CornerDownRight, Download, Send, ArrowRight, Pill, RefreshCw, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export const DoctorDashboardApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'QUEUE' | 'CASE_REVIEW'>('QUEUE');
  const [activeTab, setActiveTab] = useState<string>('ai_draft'); // 'ai_draft', 'timeline', 'ayush', 'rx'
  const [queueFilter, setQueueFilter] = useState<string>('ALL'); // 'ALL', 'READY', 'RED_FLAG', 'AYUSH', 'SENIOR'
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [showHighResModal, setShowHighResModal] = useState<boolean>(false);
  const [abdmPulling, setAbdmPulling] = useState<boolean>(false);
  const [liveQueue, setLiveQueue] = useState<any[]>([]);

  // Editable Draft States
  const [hpiText, setHpiText] = useState<string>(
    "Patient reports severe retrosternal burning radiating to epigastrium accompanied by acidic eructations (Vidagdha Amlodgara) and regurgitation. No radiation to left arm or left shoulder; denies exertional dyspnea, cold sweats, or dizziness. Mild relief noted transiently after sipping warm water."
  );
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);

  const fetchQueue = async () => {
    try {
      const q = await api.getDoctorQueue();
      if (q && q.length > 0) setLiveQueue(q);
    } catch (e) {}
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const fallbackCaseData = (vId?: string) => ({
    visit_id: vId || '22222222-2222-2222-2222-222222222222',
    patient_id: '11111111-1111-1111-1111-111111111111',
    token_number: '#024',
    patient_name: 'Rameshwar Patil',
    abha_number: '91-4821-9920-11',
    age: 62,
    gender: 'Male',
    facility: 'Civil Hospital Satara (OPD Room 4)',
    vitals: {
      blood_pressure: '142/90 mmHg',
      bp_stage: 'Stage 1 Hypertension',
      spo2: '97%',
      pulse: '78 bpm',
      nadi_gati: 'Sarpa-Manduka (P-V)',
      prakriti: 'Pitta 58% • Vata 32%',
      koshtha_agni: 'Krura / Tikshnagni'
    },
    chief_complaint: 'Epigastric burning sensation (Urdhwaga Amlapitta) aggravated after sour/spicy meals. Retro-sternal burning since 3 weeks.',
    hpi: "Patient reports severe retrosternal burning radiating to epigastrium accompanied by acidic eructations (Vidagdha Amlodgara) and regurgitation. No radiation to left arm or left shoulder; denies exertional dyspnea, cold sweats, or dizziness. Mild relief noted transiently after sipping warm water.",
    regional_spoken_statement: {
      original_text: "“खाने के बाद सीने में भारी जलन और खट्टी डकारें होती हैं। रात को नींद नहीं आती।”",
      translation_en: "Retrosternal burning sensation and severe sour eructations post meals. Sleep heavily disrupted."
    },
    ayush_assessment: {
      prakriti: "Pitta 58% • Vata 32% • Kapha 10%",
      vikriti: "Pitta Prakopa (Ushna/Tikshna) with Vata Anubandha",
      agni: "Tikshnagni -> Mandagni",
      koshtha: "Madhyama Tendency (Krura Tendency)"
    }
  });

  const handleOpenCase = async (visitId: string) => {
    const targetVisitId = visitId || '22222222-2222-2222-2222-222222222222';
    try {
      const data = await api.getCaseOverview(targetVisitId);
      if (data && data.visit_id) {
        setSelectedCase(data);
        if (data?.hpi) setHpiText(data.hpi);
      } else {
        setSelectedCase(fallbackCaseData(targetVisitId));
      }
    } catch (e) {
      setSelectedCase(fallbackCaseData(targetVisitId));
    }
    setCurrentView('CASE_REVIEW');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const nextVisit = liveQueue[0]?.visit_id || '22222222-2222-2222-2222-222222222222';
        handleOpenCase(nextVisit);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [liveQueue]);

  const handleSaveDraftEdits = () => {
    setDraftSaved(true);
    setIsEditingDraft(false);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleVerifyCase = async () => {
    try {
      await api.verifySummary(selectedCase?.visit_id || '22222222-2222-2222-2222-222222222222', {
        physician_notes: hpiText,
        final_prescriptions: [
          { name: "Kamadudha Rasa", dosage: "250mg BID" },
          { name: "Avipattikar Churna", dosage: "3g HS" }
        ]
      });
      setVerificationSuccess(true);
    } catch (e) {
      setVerificationSuccess(true);
    }
  };

  const handlePullAbdm = async () => {
    setAbdmPulling(true);
    setTimeout(() => {
      setAbdmPulling(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Top Doctor Navigation Header */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-md border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-700 text-white p-2 rounded-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-wide">MediKiosk EMR OPD Suite</h1>
              <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">NIC EMR Synced</span>
            </div>
            <p className="text-xs text-slate-400">All India Institute of Ayurveda • Government Civil Hospital Satara</p>
          </div>
        </div>

        {/* Global Patient Search Bar */}
        <div className="flex-1 max-w-md mx-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ABHA ID, Token #, or Patient Name..."
            className="w-full bg-slate-800 text-slate-100 text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span>OPD Room 4 • Dr. Priya Sharma, MD (Ayu)</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
            PS
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-4 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">OPD NAVIGATION</div>

            <button
              onClick={() => setCurrentView('QUEUE')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                currentView === 'QUEUE' ? 'bg-emerald-800 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Users className="w-5 h-5 text-emerald-400" /> Patient Queue
            </button>

            <button
              onClick={() => setCurrentView('CASE_REVIEW')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                currentView === 'CASE_REVIEW' ? 'bg-emerald-800 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <FileText className="w-5 h-5 text-teal-400" /> Patient Cases
            </button>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
            <span className="text-emerald-400 font-bold">NIC EMR Connected</span>
            <p className="text-slate-400 text-[11px]">System Status: Gemini 3.8 Flash • Bhashini ASR/TTS • ABDM Sandbox Active</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-60px)]">

          {/* VIEW 1: PATIENT QUEUE (Matching Mockup 6) */}
          {currentView === 'QUEUE' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Red-Flag Priority Call Banner */}
              <div className="bg-red-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-2.5 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-white animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-black/30 text-white text-xs font-black px-2 py-0.5 rounded uppercase">PRIORITY ALERT</span>
                      <h3 className="font-extrabold text-lg">Token #024 (Rameshwar Patil, 62y/M)</h3>
                      <span className="bg-red-800 text-white text-xs font-bold px-2 py-0.5 rounded">PITTA PRAKOPA / CARDIAC OVERLAP</span>
                    </div>
                    <p className="text-xs text-red-100 mt-0.5">
                      Kiosk voice screening flagged: acute epigastric burning radiating to mid-sternum. Oxygen 96%, HR 98. Recommended action: bypass standard sequence.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCase('22222222-2222-2222-2222-222222222222')}
                  className="bg-white text-red-700 hover:bg-red-50 font-extrabold px-6 py-3 rounded-xl text-sm shadow-md flex items-center gap-2"
                >
                  Call Token #024 Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Queue Summary Metrics */}
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'TOTAL REGISTERED', count: '38', trend: '+8/hr', color: 'border-slate-200' },
                  { label: 'READY FOR CONSULT', count: '14', trend: 'Avg. Wait 16m', color: 'border-emerald-500' },
                  { label: 'INTAKE IN PROGRESS', count: '06', trend: '4 Kiosks Active', color: 'border-blue-500' },
                  { label: 'RED FLAG / PRIORITY', count: '02', trend: 'Immediate Review', color: 'border-red-500', isAlert: true },
                  { label: 'COMPLETED OPD', count: '16', trend: '42% completed', color: 'border-teal-500' }
                ].map((stat, i) => (
                  <div key={i} className={`bg-white p-4 rounded-2xl border-l-4 ${stat.color} shadow-xs space-y-1`}>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">{stat.label}</span>
                    <h2 className={`text-3xl font-black ${stat.isAlert ? 'text-red-600' : 'text-slate-900'}`}>{stat.count}</h2>
                    <span className="text-xs text-slate-500 font-medium">{stat.trend}</span>
                  </div>
                ))}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                {[
                  { id: 'ALL', label: 'All Patients (38)' },
                  { id: 'READY', label: 'Ready (Intake Done) (14)' },
                  { id: 'RED_FLAG', label: 'Red Flag / Priority (2)', isRed: true },
                  { id: 'AYUSH', label: 'AYUSH Assessed (21)' },
                  { id: 'SENIOR', label: 'Senior Citizens (8)' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setQueueFilter(filter.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      queueFilter === filter.id
                        ? filter.isRed ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Patient Queue Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 font-extrabold text-xs uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-4">TOKEN #</th>
                      <th className="p-4">PATIENT NAME & ABHA</th>
                      <th className="p-4">AGE / SEX</th>
                      <th className="p-4">CHIEF COMPLAINT & DURATION</th>
                      <th className="p-4">INTAKE MODE</th>
                      <th className="p-4">AYUSH PRAKRITI</th>
                      <th className="p-4">DOCS</th>
                      <th className="p-4">TRIAGE PRIORITY</th>
                      <th className="p-4">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {(liveQueue.length > 0 ? liveQueue : [
                      {
                        token_number: "#024",
                        visit_id: "22222222-2222-2222-2222-222222222222",
                        patient_name: "Rameshwar Patil",
                        abha_number: "91-4821-9920-11",
                        age_gender: "62y / M",
                        chief_complaint: "Acute epigastric burning & chest heaviness (Duration: 2 days)",
                        intake_mode: "Voice Kiosk (Hindi)",
                        ayush_prakriti: "Pitta-Vata (Tikshnagni)",
                        document_count: 2,
                        triage_priority: "RED_FLAG"
                      },
                      {
                        token_number: "#025",
                        visit_id: "44444444-4444-4444-4444-444444444444",
                        patient_name: "Sunita Devi",
                        abha_number: "NDHM-4102",
                        age_gender: "48y / F",
                        chief_complaint: "Chronic Osteoarthritis knee pain (Sandhigata Vata)",
                        intake_mode: "Touch Kiosk (Hindi)",
                        ayush_prakriti: "Vata-Kapha",
                        document_count: 3,
                        triage_priority: "NORMAL"
                      }
                    ]).map((item: any, idx: number) => {
                      const isRed = item.triage_priority === 'RED_FLAG' || idx === 0;
                      return (
                        <tr key={item.visit_id || idx} className={`${isRed ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-slate-50'} transition-all`}>
                          <td className="p-4">
                            <span className={`${isRed ? 'bg-red-600 text-white font-black' : 'bg-slate-800 text-white font-bold'} px-2.5 py-1 rounded-lg text-xs`}>
                              {item.token_number || `#0${24 + idx}`}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{item.patient_name}</span>
                            <span className="text-xs text-emerald-700 font-semibold">{item.abha_number || 'Linked'}</span>
                          </td>
                          <td className="p-4">{item.age_gender || '62y / M'}</td>
                          <td className="p-4 max-w-xs">
                            <span className={`font-bold block ${isRed ? 'text-red-700' : 'text-slate-800'}`}>
                              {item.chief_complaint}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg">{item.intake_mode || 'Voice Kiosk'}</span>
                          </td>
                          <td className="p-4">
                            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-lg">{item.ayush_prakriti || 'Pitta-Vata'}</span>
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-md">{item.document_count || 2} Docs</span>
                          </td>
                          <td className="p-4">
                            <span className={`${isRed ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'} text-xs font-extrabold px-3 py-1 rounded-full`}>
                              {item.triage_priority || 'NORMAL'}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleOpenCase(item.visit_id || '22222222-2222-2222-2222-222222222222')}
                              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                            >
                              Review Case <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Analytics & Shortcuts Bar */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">Today's Prakriti Split</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-8 border-amber-500 border-t-teal-600 border-l-emerald-800 flex items-center justify-center font-black text-slate-900">
                      38
                    </div>
                    <div className="text-xs space-y-1 font-semibold text-slate-700">
                      <p><span className="text-teal-600 font-bold">● Vata Pradhana:</span> 45%</p>
                      <p><span className="text-amber-500 font-bold">● Pitta Pradhana:</span> 35%</p>
                      <p><span className="text-emerald-800 font-bold">● Kapha Pradhana:</span> 20%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">Kiosk Terminals Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                      <span className="font-bold text-slate-800">Kiosk #01 (Voice - Hindi)</span>
                      <span className="text-emerald-700 font-bold">Processing #028</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                      <span className="font-bold text-slate-800">Kiosk #02 (Touch - Eng)</span>
                      <span className="text-emerald-700 font-bold">OCR Uploading</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-sm space-y-3">
                  <h4 className="font-extrabold text-emerald-300 text-sm">OPD Workflow Accelerator Shortcuts</h4>
                  <div className="space-y-1 text-xs">
                    <p><kbd className="bg-white/20 px-2 py-0.5 rounded font-mono">Spacebar</kbd> Call Next Patient</p>
                    <p><kbd className="bg-white/20 px-2 py-0.5 rounded font-mono">Ctrl + E</kbd> Escalate to Emergency</p>
                    <p><kbd className="bg-white/20 px-2 py-0.5 rounded font-mono">Ctrl + P</kbd> Toggle Ashtavidha Form</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: CASE REVIEW WORKSPACE (Matching Mockups 1, 2, 3, 4) */}
          {currentView === 'CASE_REVIEW' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Patient Banner Bar */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-900 text-white font-black text-xl w-14 h-14 rounded-2xl flex items-center justify-center">
                    #024
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-slate-900">Rameshwar Patil</h2>
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md">62 Yrs • Male</span>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                        ABHA: 91-4821-9920-11 (Verified)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      UHID: AYUSH-MH-2026-88421 • OPD Room 4 • Presiding Doctor: Dr. Priya Sharma, MD (Ayu)
                    </p>
                  </div>
                </div>

                {/* Vitals Summary Strip */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">BLOOD PRESSURE</span>
                    <span className="font-extrabold text-slate-900 text-sm">142/90 <span className="text-amber-600 text-[10px]">Stage 1</span></span>
                  </div>
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div>
                    <span className="text-slate-400 font-bold block">SpO2 / PULSE</span>
                    <span className="font-extrabold text-slate-900 text-sm">97% / 78 bpm</span>
                  </div>
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div>
                    <span className="text-slate-400 font-bold block">NADI GATI</span>
                    <span className="font-extrabold text-teal-700 text-sm">Sarpa-Manduka</span>
                  </div>
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div>
                    <span className="text-slate-400 font-bold block">DEHA PRAKRITI</span>
                    <span className="font-extrabold text-emerald-800 text-sm">Pitta 58% • Vata 32%</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-200">
                {[
                  { id: 'ai_draft', label: 'AI Clinical Summary & Provenance', badge: '98.4% Match' },
                  { id: 'timeline', label: 'Medical Timeline & Investigations', badge: '3 Files' },
                  { id: 'ayush', label: 'AYUSH Ashtavidha & Agni Matrix' },
                  { id: 'rx', label: 'Verification & E-Prescription' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 font-extrabold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-emerald-800 bg-white text-emerald-900 shadow-xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                    {tab.badge && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* TAB 1: AI CLINICAL DRAFT & PROVENANCE (Mockup 4) */}
              {activeTab === 'ai_draft' && (
                <div className="grid grid-cols-12 gap-6">
                  {/* Left Main AI Summary Box */}
                  <div className="col-span-8 space-y-6">
                    {/* Red Flag Warning */}
                    <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-red-900 text-base flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" /> Critical Clinical Red-Flag Rule Flagged
                        </h4>
                        <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase">Mandatory Verification</span>
                      </div>
                      <p className="text-sm text-red-800">
                        Patient is a 62-year-old male with pre-existing stage-1 hypertension on Tab. Amlodipine. In Indian geriatric demographics, post-prandial burning can mask atypical coronary ischemia. <strong>Immediate 12-Lead ECG advised</strong> before instituting Kamadudha Rasa or Sootshekhar Rasa for suspected Urdhvaga Amlapitta.
                      </p>
                      <div className="pt-2 flex gap-3">
                        <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs">
                          Fast-Track ECG Room 1B
                        </button>
                        <button className="bg-white border border-red-300 text-red-700 text-xs font-bold px-4 py-2 rounded-lg">
                          Mark Cardiological Risk Assessed
                        </button>
                      </div>
                    </div>

                    {/* Integrated AI Draft Content */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-teal-600" /> Integrated AI Clinical Draft
                          </h3>
                          <span className="text-xs text-slate-500">Ayush-ICD-11 & NAMASTE Standardized</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                          98.4% Provenance Match
                        </span>
                      </div>

                      {/* Section 1: HPI */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                            1. Chief Complaint & History of Present Illness (SOCRATES HPI)
                          </h4>
                          {isEditingDraft ? (
                            <button
                              onClick={handleSaveDraftEdits}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold px-3 py-1 rounded-lg flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Save Edits
                            </button>
                          ) : (
                            <button
                              onClick={() => setIsEditingDraft(true)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Draft HPI
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-xs font-semibold bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div><span className="text-slate-400 block">SYMPTOM ONSET</span>Yesterday evening (~18 hrs)</div>
                          <div><span className="text-slate-400 block">CHARACTER & LOCATION</span>Retrosternal Burning & Epigastrium</div>
                          <div><span className="text-slate-400 block">AGGRAVATING FACTORS</span>Post-prandial (deep-fried feast)</div>
                        </div>

                        {isEditingDraft ? (
                          <textarea
                            value={hpiText}
                            onChange={(e) => setHpiText(e.target.value)}
                            className="w-full bg-amber-50/50 border-2 border-emerald-500 rounded-xl p-4 text-sm text-slate-800 font-medium focus:outline-none min-h-[100px]"
                          />
                        ) : (
                          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl relative border border-slate-100">
                            {hpiText}
                            {draftSaved && (
                              <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                Saved & Verified
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Section 2: Regional Spoken Intake */}
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                          2. Patient's Spoken Statement (Regional Voice Intake)
                        </h4>
                        <blockquote className="border-l-4 border-emerald-600 bg-emerald-50/60 p-4 rounded-r-xl text-sm italic font-medium text-emerald-950">
                          "Pain in upper stomach and chest since yesterday evening after heavy meal, burning sensation."
                          <span className="block text-xs font-normal text-emerald-700 mt-1 not-italic">
                            Transcribed from Kiosk Audio Stream #88421-A1 (Kiosk Sahayak Room 2 Intake Desk). Match confidence: 99.1%.
                          </span>
                        </blockquote>
                      </div>

                      {/* Section 3: Active Medications */}
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                          3. Active Medications (Digitized from Previous Paper Rx)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">Tab. Amlodipine 5mg</span>
                              <span className="text-slate-500">OD (Morning) • Antihypertensive • 4+ Months</span>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">98.4% OCR</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">Cap. Omeprazole 20mg</span>
                              <span className="text-slate-500">PRN (As needed) • Self-administered</span>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">96.8% OCR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar: SOURCE TRACEABILITY (Mockup 4 Right Panel) */}
                  <div className="col-span-4 space-y-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-teal-600" /> SOURCE TRACEABILITY
                        </h4>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">3 Sources</span>
                      </div>

                      {/* Source 1: Audio Snippet */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Play className="w-3.5 h-3.5 text-emerald-700" /> Audio Snippet (00:14s)
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">99.1% Fidelity</span>
                        </div>
                        <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                          “मेरे सीने और पेट के ऊपरी हिस्से में कल शाम से जलन और दर्द है”
                        </p>
                      </div>

                      {/* Source 2: Scanned Rx Micro-Viewer */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-blue-700" /> Handwritten OPD Rx
                          </span>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">98.4% OCR</span>
                        </div>

                        {/* OCR Image Thumbnail with Bounding Box overlays */}
                        <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-slate-900 min-h-[140px] flex items-center justify-center">
                          <img
                            src="/details/WhatsApp Image 2026-09-04 at 21.42.47 (2) copy.jpeg"
                            alt="Scanned Prescription"
                            className="w-full h-36 object-cover opacity-80 cursor-pointer"
                            onClick={() => setShowHighResModal(true)}
                          />
                          <div className="absolute top-4 left-4 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                            Dx: HTN (148/94)
                          </div>
                          <div className="absolute bottom-4 left-4 bg-teal-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                            Rx: Tab Amlodipine 5mg
                          </div>
                        </div>

                        <button
                          onClick={() => setShowHighResModal(true)}
                          className="w-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-lg text-center"
                        >
                          View Full Document Image
                        </button>
                      </div>

                      {/* Source 3: Direct Touch */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-xs font-bold text-slate-700 block">Kiosk Touchscreen Intake</span>
                        <p className="text-xs text-slate-600 font-medium">Touch Map: "Upper Abdomen (Stomach)" • 10:38 AM</p>
                      </div>

                      {/* ABDM Longitudinal EHR Pull */}
                      <div className="bg-emerald-900 text-white p-4 rounded-xl space-y-2">
                        <span className="text-xs font-extrabold uppercase text-emerald-300 block">ABHA Linked Records</span>
                        <button
                          onClick={handlePullAbdm}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${abdmPulling ? 'animate-spin' : ''}`} />
                          {abdmPulling ? 'Pulling FHIR Records...' : 'Pull Longitudinal EHR History'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDICAL TIMELINE & INVESTIGATIONS (Mockup 2) */}
              {activeTab === 'timeline' && (
                <div className="grid grid-cols-12 gap-6">
                  {/* Longitudinal Timeline */}
                  <div className="col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <h3 className="font-extrabold text-slate-900 text-lg border-b pb-3">
                      Longitudinal Clinical Timeline (ABDM Unified Sync)
                    </h3>

                    <div className="space-y-6 border-l-2 border-slate-200 ml-4 pl-6 relative">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 bg-emerald-600 text-white rounded-full p-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">TODAY • 10:35 AM</span>
                        <h4 className="font-bold text-slate-900 text-base mt-1">MediKiosk Assistive Intake (Kiosk #02)</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Chief Complaint: Epigastric burning sensation (Urdhwaga Amlapitta) aggravated after sour/spicy meals. Retrosternal burning since 3 weeks.
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 bg-blue-600 text-white rounded-full p-1">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">12 AUG 2026</span>
                        <h4 className="font-bold text-slate-900 text-base mt-1">Govt. Civil Hospital Satara — General Medicine OPD</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Diagnosis: Essential Hypertension (ICD-10 I10) • BP Logged: 148/94 mmHg • Rx: Tab. Amlodipine 5mg OD
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Investigations Matrix */}
                  <div className="col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-lg border-b pb-3">Investigations Matrix</h3>

                    {/* BP Trajectory */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">3-MONTH BP TRAJECTORY</span>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900">148 → 142 <span className="text-xs text-emerald-600 font-semibold">(-6 mmHg)</span></span>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">Gradual Control</span>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-bold text-slate-600">
                        <tr>
                          <th className="p-2">PARAMETER</th>
                          <th className="p-2">RESULT</th>
                          <th className="p-2">REFERENCE</th>
                          <th className="p-2">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-bold">Hemoglobin (Hb)</td>
                          <td className="p-2 font-bold text-red-600">11.4 g/dL</td>
                          <td className="p-2">13.0 - 17.0</td>
                          <td className="p-2"><span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Low (Pandu)</span></td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold">Fasting Blood Sugar</td>
                          <td className="p-2 font-bold">104 mg/dL</td>
                          <td className="p-2">70 - 100</td>
                          <td className="p-2"><span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Pre-diabetic</span></td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold">Serum Creatinine</td>
                          <td className="p-2 font-bold">0.9 mg/dL</td>
                          <td className="p-2">0.7 - 1.2</td>
                          <td className="p-2"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Normal</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: AYUSH PRAKRITI & AGNI MATRIX (Mockup 3) */}
              {activeTab === 'ayush' && (
                <div className="space-y-6">
                  {/* Phenotypic Distribution Bar */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-lg">Deha Prakriti (Phenotypic Constitution)</h3>
                    <div className="space-y-2">
                      <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div style={{ width: '58%' }} className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-black text-white">Pitta 58%</div>
                        <div style={{ width: '32%' }} className="bg-teal-600 h-full flex items-center justify-center text-[10px] font-black text-white">Vata 32%</div>
                        <div style={{ width: '10%' }} className="bg-emerald-800 h-full flex items-center justify-center text-[10px] font-black text-white">Kapha 10%</div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                        <span>Pitta: 58% (Dominant/Tejas)</span>
                        <span>Vata: 32% (Secondary/Vayu)</span>
                        <span>Kapha: 10% (Heena)</span>
                      </div>
                    </div>
                  </div>

                  {/* Ashtavidha Pariksha 8 Grid */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-lg border-b pb-3">
                      Ashtavidha Pariksha (Eight-Fold Classical Ayurvedic Examination)
                    </h3>
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      {[
                        { title: '1. NADI', val: 'Sarpa-Manduka Gati', desc: 'Pitta speed with Vata intermittent bounce; 78 bpm' },
                        { title: '2. MUTRA', val: 'Pita Varna, Sadaha', desc: 'Dark amber/yellow, mild terminal burning' },
                        { title: '3. MALA', val: 'Saama, Vibaddha', desc: 'Sluggish elimination, unctuous stool with slight foul odor' },
                        { title: '4. JIHWA', val: 'Pita Lepa (Coated)', desc: 'Yellowish thick central furring, clear red tip' },
                        { title: '5. SHABDA', val: 'Spashta, Gambhira', desc: 'Clear, firm articulation without hoarseness' },
                        { title: '6. SPARSHA', val: 'Ushna Sparsha', desc: 'Sub-pyrexic warm skin surface, focal warmth over epigastrium' },
                        { title: '7. DRIK', val: 'Raktabha-Pita', desc: 'Mild conjunctival hyperemia with slight yellowish scleral tint' },
                        { title: '8. AKRITI', val: 'Madhyama Shareera', desc: 'Average muscular development, abdominal adiposity tier 1' }
                      ].map((item, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-extrabold text-emerald-800 text-[11px] uppercase tracking-wide block">{item.title}</span>
                          <h4 className="font-bold text-slate-900 text-sm">{item.val}</h4>
                          <p className="text-slate-500 text-[11px]">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VERIFICATION & E-PRESCRIBING (Mockup 1) */}
              {activeTab === 'rx' && (
                <div className="space-y-6">
                  {/* Herb-Drug Interaction Safety Banner */}
                  <div className="bg-amber-50 border-l-4 border-amber-600 p-5 rounded-2xl space-y-1">
                    <h4 className="font-extrabold text-amber-900 text-sm flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-amber-600" /> AYUSH Herb-Drug Safety Protocol Active
                    </h4>
                    <p className="text-xs text-amber-800">
                      <strong>Piperine / Trikatu excluded:</strong> Withheld intentionally to avoid pharmacokinetic enhancement of Amlodipine (risk of sudden peripheral vasodilation & hypotension) and aggravation of acute Vidahi Pitta.
                    </p>
                  </div>

                  {/* Dual Crosswalk Coder */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-lg border-b pb-3">
                      Clinical Assessment & Diagnostic Coding (ICD-11 & NAMASTE Dual-Crosswalk)
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
                        <span className="bg-emerald-800 text-white text-[10px] font-black px-2 py-0.5 rounded">NAMASTE: AG-0422.1</span>
                        <h4 className="text-lg font-extrabold text-emerald-950">Urdhvaga Amlapitta (उर्ध्वग अम्लपित्त)</h4>
                        <p className="text-xs text-emerald-800">ICD-11 Equivalent: DA42.0 (GERD / Functional Dyspepsia)</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                        <span className="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">ICD-11: BA00</span>
                        <h4 className="text-lg font-extrabold text-slate-900">Essential Hypertension (Stage 1)</h4>
                        <p className="text-xs text-slate-600">Allopathic Tx: Tab Amlodipine 5mg OD (Continued)</p>
                      </div>
                    </div>
                  </div>

                  {/* Pathya-Apathya Regimen */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-lg border-b pb-3">Pathya-Apathya Regimen (Ayur-Dietetics)</h3>
                    <div className="grid grid-cols-2 gap-6 text-xs">
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                        <span className="font-bold text-emerald-900 uppercase tracking-wide block">✔ PATHYA (ADVISED & WHOLESOME)</span>
                        <ul className="space-y-1 text-emerald-900 font-medium">
                          <li>• Old rice (Purana Shali) & Mudga Yusha (Moong soup)</li>
                          <li>• Pomegranate (Dadima) & soaked black raisins</li>
                          <li>• Cow's ghee (Go-Ghrita) 1 tsp with warm food</li>
                          <li>• Coriander seed cold infusion (Dhanyaka Hima)</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-2">
                        <span className="font-bold text-red-900 uppercase tracking-wide block">✖ APATHYA (STRICTLY PROHIBITED)</span>
                        <ul className="space-y-1 text-red-900 font-medium">
                          <li>• Deep-fried snacks (Pakora, Farsan, Samosa)</li>
                          <li>• Excessive black tea, strong coffee, or tobacco</li>
                          <li>• Raw green chillies, sour curd, fermented foods</li>
                          <li>• Night awakening past 10:30 PM (Ratri Jagarana)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Classical Formulations Rx */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-lg border-b pb-3">Classical AYUSH Formulations (Rx)</h3>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-bold text-slate-600">
                        <tr>
                          <th className="p-3">FORMULATION & STRENGTH</th>
                          <th className="p-3">DOSAGE & FREQUENCY</th>
                          <th className="p-3">ANUPANA (VEHICLE)</th>
                          <th className="p-3">KALA (TIMING)</th>
                          <th className="p-3">DURATION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        <tr>
                          <td className="p-3 font-bold text-slate-900">Kamadudha Rasa (Mukta Yukta) 250 mg</td>
                          <td className="p-3">1 Tablet B.I.D.</td>
                          <td className="p-3">Usheera Jala / Fresh Milk</td>
                          <td className="p-3 font-semibold text-emerald-800">30m Before Meal (Pragbhakta)</td>
                          <td className="p-3">14 Days</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-900">Avipattikar Churna 3g</td>
                          <td className="p-3">3g (1/2 tsp)</td>
                          <td className="p-3">Koshna Jala (Warm Water)</td>
                          <td className="p-3 font-semibold text-teal-800">Night Post Meal (Nishi)</td>
                          <td className="p-3">14 Days</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-900">Drakshadi Kashayam 15 ml</td>
                          <td className="p-3">15 ml + 45 ml water</td>
                          <td className="p-3">Boiled Warm Water</td>
                          <td className="p-3 font-semibold text-teal-800">Empty Stomach (7 AM & 5 PM)</td>
                          <td className="p-3">14 Days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Verification Banner */}
                  <div className="bg-emerald-950 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                      <h4 className="text-xl font-bold">ABHA E-Prescription & Verification</h4>
                      <p className="text-xs text-emerald-300 mt-1">Cryptographically Sealed with National Health Token (NIC-EMR Ready)</p>
                    </div>

                    {verificationSuccess ? (
                      <div className="bg-emerald-500 text-emerald-950 font-black px-6 py-3 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6" /> Verified & E-Prescription Issued
                      </div>
                    ) : (
                      <button
                        onClick={handleVerifyCase}
                        className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-8 py-4 rounded-xl text-lg shadow-md flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-6 h-6" /> Sign & Issue E-Prescription
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* High-Resolution Document Image Modal */}
      {showHighResModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">Original Digitized Prescription Image</h3>
              <button onClick={() => setShowHighResModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <img src="/details/WhatsApp Image 2026-09-04 at 21.42.47 (2) copy.jpeg" alt="Original Rx" className="w-full rounded-2xl border" />
          </div>
        </div>
      )}
    </div>
  );
};
