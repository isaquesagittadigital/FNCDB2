import React from 'react';
import { LayoutGrid, ArrowUpRight, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const Simulator = ({ onOpen }: { onOpen?: () => void }) => {
    return (
        <div className="flex items-center justify-center p-6 h-[calc(100vh-140px)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-12 max-w-2xl w-full text-center shadow-lg shadow-slate-200/50 border border-slate-100"
            >
                <div className="flex justify-center mb-6">
                    <div className="text-[#009BB6]">
                        <Calculator size={48} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-slate-800 mb-8">
                    Simulador de Dividendos
                </h2>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 mb-10 text-left">
                    <p className="font-semibold text-slate-700 mb-1">Importante</p>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Acesse o simulador de dividendos e realize simulações precisas e rápidas, facilitando a criação de contratos.
                    </p>
                </div>

                <button
                    onClick={onOpen}
                    className="bg-[#009BB6] hover:bg-[#008f9e] text-white font-bold py-4 px-8 rounded-xl inline-flex items-center gap-2 transition-all shadow-md hover:shadow-xl hover:shadow-[#009BB6]/20 active:scale-95"
                >
                    <div className="bg-white/20 p-1 rounded">
                        <ArrowUpRight size={18} />
                    </div>
                    Abrir Simulador
                </button>
            </motion.div>
        </div>
    );
};

export default Simulator;
