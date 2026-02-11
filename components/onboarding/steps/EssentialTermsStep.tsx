
import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface EssentialTermsStepProps {
    onNext: () => void;
    onBack: () => void;
    data: any;
    onUpdate: (data: any) => void;
}

const EssentialTermsStep: React.FC<EssentialTermsStepProps> = ({ onNext, onBack }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Termos essenciais da Série</h2>
            </div>

            {/* Conta bancária dedicada Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Conta bancária dedicada</h3>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Banco</p>
                            <p className="text-slate-800 font-medium">422 - Banco Safra S.A.</p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Agência</p>
                            <p className="text-slate-800 font-medium">0034</p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Conta</p>
                            <p className="text-slate-800 font-medium">47.993-1</p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Titular</p>
                            <p className="text-slate-800 font-medium">FNCD CAPITAL LTDA</p>
                        </div>

                        <div className="col-span-2">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">E-mail</p>
                            <p className="text-slate-800 font-medium">joao.silva@email.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Condições de Investimento Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Condições de Investimento</h3>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-2">Distribuições de rendimentos</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Distribuições mensais realizadas até o dia 10 de cada mês, quando houver rendimentos disponíveis. O pagamento será feito diretamente na conta bancária cadastrada.<br />
                            As distribuições estão sujeitas à disponibilidade de caixa e à performance dos ativos do fundo.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-2">Documentação completa</h4>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            Para informações detalhadas sobre taxas, política de investimento, fatores de risco e outras condições, consulte o Suplemento da Série.
                        </p>

                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                            <ExternalLink size={16} />
                            Ver Suplemento Completo
                        </button>
                    </div>
                </div>
            </div>

            {/* Nota Footer */}
            <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-lg p-5">
                <h4 className="text-sm font-bold text-slate-800 mb-1">Nota</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                    O investimento em fundos estruturados envolve riscos. Leia atentamente o Suplemento e o Termo de Ciência de Riscos antes de investir. Rentabilidade passada não garante resultados futuros.
                </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-500 hover:text-slate-700 font-medium transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar
                </button>

                <button
                    onClick={onNext}
                    className="px-6 py-2.5 bg-[#14B8A6] text-white font-medium rounded-lg hover:bg-[#0D9488] transition-colors shadow-lg shadow-teal-500/20"
                >
                    Confirmar e continuar
                </button>
            </div>

        </div>
    );
};

export default EssentialTermsStep;
