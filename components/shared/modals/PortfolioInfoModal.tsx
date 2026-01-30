
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, HelpCircle } from 'lucide-react';

interface PortfolioInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatusLabel = ({ text, color }: { text: string, color: string }) => (
  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap border ${color}`}>
    {text}
  </span>
);

const PortfolioInfoModal: React.FC<PortfolioInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#002B49]/30 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl p-8 overflow-hidden"
        >
          <div className="flex justify-between items-start mb-8">
            <div className="w-14 h-14 bg-[#B2E7EC]/40 rounded-2xl flex items-center justify-center">
              <Wallet className="text-[#00A3B1]" size={28} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-300 hover:text-red-500"
            >
              <X size={24} />
            </button>
          </div>

          <h2 className="text-xl font-bold text-[#002B49] mb-8">Descrições das carteiras</h2>

          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-6 bg-[#F8FAFB] border-b border-slate-100 text-[10px] font-bold text-[#64748B] uppercase tracking-wider p-4">
              <div className="col-span-2 flex items-center gap-1">Carteira <HelpCircle size={14} className="text-slate-300" /></div>
              <div className="col-span-2">Descrição</div>
              <div className="col-span-2">Status validados</div>
            </div>

            <div className="grid grid-cols-6 p-6 items-start gap-6 group hover:bg-slate-50 transition-colors">
              <div className="col-span-2 space-y-2">
                <h4 className="text-sm font-bold text-[#002B49]">CP - Carteira pessoal</h4>
              </div>
              
              <div className="col-span-2 text-xs text-slate-500 font-medium leading-relaxed space-y-4">
                <p>O valor desta carteira corresponde apenas ao somatório dos contratos emitidos pelo próprio consultor.</p>
                <p className="text-[#00A3B1] font-bold">
                  *Computa para o bônus anual, considerando os critérios estabelecidos para os consultores.
                </p>
                <p className="italic text-[10px] text-slate-400">
                  Observações: cálculo realizado sempre do dia 25 ao 24 do próximo mês.
                </p>
              </div>

              <div className="col-span-2 flex flex-wrap gap-2">
                <StatusLabel text="Antecipação solicitada" color="bg-[#E6F6F7] text-[#00A3B1] border-[#00A3B1]/10" />
                <StatusLabel text="Em renovação" color="bg-[#EBF5FF] text-[#0070F3] border-[#0070F3]/10" />
                <StatusLabel text="Vigente" color="bg-[#FFF0F6] text-[#D0021B] border-[#D0021B]/10" />
                <StatusLabel text="Vigente ronovado" color="bg-[#FFF0F6] text-[#D0021B] border-[#D0021B]/10" />
                <StatusLabel text="Vigente unificado" color="bg-[#FFF0F6] text-[#D0021B] border-[#D0021B]/10" />
                <StatusLabel text="Vigente resgate" color="bg-[#FFF0F6] text-[#D0021B] border-[#D0021B]/10" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PortfolioInfoModal;
