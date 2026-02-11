
import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface FinalContractStepProps {
    data: any;
    onFinish: () => void;
    onBack: () => void;
    onUpdate?: (data: any) => void;
}

const FinalContractStep: React.FC<FinalContractStepProps> = ({ data, onFinish, onBack, onUpdate }) => {

    // Generate Token if not exists
    useEffect(() => {
        if (!data.validation_token) {
            const token = crypto.randomUUID();
            const timestamp = new Date().toISOString();
            if (onUpdate) {
                onUpdate({
                    validation_token: token,
                    validation_timestamp: timestamp
                });
            }
        }
    }, [data.validation_token, onUpdate]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const acceptanceDate = data.declarations_accepted_at ? new Date(data.declarations_accepted_at) : new Date();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#ecfeff] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                    <Check size={32} className="text-[#0EA5E9]" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Verificação Concluída!</h2>
                <p className="text-sm text-slate-500">
                    Seu processo KYC foi concluído com sucesso. Abaixo segue seu Formulário de Adesão.
                    As informações preenchidas no portal seguem.
                </p>
            </div>

            {/* Contract Container */}
            <div className="bg-white border border-slate-200 shadow-lg rounded-none p-8 md:p-12 text-xs md:text-sm text-slate-700 leading-relaxed font-serif max-w-4xl mx-auto relative">

                {/* Header Replacement */}
                <div className="text-center mb-8 border-b pb-6">
                    <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider text-slate-900 mb-2">FORMULÁRIO DE ADESÃO</h1>
                    <h2 className="text-sm md:text-base font-bold text-slate-700">FNCD CAPITAL LTDA</h2>
                    <h3 className="text-xs md:text-sm font-bold text-slate-600">CNPJ 56.441.252/0001-00</h3>
                </div>

                <div className="mb-6">
                    <p className="mb-4">
                        Este Formulário integra o Contrato-Base da SCP e deve ser preenchido e assinado antes do Termo de Adesão e do Instrumento de Aporte.
                    </p>
                </div>

                {/* 1. DADOS CADASTRAIS */}
                <div className="mb-6">
                    <h3 className="font-bold text-slate-900 mb-2 bg-slate-50 p-1 uppercase">1. DADOS CADASTRAIS DO INVESTIDOR</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                        <p><span className="font-bold">Nome completo:</span> {data?.nome_fantasia || '-'}</p>
                        <p><span className="font-bold">Nacionalidade:</span> {data?.nacionalidade || '-'}</p>
                        <p><span className="font-bold">Profissão:</span> {data?.profissao || '-'}</p>
                        <p><span className="font-bold">CPF:</span> {data?.cpf || '-'}</p>
                        <p><span className="font-bold">RG:</span> {data?.rg || '-'}</p>
                        <p><span className="font-bold">Órgão Emissor:</span> {data?.orgao_emissor || '-'}</p>
                        <p><span className="font-bold">Data de Nascimento:</span> {formatDate(data?.data_nascimento)}</p>
                        <p><span className="font-bold">Email:</span> {data?.email || '-'}</p>
                        <p><span className="font-bold">Celular:</span> {data?.celular || '-'}</p>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                        <p><span className="font-bold text-slate-700">Endereço de Correspondência:</span> {data?.logradouro_correspondencia}, {data?.numero_correspondencia} {data?.complemento_correspondencia ? `- ${data.complemento_correspondencia}` : ''}, {data?.bairro_correspondencia}, {data?.cidade_correspondencia}/{data?.uf_correspondencia} - {data?.cep_correspondencia}</p>
                    </div>
                </div>

                {/* 2. COMPLIANCE */}
                <div className="mb-6">
                    <h3 className="font-bold text-slate-900 mb-2 bg-slate-50 p-1 uppercase">2. COMPLIANCE KYC/KYB E SANÇÕES</h3>
                    <div className="mb-2">
                        <p className="mb-1">2.1 Declaro que os recursos têm origem lícita e não provêm de atividades ilícitas relacionadas a lavagem de dinheiro, terrorismo ou corrupção.</p>
                        <ul className="list-none space-y-1 pl-2 text-slate-600">
                            <li>(X) Sim, confirmo que a origem dos recursos é lícita.</li>
                            <li>(X) Autorizo expressamente a FNCD a realizar consultas em bancos de dados, mídias negativas e bureaus de crédito.</li>
                        </ul>
                    </div>
                    <div>
                        <p className="mb-1">2.2 Declaração Fiscal (FATCA / CRS):</p>
                        <p>Residência Fiscal Internacional: <span className="font-bold">{data?.international_tax_residency ? 'SIM' : 'NÃO'}</span></p>
                        {data?.international_tax_residency && <p>Países: {data?.international_tax_countries}</p>}
                    </div>
                </div>

                {/* 3. SUITABILITY */}
                <div className="mb-6">
                    <h3 className="font-bold text-slate-900 mb-2 bg-slate-50 p-1 uppercase">3. SUITABILITY (PERFIL DE RISCO)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                        <p><span className="font-bold">Horizonte:</span> {data?.investment_horizon}</p>
                        <p><span className="font-bold">Tolerância a Risco:</span> {data?.loss_absorption_capacity}</p>
                        <p><span className="font-bold">Conhecimento:</span> {data?.experience_level}</p>
                        <p><span className="font-bold">Perfil Calculado:</span> {data?.suitability_profile}</p>
                    </div>
                </div>

                {/* 4. DADOS BANCÁRIOS */}
                <div className="mb-6">
                    <h3 className="font-bold text-slate-900 mb-2 bg-slate-50 p-1 uppercase">4. DADOS BANCÁRIOS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1">
                        <p><span className="font-bold">Banco:</span> {data?.bankAccount?.banco || '-'}</p>
                        <p><span className="font-bold">Agência:</span> {data?.bankAccount?.agencia || '-'}</p>
                        <p><span className="font-bold">Conta:</span> {data?.bankAccount?.conta || '-'}</p>
                        <p><span className="font-bold">Titular:</span> {data?.bankAccount?.titular || '-'}</p>
                    </div>
                </div>

                {/* 7. DECLARAÇÕES FINAIS */}
                <div className="mb-8">
                    <h3 className="font-bold text-slate-900 mb-2 bg-slate-50 p-1 uppercase">7. DECLARAÇÕES FINAIS DO INVESTIDOR</h3>
                    <ul className="list-none space-y-2 text-slate-600">
                        <li className="flex items-start gap-2">
                            <span className="font-bold">(X)</span> Declaro que as informações são verdadeiras e me comprometo a atualizá-las em caso de mudança.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">(X)</span> Declaro ter lido e aceitado o NDA (Anexo D).
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">(X)</span> Reconheço que o Termo de Adesão (Anexo C) vincula minha participação à Série definida no Suplemento (Anexo A).
                        </li>
                    </ul>
                </div>

                {/* Company Signatures */}
                <div className="mt-12 text-center pb-8 border-b border-slate-100">
                    <p className="mb-6 font-bold text-slate-800">
                        São Paulo, {acceptanceDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>

                    <div className="flex justify-center mb-2">
                        <img
                            src="/Assinaturas.png"
                            alt="Assinaturas FNCD"
                            className="h-28 object-contain opacity-95"
                        />
                    </div>

                    <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 border-t border-slate-300 w-64 mx-auto pt-2">FNCD CAPITAL LTDA</p>
                        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">CNPJ 56.441.252/0001-00</p>
                    </div>
                </div>

                {/* VALIDATION FOOTER with QRCode */}
                <div className="mt-8 pt-4">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">

                        {/* User Info & Signatures */}
                        <div className="text-left space-y-1 flex-1">
                            <div className="mb-6">
                                <p className="font-bold text-slate-800 text-base">{data?.nome_fantasia}</p>
                                <p className="text-slate-600">CPF: {data?.cpf}</p>
                            </div>

                            <div className="text-xs text-slate-400 space-y-0.5">
                                <p>Documento assinado digitalmente.</p>
                                <p>Aceite dos termos em: <span className="font-medium text-slate-600">{formatDate(data?.declarations_accepted_at)} às {formatTime(data?.declarations_accepted_at)}</span></p>
                                <p>IP: {data?.ip_address || 'Registrado'}</p>
                            </div>
                        </div>

                        {/* QRCode & Token */}
                        <div className="flex flex-col items-center md:items-end">
                            {data?.validation_token && (
                                <>
                                    <div className="bg-white p-2 border border-slate-100 rounded mb-2">
                                        <QRCodeSVG
                                            value={`https://fncd-capital.com/validate/${data.validation_token}`}
                                            size={80}
                                            level="M"
                                        />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Código de Validação</p>
                                        <p className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                                            {data.validation_token}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-8 pb-12 max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                    Ver meus dados
                </button>

                <button
                    onClick={onFinish}
                    className="px-8 py-3 bg-[#0EA5E9] text-white font-bold rounded-lg shadow-lg hover:bg-[#0284C7] transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <Check size={18} strokeWidth={3} />
                    Acessar plataforma
                </button>
            </div>

        </div>
    );
};

export default FinalContractStep;
