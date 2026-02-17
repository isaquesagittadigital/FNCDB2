
import React from 'react';
import { ArrowLeft, Check, Edit2 } from 'lucide-react';

interface ReviewStepProps {
    onNext: (data?: any) => void;
    onBack: () => void;
    onEditStep: (step: number) => void;
    data: any;
    onSubmit?: () => void;
    onUpdate?: (data: any) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ onNext, onBack, onEditStep, data, onSubmit, onUpdate }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Revisão e aceite</h2>
            </div>

            {/* Atenção Box */}
            <div className="bg-[#ecfeff] border border-[#CFFAFE] rounded-lg p-5">
                <h4 className="text-sm font-bold text-[#155E75] mb-1">Atenção</h4>
                <p className="text-sm text-[#155E75] leading-relaxed">
                    Ao confirmar, você declara que todas as informações prestadas são verdadeiras e está de acordo com os termos de uso e política de privacidade. Algumas informações não poderão ser alteradas após a confirmação.
                </p>
            </div>

            {/* Dados pessoais Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Dados pessoais</h3>
                    <button
                        onClick={() => onEditStep(0)}
                        className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Edit2 size={12} /> Editar
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Nome completo:</p>
                        <p className="text-slate-800 font-medium">{data?.nome_fantasia || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">CPF:</p>
                        <p className="text-slate-800 font-medium">{data?.cpf || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Data de nascimento:</p>
                        <p className="text-slate-800 font-medium">{data?.data_nascimento || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Nacionalidade:</p>
                        <p className="text-slate-800 font-medium">{data?.nacionalidade || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Email:</p>
                        <p className="text-slate-800 font-medium">{data?.email || data?.auth_email || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Telefone:</p>
                        <p className="text-slate-800 font-medium">{data?.celular || '-'}</p>
                    </div>
                </div>
            </div>

            {/* KYC/KYB e compliance Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">KYC/KYB e compliance</h3>
                    <button
                        onClick={() => onEditStep(2)}
                        className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Edit2 size={12} /> Editar
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">PEP (Pessoa Exposta Politicamente):</p>
                        <p className="text-slate-800 font-medium">
                            {data?.pep_status ? 'Sim' : 'Não'}
                        </p>
                        {data?.pep_status && (
                            <p className="text-slate-600 text-xs mt-1">{data?.pep_details}</p>
                        )}
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Residência Fiscal Internacional:</p>
                        <p className="text-slate-800 font-medium">{data?.international_tax_residency ? 'Sim' : 'Não'}</p>
                        {data?.international_tax_residency && (
                            <p className="text-slate-600 text-xs mt-1">{data?.international_tax_countries}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Origem dos recursos:</p>
                        <p className="text-slate-800 font-medium">
                            {Array.isArray(data?.resource_origin) ? data.resource_origin.join(', ') : data?.resource_origin || '-'}
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Comprovantes de origem:</p>
                        <p className="text-slate-800 font-medium">
                            {data?.resource_proof_available ? `Sim (${data?.resource_proof_details})` : 'Não'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Suitability Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Suitability</h3>
                    <button
                        onClick={() => onEditStep(3)}
                        className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Edit2 size={12} /> Editar
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Horizonte de investimento:</p>
                        <p className="text-slate-800 font-medium">{data?.investment_horizon || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Objetivos:</p>
                        <p className="text-slate-800 font-medium">{data?.investment_objective || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Tolerância a Lock-up:</p>
                        <p className="text-slate-800 font-medium">{data?.lockup_tolerance || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Tolerância a Liquidez:</p>
                        <p className="text-slate-800 font-medium">{data?.liquidity_tolerance || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Nível de experiência:</p>
                        <p className="text-slate-800 font-medium">{data?.experience_level || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Anos de experiência:</p>
                        <p className="text-slate-800 font-medium">{data?.experience_years || '0'} anos</p>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Áreas de experiência:</p>
                        <p className="text-slate-800 font-medium">
                            {Array.isArray(data?.experience_areas) ? data.experience_areas.join(', ') : data?.experience_areas || '-'}
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Capacidade de perdas:</p>
                        <p className="text-slate-800 font-medium">{data?.loss_absorption_capacity || '-'}</p>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Investimento em SCP:</p>
                        <p className="text-slate-800 font-medium">{data?.scp_experience || '-'}</p>
                    </div>

                    <div className="md:col-span-2 mt-2 pt-2 border-t border-slate-100">
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Perfil calculado:</p>
                        <p className="text-[#0EA5E9] font-bold text-base">Conservador</p>
                        {/* Logic for profile calculation could be added here or in parent */}
                    </div>
                </div>
            </div>

            {/* Dados bancários Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Dados bancários</h3>
                    <button
                        onClick={() => onEditStep(1)}
                        className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Edit2 size={12} /> Editar
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Banco:</p>
                        <p className="text-slate-800 font-medium">{data?.bankAccount?.banco || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Agência:</p>
                        <p className="text-slate-800 font-medium">{data?.bankAccount?.agencia || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Conta:</p>
                        <p className="text-slate-800 font-medium">{data?.bankAccount?.conta || '-'}</p>
                    </div>

                    <div>
                        <p className="text-slate-500 text-xs mb-0.5 font-medium">Titular:</p>
                        <p className="text-slate-800 font-medium">{data?.bankAccount?.titular || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Endereço Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Endereço de correspondência</h3>
                    <button
                        onClick={() => onEditStep(1)}
                        className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Edit2 size={12} /> Editar
                    </button>
                </div>

                <div className="text-sm text-slate-600">
                    {data?.logradouro_correspondencia ?
                        `${data.logradouro_correspondencia}, ${data.cidade_correspondencia || ''} - ${data.uf_correspondencia || ''}, ${data.cep_correspondencia || ''}`
                        : 'Mesmo endereço residencial'}
                </div>
            </div>

            {/* Declarações Finais Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Declarações Finais do Investidor</h3>

                <div className="space-y-4 mb-8">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-1 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.declaration_truth ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.declaration_truth || false}
                                onChange={(e) => onUpdate && onUpdate({ declaration_truth: e.target.checked })}
                            />
                            {data.declaration_truth && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Declaro que as informações são verdadeiras e me comprometo a atualizá-las em caso de mudança.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-1 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.declaration_nda ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.declaration_nda || false}
                                onChange={(e) => onUpdate && onUpdate({ declaration_nda: e.target.checked })}
                            />
                            {data.declaration_nda && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Declaro ter lido e aceitado o NDA (Anexo D).
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-1 min-w-[20px] h-5 w-5 rounded border flex items-center justify-center transition-colors relative ${data.declaration_adhesion ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white group-hover:border-[#0EA5E9]'}`}>
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.declaration_adhesion || false}
                                onChange={(e) => onUpdate && onUpdate({ declaration_adhesion: e.target.checked })}
                            />
                            {data.declaration_adhesion && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">
                            Reconheço que o Termo de Adesão (Anexo C) vincula minha participação à Série definida no Suplemento (Anexo A).
                        </span>
                    </label>
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
                    onClick={async () => {
                        // Capture IP address
                        let ipAddress = 'Não disponível';
                        try {
                            const response = await fetch('https://api.ipify.org?format=json');
                            const ipData = await response.json();
                            ipAddress = ipData.ip;
                        } catch (error) {
                            console.error('Erro ao capturar IP:', error);
                        }

                        const updateData = {
                            declarations_accepted_at: new Date().toISOString(),
                            ip_address: ipAddress
                        };

                        if (onUpdate) {
                            onUpdate(updateData);
                        }

                        // Pass data to onNext to ensure it's saved immediately
                        onNext(updateData);
                    }}
                    disabled={!data.declaration_truth || !data.declaration_nda || !data.declaration_adhesion}
                    className={`px-6 py-2.5 font-medium rounded-lg transition-colors shadow-lg shadow-sky-500/20 ${(!data.declaration_truth || !data.declaration_nda || !data.declaration_adhesion) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-[#0EA5E9] text-white hover:bg-[#0284C7]'}`}
                >
                    Continuar
                </button>
            </div>

        </div >
    );
};

export default ReviewStep;
