

import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import KYCDocumentContent from '../../shared/KYCDocumentContent';

interface FinalContractStepProps {
    data: any;
    onFinish: () => void;
    onBack: () => void;
    onUpdate?: (data: any) => void;
}

const FinalContractStep: React.FC<FinalContractStepProps> = ({ data, onFinish, onBack, onUpdate }) => {

    // Generate unique authentication code based on:
    // DataHora + 2 primeiros dígitos CPF/CNPJ + 2 últimos dígitos CPF/CNPJ + IP completo + 10 chars aleatórios
    const generateAuthCode = () => {
        const now = new Date();

        // 1. Data e hora: YYYYMMDD-HHmmss
        const yyyy = now.getFullYear();
        const MM = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const HH = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const dateTimePart = `${yyyy}${MM}${dd}${HH}${mm}${ss}`;

        // 2. CPF ou CNPJ - somente dígitos
        const doc = (data?.cpf || data?.cnpj || '00000000000').replace(/\D/g, '');
        const first2 = doc.substring(0, 2);
        const last2 = doc.substring(doc.length - 2);

        // 3. IP completo (pontos substituidos por traço para melhor leitura)
        const ip = (data?.ip_address || '0.0.0.0').replace(/\./g, '-');

        // 4. 10 caracteres alfanuméricos aleatórios
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomPart = '';
        const array = new Uint8Array(10);
        crypto.getRandomValues(array);
        for (let i = 0; i < 10; i++) {
            randomPart += chars[array[i] % chars.length];
        }

        // Código final: DATAHORA-FIRST2LAST2-IP-RANDOM10
        return `${dateTimePart}-${first2}${last2}-${ip}-${randomPart}`;
    };

    useEffect(() => {
        if (!data.validation_token) {
            const token = generateAuthCode();
            const timestamp = new Date().toISOString();
            if (onUpdate) {
                onUpdate({
                    validation_token: token,
                    validation_timestamp: timestamp
                });
            }
        }
    }, [data.validation_token, onUpdate]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#ecfeff] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                    <Check size={32} className="text-[#0EA5E9]" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Verificação Concluída!</h2>
                <p className="text-sm text-slate-500">
                    Seu processo KYC foi concluído com sucesso. Clique no botão abaixo para visualizar seu Formulário de Adesão.
                </p>
            </div>

            {/* Document Container - Using shared component */}
            <div className="bg-white border border-slate-200 shadow-xl rounded-lg p-8 md:p-12 max-w-4xl mx-auto">
                <KYCDocumentContent data={data} />
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
