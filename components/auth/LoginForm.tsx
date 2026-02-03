
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { LogoIcon, LogoWatermark } from '../shared/ui/Logo';
import { supabase } from '../../lib/supabase';

interface LoginFormProps {
  onForgotPassword: () => void;
  onLoginSuccess: (role: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response:", responseText);
        throw new Error(`Erro no servidor: Resposta inválida (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar login');
      }

      console.log('Login successful:', data);
      localStorage.setItem('session', JSON.stringify(data.session));
      localStorage.setItem('profile', JSON.stringify(data.profile)); // Save profile for persistence

      // Establish Supabase session for client-side usage (ProfileView, etc)
      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession(data.session);
        if (sessionError) console.error("Failed to set Supabase session:", sessionError);
      }

      // Pass the role to the callback
      onLoginSuccess(data.profile.tipo_user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-white overflow-hidden">
      {/* Background Watermark - More visible and positioned as per reference */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -left-[15%] top-1/2 -translate-y-1/2 w-[70%] lg:w-[50%] opacity-[0.08]">
          <LogoWatermark className="w-full h-auto" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 py-12">
        {/* Header Logo - Using LogoEscura via dark prop */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-8"
        >
          <LogoIcon className="w-16 h-16" dark={true} />
        </motion.div>

        {/* Text Content */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-[#002B49] mb-3 tracking-tight"
          >
            Acessar a sua conta
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#64748B] max-w-sm mx-auto leading-relaxed font-medium"
          >
            Bem-vindo(a) novamente. Informe os seus dados abaixo para acessar a plataforma
          </motion.p>
        </div>



        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center w-full max-w-md"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#002B49] ml-1 uppercase tracking-widest opacity-70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-[#002B49] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#002B49] ml-1 uppercase tracking-widest opacity-70">Senha</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-[#002B49] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 p-1 text-slate-400 hover:text-[#00A3B1] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:bg-[#00A3B1] checked:border-[#00A3B1] transition-all"
                />
                <svg className="absolute h-3.5 w-3.5 pointer-events-none hidden peer-checked:block text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-sm font-medium text-slate-500 group-hover:text-[#002B49] transition-colors">Lembrar por 30 dias</span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-bold text-[#00A3B1] hover:text-[#008c99] transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#00A3B1]/20 active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Carregando...' : 'Entrar na conta'}
          </button>
        </motion.form>



        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 text-[13px] text-slate-400 font-medium"
        >
          &copy; {new Date().getFullYear()} FNCD Capital. Todos os direitos reservados.
        </motion.p>
      </div >
    </div >
  );
};

export default LoginForm;
