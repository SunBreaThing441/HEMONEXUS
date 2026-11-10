import React, { useState } from 'react';
import { 
  Activity, 
  Heart, 
  Calendar, 
  AlertCircle, 
  Menu, 
  X, 
  ShieldCheck, 
  UserPlus, 
  LogOut,
  User,
  Building2,
  Globe
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  authenticatedDonor: any | null;
  authenticatedEvent: any | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  authenticatedDonor,
  authenticatedEvent,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Global Radar', icon: <Globe className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency Grid', icon: <AlertCircle className="w-4 h-4 text-[#E63946]" /> },
    { id: 'tips', label: 'Bioethics & Safety', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'contribute', label: 'Solidarity Fund', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & UNESCO Insignia */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentView('home')}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E63946] to-[#0A0F24] p-[1.5px] shadow-[0_0_15px_rgba(230,57,70,0.4)]">
              <div className="w-full h-full bg-[#080C1A] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#E63946] transition-transform group-hover:scale-110" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00E5FF] pulse-cyan" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">
                HEMO<span className="text-[#E63946]">NEXUS</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-400/30 text-blue-300">
                UNESCO GRID
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#64748B] tracking-tight">
              GLOBAL BIO-SOLIDARITY NODE #492
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Portals */}
        <div className="hidden lg:flex items-center gap-2.5">
          {authenticatedDonor ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('donor-dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono font-semibold"
              >
                <User className="w-3.5 h-3.5" />
                <span>{authenticatedDonor.userFullName || 'Donor Terminal'}</span>
              </button>
              <button
                onClick={onLogout}
                title="Disconnect Session"
                className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : authenticatedEvent ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('organizer-dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-semibold"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{authenticatedEvent.userFullName || 'Camp Command'}</span>
              </button>
              <button
                onClick={onLogout}
                title="Disconnect Session"
                className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('donor-register')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E63946] hover:bg-[#FF1E44] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(230,57,70,0.4)] transition-all transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Become Donor</span>
              </button>

              <button
                onClick={() => setCurrentView('donor-login')}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#F8FAFC] transition"
              >
                Donor Login
              </button>

              <button
                onClick={() => setCurrentView('organizer-login')}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#94A3B8] hover:text-white transition"
              >
                Camp Login
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#94A3B8] hover:bg-white/5 hover:text-white"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setCurrentView('donor-register');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-[#E63946] text-white rounded-lg text-xs font-bold uppercase text-center"
            >
              Become Donor
            </button>
            <button
              onClick={() => {
                setCurrentView('donor-login');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-white/10 text-white rounded-lg text-xs font-bold uppercase text-center"
            >
              Donor Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
