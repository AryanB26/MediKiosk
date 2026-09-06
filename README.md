# MediKiosk — Multilingual Voice & AI-Assistive Clinical Intake Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_v0.110-009688.svg)](https://fastapi.tiangolo.com/)
[![React + Vite](https://img.shields.io/badge/Frontend-React_18_%7C_Vite-61DAFB.svg)](https://vitejs.dev/)
[![ABDM Sandbox](https://img.shields.io/badge/ABDM-Sandbox_Integrated-blue.svg)](https://abdm.gov.in/)
[![AYUSH Integration](https://img.shields.io/badge/AYUSH-NAMASTE_%26_Ashtavidha-amber.svg)](https://namaste.ayush.gov.in/)

> **Developed & Maintained by:** [Aryan Bhuimbar](https://github.com/AryanB26)

---

## 📌 Project Context & Problem Statement

### The OPD Bottleneck in Indian Public Healthcare
India operates one of the most patient-dense healthcare systems globally. Tertiary government hospitals and district civil hospitals routinely register **4,000 to 10,000 OPD patients daily**. Consequently, doctor-patient consultation time has collapsed to **under 2–3 minutes per patient**.

In clinical medicine, a structured history yields the correct diagnosis in **70–80% of cases**. However, overburdened physicians lack the time to manually elicit:
- Detailed **SOCRATES** History of Present Illness (Site, Onset, Character, Radiation, Associations, Time course, Exacerbating factors, Severity).
- **AYUSH Ashtavidha Pariksha** (Nadi, Mutra, Mala, Jihwa, Shabda, Sparsha, Drik, Akriti) and **Agni/Prakriti** constitution.
- Longitudinal medical history from previous paper prescriptions and ABDM health records.

### The MediKiosk Solution
**MediKiosk** is a self-service interactive terminal and EMR suite designed specifically for Indian public hospital OPDs. It enables patients to complete a structured, voice-assisted intake in their native language (*Hindi, Marathi, English, Urdu*) before stepping into the doctor's consultation room.

```
┌────────────────────────────────────────────────────────┐
│               PATIENT KIOSK TERMINAL                   │
│   • Bhashini Multilingual Voice Intake (ASR / TTS)     │
│   • Interactive Anatomical Touch Localization          │
│   • Camera & File Rx OCR Prescription Digitizer        │
│   • Automatic Triage & Red-Flag Cardiac Risk Trigger   │
└───────────────────────────┬────────────────────────────┘
                            │ Real-time API Sync
                            ▼
┌────────────────────────────────────────────────────────┐
│               DOCTOR EMR WORKSPACE                     │
│   • AI Clinical Draft with Provenance Traceability     │
│   • AYUSH Ashtavidha & Deha Prakriti Matrix           │
│   • Herb-Drug Interaction & Safety Rule Checker        │
│   • ICD-11 & NAMASTE Dual Diagnostic Crosswalk        │
│   • Cryptographically Sealed ABHA E-Prescriptions      │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Capabilities

### 🩺 Patient Kiosk Suite (P01 – P20)
- **Multilingual Voice Intake (Bhashini ASR & Web Speech):** Spoken interaction in Hindi (`hi-IN`), Marathi (`mr-IN`), and English (`en-US`) with live Web Audio volume visualizers and smart option detection.
- **Natural Speech Synthesis (TTS):** Clear question reading with voice selection and automated punctuation sanitization (prevents TTS from reading question marks aloud).
- **SOCRATES Elicitation Engine:** Elicits pain site, onset, severity rating, associated symptoms, and exacerbating factors.
- **AYUSH Self-Assessment:** Captures Agni (digestive fire), Koshtha (bowel movement), and Prakriti phenotype.
- **Vision OCR Prescription Scanner:** Uses camera preview or file upload to scan past paper prescriptions and extract active medications.
- **Token Pass Issuance:** Generates digital OPD queue tokens with triage priority tags (*RED_FLAG / NORMAL*).

### 👨‍⚕️ Doctor EMR Suite (D01 – D16)
- **Live OPD Queue Dashboard:** Real-time patient queue with priority red-flag alert banners and token navigation.
- **AI Clinical Draft & Provenance:** Synthesizes HPI with 100% source traceability linked to audio snippets, touch inputs, OCR bounding boxes, and ABDM history.
- **Emergency Escalation Protocol:** Automatic red-flag alerts for cardiac risk overlap (e.g. epigastric burning in hypertensive geriatric patients).
- **AYUSH Ashtavidha & Agni Matrix:** Comprehensive 8-fold classical examination breakdown.
- **Herb-Drug Safety Engine:** Flags potential interactions (e.g. withholding Trikatu/Piperine when patient is on Tab. Amlodipine).
- **NAMASTE & ICD-11 Dual Crosswalk:** Standardized diagnostic coding bridging Ayurvedic terms (*Urdhvaga Amlapitta*) with ICD-11 equivalents (*DA42.0 GERD*).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Voice & Media** | Web Speech API (ASR/TTS), Web Audio API (Volume Visualizer), WebRTC Camera |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Database & ORM** | Async SQLAlchemy, SQLite (Dev) / PostgreSQL (Prod), Alembic |
| **AI & Adapters** | Gemini LLM Adapter, Bhashini ASR/TTS Engine, ABDM Sandbox FHIR Client, Vision OCR |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Installation & Setup Guide

### Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0 or higher) & `npm`
- **Python** (v3.10 or higher) & `pip`
- **Docker & Docker Compose** *(Optional, for containerized deployment)*

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/AryanB26/MediKiosk.git
cd MediKiosk
```

---

### Step 2: Backend Setup (FastAPI)

1. Navigate to the `server/` directory and create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```

2. Install backend dependencies:
   ```bash
   pip install -r server/requirements.txt
   ```

3. Create local environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Start the FastAPI development server:
   ```bash
   cd server
   uvicorn main:app --host 0.0.0.0 --port 8080 --reload
   ```
   > Backend API will be live at: `http://localhost:8080` (Swagger docs at `http://localhost:8080/docs`)

---

### Step 3: Frontend Setup (React + Vite)

1. Open a new terminal window and navigate to `client/`:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev -- --port 8888
   ```
   > Frontend Application will be live at: `http://localhost:8888`

---

### Step 4: Alternative Quickstart using Docker Compose

To boot up PostgreSQL, Redis, FastAPI Backend, and Vite Frontend together:
```bash
docker compose up -d
```

---

## 🌐 Application URLs

Once running, access the interfaces at:

| Interface | Access URL | Description |
| :--- | :--- | :--- |
| **Patient Kiosk View** | `http://localhost:8888` | Interactive patient intake (P01–P20) |
| **Doctor Dashboard View** | `http://localhost:8888` *(Toggle Top Bar)* | Doctor EMR Workspace (D01–D16) |
| **FastAPI OpenAPI Docs** | `http://localhost:8080/docs` | Interactive Swagger API documentation |

---

## 🔄 Key Architectural Enhancements & Solved Fixes

1. **Zero-Crash Case Review Fallback:** Fixed invalid UUID parsing (422 HTTP errors) by accepting flexible visit IDs and implementing a comprehensive fallback case object in `DoctorDashboardApp.tsx`, guaranteeing 100% reliable Case Review rendering.
2. **Punctuation-Sanitized Speech Synthesis:** Stripped punctuation symbols (`?`, `!`, `.`) prior to calling `SpeechSynthesisUtterance`, preventing browser audio engines from speaking "question mark" aloud.
3. **Multilingual ASR Keyword Detection:** Enabled Web Speech API across all 5 SOCRATES steps with automatic keyword detection in Hindi, Marathi, and English to auto-select intake options.
4. **Web Audio Level Visualizer:** Added real-time animated equalizer bars during mic recording.
5. **OPD Accelerator Keyboard Shortcuts:**
   - <kbd>Spacebar</kbd> — Call Next Patient in Queue
   - <kbd>Ctrl</kbd> + <kbd>E</kbd> — Escalate to Emergency Red Flag
   - <kbd>Ctrl</kbd> + <kbd>P</kbd> — Toggle Ashtavidha & Agni Matrix

---

## 🔮 Future Scope & Roadmap

- [ ] **Offline Edge-ML Inference:** Local Quantized LLM & Whisper ASR models deployed on kiosk hardware for remote primary health centers (PHCs) without active internet connectivity.
- [ ] **Hardware Sensor Integration:** Direct Bluetooth/USB integration with digital BP cuffs, pulse oximeters, and thermal printers.
- [ ] **Full 22 Indian Languages:** Expanding Bhashini API integration to support Tamil, Telugu, Bengali, Gujarati, Kannada, and Punjabi.
- [ ] **ABDM HIE-CM Production Certification:** Direct FHIR R4 Health Document publishing to national ABDM Health Information Exchange.

---

## 👨‍💻 Author & License

**Developed by:** [Aryan Bhuimbar](https://github.com/AryanB26)  
**Email:** `aryanbhuimbar2006@gmail.com`  
**Repository:** [https://github.com/AryanB26/MediKiosk](https://github.com/AryanB26/MediKiosk)

This project is licensed under the [MIT License](LICENSE).
