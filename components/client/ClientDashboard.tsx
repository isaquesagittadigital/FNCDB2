
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Clock,
  Sparkles
} from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const [showValues, setShowValues] = useState(false);

  const contracts = [
    { id: 1, aporte: '16/12/2025', conclusao: '16/12/2026', valor: 'R$ 1.236.456,00' },
    { id: 2, aporte: '16/12/2025', conclusao: '16/12/2026', valor: 'R$ 1.236.456,00' },
    { id: 3, aporte: '16/12/2025', conclusao: '16/12/2026', valor: 'R$ 1.236.456,00' },
    { id: 4, aporte: '08/12/2025', conclusao: '08/12/2026', valor: 'R$ 1.236.456,00' },
    { id: 5, aporte: '16/12/2025', conclusao: '16/12/2026', valor: 'R$ 1.236.456,00' },
    { id: 6, aporte: '05/01/2026', conclusao: '05/07/2026', valor: 'R$ 1.236.456,00' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-[#002B49]">
            Bem-vindo(a) de volta, <span className="font-bold text-[#00A3B1]">Samuel Alves de Souza</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Visualize seus contatos com elegância e simplicidade.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-slate-300 hover:text-slate-500 transition-colors">
            <HelpCircle size={20} />
          </button>
          <button 
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#002B49] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            {showValues ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-[#00A3B1]" />}
            {showValues ? 'Esconder' : 'Mostrar'}
          </button>
        </div>
      </div>

      {/* Patrimônio Teal Card */}
      <div className="bg-[#00A3B1] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-[#00A3B1]/10">
         <div className="relative z-10 space-y-6">
           <p className="text-white/90 font-bold text-xs uppercase tracking-wider">Resumo das participações</p>
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
               <Clock size={22} />
             </div>
             <div>
               <p className="text-sm font-bold">Patrimônio total</p>
               <p className="text-[10px] text-white/60 font-medium">Valor consolidado</p>
             </div>
           </div>
           <div className={`text-4xl font-black tracking-tight transition-all duration-300 ${!showValues ? 'blur-md opacity-80 select-none' : 'blur-0 opacity-100'}`}>
              R$ 1.236.456,00
           </div>
         </div>
         {/* Wave Graphic Decoration */}
         <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
            <svg width="400" height="200" viewBox="0 0 400 200" fill="none">
               <path d="M0 100 Q 100 50 200 100 T 400 100 V 200 H 0 Z" fill="white" />
            </svg>
         </div>
      </div>

      {/* Contracts Grid Section */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#002B49]">Seus Contratos</h2>
          <p className="text-slate-400 text-sm font-medium">Acompanhe todos os seus contratos listados abaixo.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contracts.map((contract) => (
            <motion.div 
              key={contract.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group transition-all"
            >
              {/* Card Header with Wave/Sparkle */}
              <div className="h-28 bg-gradient-to-br from-[#B2E7EC] to-[#00A3B1] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <path d="M0 50 Q 50 20 100 50 T 200 50 V 100 H 0 Z" fill="white" />
                  </svg>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#00A3B1] shadow-lg relative z-10">
                   <Sparkles size={20} fill="currentColor" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 text-center space-y-4">
                <p className="text-sm font-bold text-[#002B49]">Contrato</p>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 font-medium">Aporte: <span className="text-slate-600 font-bold">{contract.aporte}</span></p>
                  <p className="text-[11px] text-slate-400 font-medium">Conclusão: <span className="text-slate-600 font-bold">{contract.conclusao}</span></p>
                </div>
                <div className={`text-lg font-black text-[#00A3B1] tracking-tight transition-all duration-300 ${!showValues ? 'blur-sm opacity-50 select-none' : 'blur-0 opacity-100'}`}>
                  {contract.valor}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
