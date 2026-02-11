import React, { useState } from 'react';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface ComplianceStepProps {
    onNext: () => void;
    onBack: () => void;
    data: any;
    onUpdate: (data: any) => void;
}

const ComplianceStep: React.FC<ComplianceStepProps> = ({ onNext, onBack, data, onUpdate }) => {
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: string, value: any) => {
        onUpdate({ [field]: value });
        setError(null);
    };

    const toggleOrigin = (origin: string) => {
        const currentOrigins = Array.isArray(data.resource_origin) ? data.resource_origin : [];
        const newOrigins = currentOrigins.includes(origin)
            ? currentOrigins.filter((o: string) => o !== origin)
            : [...currentOrigins, origin];

        // Clear "Outros" text if "Outros" is unchecked
        if (origin === 'Outros' && !newOrigins.includes('Outros')) {
            onUpdate({ resource_origin: newOrigins, resource_origin_other: '' });
        } else {
            onUpdate({ resource_origin: newOrigins });
        }
        setError(null);
    };

    const validate = () => {
        // 1. PEP Validation
        if (data.pep_status === undefined || data.pep_status === null) return "Selecione se você é ou não uma Pessoa Exposta Politicamente (PEP).";
        if (data.pep_status === true && !data.pep_details?.trim()) return "Por favor, detalhe sua condição de PEP.";

        // 2. Resource Origin Validation
        if (!data.resource_origin || data.resource_origin.length === 0) return "Selecione pelo menos uma origem dos recursos.";
        if (data.resource_origin.includes('Outros') && !data.resource_origin_other?.trim()) return "Por favor, especifique a outra origem dos recursos.";

        // 3. Resource Proof Validation
        if (data.resource_proof_available === undefined || data.resource_proof_available === null) return "Informe se possui comprovantes para a origem dos recursos.";
        if (data.resource_proof_available === true && !data.resource_proof_details?.trim()) return "Detalhe os comprovantes disponíveis.";

        // 4. Tax Residency Validation
        if (data.international_tax_residency === undefined || data.international_tax_residency === null) return "Informe se possui residência fiscal em outros países.";
        if (data.international_tax_residency === true && !data.international_tax_countries?.trim()) return "Informe o(s) país(es) de residência fiscal.";

        // 5. Mandatory Checkboxes
        if (!data.terms_licit) return "É necessário declarar que os recursos são de origem lícita.";
        if (!data.terms_authorize) return "É necessário autorizar a consulta de dados.";
        if (!data.terms_aware) return "É necessário estar ciente das políticas de compliance.";

        return null;
    };

    const handleNext = () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            window.scrollTo(0, 0);
            return;
        }
        onNext();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Compliance KYC/KYB e Sanções</h2>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Declarações obrigatórias Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Declarações obrigatórias</h3>

                <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-1 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.pep_status === false ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.pep_status === false}
                                onChange={() => handleChange('pep_status', false)}
                            />
                            {data.pep_status === false && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Declaro que não sou/somos Pessoa Exposta Politicamente (PEP) nem possuo/possuímos vínculo com PEP nos termos da regulamentação vigente.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-1 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.pep_status === true ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.pep_status === true}
                                onChange={() => handleChange('pep_status', true)}
                            />
                            {data.pep_status === true && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Declaro que sou/somos Pessoa Exposta Politicamente (PEP) ou possuo/possuímos vínculo com PEP.
                        </span>
                    </label>

                    {data.pep_status === true && (
                        <div className="pl-8 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Detalhe sua condição de PEP: *</label>
                            <input
                                type="text"
                                value={data.pep_details || ''}
                                onChange={(e) => handleChange('pep_details', e.target.value)}
                                placeholder="Informe cargo, entidade, país e período"
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] placeholder:text-slate-400"
                            />
                        </div>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-1 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.terms_licit ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.terms_licit || false}
                                onChange={(e) => handleChange('terms_licit', e.target.checked)}
                            />
                            {data.terms_licit && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Declaro que os recursos utilizados para o investimento são de origem lícita e não estão relacionados a atividades ilegais, incluindo lavagem de dinheiro ou financiamento ao terrorismo.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-1 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.terms_authorize ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.terms_authorize || false}
                                onChange={(e) => handleChange('terms_authorize', e.target.checked)}
                            />
                            {data.terms_authorize && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Autorizo a consulta e verificação dos meus dados em listas de sanções nacionais e internacionais, bem como em sistemas de prevenção à lavagem de dinheiro e combate ao financiamento do terrorismo.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-1 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.terms_aware ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.terms_aware || false}
                                onChange={(e) => handleChange('terms_aware', e.target.checked)}
                            />
                            {data.terms_aware && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Estou ciente de que a FNCD Capital pode declinar ou encerrar a relação comercial caso identifique inconsistências nas informações prestadas ou incompatibilidade com políticas internas de compliance.
                        </span>
                    </label>
                </div>
            </div>

            {/* Origem dos recursos Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Origem dos recursos</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Selecione o tipo de cadastro que deseja realizar para continuar com o processo de verificação KYC.
                </p>

                <div className="space-y-3 mb-6">
                    {['Salários/Honorários', 'Lucros/Dividendos', 'Venda de bens', 'Venda de bens (imóveis, participações...)', 'Receitas operacionais', 'Herança/Doação', 'Aplicações financeiras resgatadas', 'Outros'].map((item, idx) => {
                        const label = item.includes('Venda de bens (imóveis') ? 'Venda de bens (imóveis, participações...)' : item;
                        return (
                            <div key={idx}>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.resource_origin?.includes(label) ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={data.resource_origin?.includes(label) || false}
                                            onChange={() => toggleOrigin(label)}
                                        />
                                        {data.resource_origin?.includes(label) && <Check size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm text-slate-600">{label}</span>
                                </label>
                                {label === 'Outros' && data.resource_origin?.includes('Outros') && (
                                    <div className="pl-8 mt-2 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="text"
                                            value={data.resource_origin_other || ''}
                                            onChange={(e) => handleChange('resource_origin_other', e.target.value)}
                                            placeholder="Especifique a origem"
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Possui comprovantes disponíveis para a origem dos recursos?</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="comprovantes"
                                className="w-4 h-4 text-[#0EA5E9] focus:ring-[#0EA5E9] border-gray-300"
                                checked={data.resource_proof_available === true}
                                onChange={() => handleChange('resource_proof_available', true)}
                            />
                            <span className="text-sm text-slate-700">Sim</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="comprovantes"
                                className="w-4 h-4 text-slate-300 focus:ring-slate-300 border-gray-300"
                                checked={data.resource_proof_available === false}
                                onChange={() => handleChange('resource_proof_available', false)}
                            />
                            <span className="text-sm text-slate-700">Não</span>
                        </label>
                    </div>
                </div>

                {data.resource_proof_available === true && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Detalhe os comprovantes disponíveis: *</label>
                        <input
                            type="text"
                            value={data.resource_proof_details || ''}
                            onChange={(e) => handleChange('resource_proof_details', e.target.value)}
                            placeholder="Ex: Declaração de IR, extratos bancários, contratos..."
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] placeholder:text-slate-400"
                        />
                    </div>
                )}
            </div>

            {/* Impostos internacionais Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Impostos internacionais</h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Possui residência fiscal em outros países além do Brasil?</label>
                    <div className="flex gap-6 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="impostos"
                                className="w-4 h-4 text-[#0EA5E9] focus:ring-[#0EA5E9] border-gray-300"
                                checked={data.international_tax_residency === true}
                                onChange={() => handleChange('international_tax_residency', true)}
                            />
                            <span className="text-sm text-slate-700">Sim</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="impostos"
                                className="w-4 h-4 text-slate-300 focus:ring-slate-300 border-gray-300"
                                checked={data.international_tax_residency === false}
                                onChange={() => handleChange('international_tax_residency', false)}
                            />
                            <span className="text-sm text-slate-700">Não</span>
                        </label>
                    </div>

                    {data.international_tax_residency === true && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Informe o(s) país(es): *</label>
                            <input
                                type="text"
                                value={data.international_tax_countries || ''}
                                onChange={(e) => handleChange('international_tax_countries', e.target.value)}
                                placeholder="Ex: Estados Unidos, Portugal"
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] placeholder:text-slate-400"
                            />
                        </div>
                    )}
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
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-[#14B8A6] text-white font-medium rounded-lg hover:bg-[#0D9488] transition-colors shadow-lg shadow-teal-500/20"
                >
                    Confirmar e continuar
                </button>
            </div>

        </div>
    );
};

export default ComplianceStep;
