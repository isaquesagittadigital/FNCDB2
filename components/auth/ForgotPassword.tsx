
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Check, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { LogoIcon, LogoWatermark } from '../shared/ui/Logo';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

enum RecoveryStep {
  REQUEST_EMAIL,
  EMAIL_SENT,
  RESET_PASSWORD,
  SUCCESS
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<RecoveryStep>(RecoveryStep.REQUEST_EMAIL);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(RecoveryStep.EMAIL_SENT);
    // Simulate receiving the link and navigating to reset after a small delay if needed,
    // but here we let the user proceed manually for demo purposes
    setTimeout(() => setStep(RecoveryStep.RESET_PASSWORD), 3000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(RecoveryStep.SUCCESS);
  };

  const validation = {
    length: password.length >= 8,
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  return (
    <div className="relative flex min-h-screen bg-white">
      {/* Background Watermark */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -left-[15%] top-1/2 -translate-y-1/2 w-[70%] lg:w-[50%] opacity-[0.08]">
          <LogoWatermark className="w-full h-auto" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 py-12">
        {/* Header Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-8"
        >
          <LogoIcon className="w-16 h-16" dark={true} />
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Request Email */}
          {step === RecoveryStep.REQUEST_EMAIL && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-[#D1F7F9] rounded-full flex items-center justify-center mb-8">
                <Key className="text-[#00A3B1] w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Recuperação de senha</h1>
              <p className="text-[#666666] mb-8">Insira o seu email para enviarmos o link de recuperação de senha.</p>

              <form onSubmit={handleSendLink} className="w-full space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-semibold text-[#333333]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Informe o seu email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold py-4 rounded-lg transition-all shadow-md active:scale-[0.98]"
                >
                  Enviar link
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Email Sent */}
          {step === RecoveryStep.EMAIL_SENT && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-[#D1F7F9] rounded-full flex items-center justify-center mb-8">
                <Key className="text-[#00A3B1] w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Recuperação de senha</h1>
              <p className="text-[#666666] mb-8 leading-relaxed">
                Enviamos um link para o seu email. Verifique a sua caixa de spam.
              </p>

              <button
                type="button"
                className="w-full bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold py-4 rounded-lg transition-all shadow-md active:scale-[0.98] mb-6"
              >
                Enviar link
              </button>

              <p className="text-sm text-[#666666] mb-4">
                Não recebeu o link? <button className="text-[#00A3B1] font-bold hover:underline">Reenviar link</button>
              </p>
            </motion.div>
          )}

          {/* Step 3: Reset Password */}
          {step === RecoveryStep.RESET_PASSWORD && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-[#D1F7F9] rounded-full flex items-center justify-center mb-8">
                <Key className="text-[#00A3B1] w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Recuperação de senha</h1>
              <p className="text-[#666666] mb-8 leading-relaxed">
                Insira o seu email para enviarmos o link de recuperação de senha.
              </p>

              <form onSubmit={handleResetPassword} className="w-full space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#333333]">Nova senha</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] transition-all"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 p-1 text-gray-400">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#333333]">Confirme a sua senha</label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] transition-all"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 p-1 text-gray-400">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${validation.length ? 'bg-[#D1F7F9] border-transparent' : 'bg-gray-100 border-gray-200'}`}>
                      <Check className={`w-3 h-3 ${validation.length ? 'text-[#00A3B1]' : 'text-gray-300'}`} />
                    </div>
                    <span className="text-sm text-[#666666]">Deve conter pelo menos 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${validation.special ? 'bg-[#D1F7F9] border-transparent' : 'bg-gray-100 border-gray-200'}`}>
                      <Check className={`w-3 h-3 ${validation.special ? 'text-[#00A3B1]' : 'text-gray-300'}`} />
                    </div>
                    <span className="text-sm text-[#666666]">Deve conter pelo menos 1 caractere especial</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold py-4 rounded-lg transition-all shadow-md active:scale-[0.98]"
                >
                  Alterar senha
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === RecoveryStep.SUCCESS && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-[#D1F7F9] rounded-full flex items-center justify-center mb-8">
                <div className="w-10 h-10 rounded-full border-2 border-[#00A3B1] flex items-center justify-center">
                  <Check className="text-[#00A3B1] w-6 h-6" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Senha redefinida</h1>
              <p className="text-[#666666] mb-8 leading-relaxed">A sua senha foi redefinida com sucesso.</p>

              <button
                onClick={onBackToLogin}
                className="w-full bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold py-4 rounded-lg transition-all shadow-md active:scale-[0.98]"
              >
                Entrar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Universal Back Button */}
        {step !== RecoveryStep.SUCCESS && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onBackToLogin}
            className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#666666] hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para o login
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
