import React, { useEffect } from 'react';
import { ArrowLeft, Check, Shield } from 'lucide-react';

interface PrivacyStepProps {
    onNext: () => void;
    onBack: () => void;
    data: any;
    onUpdate: (data: any) => void;
}

const PrivacyStep: React.FC<PrivacyStepProps> = ({ onNext, onBack, data, onUpdate }) => {

    useEffect(() => {
        // Initialize consents to true if not set (matching previous defaultChecked)
        if (data.marketing_consent === undefined) onUpdate({ marketing_consent: true });
        if (data.data_verification_consent === undefined) onUpdate({ data_verification_consent: true });
        if (data.privacy_policy_accepted === undefined) onUpdate({ privacy_policy_accepted: true });
    }, []);

    const handleChange = (field: string, value: boolean) => {
        onUpdate({ [field]: value });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Privacidade e proteção de dados</h2>
            </div>

            {/* Intro LGPD Box */}
            <div className="bg-[#ecfeff] border border-[#CFFAFE] rounded-lg p-5 flex flex-col items-start gap-3">
                <Shield size={24} className="text-[#06B6D4]" />
                <p className="text-sm text-[#155E75] font-medium leading-relaxed">
                    A FNCD Capital está comprometida com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                </p>
            </div>

            {/* Resumo da política Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Resumo da política de privacidade</h3>

                <div className="space-y-6 divide-y divide-slate-100">
                    <div className="pt-4 first:pt-0">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Controladora de dados</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            FNCD CAPITAL LTDA, CNPJ 56.441.252/0001-00, com sede à Avenida Copacabana, 325 – sala 1318 – setor 02 – Dezoito do Forte Empresarial, Alphaville – Barueri/SP – CEP 06472-001.
                        </p>
                    </div>

                    <div className="pt-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Finalidades do tratamento</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Onboarding KYC/KYB, avaliação de suitability, prevenção à PLD/FT, execução do Contrato-Base e obrigações legais/tributárias, gestão da relação com investidores, envio de relatórios e comunicações dirigidas (captação privada, sem oferta pública).
                        </p>
                    </div>

                    <div className="pt-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Bases legais</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Execução de contrato, cumprimento de obrigação legal/regulatória e legítimo interesse (art. 7º, I, II e IX, LGPD).
                        </p>
                    </div>

                    <div className="pt-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Compartilhamento de dados</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Contabilidade, auditoria, bancos, provedores KYC/KYB, plataformas de assinatura/arquivo e Instituição Autorizada (quando necessário).
                        </p>
                    </div>

                    <div className="pt-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Transferências internacionais</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Quando necessárias e com salvaguardas adequadas.
                        </p>
                    </div>

                    <div className="pt-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Direitos do titular</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Acesso/correção/eliminação/portabilidade, oposição e revisão de decisões automatizadas.
                        </p>
                    </div>

                    <div className="pt-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Retenção</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Manutenção pelo prazo necessário à Série e às exigências legais; após, eliminação ou anonimização.
                        </p>
                    </div>

                    <div className="pt-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Incidentes</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Comunicação tempestiva em caso de incidente relevante de segurança, conforme políticas internas.
                        </p>
                    </div>
                </div>
            </div>

            {/* Consentimentos específicos Box */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Consentimentos específicos</h3>

                <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.marketing_consent ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.marketing_consent || false}
                                onChange={(e) => handleChange('marketing_consent', e.target.checked)}
                            />
                            {data.marketing_consent && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Autorizo comunicações dirigidas sobre Séries/relatórios por e-mail ou canal seguro (captação privada, sem publicidade).
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.data_verification_consent ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.data_verification_consent || false}
                                onChange={(e) => handleChange('data_verification_consent', e.target.checked)}
                            />
                            {data.data_verification_consent && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Autorizo verificação em bureaus de KYC/KYB e listas de sanções nacionais/internacionais.
                        </span>
                    </label>
                </div>
            </div>

            {/* Revogação Footer */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-lg p-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                    Você pode revogar estes consentimentos a qualquer momento através do e-mail privacidade@fncdcapital.com.br
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
                    onClick={() => {
                        // Explicitly set privacy policy acceptance if not already tracked by a specific checkbox, 
                        // but proceeding implies acceptance.
                        handleChange('privacy_policy_accepted', true);
                        onNext();
                    }}
                    className="px-6 py-2.5 bg-[#0EA5E9] text-white font-medium rounded-lg hover:bg-[#0284C7] transition-colors shadow-lg shadow-sky-500/20"
                >
                    Confirmar e continuar
                </button>
            </div>

        </div>
    );
};

export default PrivacyStep;
