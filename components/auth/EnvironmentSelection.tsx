
import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react';
import { LogoFull } from '../shared/ui/Logo';

interface EnvironmentSelectionProps {
  onSelect: (type: 'client' | 'consultant' | 'admin') => void;
}

const EnvironmentCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  delay: number;
}> = ({ title, description, icon: Icon, onClick, delay }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    onClick={onClick}
    className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-left w-full max-w-sm flex flex-col items-start gap-6 border-transparent hover:border-[#00A3B1]/30 overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6F6F7] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 opacity-50"></div>

    <div className="w-16 h-16 bg-[#00A3B1] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#00A3B1]/20 group-hover:scale-110 transition-transform duration-300 relative z-10">
      <Icon size={32} />
    </div>

    <div className="space-y-3 relative z-10">
      <h3 className="text-xl font-bold text-[#002B49] group-hover:text-[#00A3B1] transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-400 font-medium leading-relaxed">
        {description}
      </p>
    </div>

    <div className="mt-4 flex items-center gap-2 text-[#00A3B1] font-bold text-sm relative z-10">
      Acessar ambiente
      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.button>
);

const EnvironmentSelection: React.FC<EnvironmentSelectionProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00A3B1]/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#002B49]/5 rounded-full blur-[100px]"></div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <LogoFull dark={true} />
      </motion.div>

      <div className="text-center mb-16 space-y-4 relative z-10">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-[#002B49] tracking-tight"
        >
          Olá, <span className="text-[#00A3B1]">Carla Gandolfo</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-slate-400 font-medium"
        >
          Selecione qual ambiente você deseja acessar hoje
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
        <EnvironmentCard
          title="Cliente"
          description="Acesse seus investimentos, visualize rendimentos e acompanhe seus contratos ativos."
          icon={UserCircle}
          delay={0.4}
          onClick={() => onSelect('client')}
        />
        <EnvironmentCard
          title="Consultor"
          description="Gerencie sua carteira de clientes, acompanhe novas propostas e visualize suas comissões."
          icon={Briefcase}
          delay={0.5}
          onClick={() => onSelect('consultant')}
        />
        <EnvironmentCard
          title="Administrador"
          description="Gestão completa da plataforma, monitoramento de performance e controle de acessos."
          icon={ShieldCheck}
          delay={0.6}
          onClick={() => onSelect('admin')}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 text-slate-400 text-sm font-medium"
      >
        Precisa de ajuda? <button className="text-[#00A3B1] font-bold hover:underline">Fale com o suporte</button>
      </motion.div>
    </div>
  );
};

export default EnvironmentSelection;
