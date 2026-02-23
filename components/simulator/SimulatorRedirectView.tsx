import React from 'react';
import { LayoutGrid, ExternalLink } from 'lucide-react';

const SimulatorRedirectView: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-3xl w-full flex flex-col items-center text-center">

                {/* Icon */}
                <div className="mb-4">
                    <LayoutGrid size={40} className="text-[#00A3B1]" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-[#333333] mb-6">
                    Simulador de Dividendos
                </h2>

                {/* Info Box */}
                <div className="bg-[#F8FAFB] border border-slate-100 rounded-xl p-5 mb-8 w-full text-left">
                    <p className="text-sm font-semibold text-[#666666] mb-1">
                        Importante
                    </p>
                    <p className="text-sm text-slate-500">
                        Acesse o simulador de dividendos e realize simulações precisas e rápidas, facilitando a criação de contratos.
                    </p>
                </div>

                {/* Button */}
                <button
                    onClick={() => window.open('/simulador', '_blank')}
                    className="flex items-center justify-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md w-full sm:w-auto min-w-[280px]"
                >
                    <ExternalLink size={18} strokeWidth={2.5} />
                    Abrir Simulador
                </button>
            </div>
        </div>
    );
};

export default SimulatorRedirectView;
