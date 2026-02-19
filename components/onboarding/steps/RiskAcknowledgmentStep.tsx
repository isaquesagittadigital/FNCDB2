import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';

interface RiskAcknowledgmentStepProps {
    onNext: () => void;
    onBack: () => void;
    data: any;
    onUpdate: (data: any) => void;
}

const RiskAcknowledgmentStep: React.FC<RiskAcknowledgmentStepProps> = ({ onNext, onBack, data, onUpdate }) => {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
            setHasScrolledToBottom(true);
        }
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Termo de ciência de riscos</h2>
            </div>

            {/* Intro Box */}
            <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-lg p-5">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    Ao assinar este Formulário, declaro que li e compreendi os riscos abaixo, entre outros previstos no Contrato-Base e no Suplemento:
                </p>
            </div>

            {/* Scrollable Risk Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div ref={scrollRef} onScroll={handleScroll} className="p-6 max-h-[320px] overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-2">

                    <div className="space-y-6 pb-12">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Risco de Mercado e Câmbio</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Variações de taxas de câmbio, spreads, volumes e regulamentação podem afetar receitas e resultados.
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Risco de Execução/Contraparte</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                As operações de câmbio são executadas e liquidadas exclusivamente por Instituição Autorizada; atrasos, falhas ou mudanças contratuais podem impactar o desempenho.
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Risco de Crédito/Operacional</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Falhas operacionais, fraudes, contingências legais, chargebacks e inadimplementos podem gerar perdas.
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Risco de Concentração</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Alocações altas do patrimônio nesta Série aumentam a volatilidade do resultado individual.
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Risco Regulatória/Legal</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Alterações normativas (cambiais, tributárias, de correspondentes) podem exigir ajustes ou liquidação ordenada da Série.
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Taxa e Performance</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                A Taxa de Operação e Performance de mercado impactam o resultado líquido do investidor.
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Ausência de Garantia</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                NÃO há garantia de rentabilidade, preservação de capital ou distribuição mínima.
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Sem Voto</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Não tenho direito a voto/gestão; meus direitos são econômicos e informacionais.
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Proibição de Adiantamento de Lucros</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Distribuições ocorrem apenas conforme o Contrato-Base, Suplemento, Termo de Adesão e documentos da Série.
                            </p>
                        </div>
                    </div>

                    {/* Fade out effect at bottom - hides after scrolling to bottom */}
                    {!hasScrolledToBottom && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-4 transition-opacity duration-300">
                            <span className="bg-[#E0F2FE] text-[#0284C7] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                Role para ler todo o conteúdo <ChevronDown size={12} />
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Consentimentos Box */}
            <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Consentimentos específicos</h3>

                <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.terms_accepted ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.terms_accepted || false}
                                onChange={(e) => onUpdate({ terms_accepted: e.target.checked })}
                            />
                            {data.terms_accepted && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Confirmo que compreendi os riscos o Suplemento, o Contrato-Base e o Termo Adesão, e aceito os termos.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.risk_data_truth ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.risk_data_truth || false}
                                onChange={(e) => onUpdate({ risk_data_truth: e.target.checked })}
                            />
                            {data.risk_data_truth && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Declaro que as informações são verdadeiras e me comprometo a atualizá-las em caso de mudança.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.risk_nda_read ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.risk_nda_read || false}
                                onChange={(e) => onUpdate({ risk_nda_read: e.target.checked })}
                            />
                            {data.risk_nda_read && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Declaro ter lido e aceitado o NDA (Anexo D).
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.risk_adhesion_bind ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.risk_adhesion_bind || false}
                                onChange={(e) => onUpdate({ risk_adhesion_bind: e.target.checked })}
                            />
                            {data.risk_adhesion_bind && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Reconheço que o Termo de Adesão (Anexo C) vincula minha participação à Série definida no Suplemento (Anexo A).
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.risk_calendar_aware ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.risk_calendar_aware || false}
                                onChange={(e) => onUpdate({ risk_calendar_aware: e.target.checked })}
                            />
                            {data.risk_calendar_aware && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Estou ciente de que distribuições e relatórios seguirão o calendário do Suplemento.
                        </span>
                    </label>
                </div>
            </div>

            {/* Footer Note */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-lg p-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                    Para mais informações sobre os riscos e as características do investimento, consulte o Suplemento da Série e o Regulamento do Fundo, disponíveis no site da administradora.
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
                    disabled={!data.terms_accepted || !data.risk_data_truth || !data.risk_nda_read || !data.risk_adhesion_bind || !data.risk_calendar_aware}
                    className={`px-6 py-2.5 font-medium rounded-lg transition-colors shadow-lg shadow-teal-500/20 ${(!data.terms_accepted || !data.risk_data_truth || !data.risk_nda_read || !data.risk_adhesion_bind || !data.risk_calendar_aware) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-[#0EA5E9] text-white hover:bg-[#0284C7]'}`}
                >
                    Confirmar e continuar
                </button>
            </div>

        </div>
    );
};

export default RiskAcknowledgmentStep;
