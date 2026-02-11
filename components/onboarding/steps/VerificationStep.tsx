
import React from 'react';
import { Check, Info, Maximize2 } from 'lucide-react';


interface VerificationStepProps {
    onFinish?: () => void;
}

const VerificationStep: React.FC<VerificationStepProps> = ({ onFinish }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in-95 duration-700">

            {/* Container Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 w-full max-w-2xl flex flex-col items-center text-center">

                <div className="w-20 h-20 bg-[#CCFBF1] rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <div className="w-10 h-10 border-[3px] border-[#14B8A6] rounded-full flex items-center justify-center">
                        <Check size={24} className="text-[#14B8A6] stroke-[3]" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-4">Verificação Concluída!</h2>

                <p className="text-slate-600 mb-8 max-w-lg leading-relaxed">
                    Seu processo KYC foi concluído com sucesso. Você já pode acessar a sua conta. <br />
                    Você receberá um e-mail de confirmação com os próximos passos.
                </p>

                <div className="w-full bg-[#ecfeff] border border-[#CFFAFE] rounded-lg p-4 mb-8 flex items-start gap-4 text-left">
                    {/* <Info size={20} className="text-[#06B6D4] shrink-0 mt-0.5" /> */}
                    <p className="text-sm text-[#155E75] font-medium">
                        Seus dados foram verificados e aprovados. Você já pode acessar a sua conta.
                    </p>
                </div>

                {/* Document Preview Snippet */}
                <div className="w-full border border-slate-200 rounded-lg p-2 mb-8 bg-slate-50 relative group cursor-pointer overflow-hidden h-[180px]">
                    <div className="bg-white shadow-sm border border-slate-100 rounded p-4 h-full flex flex-col items-start gap-2 opacity-60 blur-[0.5px] select-none pointer-events-none">
                        <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                        <div className="h-2 w-1/2 bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-full bg-slate-200 rounded"></div>
                        <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                        <div className="h-2 w-4/6 bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-1/3 bg-slate-200 rounded mt-auto"></div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-sm transition-colors z-10">
                        <Maximize2 size={16} className="text-slate-400" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <button className="w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
                        Ver meus dados
                    </button>

                    <button
                        onClick={onFinish}
                        className="w-full px-6 py-3 bg-[#0EA5E9] text-white font-bold rounded-lg hover:bg-[#0284C7] transition-colors shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                    >
                        <Check size={20} className="stroke-[3]" />
                        Acessar plataforma
                    </button>
                </div>

                <p className="mt-8 text-xs text-slate-400">
                    Você receberá um e-mail de confirmação em instantes com os próximos passos.
                </p>

            </div>
        </div>
    );
};


export default VerificationStep;
