import React, { useState } from 'react';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, X } from 'lucide-react';
import { HemoNexusApi } from '../../services/api';
import { EventProfile } from '../../types';

interface EventLoginModalProps {
  onSuccess: (event: EventProfile) => void;
  onClose: () => void;
}

export const EventLoginModal: React.FC<EventLoginModalProps> = ({ onSuccess, onClose }) => {
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Call live PHP backend endpoint (login_event.php)
    const resp = await HemoNexusApi.loginEvent(userEmail, password);
    setLoading(false);

    if (resp.success || resp.message.toLowerCase().includes('welcome')) {
      const profile: EventProfile = {
        id: '902',
        userFullName: 'UNESCO Regional Health Camp',
        userEmail: userEmail,
        userNumber: '9825012345',
        eventAddress: 'Town Hall Grounds, Ellisbridge',
        eventDate: 'Today, Active Drive',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        pincode: '380006',
        city: 'Ahmedabad',
        state: 'Gujarat',
        need: 'Whole Blood & Platelets',
        otherMessage: 'Certified municipal camp collection station.',
      };
      onSuccess(profile);
    } else {
      setError(resp.message || 'Invalid organizer email or passkey combination.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full relative border border-white/20">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/50 border border-emerald-400/40 text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white font-sans">
            Camp Command Access
          </h2>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Certified Blood Drive Organizer Terminal
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Registered Organizer Email</span>
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="organizer@redcross.org"
              required
              className="glass-input font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Passkey</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="glass-input font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#080C1A] text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(16,185,129,0.35)] transition flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Verifying Camp...' : 'Authorize Camp Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
