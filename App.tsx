import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/shared/ui/SplashScreen';
import LoginForm from './components/auth/LoginForm';
import ForgotPassword from './components/auth/ForgotPassword';
import EnvironmentSelection from './components/auth/EnvironmentSelection';
import ClientFlow from './components/client/ClientFlow';
import ConsultantFlow from './components/consultant/ConsultantFlow';
import AdminFlow from './components/admin/AdminFlow';
import SimulatorView from './components/simulator/SimulatorView';
import { supabase } from './lib/supabase';
import { PermissionsProvider } from './components/shared/contexts/PermissionsContext';

export enum AppView {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  ENVIRONMENT_SELECTION = 'ENVIRONMENT_SELECTION',
  DASHBOARD = 'DASHBOARD',
  SIMULATOR = 'SIMULATOR'
}

export type UserRole = 'client' | 'consultant' | 'admin';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SPLASH);
  const [splashStep, setSplashStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>('consultant');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const restoreSession = () => {
      // Check if URL has special view (for new tab support)
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'simulator') {
        setView(AppView.SIMULATOR);
        return;
      }

      try {
        const sessionStr = localStorage.getItem('session');
        const profileStr = localStorage.getItem('profile');

        if (sessionStr && profileStr) {
          const session = JSON.parse(sessionStr);
          const profile = JSON.parse(profileStr);

          // Restore Supabase session
          if (session) {
            supabase.auth.setSession(session).then(({ error }) => {
              if (error) console.error("Error restoring Supabase session:", error);
            });
          }

          if (profile && profile.tipo_user) {
            handleLoginSuccess(profile.tipo_user, profile);
            return; // Skip splash animation logic if session exists
          }
        }
      } catch (e) {
        console.error("Failed to restore session", e);
        localStorage.removeItem('session');
        localStorage.removeItem('profile');
      }

      // If no session, proceed with Splash -> Login
      const t1 = setTimeout(() => setSplashStep(1), 1200);
      const t2 = setTimeout(() => setView(AppView.LOGIN), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    };

    restoreSession();
  }, []);

  const handleLoginSuccess = (role: string, profile?: any, permissions?: any) => {
    let mappedRole: UserRole = 'consultant'; // default

    if (role === 'Admin') mappedRole = 'admin';
    else if (role === 'Cliente') mappedRole = 'client';
    else if (role === 'Consultor') mappedRole = 'consultant';

    setSelectedRole(mappedRole);
    if (profile) setUserProfile(profile);

    // permissions are handled via localStorage in the Provider, 
    // but we can also trigger a state update if we had direct access to setPermissions here.
    // For now, reload or just ensure Provider picks it up.
    if (permissions) {
      localStorage.setItem('permissions', JSON.stringify(permissions));
    }

    if (!profile) {
      // Fallback or fetch if needed, but Login form usually saves it
      const savedProfile = localStorage.getItem('profile');
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    }
    setView(AppView.DASHBOARD);
  };

  const handleEnvironmentSelect = (role: UserRole) => {
    setSelectedRole(role);
    setView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('session');
    localStorage.removeItem('profile');
    setView(AppView.LOGIN);
    setUserProfile(null);
  };

  const renderDashboard = () => {
    const commonProps = {
      onLogout: handleLogout,
      userProfile: userProfile,
      onOpenSimulator: () => window.open('?view=simulator', '_blank')
    };

    switch (selectedRole) {
      case 'client':
        return <ClientFlow {...commonProps} />;
      case 'consultant':
        return <ConsultantFlow {...commonProps} />;
      case 'admin':
        return <AdminFlow {...commonProps} />;
      default:
        return <ConsultantFlow {...commonProps} />;
    }
  };

  return (
    <PermissionsProvider>
      <div className="min-h-screen relative bg-[#F8FAFB] overflow-hidden">
        <AnimatePresence mode="wait">
          {view === AppView.SPLASH && (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <SplashScreen showText={splashStep === 1} />
            </motion.div>
          )}

          {view === AppView.LOGIN && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full min-h-screen"
            >
              <LoginForm
                onForgotPassword={() => setView(AppView.FORGOT_PASSWORD)}
                onLoginSuccess={handleLoginSuccess}
              />
            </motion.div>
          )}

          {view === AppView.FORGOT_PASSWORD && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full min-h-screen"
            >
              <ForgotPassword onBackToLogin={() => setView(AppView.LOGIN)} />
            </motion.div>
          )}

          {view === AppView.ENVIRONMENT_SELECTION && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full min-h-screen"
            >
              <EnvironmentSelection onSelect={handleEnvironmentSelect} />
            </motion.div>
          )}

          {view === AppView.SIMULATOR && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full min-h-screen"
            >
              <SimulatorView onBack={() => setView(AppView.DASHBOARD)} />
            </motion.div>
          )}

          {view === AppView.DASHBOARD && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full min-h-screen"
            >
              {renderDashboard()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PermissionsProvider>
  );
};

export default App;
