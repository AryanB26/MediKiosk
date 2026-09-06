import React, { useState } from 'react';
import { PatientKioskApp } from '../pages/PatientKioskApp';
import { DoctorDashboardApp } from '../pages/DoctorDashboardApp';
import { Stethoscope, UserCheck } from 'lucide-react';

export const AppRoutes: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'PATIENT_KIOSK' | 'DOCTOR_DASHBOARD'>('PATIENT_KIOSK');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top System Navigation Bar (Non-overlapping header) */}
      <nav className="bg-slate-950 text-white px-6 py-2 border-b border-slate-800 flex items-center justify-between z-40 sticky top-0 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
            SIH26047 • MEDIKIOSK DEMO SUITE
          </span>
          <span className="text-xs text-slate-400 font-medium">Select Active View:</span>
        </div>

        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1.5">
          <button
            onClick={() => setActiveRole('PATIENT_KIOSK')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeRole === 'PATIENT_KIOSK' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Patient Kiosk View (P01-P20)
          </button>

          <button
            onClick={() => setActiveRole('DOCTOR_DASHBOARD')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeRole === 'DOCTOR_DASHBOARD' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor Dashboard View (D01-D16)
          </button>
        </div>
      </nav>

      {/* Main Role App Content */}
      <div className="flex-1">
        {activeRole === 'PATIENT_KIOSK' ? <PatientKioskApp /> : <DoctorDashboardApp />}
      </div>
    </div>
  );
};
