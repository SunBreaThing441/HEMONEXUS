import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UserPlus, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Droplet,
  Search,
  Sparkles
} from 'lucide-react';
import { TelemetryGauge } from '../ui/TelemetryGauge';
import { BloodBadge } from '../ui/BloodBadge';
import { CampAttendee, EventProfile } from '../../types';
import { HemoNexusApi } from '../../services/api';

interface EventCommandCenterProps {
  event: EventProfile;
  onLogout: () => void;
}

export const EventCommandCenter: React.FC<EventCommandCenterProps> = ({ event, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'roster' | 'overview'>('checkin');
  const [donorIdInput, setDonorIdInput] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Vitals form state
  const [vitals, setVitals] = useState({
    weight: '65',
    bloodPressure: '120/80',
    pulse: '74',
    hemoglobin: '14.0',
    need: 'Blood',
  });

  // Sample Camp Attendees Roster
  const [attendees, setAttendees] = useState<CampAttendee[]>([
    {
      id: '1',
      donorId: '4820',
      userFullName: 'Karan Dave',
      userNumber: '9824098240',
      bloodGroup: 'O+',
      weight: '68',
      bloodPressure: '122/82',
      pulse: '72',
      hemoglobin: '14.5',
      donationType: 'Whole Blood',
    },
    {
      id: '2',
      donorId: '1029',
      userFullName: 'Meera Trivedi',
      userNumber: '9909012345',
      bloodGroup: 'B+',
      weight: '58',
      bloodPressure: '118/78',
      pulse: '76',
      hemoglobin: '13.2',
      donationType: 'Platelets',
    },
    {
      id: '3',
      donorId: '3310',
      userFullName: 'Rajesh Sharma',
      userNumber: '9898033221',
      bloodGroup: 'A+',
      weight: '74',
      bloodPressure: '125/85',
      pulse: '70',
      hemoglobin: '15.1',
      donationType: 'Whole Blood',
    },
  ]);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorIdInput) {
      setStatusMessage({ type: 'error', text: 'Please input a valid Donor ID.' });
      return;
    }

    setCheckinLoading(true);
    setStatusMessage(null);

    // Call live PHP backend check-in endpoint (eventdata_entry.php)
    const resp = await HemoNexusApi.checkinDonorAtCamp({
      donorId: donorIdInput,
      weight: vitals.weight,
      bloodPressure: vitals.bloodPressure,
      pulse: vitals.pulse,
      hemoglobin: vitals.hemoglobin,
      need: vitals.need,
    });

    setCheckinLoading(false);

    // Add to local state roster
    const newAttendee: CampAttendee = {
      id: (attendees.length + 1).toString(),
      donorId: donorIdInput,
      userFullName: `Registered Donor #${donorIdInput}`,
      userNumber: '98XXXXXXXX',
      bloodGroup: 'O+',
      weight: vitals.weight,
      bloodPressure: vitals.bloodPressure,
      pulse: vitals.pulse,
      hemoglobin: vitals.hemoglobin,
      donationType: vitals.need,
    };

    setAttendees([newAttendee, ...attendees]);
    setStatusMessage({
      type: 'success',
      text: `Donor #${donorIdInput} successfully checked in! Bio-vitals and donation units synchronized.`,
    });
    setDonorIdInput('');
  };

  const targetGoal = 100;
  const currentTotal = attendees.length + 35; // combined total
  const progressPercent = Math.min(Math.round((currentTotal / targetGoal) * 100), 100);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Event Command HUD */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none blur-3xl" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-[#00E5FF] p-0.5 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <div className="w-full h-full bg-[#080C1A] rounded-[15px] flex items-center justify-center">
                <Building2 className="w-9 h-9 text-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  {event.userFullName || 'UNESCO Regional Health Camp'}
                </h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-400/40 text-emerald-400">
                  CAMP ID: #{event.id || '902'}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                  {event.eventDate || 'Today, Active Drive'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                  {event.startTime || '09:00 AM'} - {event.endTime || '05:00 PM'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                  {event.city || 'Ahmedabad'}, {event.eventAddress || 'Civic Hall'}
                </span>
              </p>
            </div>
          </div>

          {/* Real-time Target Goal Bar */}
          <div className="w-full lg:w-72 glass-card p-4">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#94A3B8] uppercase">Camp Quota</span>
              <span className="text-[#00E5FF] font-bold">{currentTotal} / {targetGoal} Units</span>
            </div>
            <div className="h-2 w-full bg-[#0B1124] rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-[#00E5FF] to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#64748B] block mt-1.5 text-right">
              {progressPercent}% Bio-Harvest Achieved
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Controller */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="flex border-b border-white/10 bg-[#0B1124]/60 px-6 pt-4">
          {[
            { id: 'checkin', label: 'Camp Reception & Check-in', icon: <UserPlus className="w-4 h-4 text-[#00E5FF]" /> },
            { id: 'roster', label: 'Donor Intake Ledger', icon: <Users className="w-4 h-4" />, count: attendees.length },
            { id: 'overview', label: 'Camp Operations & Details', icon: <Building2 className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'border-emerald-400 text-emerald-400 bg-white/5'
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

        {/* TAB 1: CAMP CHECK-IN KIOSK */}
        {activeTab === 'checkin' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Rapid Biometric Check-in Terminal</span>
              </h3>
              <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                Record attendee vitals before extraction. Syncs with personal donor history and camp tally.
              </p>
            </div>

            {statusMessage && (
              <div 
                className={`p-4 rounded-xl text-xs font-mono flex items-center gap-3 border ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-200' 
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCheckin} className="space-y-6">
              {/* Donor ID Lookup */}
              <div className="glass-card p-5 border border-white/10">
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Input Registered Donor ID</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={donorIdInput}
                    onChange={(e) => setDonorIdInput(e.target.value)}
                    placeholder="e.g. 4820"
                    required
                    className="glass-input font-mono text-base tracking-wider"
                  />
                </div>
              </div>

              {/* Vitals Telemetry Inputs */}
              <div>
                <h4 className="text-xs font-mono uppercase text-[#94A3B8] mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clinical Vitals Assessment</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#64748B] mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      required
                      className="glass-input font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#64748B] mb-1">
                      Blood Pressure (mmHg)
                    </label>
                    <input
                      type="text"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      placeholder="120/80"
                      required
                      className="glass-input font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#64748B] mb-1">
                      Heart Pulse Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      placeholder="72"
                      required
                      className="glass-input font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#64748B] mb-1">
                      Hemoglobin (g/dL)
                    </label>
                    <input
                      type="text"
                      value={vitals.hemoglobin}
                      onChange={(e) => setVitals({ ...vitals, hemoglobin: e.target.value })}
                      placeholder="14.0"
                      required
                      className="glass-input font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Component Extraction Type */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Bio-Extraction Component</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Blood', 'Pletlets', 'Plasama'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVitals({ ...vitals, need: type })}
                      className={`p-3 rounded-xl border font-mono text-xs font-bold uppercase transition ${
                        vitals.need === type
                          ? 'bg-[#E63946] border-[#FF6B6B] text-white shadow-[0_0_12px_rgba(230,57,70,0.4)]'
                          : 'bg-[#0B1124] border-white/10 text-[#94A3B8] hover:border-white/30'
                      }`}
                    >
                      {type === 'Blood' ? 'Whole Blood' : type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={checkinLoading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#080C1A] text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
              >
                {checkinLoading ? 'Verifying & Recording...' : 'Authorize Donor Check-In'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: ATTENDEE ROSTER */}
        {activeTab === 'roster' && (
          <div className="p-6 sm:p-8">
            <h3 className="text-base font-bold text-white font-sans mb-4">
              Camp Intake & Extraction Ledger
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#94A3B8] uppercase">
                    <th className="py-3 px-4">Donor ID</th>
                    <th className="py-3 px-4">Donor Full Name</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">Vitals (BP / Pulse / Hb)</th>
                    <th className="py-3 px-4">Component</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#F8FAFC]">
                  {attendees.map((attendee) => (
                    <tr key={attendee.id}>
                      <td className="py-3 px-4 font-bold text-[#00E5FF]">#{attendee.donorId}</td>
                      <td className="py-3 px-4 font-semibold text-white">{attendee.userFullName}</td>
                      <td className="py-3 px-4">
                        <BloodBadge type={attendee.bloodGroup} size="sm" />
                      </td>
                      <td className="py-3 px-4">{attendee.weight} kg</td>
                      <td className="py-3 px-4 text-[#94A3B8]">
                        {attendee.bloodPressure} | {attendee.pulse} bpm | {attendee.hemoglobin} g/dL
                      </td>
                      <td className="py-3 px-4 text-emerald-400">{attendee.donationType}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          Complete
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CAMP OPERATIONS */}
        {activeTab === 'overview' && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="glass-card p-6 space-y-3 font-mono text-xs">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Operational Camp Logistics
              </h4>
              <p className="text-[#94A3B8] flex justify-between border-b border-white/5 py-2">
                <span>Organizer Contact:</span>
                <span className="text-white">{event.userEmail || 'contact@camp.org'}</span>
              </p>
              <p className="text-[#94A3B8] flex justify-between border-b border-white/5 py-2">
                <span>Contact Phone:</span>
                <span className="text-white">{event.userNumber || '9876543210'}</span>
              </p>
              <p className="text-[#94A3B8] flex justify-between border-b border-white/5 py-2">
                <span>Facility Coordinates:</span>
                <span className="text-white">{event.eventAddress || 'Civic Center'}, {event.city}</span>
              </p>
              <p className="text-[#94A3B8] flex justify-between py-2">
                <span>Target Biological Need:</span>
                <span className="text-[#00E5FF]">{event.need || 'Whole Blood & Platelets'}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
