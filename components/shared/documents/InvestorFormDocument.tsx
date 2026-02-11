
import React from 'react';
import { X } from 'lucide-react';

interface InvestorFormProps {
    data: {
        name: string;
        document: string;
        nationality?: string;
        maritalStatus?: string;
        profession?: string;
        birthDate?: string;
        rg?: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country?: string;
        email?: string;
        phone?: string;
        bankDetails?: {
            bank: string;
            agency: string;
            account: string;
            holder: string;
            document: string;
        };
        suitabilityProfile: string;
        signatureDate: string;
    };
    onClose?: () => void;
    onDownload?: () => void;
}

const InvestorFormDocument: React.FC<InvestorFormProps> = ({ data, onClose, onDownload }) => {

    const handlePrint = () => {
        if (onDownload) {
            onDownload();
        } else {
            window.print();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:p-0 print:bg-white print:static print:block backdrop-blur-sm">

            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl relative print:w-full print:max-w-none print:max-h-none print:shadow-none print:rounded-none flex flex-col">

                {/* Header (Sticky) */}
                <div className="sticky top-0 bg-white z-10 border-b border-slate-200 px-8 py-4 flex justify-end items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 text-sm font-bold text-white bg-[#00A3B1] hover:bg-[#008c99] rounded-lg shadow-md transition-all flex items-center gap-2"
                        >
                            Baixar PDF / Imprimir
                        </button>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Document Content */}
                <div className="p-12 md:p-16 print:p-0 bg-white text-slate-900 font-sans text-sm leading-relaxed">

                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-base font-bold text-slate-900 uppercase mb-1">Formulário do Investidor</h1>
                        <h2 className="text-sm font-bold text-slate-700 uppercase">FNCD CAPITAL LTDA SCP 4T-2026</h2>
                    </div>

                    {/* Location/Date Line */}
                    <div className="mb-8">
                        <p>São Paulo, {data.signatureDate}.</p>
                    </div>

                    <div className="mb-6 text-justify">
                        <p>Este Formulário integra o Contrato-Base da SCP e deve ser preenchido e assinado antes do Termo de Adesão e da emissão do Recibo.</p>
                    </div>

                    {/* 1. Identificação */}
                    <div className="mb-8">
                        <h4 className="font-bold mb-2">1) IDENTIFICAÇÃO DO INVESTIDOR</h4>

                        <div className="mb-4">
                            <p className="font-bold text-xs mb-1">1.1. Tipo de Investidor (marcar):</p>
                            <div className="flex gap-8 items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">
                                        {data.document.length <= 14 ? 'X' : ''}
                                    </div>
                                    <span>Pessoa Física (PF)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">
                                        {data.document.length > 14 ? 'X' : ''}
                                    </div>
                                    <span>Pessoa Jurídica (PJ)</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <span className="font-bold">Nome completo: </span>
                                <span>{data.name}</span>
                            </div>
                            <div>
                                <span className="font-bold">Nacionalidade: </span>
                                <span>{data.nationality || 'Brasil'}</span>
                            </div>
                            <div>
                                <span className="font-bold">Estado civil: </span>
                                <span>{data.maritalStatus}</span>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <span className="font-bold">Profissão: </span>
                                    <span>{data.profession}</span>
                                </div>
                                <div>
                                    <span className="font-bold">Nasc.: </span>
                                    <span>{data.birthDate}</span>
                                </div>
                            </div>
                            <div>
                                <span className="font-bold">CPF: </span>
                                <span>{data.document}</span>
                                <span className="font-bold ml-4">RG/Órgão/UF: </span>
                                <span>{data.rg} / {data.state}</span>
                            </div>
                            <div>
                                <span className="font-bold">Endereço residencial: </span>
                                <span>{data.address}</span>
                            </div>
                            <div>
                                <span className="font-bold">Cidade/UF: </span>
                                <span>{data.city} - {data.state}</span>
                                <span className="font-bold ml-4">CEP: </span>
                                <span>{data.zipCode}</span>
                            </div>
                            <div>
                                <span className="font-bold">País: </span>
                                <span>{data.country || 'Brasil'}</span>
                            </div>
                            <div>
                                <span className="font-bold">E-mail: </span>
                                <span>{data.email}</span>
                            </div>
                            <div>
                                <span className="font-bold">Tel.: </span>
                                <span>{data.phone}</span>
                            </div>
                        </div>

                        <div className="mt-6 mb-4">
                            <p className="font-bold text-xs mb-1">1.2. Endereço para correspondência (se diferente):</p>
                            <p>-</p>
                        </div>

                        <div className="mt-6">
                            <p className="font-bold text-xs mb-1">1.3. Dados bancários para distribuições:</p>
                            <p>
                                <span className="font-bold">Banco: </span>{data.bankDetails?.bank || '_________________'}
                                <span className="font-bold ml-2">Agência: </span>{data.bankDetails?.agency || '_______'}
                                <span className="font-bold ml-2">Conta: </span>{data.bankDetails?.account || '_______'}
                                <span className="font-bold ml-2">Titular: </span>{data.bankDetails?.holder || '_________________'}
                                <span className="font-bold ml-2">CPF/CNPJ: </span>{data.bankDetails?.document || '_________________'}
                            </p>
                        </div>
                    </div>

                    {/* 2. Compliance */}
                    <div className="mb-8">
                        <h4 className="font-bold mb-4">2) COMPLIANCE KYC/KYB E SANÇÕES</h4>

                        <div className="mb-4">
                            <p className="font-bold mb-2">2.1.</p>
                            <div className="w-full border-b border-black h-4 mb-4"></div>
                        </div>

                        <div className="space-y-4 text-justify">
                            <div className="flex items-start gap-2">
                                <div className="mt-1 min-w-[16px] h-4 border border-black text-[10px] flex items-center justify-center cursor-pointer">
                                    X
                                </div>
                                <p>Recursos de origem lícita e sob minha/nossa titularidade; concordo/concordamos em comprovar quando solicitado.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-1 min-w-[16px] h-4 border border-black text-[10px] flex items-center justify-center cursor-pointer">
                                    X
                                </div>
                                <p>Autorizo/autorizamos a FNCD a realizar consultas a lista de sanções, mídias negativas e bureaus de KYC/KYB, inclusive internacionais, para fins de PLD/FT e integridade.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-1 min-w-[16px] h-4 border border-black text-[10px] flex items-center justify-center cursor-pointer">
                                    X
                                </div>
                                <p>Não sou/somos Pessoa Exposta Politicamente (PEP) nem parente/colaborador próximo de uma.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 mb-8">
                        <h4 className="font-bold mb-4">7) DECLARAÇÕES FINAIS DO INVESTIDOR</h4>

                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <div className="mt-1 min-w-[16px] h-4 border border-black text-[10px] flex items-center justify-center cursor-pointer">

                                </div>
                                <p>Declaro que as informações são verdadeiras e me comprometo a atualizá-las em caso de mudança.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-1 min-w-[16px] h-4 border border-black text-[10px] flex items-center justify-center cursor-pointer">

                                </div>
                                <p>Declaro ter lido e aceitado o NDA (Anexo D).</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-1 min-w-[16px] h-4 border border-black text-[10px] flex items-center justify-center cursor-pointer">

                                </div>
                                <p>Reconheço que o Termo de Adesão (Anexo C) vincula minha participação à Série definida no Suplemento (Anexo A).</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 mb-8 text-center">
                        <p className="mb-8 font-bold text-left">São Paulo, {data.signatureDate}</p>

                        <div className="flex flex-col items-center justify-center">
                            {/* Placeholder for Signature Image */}
                            <div className="mb-2">
                                <img
                                    src="/assets/assinaturas.png"
                                    alt="Assinaturas da Diretoria"
                                    className="h-24 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML = '<div class="h-24 w-64 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs italic">Assinaturas (arquivo não encontrado)</div>';
                                    }}
                                />
                            </div>
                            <div className="w-64 border-t border-black mb-1"></div>
                            <p className="font-bold">FNCD CAPITAL LTDA</p>
                            <p>CNPJ 56.441.252/0001-00</p>
                        </div>
                    </div>

                    {/* Footer Text */}
                    <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-sans print:mt-auto print:fixed print:bottom-4 print:left-0 print:right-0">
                        <p>FNCD Capital - Formulário do Investidor - {new Date().getFullYear()}</p>
                    </div>

                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .fixed {
                        position: static;
                        background: white;
                    }
                    .overflow-y-auto {
                        overflow: visible;
                    }
                    .bg-black\\/50 {
                        background: white;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    /* Show only the content inside the print wrapper */
                    .bg-white.w-full.max-w-4xl, .bg-white.w-full.max-w-4xl * {
                        visibility: visible;
                    }
                    .bg-white.w-full.max-w-4xl {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 2cm; 
                        box-shadow: none;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvestorFormDocument;
