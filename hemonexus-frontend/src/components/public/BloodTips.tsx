import React from 'react';
import { ShieldCheck, Heart, Droplet, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const BloodTips: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-400/30 text-[#00E5FF] text-xs font-mono uppercase tracking-widest mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CLINICAL BIOETHICS & DONOR SAFETY STANDARDS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Blood Donation Protocols & Biometrics
        </h1>
        <p className="text-sm text-[#94A3B8] mt-2">
          Strict clinical guidelines upholding donor health, ethical transfusion standards, and microbiological screening.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-3 border-t-2 border-t-[#00E5FF]">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-[#00E5FF] flex items-center justify-center">
            <Droplet className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-sans">Pre-Donation Protocol</h3>
          <ul className="text-xs text-[#94A3B8] font-mono space-y-2 list-disc list-inside leading-relaxed">
            <li>Drink 500 mL water or fruit juices 30 minutes before extraction.</li>
            <li>Consume a healthy, iron-rich meal; avoid fatty/fried foods.</li>
            <li>Ensure at least 6-8 hours of sound sleep the preceding night.</li>
            <li>Refrain from tobacco/smoking for at least 2 hours prior.</li>
          </ul>
        </div>

        <div className="glass-card p-6 space-y-3 border-t-2 border-t-[#E63946]">
          <div className="w-10 h-10 rounded-xl bg-red-950/60 text-[#E63946] flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-sans">Post-Donation Care</h3>
          <ul className="text-xs text-[#94A3B8] font-mono space-y-2 list-disc list-inside leading-relaxed">
            <li>Rest in the clinical recovery area for 15 minutes post-donation.</li>
            <li>Keep the puncture site bandage dry and secure for 4-6 hours.</li>
            <li>Drink extra fluids throughout the next 24-48 hours.</li>
            <li>Avoid heavy physical lifting or strenuous athletics for 24 hours.</li>
          </ul>
        </div>

        <div className="glass-card p-6 space-y-3 border-t-2 border-t-emerald-400">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-sans">Eligibility Thresholds</h3>
          <ul className="text-xs text-[#94A3B8] font-mono space-y-2 list-disc list-inside leading-relaxed">
            <li>Age: 18 - 65 years in sound clinical health.</li>
            <li>Weight: Minimum 50 kg for standard 450 mL whole blood draw.</li>
            <li>Hemoglobin: Minimum 12.5 g/dL confirmed via prick test.</li>
            <li>Frequency: 90 days interval for males; 120 days for females.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
