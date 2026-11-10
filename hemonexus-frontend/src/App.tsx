import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeOverview } from './components/public/HomeOverview';
import { EmergencyBloodWizard } from './components/public/EmergencyBloodWizard';
import { BloodTips } from './components/public/BloodTips';
import { ContributeView } from './components/public/ContributeView';
import { DonorRegistrationStepper } from './components/donor/DonorRegistrationStepper';
import { DonorDashboard } from './components/donor/DonorDashboard';
import { EventCommandCenter } from './components/organizer/EventCommandCenter';
import { DonorLoginModal } from './components/donor/DonorLoginModal';
import { EventLoginModal } from './components/organizer/EventLoginModal';
import type { DonorProfile, EventProfile, SessionState, SecurityNotice } from './types';
import { HemoNexusApi } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [session, setSession] = useState<SessionState>({
    checking: true,
    authenticated: false,
    role: null,
    sessionId: null,
    user: null,
  });

  const [securityNotice, setSecurityNotice] = useState<SecurityNotice | null>(null);
  const [showDonorLoginModal, setShowDonorLoginModal] = useState(false);
  const [showEventLoginModal, setShowEventLoginModal] = useState(false);

  // Synchronize session state from backend
  const refreshSession = async (): Promise<SessionState> => {
    const auth = await HemoNexusApi.verifySession();
    const newState: SessionState = {
      checking: false,
      authenticated: auth.authenticated,
      role: auth.role,
      sessionId: auth.sessionId,
      user: auth.user,
    };
    setSession(newState);
    return newState;
  };

  useEffect(() => {
    refreshSession().then((auth) => {
      if (auth.authenticated) {
        if (auth.role === 'donor') setCurrentView('donor-dashboard');
        else if (auth.role === 'organizer') setCurrentView('organizer-dashboard');
      }
    });

    // Background session heartbeat watchdog every 45s
    const timer = setInterval(async () => {
      const auth = await HemoNexusApi.verifySession();
      setSession((prev) => {
        if (prev.authenticated && !auth.authenticated) {
          setSecurityNotice({
            type: 'warning',
            title: 'Session Expired',
            message: 'Your authenticated session has expired on the server. Please sign in again.',
            intendedRoute: 'home',
          });
          setCurrentView('home');
        }
        return {
          checking: false,
          authenticated: auth.authenticated,
          role: auth.role,
          sessionId: auth.sessionId,
          user: auth.user,
        };
      });
    }, 45000);

    return () => clearInterval(timer);
  }, []);

  // Strict Client-Side Route Guard
  const navigateWithGuard = (targetView: string, currentSession: SessionState = session): boolean => {
    setSecurityNotice(null);

    const donorProtected = ['donor-dashboard', 'donor-history', 'donor-health', 'donor-requests'];
    const organizerProtected = ['organizer-dashboard', 'camp-kiosk', 'camp-roster'];
    const guestOnly = ['donor-login', 'organizer-login', 'donor-register'];

    // 1. Guard Donor Protected Routes
    if (donorProtected.includes(targetView)) {
      if (!currentSession.authenticated) {
        setSecurityNotice({
          type: 'warning',
          title: 'Authentication Required',
          message: 'An active verified Donor session is required to access the Donor Terminal.',
          intendedRoute: targetView,
        });
        setShowDonorLoginModal(true);
        return false;
      }
      if (currentSession.role !== 'donor') {
        setSecurityNotice({
          type: 'violation',
          title: 'Workspace Isolation Violation',
          message: 'Security Policy: Event Organizers are prevented from entering the Donor Terminal workspace.',
          intendedRoute: null,
        });
        setCurrentView('organizer-dashboard');
        return false;
      }
    }

    // 2. Guard Organizer Protected Routes
    if (organizerProtected.includes(targetView)) {
      if (!currentSession.authenticated) {
        setSecurityNotice({
          type: 'warning',
          title: 'Authentication Required',
          message: 'Certified Event Organizer credentials are required to access Camp Command.',
          intendedRoute: targetView,
        });
        setShowEventLoginModal(true);
        return false;
      }
      if (currentSession.role !== 'organizer') {
        setSecurityNotice({
          type: 'violation',
          title: 'Workspace Isolation Violation',
          message: 'Security Policy: Registered Donors are prevented from entering the Event Organizer Command Center.',
          intendedRoute: null,
        });
        setCurrentView('donor-dashboard');
        return false;
      }
    }

    // 3. Guard Guest-Only Routes
    if (guestOnly.includes(targetView) && currentSession.authenticated) {
      if (currentSession.role === 'donor') {
        setCurrentView('donor-dashboard');
        return false;
      }
      if (currentSession.role === 'organizer') {
        setCurrentView('organizer-dashboard');
        return false;
      }
    }

    setCurrentView(targetView);
    return true;
  };

  const handleLogout = async () => {
    if (session.role === 'organizer') {
      await HemoNexusApi.logoutEvent();
    } else {
      await HemoNexusApi.logoutDonor();
    }
    await refreshSession();
    setSecurityNotice({
      type: 'success',
      title: 'Session Securely Terminated',
      message: 'Server session flushed and client state purged.',
      intendedRoute: null,
    });
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C1A] text-[#F8FAFC]">
      {/* Top Universal Navigation */}
      <Header
        currentView={currentView}
        setCurrentView={navigateWithGuard}
        authenticatedDonor={session.role === 'donor' ? (session.user as DonorProfile) : null}
        authenticatedEvent={session.role === 'organizer' ? (session.user as EventProfile) : null}
        onLogout={handleLogout}
      />

      {/* Security Intercept / Audit Notice */}
      {securityNotice && (
        <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-4">
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 font-mono text-xs ${
              securityNotice.type === 'violation'
                ? 'bg-red-950/60 border-red-500/60 text-red-200'
                : securityNotice.type === 'warning'
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
            }`}
          >
            <div>
              <span className="font-bold text-sm block mb-0.5">{securityNotice.title}</span>
              <span>{securityNotice.message}</span>
            </div>
            <button
              onClick={() => setSecurityNotice(null)}
              className="text-white/60 hover:text-white px-2 py-0.5 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeOverview
            onRegisterDonor={() => navigateWithGuard('donor-register')}
            onRequestBlood={() => navigateWithGuard('emergency')}
            onExploreCamps={() => navigateWithGuard('home')}
          />
        )}

        {currentView === 'emergency' && (
          <EmergencyBloodWizard
            onSuccess={() => {
              if (session.authenticated && session.role === 'donor') {
                navigateWithGuard('donor-dashboard');
              } else {
                navigateWithGuard('home');
              }
            }}
          />
        )}

        {currentView === 'donor-register' && (
          <DonorRegistrationStepper
            onRegistrationComplete={async () => {
              const updated = await refreshSession();
              navigateWithGuard('donor-dashboard', updated);
            }}
            onSwitchToLogin={() => setShowDonorLoginModal(true)}
          />
        )}

        {currentView === 'donor-dashboard' && session.authenticated && session.role === 'donor' && (
          <DonorDashboard
            donor={session.user as DonorProfile}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'organizer-dashboard' && session.authenticated && session.role === 'organizer' && (
          <EventCommandCenter
            event={session.user as EventProfile}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'tips' && <BloodTips />}
        {currentView === 'contribute' && <ContributeView />}
      </main>

      {/* Global Clinical Footer */}
      <Footer />

      {/* Login Modals with Intended Route Redirection */}
      {showDonorLoginModal && (
        <DonorLoginModal
          onSuccess={async (profile) => {
            const updated = await refreshSession();
            setShowDonorLoginModal(false);
            const target = securityNotice?.intendedRoute || 'donor-dashboard';
            navigateWithGuard(target, updated);
          }}
          onClose={() => setShowDonorLoginModal(false)}
          onSwitchToRegister={() => {
            setShowDonorLoginModal(false);
            navigateWithGuard('donor-register');
          }}
        />
      )}

      {showEventLoginModal && (
        <EventLoginModal
          onSuccess={async (profile) => {
            const updated = await refreshSession();
            setShowEventLoginModal(false);
            const target = securityNotice?.intendedRoute || 'organizer-dashboard';
            navigateWithGuard(target, updated);
          }}
          onClose={() => setShowEventLoginModal(false)}
        />
      )}
    </div>
  );
};

export default App;
