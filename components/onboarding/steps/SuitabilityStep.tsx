import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface SuitabilityStepProps {
    onNext: () => void;
    onBack: () => void;
    data: any;
    onUpdate: (data: any) => void;
}

const SuitabilityStep: React.FC<SuitabilityStepProps> = ({ onNext, onBack, data, onUpdate }) => {

    // Calculate Suitability Profile based on Investment Horizon
    useEffect(() => {
        let profile = '';
        if (data.investment_horizon === 'Menos de 6 meses' || data.investment_horizon === '6 a 12 meses') {
            profile = 'Conservador';
        } else if (data.investment_horizon === '12 a 24 meses') {
            profile = 'Moderado';
        } else if (data.investment_horizon === 'Mais de 24 meses') { // "Acima de 20%" interpreted as > 24 months
            profile = 'Arrojado';
        }

        // Only update if it's different to avoid infinite loop
        if (profile && data.suitability_profile !== profile) {
            onUpdate({ suitability_profile: profile });
        }
    }, [data.investment_horizon, data.suitability_profile, onUpdate]);

    const handleSelect = (field: string, value: string) => {
        onUpdate({ [field]: value });
    };

    const toggleMultiSelect = (field: string, value: string) => {
        const current = data[field] || [];
        const newValues = current.includes(value)
            ? current.filter((v: string) => v !== value)
            : [...current, value];
        onUpdate({ [field]: newValues });
    };

    const getProfileColor = (profile: string) => {
        switch (profile) {
            case 'Conservador': return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
            case 'Moderado': return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
            case 'Arrojado': return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const getProfileDescription = (profile: string) => {
        switch (profile) {
            case 'Conservador': return 'Perfil com baixa tolerância a risco';
            case 'Moderado': return 'Perfil com média tolerância a risco';
            case 'Arrojado': return 'Perfil com alta tolerância a risco';
            default: return 'Selecione o horizonte para calcular';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Suitability (Perfil do investidor)</h2>
            </div>

            {/* Horizonte e liquidez Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Horizonte e liquidez</h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Horizonte de investimentos</label>
                        <div className="space-y-2">
                            {['Menos de 6 meses', '6 a 12 meses', '12 a 24 meses', 'Mais de 24 meses'].map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => handleSelect('investment_horizon', option)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${data.investment_horizon === option ? 'border-[#0EA5E9]' : 'border-slate-300 group-hover:border-[#0EA5E9]'}`}
                                    >
                                        {data.investment_horizon === option && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                                    </div>
                                    <span onClick={() => handleSelect('investment_horizon', option)} className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Tolerância a Lock-up (período de carência):</label>
                        <div className="space-y-2">
                            {['Baixa', 'Média', 'Alta'].map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => handleSelect('lockup_tolerance', option)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${data.lockup_tolerance === option ? 'border-[#0EA5E9]' : 'border-slate-300 group-hover:border-[#0EA5E9]'}`}
                                    >
                                        {data.lockup_tolerance === option && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                                    </div>
                                    <span onClick={() => handleSelect('lockup_tolerance', option)} className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Tolerância à Baixa Liquidez:</label>
                        <div className="space-y-2">
                            {['Baixa', 'Média', 'Alta'].map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => handleSelect('liquidity_tolerance', option)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${data.liquidity_tolerance === option ? 'border-[#0EA5E9]' : 'border-slate-300 group-hover:border-[#0EA5E9]'}`}
                                    >
                                        {data.liquidity_tolerance === option && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                                    </div>
                                    <span onClick={() => handleSelect('liquidity_tolerance', option)} className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Experiência prévia Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Experiência prévia</h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Nível de experiência</label>
                        <div className="space-y-2">
                            {['Baixa', 'Intermediária', 'Avançada'].map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => handleSelect('experience_level', option)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${data.experience_level === option ? 'border-[#0EA5E9]' : 'border-slate-300 group-hover:border-[#0EA5E9]'}`}
                                    >
                                        {data.experience_level === option && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                                    </div>
                                    <span onClick={() => handleSelect('experience_level', option)} className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Áreas de Experiência (selecione todas que se aplicam):</label>
                        <div className="space-y-2">
                            {['Câmbio/FX', 'Créditos/Recebíveis', 'Fundos estruturados'].map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => toggleMultiSelect('experience_areas', option)}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${data.experience_areas?.includes(option) ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}
                                    >
                                        {data.experience_areas?.includes(option) && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span onClick={() => toggleMultiSelect('experience_areas', option)} className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Anos de experiência *</label>
                        <input
                            type="number"
                            value={data.experience_years || ''}
                            onChange={(e) => onUpdate({ experience_years: e.target.value })}
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Já investiu em estruturas SCP?</label>
                        <div className="space-y-2">
                            {['Sim', 'Não'].map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => handleSelect('scp_experience', option)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${data.scp_experience === option ? 'border-[#0EA5E9]' : 'border-slate-300 group-hover:border-[#0EA5E9]'}`}
                                    >
                                        {data.scp_experience === option && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                                    </div>
                                    <span onClick={() => handleSelect('scp_experience', option)} className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Capacidade de absorção de perdas Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Capacidade de absorção de perdas</h3>

                <div className="space-y-2">
                    {['Não aceito perdas no capital investido', 'Aceito perdas moderadas (até 20% do capital)', 'Aceito perdas significativas (acima de 20% do capital)'].map((option, idx) => (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                            <div
                                onClick={() => handleSelect('loss_absorption_capacity', option)}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${data.loss_absorption_capacity === option ? 'border-[#0EA5E9]' : 'border-slate-300 group-hover:border-[#0EA5E9]'}`}
                            >
                                {data.loss_absorption_capacity === option && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                            </div>
                            <span onClick={() => handleSelect('loss_absorption_capacity', option)} className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Concentração e objetivos Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Concentração e objetivos</h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Percentual do patrimônio que será alocado nesta Série:</label>
                        <div className="space-y-2">
                            {['Até 5%', '5% a 10%', '10% a 20%', 'Acima de 20%'].map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => handleSelect('patrimony_allocation', option)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${data.patrimony_allocation === option ? 'border-[#0EA5E9]' : 'border-slate-300 group-hover:border-[#0EA5E9]'}`}
                                    >
                                        {data.patrimony_allocation === option && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                                    </div>
                                    <span onClick={() => handleSelect('patrimony_allocation', option)} className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Objetivo principal do investimento</label>
                        <div className="space-y-2">
                            {['Geração de renda', 'Preservação de capital', 'Crescimento de capital', 'Diversificação de portfólio', 'Exposição cambial'].map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => handleSelect('investment_objective', option)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${data.investment_objective === option ? 'border-[#0EA5E9]' : 'border-slate-300 group-hover:border-[#0EA5E9]'}`}
                                    >
                                        {data.investment_objective === option && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                                    </div>
                                    <span onClick={() => handleSelect('investment_objective', option)} className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Classificação sugerida footer */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Classificação sugerida:</span>
                    <span className="text-xs text-slate-500 mt-1">{getProfileDescription(data.suitability_profile)}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getProfileColor(data.suitability_profile)}`}>
                    {data.suitability_profile || '---'}
                </div>
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

export default SuitabilityStep;
