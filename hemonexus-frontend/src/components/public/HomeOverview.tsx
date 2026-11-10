import React from 'react';
import { 
  Activity, 
  AlertCircle, 
  Heart, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Globe2,
  Users
} from 'lucide-react';
import { BloodBadge } from '../ui/BloodBadge';

interface HomeOverviewProps {
  onRegisterDonor: () => void;
  onRequestBlood: () => void;
  onExploreCamps: () => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onRegisterDonor,
  onRequestBlood,
  onExploreCamps,
}) => {
  const regionalStock = [
    { type: 'O+', level: 82, status: 'Stable' },
    { type: 'O-', level: 24, status: 'Critical Shortage' },
    { type: 'A+', level: 75, status: 'Stable' },
    { type: 'A-', level: 32, status: 'Low Reserve' },
    { type: 'B+', level: 90, status: 'Optimal' },
    { type: 'B-', level: 29, status: 'Low Reserve' },
    { type: 'AB+', level: 65, status: 'Adequate' },
    { type: 'AB-', level: 18, status: 'Critical Shortage' },
  ];

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-400/30 text-blue-300 text-xs font-mono uppercase tracking-widest mb-6">
          <Globe2 className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>UNESCO Bioethics & Global Healthcare Initiative</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Planetary Emergency <br />
          <span className="text-gradient-crimson">Blood Allocation Grid</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-2xl mx-auto">
          HemoNexus coordinates transnational voluntary blood reserves, emergency trauma wards, and mobile community donation camps under uncompromising clinical bioethics.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onRequestBlood}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E63946] hover:bg-[#FF1E44] text-white text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(230,57,70,0.4)] transition transform hover:-translate-y-0.5"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Request Emergency Blood</span>
          </button>

          <button
            onClick={onRegisterDonor}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#00E5FF] hover:bg-[#38bdf8] text-[#080C1A] text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(0,229,255,0.35)] transition transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enroll as Voluntary Donor</span>
          </button>

          <button
            onClick={onExploreCamps}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider font-mono transition"
          >
            <span>Active Camps Radar</span>
            <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
          </button>
        </div>
      </div>

      {/* Real-time Regional Blood Reserve Telemetry */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00E5FF]" />
              <span>Real-Time Biometric Supply Reserve</span>
            </h2>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
              Live hospital grid inventory status across the municipal node
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/5 text-[#00E5FF] border border-white/10">
            Node Refresh: Sub-second
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {regionalStock.map((item) => {
            const isCritical = item.level < 35;
            return (
              <div 
                key={item.type} 
                className={`glass-card p-4 text-center border ${
                  isCritical ? 'border-[#E63946]/40 bg-[#E63946]/5' : 'border-white/10'
                }`}
              >
                <BloodBadge type={item.type} isUrgent={isCritical} size="sm" />
                <div className="mt-3">
                  <span className="text-2xl font-bold font-mono text-white">
                    {item.level}%
                  </span>
                  <div className="w-full bg-[#0B1124] h-1.5 rounded-full overflow-hidden mt-1.5 border border-white/5">
                    <div 
                      className={`h-full rounded-full ${
                        isCritical ? 'bg-[#E63946]' : 'bg-[#00E5FF]'
                      }`}
                      style={{ width: `${item.level}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono block mt-1.5 ${
                    isCritical ? 'text-[#FF6B6B]' : 'text-[#64748B]'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Donation Drives & Camps Card Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Upcoming Field Camps & Extraction Drives</span>
            </h2>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
              Authorized clinical collection stations organized by certified healthcare partners
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: 'Metro Red Cross Humanitarian Drive',
              date: '15-Nov-2026',
              time: '09:00 AM - 04:00 PM',
              city: 'Ahmedabad',
              venue: 'Town Hall Grounds, Ellisbridge',
              target: '120 Units (Whole Blood & Platelets)',
              status: 'Open for Registration',
            },
            {
              title: 'Civil Hospital Pediatric Reserve Camp',
              date: '22-Nov-2026',
              time: '10:00 AM - 05:00 PM',
              city: 'Gandhinagar',
              venue: 'Medical College Auditorium, Sector 12',
              target: '80 Units (A- / O- Priority)',
              status: 'Open for Registration',
            },
            {
              title: 'Rotary Global Lifeblood Initiative',
              date: '02-Dec-2026',
              time: '08:30 AM - 03:30 PM',
              city: 'Ahmedabad',
              venue: 'Science City Convention Dome',
              target: '200 Units (Emergency Buffer)',
              status: 'Open for Registration',
            },
          ].map((camp, idx) => (
            <div key={idx} className="glass-card p-6 flex flex-col justify-between border border-white/10">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 uppercase">
                    Certified Drive
                  </span>
                  <span className="text-xs font-mono text-white/80">{camp.date}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-3">
                  {camp.title}
                </h3>

                <div className="space-y-2 text-xs font-mono text-[#94A3B8]">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>{camp.venue}, {camp.city}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#E63946]" />
                    <span>Target: {camp.target}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#64748B]">{camp.time}</span>
                <button
                  onClick={onRegisterDonor}
                  className="text-xs font-mono font-bold text-[#00E5FF] hover:underline"
                >
                  Join Drive →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
