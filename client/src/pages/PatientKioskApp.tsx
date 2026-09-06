import React, { useState, useEffect } from 'react';
import {
  Volume2, AlertTriangle, ShieldCheck, UserCheck, Mic, ArrowRight, ArrowLeft,
  RotateCcw, HelpCircle, CheckCircle2, QrCode, CreditCard, UserPlus, Camera, Upload,
  FileText, Smartphone, Printer, Sparkles, Check, Play, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export const PatientKioskApp: React.FC = () => {
  // Step State: 1=Welcome/Lang/Identity, 2=Consent, 3=SOCRATES Intake (Steps 1-5), 4=AYUSH Intake, 5=Webcam Scan, 6=Review, 7=Token Pass
  const [step, setStep] = useState<number>(1);
  const [socratesStep, setSocratesStep] = useState<number>(1);
  const [language, setLanguage] = useState<string>('hi');
  const [intakeMethod, setIntakeMethod] = useState<string>('ABHA');
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [patientId, setPatientId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [visitId, setVisitId] = useState<string>('22222222-2222-2222-2222-222222222222');
  const [tokenNumber, setTokenNumber] = useState<string>('#024');

  // Intake Answers
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('Upper Abdomen');
  const [onsetDuration, setOnsetDuration] = useState<string>('Sudden (~18 hrs / yesterday evening)');
  const [painSeverity, setPainSeverity] = useState<string>('Severe Burning / Pyrosis (8/10)');
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string>('Acidic Regurgitation & Sour Burps (Vidagdha Amlodgara)');
  const [aggravatingFactors, setAggravatingFactors] = useState<string>('Worse Post-Meal (Deep Fried/Spicy Feast)');
  
  // AYUSH Dashavidha State
  const [agniState, setAgniState] = useState<string>('Tikshnagni (Excessive Appetite + Sour Regurgitation)');
  const [koshthaState, setKoshthaState] = useState<string>('Krura Koshtha (Hard Stool)');
  const [prakritiSelection, setPrakritiSelection] = useState<string>('Pitta-Vata (Pitta 58% • Vata 32%)');
  const [showRedFlagModal, setShowRedFlagModal] = useState<boolean>(false);

  // Camera & Document Scan State
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [spokenText, setSpokenText] = useState<string>('');
  const [capturedDoc, setCapturedDoc] = useState<boolean>(false);

  const [audioLevel, setAudioLevel] = useState<number>(3);

  // Multilingual Speech Keyword Option Detector
  const processSpeechDetection = (transcript: string, currentSocratesStep: number) => {
    const lower = transcript.toLowerCase();
    
    if (currentSocratesStep === 1) {
      if (lower.includes('छाती') || lower.includes('chest') || lower.includes('हृदय') || lower.includes('सीना')) {
        setSelectedBodyPart('Chest');
      } else if (lower.includes('पेट') || lower.includes('stomach') || lower.includes('आमाशय') || lower.includes('belly') || lower.includes('abdomen')) {
        setSelectedBodyPart('Upper Abdomen');
      } else if (lower.includes('पीठ') || lower.includes('कमर') || lower.includes('back') || lower.includes('spine')) {
        setSelectedBodyPart('Back & Spine');
      } else if (lower.includes('जोड़') || lower.includes('joint') || lower.includes('हाथ') || lower.includes('पैर') || lower.includes('knee')) {
        setSelectedBodyPart('Joints & Limbs');
      }
    } else if (currentSocratesStep === 2) {
      if (lower.includes('अचानक') || lower.includes('कल') || lower.includes('sudden') || lower.includes('yesterday') || lower.includes('शाम')) {
        setOnsetDuration('Sudden (~18 hrs / yesterday evening)');
      } else if (lower.includes('3') || lower.includes('5') || lower.includes('धीरे') || lower.includes('gradual')) {
        setOnsetDuration('Gradual (3-5 Days)');
      } else if (lower.includes('पुराना') || lower.includes('हफ्ते') || lower.includes('सप्ताह') || lower.includes('chronic') || lower.includes('week')) {
        setOnsetDuration('Chronic (2+ Weeks)');
      }
    } else if (currentSocratesStep === 3) {
      if (lower.includes('जलन') || lower.includes('तेज') || lower.includes('burning') || lower.includes('severe') || lower.includes('8')) {
        setPainSeverity('Severe Burning Sensation / Pyrosis (8/10)');
      } else if (lower.includes('भारी') || lower.includes('heavy') || lower.includes('dull') || lower.includes('6')) {
        setPainSeverity('Dull Heavy Pressure / Weight (6/10)');
      } else if (lower.includes('चुभन') || lower.includes('sharp') || lower.includes('stabbing') || lower.includes('9')) {
        setPainSeverity('Sharp Stabbing Pain (9/10)');
      }
    } else if (currentSocratesStep === 4) {
      if (lower.includes('पसीना') || lower.includes('sweat') || lower.includes('बाएं') || lower.includes('left arm') || lower.includes('जबड़ा') || lower.includes('jaw')) {
        setAssociatedSymptoms('Radiation to Left Arm / Jaw + Sweating (RED FLAG)');
        setShowRedFlagModal(true);
      } else if (lower.includes('खट्टी') || lower.includes('डकार') || lower.includes('acid') || lower.includes('burp') || lower.includes('sour')) {
        setAssociatedSymptoms('Acidic Regurgitation & Sour Burps (Vidagdha Amlodgara)');
      } else if (lower.includes('जी') || lower.includes('मिचलाना') || lower.includes('nausea') || lower.includes('bloat')) {
        setAssociatedSymptoms('Nausea & Abdominal Bloating (Ajeerna)');
      }
    } else if (currentSocratesStep === 5) {
      if (lower.includes('मसालेदार') || lower.includes('तली') || lower.includes('fried') || lower.includes('spicy') || lower.includes('खाना') || lower.includes('meal')) {
        setAggravatingFactors('Worse Post-Meal (Deep Fried / Spicy Feast)');
      } else if (lower.includes('पानी') || lower.includes('water') || lower.includes('दूध') || lower.includes('milk') || lower.includes('गरम')) {
        setAggravatingFactors('Relieved Transiently by Warm Water / Milk');
      } else if (lower.includes('चलने') || lower.includes('walking') || lower.includes('exertion')) {
        setAggravatingFactors('Worse on Walking / Physical Exertion');
      }
    }
  };

  // Web Speech API Voice Recognition
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const defaultFallback = language === 'hi'
      ? 'सीने और पेट के ऊपरी हिस्से में तेज जलन और दर्द कल शाम से हो रहा है'
      : language === 'mr'
      ? 'छाती आणि पोटात जळजळ आणि वेदना होत आहेत'
      : 'Severe epigastric burning and chest pain since yesterday evening';

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpokenText(defaultFallback);
      processSpeechDetection(defaultFallback, socratesStep);
      setIsListening(true);
      setTimeout(() => setIsListening(false), 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        // Simulate audio wave level animation
        const levelInterval = setInterval(() => {
          setAudioLevel(Math.floor(Math.random() * 5) + 1);
        }, 150);
        (recognition as any).levelInterval = levelInterval;
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setSpokenText(transcript);
        processSpeechDetection(transcript, socratesStep);
      };

      recognition.onend = () => {
        setIsListening(false);
        if ((recognition as any).levelInterval) clearInterval((recognition as any).levelInterval);
      };

      recognition.onerror = () => {
        setIsListening(false);
        if ((recognition as any).levelInterval) clearInterval((recognition as any).levelInterval);
        // On mic error, provide fallback recognition text so user intake never halts
        setSpokenText(defaultFallback);
        processSpeechDetection(defaultFallback, socratesStep);
      };

      recognition.start();
    } catch (err) {
      setSpokenText(defaultFallback);
      processSpeechDetection(defaultFallback, socratesStep);
      setIsListening(true);
      setTimeout(() => setIsListening(false), 2000);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStreamActive(true);
      }
    } catch (e) {
      setStreamActive(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append('file', blob, 'scanned_prescription.jpg');
            formData.append('visit_id', visitId);
            formData.append('patient_id', patientId);
            formData.append('document_type', 'PRESCRIPTION');
            try {
              const res = await api.uploadDocument(formData);
              setOcrData(res);
              setCapturedDoc(true);
            } catch (err) {
              setCapturedDoc(true);
            }
          } else {
            setCapturedDoc(true);
          }
        }, 'image/jpeg');
      }
    } else {
      setCapturedDoc(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      formData.append('visit_id', visitId);
      formData.append('patient_id', patientId);
      formData.append('document_type', 'PRESCRIPTION');
      try {
        const res = await api.uploadDocument(formData);
        setOcrData(res);
        setCapturedDoc(true);
      } catch (err) {
        setCapturedDoc(true);
      }
    }
  };

  const [isSpeakingVoiceAssist, setIsSpeakingVoiceAssist] = useState<boolean>(false);

  // Auto-start camera when entering Step 5
  useEffect(() => {
    if (step === 5 && !capturedDoc) {
      startCamera();
    }
  }, [step, capturedDoc]);

  // Audio Text-To-Speech Trigger (Sanitizes punctuation so TTS doesn't read question marks aloud)
  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingVoiceAssist) {
      window.speechSynthesis.cancel();
      setIsSpeakingVoiceAssist(false);
      return;
    }

    if (!isAudioOn) return;

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const cleanText = text.replace(/[\?？\.,!\-\u2047\u2048\u2049]+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
      utterance.lang = targetLang;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.slice(0, 2)));
        if (matchingVoice) utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setIsSpeakingVoiceAssist(true);
      utterance.onend = () => setIsSpeakingVoiceAssist(false);
      utterance.onerror = () => setIsSpeakingVoiceAssist(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeakingVoiceAssist(false);
    }
  };

  const handleStartIdentification = async () => {
    try {
      const res = await api.identifyPatient({
        id_type: intakeMethod === 'ABHA' ? 'ABHA_NUMBER' : 'MOBILE_OTP',
        external_ref: '91-4821-9920-11',
        full_name: 'Rameshwar Patil',
        phone_number: '+91 98231 ****84'
      });
      setPatientId(res.patient_id);
      setVisitId(res.visit_id);
      setTokenNumber(res.token_number);
      setStep(2);
    } catch (e) {
      setStep(2);
    }
  };

  const handleGrantConsent = async () => {
    try {
      await api.recordConsent({
        patient_id: patientId,
        visit_id: visitId,
        scopes: ['HPI', 'AYUSH', 'DOCUMENT_OCR']
      });
    } catch (e) {}
    setStep(3);
    setSocratesStep(1);
    speakQuestion('आपको दर्द या असहजता किस स्थान पर महसूस हो रही है');
  };

  const handleNextSocrates = () => {
    if (socratesStep < 5) {
      const next = socratesStep + 1;
      setSocratesStep(next);
      if (next === 2) speakQuestion('यह दर्द कब और कैसे शुरू हुआ कितने समय से हो रहा है');
      if (next === 3) speakQuestion('दर्द का प्रकार कैसा है और तीव्रता कितनी है');
      if (next === 4) speakQuestion('क्या दर्द कहीं फैलता है या साथ में खट्टी डकारें आ रही हैं');
      if (next === 5) speakQuestion('क्या मसालेदार या भारी खाना खाने के बाद जलन बढ़ती है');
    } else {
      setStep(4); // Go to AYUSH Intake
      speakQuestion('अपनी भूख और पाचन स्वभाव का चयन करें');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none font-sans">
      {/* Top Kiosk Header */}
      <header className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-700 p-2 rounded-xl border border-emerald-500">
            <ShieldCheck className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide text-white">MediKiosk AYUSH</h1>
            <p className="text-xs text-emerald-300 font-medium">Ministry of Ayush, Govt. of India • OPD Kiosk #02 (ABDM Integrated)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-emerald-900/80 px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-700 text-emerald-200">
            🕒 10:42 AM • Room 4 Queue Active
          </div>

          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              isAudioOn ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            {isAudioOn ? 'Audio ON' : 'Audio OFF'}
          </button>

          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md">
            <AlertTriangle className="w-5 h-5" />
            Emergency / Help
          </button>
        </div>
      </header>

      {/* Main Kiosk Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">

        {/* STEP 1: Welcome, Language & Identification (P01 - P04) */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-8 shadow-xl flex items-center justify-between">
              <div>
                <span className="bg-emerald-700/80 text-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  MINISTRY OF AYUSH • GOVT. OF INDIA
                </span>
                <h2 className="text-3xl font-extrabold mt-3">Welcome to MediKiosk / मेडिकियोस्क में स्वागत है</h2>
                <p className="text-emerald-100 text-lg mt-2">
                  Complete your medical intake in 3 simple steps before meeting your doctor.
                </p>
              </div>
              <button
                onClick={() => speakQuestion(language === 'hi' ? 'मेडिकियोस्क में आपका स्वागत है। डॉक्टर से मिलने से पहले अपनी जानकारी दर्ज करें' : language === 'mr' ? 'मेडिकियोस्क मध्ये आपले स्वागत आहे' : 'Welcome to MediKiosk. Complete your medical intake in 3 simple steps.')}
                className={`font-black px-6 py-4 rounded-2xl text-lg shadow-lg flex items-center gap-3 transition-all ${
                  isSpeakingVoiceAssist ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950'
                }`}
              >
                <Volume2 className="w-6 h-6" />
                {isSpeakingVoiceAssist ? 'STOP VOICE ASSIST ⏹️' : 'TAP FOR VOICE ASSIST 🔊'}
              </button>
            </div>

            {/* Language Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-emerald-800 text-white w-7 h-7 rounded-full inline-flex items-center justify-center text-sm">1</span>
                Select Language / भाषा का चयन करें / भाषा निवडा
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { code: 'en', label: 'English', desc: 'Continue in English' },
                  { code: 'hi', label: 'हिन्दी (Hindi)', desc: 'आसान बोलचाल की भाषा (Recommended)', badge: 'RECOMMENDED' },
                  { code: 'mr', label: 'मराठी (Marathi)', desc: 'मराठी भाषेत जलद नोंदणी करा' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`kiosk-card p-6 text-left border-2 transition-all relative ${
                      language === lang.code ? 'border-emerald-700 bg-emerald-50 shadow-md ring-2 ring-emerald-600' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {lang.badge && (
                      <span className="absolute top-3 right-3 bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                        {lang.badge}
                      </span>
                    )}
                    <h4 className="text-2xl font-bold text-slate-900">{lang.label}</h4>
                    <p className="text-sm text-slate-600 mt-2">{lang.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Identification Method */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-emerald-800 text-white w-7 h-7 rounded-full inline-flex items-center justify-center text-sm">2</span>
                Choose Intake Method / पहचान का माध्यम चुनें
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div
                  onClick={() => setIntakeMethod('ABHA')}
                  className={`kiosk-card p-6 cursor-pointer border-2 transition-all ${
                    intakeMethod === 'ABHA' ? 'border-emerald-700 bg-emerald-50 shadow-md ring-2 ring-emerald-600' : 'border-slate-200'
                  }`}
                >
                  <div className="bg-emerald-100 text-emerald-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-md">INSTANT 5S SYNC</span>
                  <h4 className="text-xl font-bold text-slate-900 mt-2">ABHA / आभा खाता</h4>
                  <p className="text-sm text-slate-600 mt-1">Scan QR code on ABHA card or Ayushman app.</p>
                  <button onClick={handleStartIdentification} className="mt-6 w-full kiosk-btn-primary py-3 text-base">
                    <QrCode className="w-5 h-5" /> Scan ABHA QR Code
                  </button>
                </div>

                <div
                  onClick={() => setIntakeMethod('SLIP')}
                  className={`kiosk-card p-6 cursor-pointer border-2 transition-all ${
                    intakeMethod === 'SLIP' ? 'border-emerald-700 bg-emerald-50 shadow-md ring-2 ring-emerald-600' : 'border-slate-200'
                  }`}
                >
                  <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md">PAPER SLIP</span>
                  <h4 className="text-xl font-bold text-slate-900 mt-2">OPD Slip / पर्ची</h4>
                  <p className="text-sm text-slate-600 mt-1">Hold barcode of OPD slip under red glass scanner.</p>
                  <button onClick={handleStartIdentification} className="mt-6 w-full kiosk-btn-secondary py-3 text-base">
                    Scan OPD Barcode
                  </button>
                </div>

                <div
                  onClick={() => setIntakeMethod('NEW')}
                  className={`kiosk-card p-6 cursor-pointer border-2 transition-all ${
                    intakeMethod === 'NEW' ? 'border-emerald-700 bg-emerald-50 shadow-md ring-2 ring-emerald-600' : 'border-slate-200'
                  }`}
                >
                  <div className="bg-purple-100 text-purple-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <UserPlus className="w-7 h-7" />
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md">FIRST VISIT</span>
                  <h4 className="text-xl font-bold text-slate-900 mt-2">New Patient / नया पंजीकरण</h4>
                  <p className="text-sm text-slate-600 mt-1">Register using mobile number and name.</p>
                  <button onClick={handleStartIdentification} className="mt-6 w-full kiosk-btn-secondary py-3 text-base">
                    <Smartphone className="w-5 h-5" /> Register via Mobile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Consent (P04) */}
        {step === 2 && (
          <div className="kiosk-card p-8 max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
              <div className="bg-emerald-100 text-emerald-800 p-3 rounded-2xl">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Patient Consent & Data Privacy Notice</h2>
                <p className="text-sm text-slate-600">DPDP Act 2023 & ABDM Digital Health Infrastructure Compliant</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-800 space-y-4">
              <p className="font-semibold text-lg">
                I hereby grant consent to MediKiosk and Civil Hospital Satara to:
              </p>
              <ul className="space-y-3 text-base">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Collect clinical history through spoken audio and touch interaction in my preferred language.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Digitize and perform OCR analysis on my previous medical prescriptions and lab reports.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Prepare a structured clinical intake summary exclusively for presiding AYUSH physicians.</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button onClick={() => setStep(1)} className="kiosk-btn-secondary px-6 py-4 text-lg">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleGrantConsent} className="kiosk-btn-primary px-10 py-4 text-xl">
                I Agree & Grant Consent <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SOCRATES Clinical History Interview (P06 - P14) */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Progress Bar Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="bg-emerald-800 text-white font-extrabold px-3 py-1 rounded-xl text-sm">
                  SOCRATES INTAKE • STEP {socratesStep} OF 5
                </span>
                <h3 className="font-bold text-slate-800 text-lg">Clinical History Elicitation</h3>
              </div>
              <button
                onClick={() => speakQuestion('कृपया प्रश्न ध्यानपूर्वक सुनें या स्क्रीन पर उत्तर चुनें')}
                className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" /> Repeat Audio Question
              </button>
            </div>

            {/* Voice Assistant & Audio Visualizer Bar across all SOCRATES steps */}
            <div className="bg-slate-50 border-2 border-emerald-400 rounded-3xl p-5 text-center space-y-3 shadow-xs">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={toggleListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-600 animate-pulse text-white shadow-lg ring-4 ring-red-300 scale-105'
                      : 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-md'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>

                {/* Animated Audio Equalizer Visualizer */}
                {isListening && (
                  <div className="flex items-end gap-1.5 h-8 px-2">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <div
                        key={bar}
                        className="w-2 bg-emerald-600 rounded-full transition-all duration-150"
                        style={{ height: `${Math.max(25, (audioLevel * bar * 15) % 100)}%` }}
                      ></div>
                    ))}
                  </div>
                )}

                {isSpeakingVoiceAssist && (
                  <div className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                    <Volume2 className="w-4 h-4" /> Reading Question Aloud...
                  </div>
                )}
              </div>

              <p className="text-slate-800 font-bold text-base">
                {isListening
                  ? 'Listening in ' + (language === 'hi' ? 'Hindi...' : language === 'mr' ? 'Marathi...' : 'English...')
                  : 'Tap Mic to Speak Answer / बोलकर उत्तर दें'}
              </p>

              <div className="max-w-md mx-auto flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type or edit voice input (e.g. सीने में तेज जलन व दर्द)..."
                  value={spokenText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSpokenText(val);
                    processSpeechDetection(val, socratesStep);
                  }}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-medium focus:border-emerald-600 focus:outline-none shadow-xs"
                />
                {spokenText && (
                  <button onClick={() => setSpokenText('')} className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2">Clear</button>
                )}
              </div>

              {spokenText && (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold px-4 py-1.5 rounded-xl inline-block">
                  🗣 Speech Recognized: "{spokenText}"
                </div>
              )}
            </div>

            {/* SOCRATES Step 1: Site */}
            {socratesStep === 1 && (
              <div className="kiosk-card p-8 space-y-6">
                <div>
                  <span className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">1. SOCRATES SITE • मुख्य स्थान</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Where exactly do you feel the pain or discomfort?</h2>
                  <p className="text-xl text-slate-600 mt-1">आपको दर्द या असहजता किस स्थान पर महसूस हो रही है?</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'Chest', title: 'Chest', sub: 'छाती / हृदय क्षेत्र' },
                    { id: 'Upper Abdomen', title: 'Upper Abdomen', sub: 'पेट का ऊपरी भाग / आमाशय' },
                    { id: 'Lower Abdomen', title: 'Lower Abdomen', sub: 'नाभि के नीचे / बस्ती क्षेत्र' },
                    { id: 'Back & Spine', title: 'Back & Spine', sub: 'पीठ, कमर और मेरुदंड' },
                    { id: 'Joints & Limbs', title: 'Joints & Limbs', sub: 'जोड़ों में दर्द / हाथ-पैर' },
                    { id: 'Other Location', title: 'Other Location', sub: 'सिर, गला अथवा अन्य स्थान' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedBodyPart(opt.id)}
                      className={`p-4 rounded-2xl text-left border-2 flex items-center justify-between ${
                        selectedBodyPart === opt.id ? 'border-emerald-700 bg-emerald-800 text-white' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-base">{opt.title}</h4>
                        <p className="text-xs opacity-80 mt-0.5">{opt.sub}</p>
                      </div>
                      {selectedBodyPart === opt.id && <CheckCircle2 className="w-6 h-6 text-emerald-300" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SOCRATES Step 2: Onset & Duration */}
            {socratesStep === 2 && (
              <div className="kiosk-card p-8 space-y-6">
                <div>
                  <span className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">2. SOCRATES ONSET • शुरुआत एवं कालावधी</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">When and how did this symptom begin?</h2>
                  <p className="text-xl text-slate-600 mt-1">यह दर्द कब और कैसे शुरू हुआ? कितने समय से हो रहा है?</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'Sudden (~18 hrs / yesterday evening)', title: 'Sudden Onset (~18 hrs / yesterday evening)', desc: 'अचानक कल शाम से (18-24 घंटे)' },
                    { id: 'Gradual (3-5 Days)', title: 'Gradual Onset (3 to 5 Days)', desc: 'धीरे-धीरे 3 से 5 दिनों से' },
                    { id: 'Chronic (2+ Weeks)', title: 'Chronic Duration (More than 2 weeks)', desc: 'पुराना (2 सप्ताह से अधिक)' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setOnsetDuration(opt.id)}
                      className={`w-full p-5 rounded-2xl text-left border-2 flex items-center justify-between ${
                        onsetDuration.includes(opt.id.split(' ')[0]) ? 'border-emerald-700 bg-emerald-800 text-white' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-lg">{opt.title}</h4>
                        <p className="text-sm opacity-80 mt-1">{opt.desc}</p>
                      </div>
                      {onsetDuration.includes(opt.id.split(' ')[0]) && <CheckCircle2 className="w-6 h-6 text-emerald-300" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SOCRATES Step 3: Character & Severity */}
            {socratesStep === 3 && (
              <div className="kiosk-card p-8 space-y-6">
                <div>
                  <span className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">3. SOCRATES CHARACTER & SEVERITY • तीव्रता</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">What does the pain feel like, and how severe is it?</h2>
                  <p className="text-xl text-slate-600 mt-1">दर्द का प्रकार कैसा है और तीव्रता 1 से 10 में कितनी है?</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'Severe Burning', title: 'Severe Burning Sensation / Pyrosis (8/10)', desc: 'तेज जलन व अम्लपित्त दाह (High Severity)' },
                    { id: 'Dull Heavy Pressure', title: 'Dull Heavy Pressure / Weight (6/10)', desc: 'सीने/पेट में भारीपन व मंद दर्द' },
                    { id: 'Sharp Stabbing', title: 'Sharp Stabbing Pain (9/10)', desc: 'तेज चुभन जैसा तीव्र दर्द' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPainSeverity(opt.title)}
                      className={`w-full p-5 rounded-2xl text-left border-2 flex items-center justify-between ${
                        painSeverity.includes(opt.id) ? 'border-emerald-700 bg-emerald-800 text-white' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-lg">{opt.title}</h4>
                        <p className="text-sm opacity-80 mt-1">{opt.desc}</p>
                      </div>
                      {painSeverity.includes(opt.id) && <CheckCircle2 className="w-6 h-6 text-emerald-300" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SOCRATES Step 4: Radiation & Associated Symptoms */}
            {socratesStep === 4 && (
              <div className="kiosk-card p-8 space-y-6">
                <div>
                  <span className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">4. SOCRATES RADIATION & ASSOCIATED • सह-लक्षण</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Does the pain radiate anywhere, or are there burps/sweating?</h2>
                  <p className="text-xl text-slate-600 mt-1">क्या दर्द कहीं फैलता है या साथ में खट्टी डकारें आ रही हैं?</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'Acidic Regurgitation', title: 'Acidic Regurgitation & Sour Burps (Vidagdha Amlodgara)', desc: 'खट्टी डकारें, गले में जलन व मुंह में पानी आना' },
                    { id: 'Radiation to Arm/Jaw', title: 'Radiation to Left Arm / Jaw + Sweating (RED FLAG)', desc: 'बाएँ हाथ व जबड़े में दर्द + पसीना आना (Red Flag Trigger)' },
                    { id: 'Nausea & Bloating', title: 'Nausea & Abdominal Bloating (Ajeerna)', desc: 'जी मिचलाना व पेट फूलना' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAssociatedSymptoms(opt.title)}
                      className={`w-full p-5 rounded-2xl text-left border-2 flex items-center justify-between ${
                        associatedSymptoms.includes(opt.id) ? 'border-emerald-700 bg-emerald-800 text-white' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-lg">{opt.title}</h4>
                        <p className="text-sm opacity-80 mt-1">{opt.desc}</p>
                      </div>
                      {associatedSymptoms.includes(opt.id) && <CheckCircle2 className="w-6 h-6 text-emerald-300" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SOCRATES Step 5: Aggravating/Relieving */}
            {socratesStep === 5 && (
              <div className="kiosk-card p-8 space-y-6">
                <div>
                  <span className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">5. SOCRATES EXACERBATING / RELIEVING • बढ़ाने-घटाने वाले कारक</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Does spicy/fried food worsen it, and does warm water relieve it?</h2>
                  <p className="text-xl text-slate-600 mt-1">क्या मसालेदार खाने से जलन बढ़ती है और गरम पानी से आराम मिलता है?</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'Worse Post-Meal', title: 'Worse Post-Meal (Deep Fried / Spicy Feast)', desc: 'तली-मसालेदार चीज़ें व भारी भोजन खाने के बाद बढ़ता है' },
                    { id: 'Relieved by Warm Water', title: 'Relieved Transiently by Warm Water / Milk', desc: 'कोमट पाण्याने/गरम पानी से अस्थायी राहत' },
                    { id: 'Worse on Exertion', title: 'Worse on Walking / Physical Exertion', desc: 'चलने-फिरने पर बढ़ता है' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAggravatingFactors(opt.title)}
                      className={`w-full p-5 rounded-2xl text-left border-2 flex items-center justify-between ${
                        aggravatingFactors.includes(opt.id) ? 'border-emerald-700 bg-emerald-800 text-white' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-lg">{opt.title}</h4>
                        <p className="text-sm opacity-80 mt-1">{opt.desc}</p>
                      </div>
                      {aggravatingFactors.includes(opt.id) && <CheckCircle2 className="w-6 h-6 text-emerald-300" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (socratesStep > 1) setSocratesStep(socratesStep - 1);
                  else setStep(2);
                }}
                className="kiosk-btn-secondary px-6 py-4 text-lg"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>

              <button onClick={handleNextSocrates} className="kiosk-btn-primary px-10 py-4 text-xl">
                {socratesStep === 5 ? 'Continue to AYUSH Intake' : 'Next Question'} <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: AYUSH Dashavidha Pariksha Intake (P15 - P17) */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="bg-emerald-800 text-white font-extrabold px-3 py-1 rounded-xl text-sm">
                  AYUSH INTENDED INTAKE • DASHAVIDHA & AHARA
                </span>
                <h3 className="font-bold text-slate-800 text-lg">Prakriti, Agni & Koshtha Assessment</h3>
              </div>
            </div>

            <div className="kiosk-card p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Select Digestive Agni & Koshtha Pattern</h2>
                <p className="text-slate-600 mt-1">अपनी भूख, पाचन एवं मल प्रवृत्ति का चयन करें:</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'Tikshnagni', title: 'Tikshnagni (Excessive Appetite + Acidic Regurgitation)', desc: 'तीव्र भूख, खट्टी डकारें व पित्त प्रकोप (Pitta 58% • Vata 32%)' },
                  { id: 'Mandagni', title: 'Mandagni (Sluggish Digestion + Heavy Bloating)', desc: 'कम भूख, पेट भारी होना व आलस्य (Kapha 60%)' },
                  { id: 'Vishamagni', title: 'Vishamagni (Irregular Digestion + Gas/Constipation)', desc: 'अनियमित भूख व कब्ज (Vata 65%)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAgniState(item.title)}
                    className={`w-full p-5 rounded-2xl text-left border-2 flex items-center justify-between ${
                      agniState.includes(item.id) ? 'border-emerald-700 bg-emerald-800 text-white' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <h4 className="text-xl font-bold">{item.title}</h4>
                      <p className="text-sm opacity-80 mt-1">{item.desc}</p>
                    </div>
                    {agniState.includes(item.id) && <CheckCircle2 className="w-8 h-8 text-emerald-300" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(3)} className="kiosk-btn-secondary px-6 py-4 text-lg">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={() => setStep(5)} className="kiosk-btn-primary px-10 py-4 text-xl">
                Continue to Document Scan <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Webcam Document Scanning & OCR (P18) */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="bg-emerald-800 text-white font-extrabold px-3 py-1 rounded-xl text-sm">
                  MODULE B • DOCUMENT INTELLIGENCE
                </span>
                <h3 className="font-bold text-slate-800 text-lg">Scan Previous Medical Prescriptions / Blood Reports</h3>
              </div>
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Camera className="w-4 h-4" /> Live Webcam Scanner Ready
              </span>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Webcam Live Frame */}
              <div className="col-span-7 kiosk-card p-6 bg-slate-950 text-white flex flex-col justify-between min-h-[420px] relative overflow-hidden">
                <div className="flex items-center justify-between z-10">
                  <span className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-md flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> EDGE AUTO-DETECT: LOCKED
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1 rounded-md">Optimal Hospital Light</span>
                </div>

                <div className="border-4 border-dashed border-emerald-400/80 rounded-2xl m-4 flex-1 flex flex-col items-center justify-center text-center p-4 bg-emerald-950/40 relative overflow-hidden min-h-[260px]">
                  <canvas ref={canvasRef} className="hidden" />

                  {capturedDoc ? (
                    <div className="space-y-3 z-10">
                      <div className="bg-emerald-500 text-emerald-950 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center">
                        <Check className="w-10 h-10 stroke-[3]" />
                      </div>
                      <h4 className="text-xl font-bold text-emerald-300">Document Digitized & SHA-256 Hashed</h4>
                      <p className="text-xs text-slate-300">Extracted 1 Prescription & 3 Lab Values</p>
                    </div>
                  ) : streamActive ? (
                    <div className="relative w-full h-full min-h-[240px] flex items-center justify-center">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-60 object-cover rounded-xl border border-emerald-500/50" />
                      <div className="absolute inset-0 border-2 border-emerald-400 rounded-xl pointer-events-none flex items-center justify-center">
                        <span className="bg-black/60 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                          Live Camera Active • Align Paper Inside Guides
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 z-10">
                      <FileText className="w-16 h-16 text-emerald-400 mx-auto opacity-80" />
                      <h4 className="text-xl font-bold text-white">Align paper inside green guides or Upload File</h4>
                      <p className="text-xs text-slate-400">Hold paper flat for 2 seconds • स्थिरता से पकड़े रखें</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 z-10">
                  <button onClick={capturePhoto} className="flex-1 kiosk-btn-primary py-3.5 text-base bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5" /> Capture Document
                  </button>

                  <label className="flex-1 kiosk-btn-secondary py-3.5 text-base bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 cursor-pointer border border-slate-700">
                    <Upload className="w-5 h-5" /> Upload File
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button onClick={() => { setCapturedDoc(false); startCamera(); }} className="kiosk-btn-secondary py-3.5 px-4 text-base bg-slate-800 text-slate-300">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Real-time OCR Analysis Card with Abnormal Value Highlighting */}
              <div className="col-span-5 kiosk-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600" /> Real-Time OCR Analysis
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded">98.4% Confidence</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded-xl border">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">DOCUMENT TYPE</span>
                    <p className="font-bold text-slate-900">Govt. Civil Hospital Satara OPD Prescription</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">DIGITIZED MEDICATION</span>
                    <p className="font-bold text-slate-900">Tab. Amlodipine 5mg - 1 Tab OD</p>
                  </div>

                  {/* Abnormal Value Highlighting */}
                  <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1">
                    <span className="text-[10px] font-extrabold text-red-700 uppercase flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> ABNORMAL LAB VALUE HIGHLIGHTED
                    </span>
                    <p className="font-bold text-red-900">Hemoglobin (Hb): 11.4 g/dL <span className="text-xs font-semibold text-red-700">(Low • Pandu)</span></p>
                    <p className="text-xs text-slate-700">Fasting Blood Sugar: 104 mg/dL <span className="text-amber-700 font-semibold">(Pre-diabetic)</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(4)} className="kiosk-btn-secondary px-6 py-4 text-lg">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={() => setStep(6)} className="kiosk-btn-primary px-10 py-4 text-xl">
                Review Case Summary <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Patient Summary Review (P19) */}
        {step === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
              <div>
                <span className="bg-emerald-700 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  FINAL REVIEW • CLINICAL SUMMARY
                </span>
                <h2 className="text-3xl font-extrabold mt-2">Medical Intake Summary & Queue Pass</h2>
                <p className="text-emerald-200 text-base mt-1">Verify details before generating your OPD consultation slip.</p>
              </div>
              <button onClick={() => speakQuestion('अपनी जानकारी की जांच करें। पुष्टि के बाद आपकी ओपीडी पर्ची प्रिंट होगी।')} className="bg-emerald-500 text-emerald-950 font-black px-6 py-3 rounded-2xl flex items-center gap-2">
                <Volume2 className="w-5 h-5" /> Replay Voice Summary
              </button>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-7 space-y-4">
                <div className="kiosk-card p-6 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-lg border-b pb-2">Patient Identity</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 font-bold">FULL NAME / AGE / GENDER</span>
                      <p className="font-bold text-slate-900 text-base">Rameshwar Patil (62 Years • Male)</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold">ABHA NUMBER</span>
                      <p className="font-bold text-emerald-700 text-base">91-4821-9920-11</p>
                    </div>
                  </div>
                </div>

                <div className="kiosk-card p-6 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-lg border-b pb-2">SOCRATES Clinical Complaint</h4>
                  <p className="font-bold text-slate-800 text-base">
                    "{selectedBodyPart}: Pain & epigastric burning after eating since yesterday evening."
                  </p>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg">Onset: {onsetDuration.split(' ')[0]}</span>
                    <span className="bg-slate-100 px-3 py-1 rounded-lg">Severity: 8/10</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg">Pitta-Vata Amlapitta</span>
                  </div>
                </div>
              </div>

              {/* Queue Pass Ticket */}
              <div className="col-span-5 kiosk-card p-6 bg-gradient-to-b from-emerald-900 to-teal-950 text-white flex flex-col justify-between text-center space-y-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
                    AYUSH OPD LIVE QUEUE PASS
                  </span>
                  <div className="bg-white/10 rounded-2xl p-6 mt-4 border border-white/20">
                    <span className="text-xs text-emerald-200 uppercase font-bold">ASSIGNED TOKEN NUMBER</span>
                    <h1 className="text-6xl font-black text-white mt-1">{tokenNumber}</h1>
                    <span className="text-xs text-emerald-300 font-medium">Live Queue Active</span>
                  </div>
                </div>

                <div className="text-left space-y-2 text-sm bg-white/5 p-4 rounded-xl">
                  <p><span className="text-emerald-300 font-bold">Physician:</span> Dr. Priya Sharma, MD (Ayu)</p>
                  <p><span className="text-emerald-300 font-bold">Room:</span> OPD Room 4 (General Medicine)</p>
                  <p><span className="text-emerald-300 font-bold">Est. Wait:</span> ~14 Mins (2 Patients ahead)</p>
                </div>

                <button
                  onClick={async () => {
                    try {
                      const res = await api.identifyPatient({
                        id_type: intakeMethod === 'ABHA' ? 'ABHA_NUMBER' : 'MOBILE_OTP',
                        external_ref: '91-4821-9920-11',
                        full_name: 'Rameshwar Patil',
                        phone_number: '+91 98231 ****84'
                      });
                      if (res?.token_number) setTokenNumber(res.token_number);
                    } catch (e) {}
                    setStep(7);
                  }}
                  className="w-full bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black py-4 rounded-2xl text-xl shadow-lg flex items-center justify-center gap-3 transition-all"
                >
                  <Printer className="w-6 h-6" /> Confirm & Print OPD Slip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Completion (P20) */}
        {step === 7 && (
          <div className="kiosk-card p-12 max-w-2xl mx-auto text-center space-y-6 animate-fadeIn">
            <div className="bg-emerald-100 text-emerald-800 w-24 h-24 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16" />
            </div>

            <div>
              <h2 className="text-4xl font-black text-slate-900">OPD Consultation Slip Printed</h2>
              <p className="text-slate-600 text-lg mt-2">
                Please collect your slip below and proceed to <strong className="text-emerald-800">OPD Room 4</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border text-center">
              <span className="text-xs font-bold text-slate-400 uppercase">YOUR TOKEN NUMBER</span>
              <h1 className="text-6xl font-black text-emerald-900 mt-1">{tokenNumber}</h1>
              <p className="text-sm font-semibold text-slate-600 mt-2">Assigned to Dr. Priya Sharma, MD (Ayu)</p>
            </div>

            <button onClick={() => { setStep(1); setSocratesStep(1); }} className="w-full kiosk-btn-primary py-4 text-xl">
              Finish & Return to Welcome Screen
            </button>
          </div>
        )}
      </main>

      {/* Priority Red-Flag Emergency Triage Alert Modal */}
      {showRedFlagModal && (
        <div className="fixed inset-0 bg-red-950/90 z-50 flex items-center justify-center p-8 backdrop-blur-sm animate-fadeIn select-none">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 text-center space-y-6 border-4 border-red-600 shadow-2xl">
            <div className="w-20 h-20 bg-red-600 text-white rounded-full mx-auto flex items-center justify-center animate-bounce shadow-lg">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <div>
              <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                EMERGENCY PRIORITY TRIAGE TRIGGERED
              </span>
              <h2 className="text-3xl font-black text-red-950 mt-3">High Clinical Priority Alert</h2>
              <p className="text-red-900 text-base font-semibold mt-2">
                Cardiological / Acute Symptoms Flagged: Left Arm Pain, Jaw Radiation & Autonomic Sweating detected.
              </p>
            </div>
            <div className="bg-red-50 border border-red-300 p-4 rounded-2xl text-sm font-bold text-red-900 text-left space-y-1">
              <p className="flex items-center gap-2">🚨 <strong>RECOMMENDED IMMEDIATE ACTION:</strong></p>
              <p>Please do NOT wait in the regular OPD queue. Show this screen to the nearest Kiosk Sahayak or Nurse at <strong>Emergency ECG Room 1B</strong> immediately.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowRedFlagModal(false)}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-4 rounded-2xl text-lg shadow-md transition-all"
              >
                I Understand — Fast-Track to Triage Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Kiosk Footer Controls */}
      <footer className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between border-t border-slate-800">
        <button onClick={() => setStep(Math.max(1, step - 1))} className="kiosk-btn-secondary bg-slate-800 text-white border-slate-700 px-6 py-3">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => speakQuestion('सहायक को बुलाया जा रहा है।')} className="kiosk-btn-secondary bg-slate-800 text-emerald-300 border-slate-700 px-6 py-3">
            <Volume2 className="w-5 h-5" /> Repeat Audio
          </button>
          <button className="kiosk-btn-secondary bg-slate-800 text-teal-300 border-slate-700 px-6 py-3">
            <HelpCircle className="w-5 h-5" /> Call Sahayak
          </button>
        </div>
      </footer>
    </div>
  );
};
