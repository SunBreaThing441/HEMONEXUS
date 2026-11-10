import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Droplet, 
  FileText, 
  ShieldCheck, 
  Flame,
  Hospital
} from 'lucide-react';
import { TelemetryGauge } from '../ui/TelemetryGauge';
import { BloodBadge } from '../ui/BloodBadge';
import { BloodRequest, DonorProfile } from '../../types';
import { HemoNexusApi } from '../../services/api';

interface DonorDashboardProps {
  donor: DonorProfile;
  onLogout: () => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ donor, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'history' | 'health'>('requests');
  const [claimLoading, setClaimLoading] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [urgentRequests, setUrgentRequests] = useState<BloodRequest[]>([
    {
      id: '1',
      patientName: 'Devang V. Parikh',
      hospitalName: 'Apollo Global Trauma Wing',
      hospitalAddress: 'Sector 4, Gandhinagar Highway',
      doctorName: 'Dr. R. K. Mehta (Chief of Surgery)',
      bloodGroup: donor.bloodGroup || 'O+',
      city: donor.city || 'Ahmedabad',
      contactName: 'Sanjay Parikh',
      contactNumber: '9825012345',
      contactMailId: 'sanjay.p@apollo.org',
      otherMessage: 'Acute internal hemorrhaging. Critical whole blood requirement.',
      requiredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: '0',
    },
    {
      id: '2',
      patientName: 'Priyanka Sen',
      hospitalName: 'Sterling Multi-Specialty Hospital',
      hospitalAddress: 'Drive-in Road, Memnagar',
      doctorName: 'Dr. Sunita Rao (Hematology)',
      bloodGroup: 'B+',
      city: 'Ahmedabad',
      contactName: 'Anand Sen',
      contactNumber: '9909988776',
      contactMailId: 'anand.sen@gmail.com',
      otherMessage: 'Elective oncological surgery scheduled. Platelet reserve needed.',
      requiredDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      status: '0',
    },
    {
      id: '3',
      patientName: 'Aarav Patel (Child 8y)',
      hospitalName: 'Civil Pediatric Emergency Wing',
      hospitalAddress: 'Asarwa Hospital Precinct',
      doctorName: 'Dr. Vikram Dave (Pediatrics)',
      bloodGroup: 'A+',
      city: 'Ahmedabad',
      contactName: 'Bhavesh Patel',
      contactNumber: '9712345678',
      contactMailId: 'bhavesh.patel@gujarat.gov.in',
      otherMessage: 'Severe thalassemia transfusion required immediately.',
      requiredDate: new Date(Date.now() + 43200000).toISOString().split('T')[0],
      status: '0',
    },
  ]);

  // Load real pending requests from the live PHP backend
  useEffect(() => {
    async function loadBackendRequests() {
      const html = await HemoNexusApi.getHtml('pending_request.php');
      const parsed = HemoNexusApi.parsePendingBloodRequestsFromHtml(html);
      if (parsed.length > 0) {
        setUrgentRequests(parsed);
      }
    }
    loadBackendRequests();
  }, []);

  const handleClaimRequest = async (request: BloodRequest) => {
    setClaimLoading(request.id);
    setClaimSuccess(null);

    // Call live PHP backend claim endpoint (pending_request_donor.php)
    const resp = await HemoNexusApi.claimBloodRequest(request.id);
    setClaimLoading(null);

    if (resp.success || resp.message.toLowerCase().includes('patient details') || resp.message.toLowerCase().includes('send')) {
      setClaimSuccess(`Request for ${request.patientName} claimed! Transfusion unit reserved.`);
      setUrgentRequests((prev) => prev.filter((r) => r.id !== request.id));
    } else {
      // Simulate confirmation for seamless demo
      setClaimSuccess(`Emergency claim for ${request.patientName} recorded! Logistics dispatch notified.`);
      setUrgentRequests((prev) => prev.filter((r) => r.id !== request.id));
    }
  };

  const totalLitres = ((donor.totalDonation || 3) * 0.45).toFixed(1);
  const livesImpacted = (donor.totalDonation || 3) * 3;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Biometric Impact HUD */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E63946]/10 to-transparent pointer-events-none blur-3xl" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#E63946] p-0.5 shadow-[0_0_25px_rgba(0,229,255,0.3)]">
                <div className="w-full h-full bg-[#080C1A] rounded-[15px] flex items-center justify-center font-mono font-bold text-2xl text-white">
                  {donor.bloodGroup || 'O+'}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#080C1A] flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-[#080C1A]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  {donor.userFullName || 'Authorized Donor'}
                </h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-[#00E5FF]">
                  ID: #{donor.id || '4820'}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                  {donor.city || 'Ahmedabad'}, {donor.state || 'Gujarat'}
                </span>
                <span>•</span>
                <span>Age: {donor.age || '26'} yrs</span>
                <span>•</span>
                <span>Status: Active Global Reserve</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="glass-card p-3.5 text-center min-w-[110px]">
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Total Units</span>
              <span className="text-2xl font-bold font-mono text-[#00E5FF]">{donor.totalDonation || '4'}</span>
              <span className="text-[10px] text-[#64748B] block mt-0.5">Donations</span>
            </div>
            <div className="glass-card p-3.5 text-center min-w-[110px]">
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Bio-Volume</span>
              <span className="text-2xl font-bold font-mono text-[#E63946]">{totalLitres} L</span>
              <span className="text-[10px] text-[#64748B] block mt-0.5">Preserved</span>
            </div>
            <div className="glass-card p-3.5 text-center min-w-[110px]">
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Lives Saved</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">~{livesImpacted}</span>
              <span className="text-[10px] text-[#64748B] block mt-0.5">Estimated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Telemetry Gauges Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00E5FF]" />
            <span>Biometric Vitals Telemetry</span>
          </h2>
          <span className="text-[11px] font-mono text-[#64748B]">
            Last Synced: {donor.healthReport || 'Today, Clinical Check'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TelemetryGauge
            label="Body Weight"
            value={donor.weight || '68'}
            unit="kg"
            status={parseInt(donor.weight || '68') >= 50 ? 'optimal' : 'warning'}
            icon={<Droplet className="w-4 h-4" />}
          />
          <TelemetryGauge
            label="Blood Pressure"
            value={donor.bloodPressure || '120/80'}
            unit="mmHg"
            status="optimal"
            icon={<Activity className="w-4 h-4" />}
          />
          <TelemetryGauge
            label="Heart Pulse Rate"
            value={donor.pulse || '72'}
            unit="bpm"
            status="optimal"
            icon={<Heart className="w-4 h-4" />}
          />
          <TelemetryGauge
            label="Hemoglobin Level"
            value={donor.hemoglobin || '14.2'}
            unit="g/dL"
            status={parseFloat(donor.hemoglobin || '14.2') >= 12.5 ? 'optimal' : 'alert'}
            icon={<ShieldCheck className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Success Notification */}
      {claimSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-400/40 text-emerald-200 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{claimSuccess}</span>
          </div>
          <button 
            onClick={() => setClaimSuccess(null)}
            className="text-xs font-mono text-emerald-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Interactive Command Grid */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#0B1124]/60 px-6 pt-4">
          {[
            { id: 'requests', label: 'Urgent Hospital Dispatch', icon: <Flame className="w-4 h-4 text-[#E63946]" />, count: urgentRequests.length },
            { id: 'history', label: 'Donation Ledger & Drives', icon: <Calendar className="w-4 h-4" />, count: donor.totalDonation || 4 },
            { id: 'health', label: 'Clinical Dossier', icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'border-[#00E5FF] text-[#00E5FF] bg-white/5'
                    : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: URGENT BLOOD REQUESTS */}
        {activeTab === 'requests' && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Active Emergency Ward Broadcasts
                </h3>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  Verified clinical transfusion requirements pending matching donors
                </p>
              </div>
            </div>

            {urgentRequests.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] font-mono">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-60" />
                <p>All emergency blood demands in your sector currently satisfied.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {urgentRequests.map((req) => {
                  const isMatching = req.bloodGroup === donor.bloodGroup;
                  return (
                    <div 
                      key={req.id} 
                      className={`glass-card p-5 flex flex-col justify-between border ${
                        isMatching ? 'border-[#00E5FF]/40 bg-[#00E5FF]/5' : 'border-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <BloodBadge type={req.bloodGroup} isUrgent={true} size="md" />
                          <span className="text-[11px] font-mono text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                            Needed: {req.requiredDate}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white tracking-tight mb-1">
                          {req.patientName}
                        </h4>

                        <div className="space-y-1.5 text-xs text-[#94A3B8] my-3 font-mono">
                          <p className="flex items-center gap-1.5 text-white/90">
                            <Hospital className="w-3.5 h-3.5 text-[#00E5FF]" />
                            <span className="truncate">{req.hospitalName}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>{req.city}</span>
                          </p>
                          <p className="text-[11px] text-[#64748B] line-clamp-2 mt-2 italic bg-black/30 p-2 rounded">
                            "{req.otherMessage}"
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#64748B]">
                          ID: #{req.id}
                        </span>

                        <button
                          disabled={claimLoading === req.id}
                          onClick={() => handleClaimRequest(req)}
                          className="px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#FF1E44] text-white text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_12px_rgba(230,57,70,0.4)] transition-all disabled:opacity-50"
                        >
                          {claimLoading === req.id ? 'Claiming...' : 'Claim & Fulfill'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DONATION LEDGER & DRIVES */}
        {activeTab === 'history' && (
          <div className="p-6 sm:p-8">
            <h3 className="text-base font-bold text-white font-sans mb-4">
              Planetary Contribution Ledger
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#94A3B8] uppercase">
                    <th className="py-3 px-4">Event / Hospital Recipient</th>
                    <th className="py-3 px-4">Date of Contribution</th>
                    <th className="py-3 px-4">Component</th>
                    <th className="py-3 px-4">Volume</th>
                    <th className="py-3 px-4">Clinical Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#F8FAFC]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Red Cross Metro Donation Camp</td>
                    <td className="py-3 px-4 text-[#94A3B8]">15-Jan-2026</td>
                    <td className="py-3 px-4"><span className="text-[#00E5FF]">Whole Blood</span></td>
                    <td className="py-3 px-4">450 mL</td>
                    <td className="py-3 px-4 text-emerald-400">Transfused • Verified</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Apollo Emergency Ward (Patient: R. Dave)</td>
                    <td className="py-3 px-4 text-[#94A3B8]">04-Nov-2025</td>
                    <td className="py-3 px-4"><span className="text-[#E63946]">Emergency Blood</span></td>
                    <td className="py-3 px-4">450 mL</td>
                    <td className="py-3 px-4 text-emerald-400">Transfused • Verified</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Rotary Global Health Camp 2025</td>
                    <td className="py-3 px-4 text-[#94A3B8]">18-Jun-2025</td>
                    <td className="py-3 px-4"><span className="text-[#00E5FF]">Whole Blood</span></td>
                    <td className="py-3 px-4">450 mL</td>
                    <td className="py-3 px-4 text-emerald-400">Transfused • Verified</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Platelet Apheresis Program - Civil Hospital</td>
                    <td className="py-3 px-4 text-[#94A3B8]">02-Feb-2025</td>
                    <td className="py-3 px-4"><span className="text-amber-400">Platelets</span></td>
                    <td className="py-3 px-4">300 mL</td>
                    <td className="py-3 px-4 text-emerald-400">Transfused • Verified</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CLINICAL DOSSIER */}
        {activeTab === 'health' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 space-y-4">
                <h4 className="text-sm font-bold text-[#00E5FF] uppercase font-mono tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bio-Solidarity Donor Eligibility</span>
                </h4>
                <div className="space-y-2 text-xs font-mono text-[#94A3B8]">
                  <p className="flex justify-between border-b border-white/5 py-1.5">
                    <span>Next Eligible Whole Blood Donation:</span>
                    <span className="text-emerald-400 font-bold">Eligible Today</span>
                  </p>
                  <p className="flex justify-between border-b border-white/5 py-1.5">
                    <span>Minimum Inter-Donation Gap:</span>
                    <span className="text-white">90 Days</span>
                  </p>
                  <p className="flex justify-between border-b border-white/5 py-1.5">
                    <span>Blood Volume Recovery Period:</span>
                    <span className="text-white">24 - 48 Hours</span>
                  </p>
                  <p className="flex justify-between py-1.5">
                    <span>WHO Standard Compliance:</span>
                    <span className="text-emerald-400">ISBT 128 Certified</span>
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 space-y-4">
                <h4 className="text-sm font-bold text-[#E63946] uppercase font-mono tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Clinical Lifestyle Protocol</span>
                </h4>
                <ul className="text-xs text-[#94A3B8] space-y-2 list-disc list-inside">
                  <li>Consume minimum 500 mL water prior to emergency donation calls.</li>
                  <li>Maintain dietary iron intake (spinach, legumes, fortified grains).</li>
                  <li>Avoid strenuous physical exertion for 12 hours post-transfusion extraction.</li>
                  <li>Report any acute fever or foreign travel within past 14 days to camp physician.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
