import React from 'react';
import { Activity, ShieldCheck, Globe, Heart, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-white/10 mt-20 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">
                HEMO<span className="text-[#E63946]">NEXUS</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-400/30 text-blue-300">
                UNESCO BIO-SOLIDARITY
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-md">
              A UNESCO-aligned bioethics framework and digital public infrastructure network dedicated to voluntary, uncompensated blood and biometric component coordination worldwide.
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-[#64748B] pt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block pulse-cyan" />
                <span>Backend Port 8000 Linked</span>
              </span>
              <span>•</span>
              <span>DB: MariaDB (b24u)</span>
              <span>•</span>
              <span>ISBT 128 Standard</span>
            </div>
          </div>

          {/* Clinical Standards */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Bioethics & Compliance
            </h4>
            <ul className="space-y-2 text-[#94A3B8]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>UNESCO Universal Declaration on Bioethics</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>WHO Voluntary Unremunerated Donation</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict Anonymity & Clinical Data Privacy</span>
              </li>
            </ul>
          </div>

          {/* Emergency Dispatch Hotlines */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="font-bold text-[#E63946] uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>Emergency Trauma Hotlines</span>
            </h4>
            <div className="space-y-1 text-[#94A3B8]">
              <p className="text-white font-bold text-sm">1800-HEMO-NEXUS</p>
              <p>Municipal Blood Triage Desk: 104 / 108</p>
              <p className="text-[#64748B] text-[11px] pt-1">
                24/7 Transfusion Logistics Coordinator on Duty
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#64748B]">
          <p>© 2026 HemoNexus Global. Developed as an advanced UNESCO Social Service solution.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            <span>Powered by Core PHP procedural backend & MariaDB</span>
            <Heart className="w-3 h-3 text-[#E63946] inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
