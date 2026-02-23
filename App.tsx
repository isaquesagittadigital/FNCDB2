import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { rolePrefixes } from './lib/routes';

export type UserRole = 'client' | 'consultant' | 'admin';

/**
 * Inner component that has access to router hooks
 */
const AppInner: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashStep, setSplashStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Keep localStorage session in sync when Supabase refreshes tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        localStorage.setItem('session', JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }));
      }
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('session');
        localStorage.removeItem('profile');
      }
    });

    const restoreSession = async () => {
      try {
        const sessionStr = localStorage.getItem('session');
        const profileStr = localStorage.getItem('profile');

        if (sessionStr && profileStr) {
          const savedSession = JSON.parse(sessionStr);
          const profile = JSON.parse(profileStr);

          // Try to restore session - Supabase handles token refresh automatically
          if (savedSession) {
            const { error } = await supabase.auth.setSession({
              access_token: savedSession.access_token,
              refresh_token: savedSession.refresh_token,
            });

            if (error) {
              console.warn("Session expired, redirecting to login:", error.message);
              localStorage.removeItem('session');
              localStorage.removeItem('profile');
              await supabase.auth.signOut().catch(() => { });
              setShowSplash(false);
              setIsReady(true);
              navigate('/login', { replace: true });
              return;
            }

            // Session restored successfully — update localStorage with fresh tokens
            const { data: { session: freshSession } } = await supabase.auth.getSession();
            if (freshSession) {
              localStorage.setItem('session', JSON.stringify({
                access_token: freshSession.access_token,
                refresh_token: freshSession.refresh_token,
              }));

              // Refresh profile from DB to get newly added fields (e.g., percentual_contrato)
              const { data: dbProfile, error: dbError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', freshSession.user.id)
                .single();

              if (!dbError && dbProfile) {
                localStorage.setItem('profile', JSON.stringify(dbProfile));
                handleLoginSuccess(dbProfile.tipo_user, dbProfile, undefined, true);
                return;
              }
            }
          }

          if (profile && profile.tipo_user) {
            handleLoginSuccess(profile.tipo_user, profile, undefined, true);
            return;
          } else {
            localStorage.removeItem('session');
            localStorage.removeItem('profile');
            setShowSplash(false);
            setIsReady(true);
            navigate('/login', { replace: true });
            return;
          }
        }
      } catch (e) {
        console.error("Failed to restore session", e);
        localStorage.removeItem('session');
        localStorage.removeItem('profile');
      }

      // If no session, show Splash -> Login
      const t1 = setTimeout(() => setSplashStep(1), 1200);
      const t2 = setTimeout(() => {
        setShowSplash(false);
        setIsReady(true);
        navigate('/login', { replace: true });
      }, 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    };

    restoreSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (role: string, profile?: any, permissions?: any, isRestore = false) => {
    let mappedRole: UserRole = 'consultant';

    if (role === 'Admin') mappedRole = 'admin';
    else if (role === 'Cliente') mappedRole = 'client';
    else if (role === 'Consultor') mappedRole = 'consultant';

    setSelectedRole(mappedRole);
    if (profile) setUserProfile(profile);

    if (permissions) {
      localStorage.setItem('permissions', JSON.stringify(permissions));
    }

    if (!profile) {
      const savedProfile = localStorage.getItem('profile');
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    }

    setShowSplash(false);
    setIsReady(true);

    // Navigate to dashboard of the role
    const prefix = rolePrefixes[mappedRole];

    // If restoring session and already on a valid role path, keep the current path
    if (isRestore && (location.pathname.startsWith(`/${prefix}/`) || location.pathname === '/simulador')) {
      // Already on a valid path, don't navigate
    } else {
      navigate(`/${prefix}/dashboard`, { replace: true });
    }
  };

  const handleEnvironmentSelect = (role: UserRole) => {
    setSelectedRole(role);
    const prefix = rolePrefixes[role];
    navigate(`/${prefix}/dashboard`, { replace: true });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut().catch(() => { });
    localStorage.removeItem('session');
    localStorage.removeItem('profile');
    localStorage.removeItem('permissions');
    setSelectedRole(null);
    setUserProfile(null);
    navigate('/login', { replace: true });
  };

  const commonProps = {
    onLogout: handleLogout,
    userProfile: userProfile,
    onOpenSimulator: () => window.open('/simulador', '_blank')
  };

  return (
    <div className="min-h-screen relative bg-[#F8FAFB] overflow-hidden">
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <SplashScreen showText={splashStep === 1} />
          </motion.div>
        )}
      </AnimatePresence>

      {isReady && (
        <Routes>
          {/* Auth routes */}
          <Route
            path="/login"
            element={
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full min-h-screen"
              >
                <LoginForm
                  onForgotPassword={() => navigate('/esqueci-senha')}
                  onLoginSuccess={handleLoginSuccess}
                />
              </motion.div>
            }
          />

          <Route
            path="/esqueci-senha"
            element={
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full min-h-screen"
              >
                <ForgotPassword onBackToLogin={() => navigate('/login')} />
              </motion.div>
            }
          />

          <Route
            path="/selecionar-ambiente"
            element={
              <motion.div
                key="selection"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full min-h-screen"
              >
                <EnvironmentSelection onSelect={handleEnvironmentSelect} />
              </motion.div>
            }
          />

          {/* Simulator */}
          <Route
            path="/simulador"
            element={
              <motion.div
                key="simulator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-screen"
              >
                <SimulatorView
                  userProfile={userProfile}
                  onBack={() => {
                    if (selectedRole) {
                      navigate(`/${rolePrefixes[selectedRole]}/dashboard`);
                    } else {
                      navigate('/login');
                    }
                  }} />
              </motion.div>
            }
          />

          {/* Client Routes */}
          <Route
            path="/cliente/*"
            element={
              selectedRole === 'client' ? (
                <motion.div
                  key="client-flow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full min-h-screen"
                >
                  <ClientFlow {...commonProps} />
                </motion.div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Consultant Routes */}
          <Route
            path="/consultor/*"
            element={
              selectedRole === 'consultant' ? (
                <motion.div
                  key="consultant-flow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full min-h-screen"
                >
                  <ConsultantFlow {...commonProps} />
                </motion.div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              selectedRole === 'admin' ? (
                <motion.div
                  key="admin-flow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full min-h-screen"
                >
                  <AdminFlow {...commonProps} />
                </motion.div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Default: redirect to login or dashboard */}
          <Route
            path="*"
            element={
              selectedRole ? (
                <Navigate to={`/${rolePrefixes[selectedRole]}/dashboard`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PermissionsProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </PermissionsProvider>
  );
};

export default App;
