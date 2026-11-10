import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  User, 
  Activity, 
  KeyRound, 
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import { HemoNexusApi } from '../../services/api';
import { BloodBadge } from '../ui/BloodBadge';

interface StepperProps {
  onRegistrationComplete: () => void;
  onSwitchToLogin: () => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const DonorRegistrationStepper: React.FC<StepperProps> = ({
  onRegistrationComplete,
  onSwitchToLogin,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
    confirm_password: '',
    user_full_name: '',
    user_email: '',
    user_number: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: 'O+',
    weight: '65',
    Address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380007',
  });

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage(null);
  };

  const handleStep1Validation = () => {
    if (!formData.user_name || formData.user_name.length < 5 || formData.user_name.length > 10) {
      setErrorMessage('Username must be between 5 and 10 characters.');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters with mixed case and digits.');
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleStep2Validation = () => {
    if (!formData.user_full_name || formData.user_full_name.trim().length < 2) {
      setErrorMessage('Please provide your full legal name.');
      return false;
    }
    if (!formData.user_email || !formData.user_email.includes('@')) {
      setErrorMessage('Please provide a valid clinical contact email.');
      return false;
    }
    if (!formData.user_number || formData.user_number.length !== 10) {
      setErrorMessage('Mobile number must be exactly 10 digits.');
      return false;
    }
    if (!formData.date_of_birth) {
      setErrorMessage('Please indicate your date of birth for eligibility verification.');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMessage(null);

    // Call process.php step 1 asynchronously
    const resp = await HemoNexusApi.submitDonorRegistration(formData);

    setLoading(false);
    if (resp.success || resp.message.includes('OTP')) {
      setSuccessMessage('4-digit Bio-Verification OTP transmitted to registered email.');
      setCurrentStep(4);
    } else {
      // In dev or local without working mail credentials, allow proceeding to OTP test mode
      console.warn('Backend returned notice:', resp.message);
      setSimulatedOtpNotice(resp.message || 'Verification token required.');
      setCurrentStep(4);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otpDigits];
    updated[index] = val;
    setOtpDigits(updated);

    // Auto advance focus
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleFinalVerification = async () => {
    const code = otpDigits.join('');
    if (code.length !== 4) {
      setErrorMessage('Please enter the complete 4-digit token.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const resp = await HemoNexusApi.verifyDonorOTP(code);
    setLoading(false);

    if (resp.success || resp.message.toLowerCase().includes('created') || resp.message.toLowerCase().includes('welcome')) {
      setSuccessMessage('Biometric Dossier Enrolled Successfully into UNESCO Bio-Grid!');
      setTimeout(() => {
        onRegistrationComplete();
      }, 1500);
    } else {
      setErrorMessage(resp.message || 'Verification failed. Please check the code.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
          <span>UNESCO VOLUNTARY DONOR REGISTRY</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          Donor Enrollment Dossier
        </h1>
        <p className="text-sm text-[#94A3B8] max-w-md mx-auto mt-1">
          Join the planetary bio-solidarity network. Complete the interactive baseline assessment.
        </p>
      </div>

      {/* Futuristic Progress Stepper Track */}
      <div className="glass-panel p-4 rounded-2xl mb-8">
        <div className="grid grid-cols-4 gap-2 relative">
          {[
            { step: 1, label: 'Identity', icon: <Lock className="w-3.5 h-3.5" /> },
            { step: 2, label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
            { step: 3, label: 'Biometrics', icon: <Activity className="w-3.5 h-3.5" /> },
            { step: 4, label: 'Verify', icon: <KeyRound className="w-3.5 h-3.5" /> },
          ].map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div 
                key={s.step} 
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF]' 
                    : isCompleted 
                      ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20' 
                      : 'text-[#64748B] opacity-50'
                }`}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold mb-1 border border-current">
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase font-mono">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error or Alert banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-3 text-red-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-[#E63946] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center gap-3 text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Stepper Card Substrate */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative">
        {/* STEP 1: IDENTITY & CREDENTIALS */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Lock className="w-4 h-4 text-[#00E5FF]" />
              <span>Step 1: Security & Terminal Credentials</span>
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                Username Identifier (5 - 10 Chars)
              </label>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleInputChange}
                placeholder="e.g. bio_smit24"
                className="glass-input font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                  Secure Passkey
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 6 characters, Uppercase & Digit"
                  className="glass-input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                  Confirm Passkey
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Re-enter passkey"
                  className="glass-input font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-white/10">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs text-[#94A3B8] hover:text-white transition"
              >
                Already registered? <span className="text-[#00E5FF] underline">Log in</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (handleStep1Validation()) setCurrentStep(2);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#38bdf8] text-[#080C1A] text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(0,229,255,0.3)] transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONAL & CONTACT PROFILE */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="w-4 h-4 text-[#00E5FF]" />
              <span>Step 2: Personal Profile & Clinical Communications</span>
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                name="user_full_name"
                value={formData.user_full_name}
                onChange={handleInputChange}
                placeholder="Dr. / Mr. / Ms. Full Name"
                className="glass-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Clinical Email Address</span>
                </label>
                <input
                  type="email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleInputChange}
                  placeholder="donor@domain.org"
                  className="glass-input font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Emergency Phone (10 Digits)</span>
                </label>
                <input
                  type="tel"
                  name="user_number"
                  value={formData.user_number}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className="glass-input font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="glass-input font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                  Gender Identification
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="glass-input text-sm"
                >
                  <option value="Male" className="bg-[#0B1124]">Male</option>
                  <option value="Female" className="bg-[#0B1124]">Female</option>
                  <option value="Other" className="bg-[#0B1124]">Other / Non-Binary</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-white/10">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono uppercase text-[#94A3B8]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (handleStep2Validation()) setCurrentStep(3);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#38bdf8] text-[#080C1A] text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(0,229,255,0.3)] transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BIOMETRIC BASELINE & LOCATION */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Activity className="w-4 h-4 text-[#E63946]" />
              <span>Step 3: Biometric Baseline & Coordinates</span>
            </h3>

            {/* Blood Group Selector */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Select Biometric Blood Classification
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {BLOOD_GROUPS.map((bg) => {
                  const isSelected = formData.blood_group === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setFormData({ ...formData, blood_group: bg })}
                      className={`p-2.5 rounded-xl border text-center font-mono font-bold text-sm transition-all ${
                        isSelected
                          ? 'bg-[#E63946] border-[#FF6B6B] text-white shadow-[0_0_15px_rgba(230,57,70,0.5)] scale-105'
                          : 'bg-[#0B1124] border-white/10 text-[#94A3B8] hover:border-white/30'
                      }`}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                Current Body Weight (kg) - UNESCO Minimum: 50 kg
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min={45}
                max={150}
                className="glass-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Residential Address</span>
              </label>
              <input
                type="text"
                name="Address"
                value={formData.Address}
                onChange={handleInputChange}
                placeholder="Street address, precinct"
                className="glass-input"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1">
                  Pincode (6 Digits)
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  maxLength={6}
                  className="glass-input font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-white/10">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono uppercase text-[#94A3B8]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#FF1E44] text-white text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(230,57,70,0.4)] transition"
              >
                {loading ? 'Transmitting Token...' : 'Transmit Bio-Token'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: BIOLUMINESCENT OTP VERIFICATION */}
        {currentStep === 4 && (
          <div className="space-y-6 text-center animate-fadeIn py-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 text-[#00E5FF] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.25)]">
              <KeyRound className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-sans">
                Enter 4-Digit Authentication Token
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 font-mono">
                Dispatched to <span className="text-[#00E5FF]">{formData.user_email}</span>
              </p>
              {simulatedOtpNotice && (
                <p className="text-[11px] text-amber-400 mt-2 font-mono bg-amber-950/30 p-2 rounded-lg border border-amber-500/20">
                  {simulatedOtpNotice}
                </p>
              )}
            </div>

            {/* 4-Digit Inputs */}
            <div className="flex justify-center gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-14 h-16 text-center text-2xl font-mono font-bold bg-[#0B1124] border-2 border-white/20 rounded-xl focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.4)] outline-none text-white transition-all"
                />
              ))}
            </div>

            <div className="pt-4 flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleFinalVerification}
                className="w-full sm:w-64 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#38bdf8] text-[#080C1A] text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(0,229,255,0.4)] transition"
              >
                {loading ? 'Authenticating...' : 'Validate Token & Enroll'}
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-xs text-[#64748B] hover:text-white font-mono"
              >
                Change registration details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
