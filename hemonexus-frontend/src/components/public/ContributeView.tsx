import React, { useState } from 'react';
import { Heart, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { HemoNexusApi } from '../../services/api';

export const ContributeView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactnumber: '',
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380007',
    amount: '1000',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const resp = await HemoNexusApi.submitContribution(formData);
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono uppercase tracking-widest mb-3">
          <Heart className="w-3.5 h-3.5 text-[#E63946]" />
          <span>UNESCO BIO-SOLIDARITY RESERVE FUND</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          Support Mobile Clinical Camps
        </h1>
        <p className="text-sm text-[#94A3B8] max-w-md mx-auto mt-1">
          Contributions directly finance sterile extraction kits, mobile cold-chain logistics, and donor nutrition.
        </p>
      </div>

      {success ? (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Thank You for Your Humanitarian Contribution!
          </h2>
          <p className="text-xs text-[#94A3B8] font-mono max-w-md mx-auto">
            Your pledge has been securely recorded to the central bio-solidarity ledger (`b24u.contribution`).
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-2.5 rounded-xl bg-[#00E5FF] text-[#080C1A] text-xs font-bold uppercase tracking-wider font-mono mt-2"
          >
            Submit Another Pledge
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
              Contributor Legal Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="glass-input text-sm"
              placeholder="Full name or Organization"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="glass-input font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                Phone Number (10 Digits)
              </label>
              <input
                type="tel"
                name="contactnumber"
                value={formData.contactnumber}
                onChange={(e) => setFormData({ ...formData, contactnumber: e.target.value })}
                maxLength={10}
                required
                className="glass-input font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
              Select Pledge Amount (INR / Local Currency)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['500', '1000', '2500', '5000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: amt })}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs font-bold transition ${
                    formData.amount === amt
                      ? 'bg-[#E63946] border-[#FF6B6B] text-white shadow-[0_0_12px_rgba(230,57,70,0.4)]'
                      : 'bg-[#0B1124] border-white/10 text-[#94A3B8] hover:border-white/30'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="glass-input font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#E63946] hover:bg-[#FF1E44] text-white text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(230,57,70,0.4)] transition"
          >
            {loading ? 'Processing Pledge...' : 'Confirm Humanitarian Contribution'}
          </button>
        </form>
      )}
    </div>
  );
};
