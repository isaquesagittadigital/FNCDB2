

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

    // Function to calculate current quarter and year
    const getCurrentQuarterAndYear = () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        let quarter;
        if (month >= 1 && month <= 3) {
            quarter = '1T';
        } else if (month >= 4 && month <= 6) {
            quarter = '2T';
        } else if (month >= 7 && month <= 9) {
            quarter = '3T';
        } else {
            quarter = '4T';
        }

        return `${quarter}-${year}`;
    };

    // Function to get correspondence address with fallback to main address
    const getCorrespondenceAddress = () => {
        const hasCorrespondenceAddress = data?.logradouro_correspondencia &&
            data?.numero_correspondencia &&
            data?.cidade_correspondencia;

        if (hasCorrespondenceAddress) {
            return {
                logradouro: data.logradouro_correspondencia,
                numero: data.numero_correspondencia,
                complemento: data.complemento_correspondencia,
                bairro: data.bairro_correspondencia,
                cidade: data.cidade_correspondencia,
                uf: data.uf_correspondencia,
                cep: data.cep_correspondencia
            };
        }

        return {
            logradouro: data?.logradouro || '-',
            numero: data?.numero || '-',
            complemento: data?.complemento,
            bairro: data?.bairro || '-',
            cidade: data?.cidade || '-',
            uf: data?.uf || '-',
            cep: data?.cep || '-'
        };
    };

    const correspondenceAddress = getCorrespondenceAddress();
    const acceptanceDate = data.declarations_accepted_at ? new Date(data.declarations_accepted_at) : new Date();

    // Document content component
    const DocumentContent = () => (
        <div className="bg-white text-slate-700" style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '12pt', lineHeight: '1.5', textAlign: 'justify' }}>

            {/* Header */}
            <div className="text-center mb-8 border-b pb-6" style={{ textAlign: 'center' }}>
                <h1 className="font-bold uppercase tracking-wider text-slate-900 mb-2" style={{ fontSize: '14pt' }}>FORMULÁRIO DO INVESTIDOR</h1>
                <h2 className="font-bold text-slate-700" style={{ fontSize: '14pt' }}>FNCD CAPITAL LTDA SCP {getCurrentQuarterAndYear()}</h2>
            </div>

            <div className="mb-6">
                <p className="mb-4 text-slate-800" style={{ textAlign: 'left' }}>
                    São Paulo, {acceptanceDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="mb-4" style={{ textAlign: 'justify', textIndent: '1.25cm' }}>
                    Este Formulário integra o Contrato-Base da SCP e deve ser preenchido e assinado antes do Termo de Adesão e do Instrumento de Aporte.
                </p>
            </div>

            {/* 1. DADOS CADASTRAIS */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-2 bg-slate-50 p-1 uppercase" style={{ fontSize: '14pt', textAlign: 'left' }}>1. DADOS CADASTRAIS DO INVESTIDOR</h3>
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
                <div className="mt-3">
                    <p><span className="font-bold text-slate-900">Endereço de Correspondência:</span> {correspondenceAddress.logradouro}, {correspondenceAddress.numero} {correspondenceAddress.complemento ? `- ${correspondenceAddress.complemento}` : ''}, {correspondenceAddress.bairro}, {correspondenceAddress.cidade}/{correspondenceAddress.uf} - {correspondenceAddress.cep}</p>
                </div>
            </div>

            {/* 2. COMPLIANCE */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1 uppercase" style={{ fontSize: '14pt', textAlign: 'left' }}>2. COMPLIANCE KYC/KYB E SANÇÕES</h3>

                <div className="mb-3">
                    <p className="font-bold mb-2">2.1. Declarações (marcar):</p>
                    <ul className="list-none space-y-1 pl-2">
                        <li>[{data?.pep_status === 'Não' || !data?.pep_status ? 'X' : ' '}] Declaro que NÃO sou Pessoa Politicamente Exposta (PEP).</li>
                        <li>[{data?.pep_status === 'Sim' ? 'X' : ' '}] Declaro que SOU Pessoa Politicamente Exposta (PEP). Detalhes: {data?.pep_details || '___'}</li>
                        <li>[X] Declaro que os recursos têm origem lícita e não provêm de atividades ilícitas.</li>
                        <li>[X] Autorizo a FNCD a realizar consultas em bancos de dados, mídias negativas e bureaus de crédito.</li>
                    </ul>
                </div>

                <div className="mb-3">
                    <p className="font-bold mb-2">2.2. Origem dos recursos (marcar todas que se aplicam):</p>
                    <ul className="list-none space-y-1 pl-2">
                        <li>[{data?.resource_origin?.includes('Salário/Renda') ? 'X' : ' '}] Salário/Renda</li>
                        <li>[{data?.resource_origin?.includes('Poupança/Investimentos') ? 'X' : ' '}] Poupança/Investimentos</li>
                        <li>[{data?.resource_origin?.includes('Herança/Doação') ? 'X' : ' '}] Herança/Doação</li>
                        <li>[{data?.resource_origin?.includes('Venda de Bens') ? 'X' : ' '}] Venda de Bens</li>
                        <li>[{data?.resource_origin?.includes('Outros') ? 'X' : ' '}] Outros: {data?.resource_origin_other || '___'}</li>
                    </ul>
                    <p className="mt-2">Comprovantes disponíveis: {data?.resource_proof_available ? 'SIM' : 'NÃO'}</p>
                    {data?.resource_proof_details && <p>Detalhes: {data.resource_proof_details}</p>}
                </div>

                <div>
                    <p className="font-bold mb-2">2.3. Impostos Internacionais (FATCA/CRS):</p>
                    <p>Residência fiscal em outro país: {data?.international_tax_residency ? 'SIM' : 'NÃO'}</p>
                    {data?.international_tax_residency && <p>Países: {data?.international_tax_countries}</p>}
                </div>
            </div>

            {/* 3. SUITABILITY */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1 uppercase" style={{ fontSize: '14pt', textAlign: 'left' }}>3. SUITABILITY (PERFIL DO INVESTIDOR)</h3>

                <div className="mb-3">
                    <p className="font-bold mb-2">3.1. Horizonte de investimento e liquidez:</p>
                    <p>Horizonte: [{data?.investment_horizon === 'Curto prazo (até 1 ano)' ? 'X' : ' '}] Curto prazo (até 1 ano) | [{data?.investment_horizon === 'Médio prazo (1-3 anos)' ? 'X' : ' '}] Médio prazo (1-3 anos) | [{data?.investment_horizon === 'Longo prazo (acima de 3 anos)' ? 'X' : ' '}] Longo prazo (acima de 3 anos)</p>
                    <p>Tolerância a lock-up: [{data?.lockup_tolerance === 'Baixa' ? 'X' : ' '}] Baixa | [{data?.lockup_tolerance === 'Média' ? 'X' : ' '}] Média | [{data?.lockup_tolerance === 'Alta' ? 'X' : ' '}] Alta</p>
                    <p>Tolerância a baixa liquidez: [{data?.liquidity_tolerance === 'Baixa' ? 'X' : ' '}] Baixa | [{data?.liquidity_tolerance === 'Média' ? 'X' : ' '}] Média | [{data?.liquidity_tolerance === 'Alta' ? 'X' : ' '}] Alta</p>
                </div>

                <div className="mb-3">
                    <p className="font-bold mb-2">3.2. Experiência prévia:</p>
                    <p>Nível: [{data?.experience_level === 'Iniciante' ? 'X' : ' '}] Iniciante | [{data?.experience_level === 'Intermediário' ? 'X' : ' '}] Intermediário | [{data?.experience_level === 'Avançado' ? 'X' : ' '}] Avançado</p>
                    <p>Áreas de experiência: [{data?.experience_areas?.includes('Renda Fixa') ? 'X' : ' '}] Renda Fixa | [{data?.experience_areas?.includes('Renda Variável') ? 'X' : ' '}] Renda Variável | [{data?.experience_areas?.includes('Fundos') ? 'X' : ' '}] Fundos | [{data?.experience_areas?.includes('Derivativos') ? 'X' : ' '}] Derivativos | [{data?.experience_areas?.includes('Outros') ? 'X' : ' '}] Outros</p>
                    <p>Anos de experiência: {data?.experience_years || '___'}</p>
                    <p>Já investiu em SCP: [{data?.scp_experience === 'Sim' ? 'X' : ' '}] Sim | [{data?.scp_experience === 'Não' || !data?.scp_experience ? 'X' : ' '}] Não</p>
                </div>

                <div className="mb-3">
                    <p className="font-bold mb-2">3.3. Capacidade de absorção de perdas:</p>
                    <p>[{data?.loss_absorption_capacity === 'Baixa' ? 'X' : ' '}] Baixa | [{data?.loss_absorption_capacity === 'Média' ? 'X' : ' '}] Média | [{data?.loss_absorption_capacity === 'Alta' ? 'X' : ' '}] Alta</p>
                </div>

                <div className="mb-3">
                    <p className="font-bold mb-2">3.4. Concentração (% do patrimônio nesta Série):</p>
                    <p>[{data?.patrimony_allocation === 'Até 10%' ? 'X' : ' '}] Até 10% | [{data?.patrimony_allocation === '10-25%' ? 'X' : ' '}] 10-25% | [{data?.patrimony_allocation === '25-50%' ? 'X' : ' '}] 25-50% | [{data?.patrimony_allocation === 'Acima de 50%' ? 'X' : ' '}] Acima de 50%</p>
                </div>

                <div className="mb-3">
                    <p className="font-bold mb-2">3.5. Objetivo principal:</p>
                    <p>[{data?.investment_objective === 'Preservação de capital' ? 'X' : ' '}] Preservação de capital | [{data?.investment_objective === 'Renda regular' ? 'X' : ' '}] Renda regular | [{data?.investment_objective === 'Crescimento moderado' ? 'X' : ' '}] Crescimento moderado | [{data?.investment_objective === 'Crescimento agressivo' ? 'X' : ' '}] Crescimento agressivo</p>
                </div>

                <div>
                    <p className="font-bold">Classificação FNCD:</p>
                    <p>
                        Pontuação/critério interno → Perfil:
                        [{data?.suitability_profile === 'Conservador' ? 'X' : ' '}] Conservador
                        [{data?.suitability_profile === 'Moderado' ? 'X' : ' '}] Moderado
                        [{data?.suitability_profile === 'Arrojado' ? 'X' : ' '}] Arrojado
                    </p>
                </div>
            </div>

            {/* 4. TERMOS ESSENCIAIS DA SÉRIE */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-2 bg-slate-50 p-1 uppercase" style={{ fontSize: '14pt', textAlign: 'left' }}>4. TERMOS ESSENCIAIS DA SÉRIE (RESUMO EXECUTIVO)</h3>
                <div className="space-y-2 text-slate-700">
                    <p>
                        <span className="font-bold">Conta Bancária Dedicada da Série (uso exclusivo):</span> Banco 422 | Ag. 0034 | Conta 47.993-1 | Titular: FNCD CAPITAL LTDA
                    </p>
                    <p>
                        <span className="font-bold">Lock-up:</span> 18 meses a contar da integralização.
                    </p>
                    <p>
                        <span className="font-bold">Distribuições:</span> mensais até o dia 10 (se houver), conforme Suplemento.
                    </p>
                </div>
            </div>

            {/* 5. TERMO DE CIÊNCIA DE RISCOS */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1 uppercase" style={{ fontSize: '14pt', textAlign: 'left' }}>5. TERMO DE CIÊNCIA DE RISCOS (LEIA COM ATENÇÃO)</h3>
                <p className="mb-3 text-slate-700">
                    Ao assinar este Formulário, declaro que li e compreendi os riscos abaixo, entre outros previstos no Contrato-Base e no Suplemento:
                </p>
                <ul className="list-none space-y-2 text-slate-700 mb-4">
                    <li className="pl-2">
                        <span className="font-bold">Risco de Mercado e Câmbio:</span> variações de taxas de câmbio, spreads, volumes e regulamentação podem afetar receitas e resultados.
                    </li>
                    <li className="pl-2">
                        <span className="font-bold">Risco de Execução/Contraparte:</span> as operações de câmbio são executadas e liquidadas exclusivamente por Instituição Autorizada; atrasos, falhas ou mudanças contratuais podem impactar o desempenho.
                    </li>
                    <li className="pl-2">
                        <span className="font-bold">Risco de Liquidez:</span> lock-up e janelas/eventos de liquidez limitam resgates; não há garantia de mercado secundário das UPs.
                    </li>
                    <li className="pl-2">
                        <span className="font-bold">Risco de Crédito/Operacional:</span> falhas operacionais, fraudes, contingências legais, chargebacks e inadimplementos podem gerar perdas.
                    </li>
                    <li className="pl-2">
                        <span className="font-bold">Risco de Concentração:</span> alocações altas do patrimônio nesta Série aumentam a volatilidade do resultado individual.
                    </li>
                    <li className="pl-2">
                        <span className="font-bold">Risco Regulatória/Legal:</span> alterações normativas (cambiais, tributárias, de correspondentes) podem exigir ajustes ou liquidação ordenada da Série.
                    </li>
                    <li className="pl-2">
                        <span className="font-bold">Taxas e Performance:</span> a Taxa de Operação e Performance de mercado impactam o resultado líquido do investidor.
                    </li>
                    <li className="pl-2">
                        <span className="font-bold">Ausência de Garantia:</span> NÃO há garantia de rentabilidade, preservação de capital ou distribuição mínima.
                    </li>
                    <li className="pl-2">
                        <span className="font-bold">Sem Voto:</span> não tenho direito a voto/gestão; meus direitos são econômicos e informacionais.
                    </li>
                    <li className="pl-2">
                        <span className="font-bold">Proibição de Adiantamento de Lucros:</span> distribuições ocorrem apenas conforme o Contrato-Base, Suplemento, Termo de Adesão e documentos da Série.
                    </li>
                </ul>
                <div className="mt-3">
                    <p className="font-bold mb-2">Confirmação:</p>
                    <p className="pl-2">
                        [{data?.risk_acknowledged ? 'X' : ' '}] Confirmo que compreendi os riscos, recebi/acessei o Suplemento, o Contrato-Base e o Termo de Adesão, e aceito os termos.
                    </p>
                </div>
            </div>

            {/* 6. PRIVACIDADE E PROTEÇÃO DE DADOS */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1 uppercase" style={{ fontSize: '14pt', textAlign: 'left' }}>6. PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)</h3>
                <div className="space-y-3 text-slate-700">
                    <p>
                        <span className="font-bold">Controladora:</span> FNCD CAPITAL LTDA, CNPJ 56.441.252/0001-00, com sede à Avenida Copacabana, 325 – sala 1318 – setor 02 – Dezoito do Forte Empresarial, Alphaville – Barueri/SP – CEP 06472-001.
                    </p>
                    <p>
                        <span className="font-bold">Finalidades:</span> onboarding KYC/KYB, avaliação de suitability, prevenção à PLD/FT, execução do Contrato-Base e obrigações legais/tributárias, gestão da relação com investidores, envio de relatórios e comunicações dirigidas (captação privada, sem oferta pública).
                    </p>
                    <p>
                        <span className="font-bold">Bases legais:</span> execução de contrato, cumprimento de obrigação legal/regulatória e legítimo interesse (art. 7º, I, II e IX, LGPD).
                    </p>
                    <p>
                        <span className="font-bold">Compartilhamento:</span> contabilidade, auditoria, bancos, provedores KYC/KYB, plataformas de assinatura/arquivo e Instituição Autorizada (quando necessário).
                    </p>
                    <p>
                        <span className="font-bold">Transferências internacionais:</span> quando necessárias e com salvaguardas adequadas.
                    </p>
                    <p>
                        <span className="font-bold">Direitos do titular:</span> acesso/correção/eliminação/portabilidade, oposição e revisão de decisões automatizadas.
                    </p>
                    <p>
                        <span className="font-bold">Retenção:</span> manutenção pelo prazo necessário à Série e às exigências legais; após, eliminação ou anonimização.
                    </p>
                    <p>
                        <span className="font-bold">Incidentes:</span> comunicação tempestiva em caso de incidente relevante de segurança, conforme políticas internas.
                    </p>
                </div>
                <div className="mt-4">
                    <p className="font-bold mb-2">Consentimentos específicos (marcar quando aplicável):</p>
                    <ul className="list-none space-y-1 pl-2">
                        <li>
                            [{data?.marketing_consent ? 'X' : ' '}] Autorizo comunicações dirigidas sobre Séries/relatórios por e-mail ou canal seguro (captação privada, sem publicidade).
                        </li>
                        <li>
                            [{data?.data_verification_consent ? 'X' : ' '}] Autorizo verificação em bureaus de KYC/KYB e listas de sanções nacionais/internacionais.
                        </li>
                    </ul>
                </div>
            </div>

            {/* 7. DECLARAÇÕES FINAIS */}
            <div className="mb-8">
                <h3 className="font-bold text-slate-900 mb-2 bg-slate-50 p-1 uppercase" style={{ fontSize: '14pt', textAlign: 'left' }}>7. DECLARAÇÕES FINAIS DO INVESTIDOR</h3>
                <ul className="list-none space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                        <span className="font-bold">[{data?.declaration_truth ? 'X' : ' '}]</span> Declaro que as informações são verdadeiras e me comprometo a atualizá-las em caso de mudança.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">[{data?.declaration_nda ? 'X' : ' '}]</span> Declaro ter lido e aceitado o NDA (Anexo D).
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">[{data?.declaration_adhesion ? 'X' : ' '}]</span> Reconheço que o Termo de Adesão (Anexo C) vincula minha participação à Série definida no Suplemento (Anexo A).
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">[X]</span> Estou ciente de que distribuições e relatórios seguirão o calendário do Suplemento.
                    </li>
                </ul>
            </div>

            {/* Company Signatures */}
            <div className="mt-12 pb-8 border-b border-slate-100">
                <p className="mb-6 font-bold text-slate-800">
                    São Paulo, {acceptanceDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                <div className="text-center">
                    <div className="flex justify-center mb-2">
                        <img
                            src="/Assinaturas.png"
                            alt="Assinaturas FNCD"
                            className="h-20 object-contain opacity-95"
                        />
                    </div>

                    <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 border-t border-slate-300 w-64 mx-auto pt-2">FNCD CAPITAL LTDA</p>
                        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">CNPJ 56.441.252/0001-00</p>
                    </div>
                </div>
            </div>

            {/* VALIDATION FOOTER with QRCode */}
            <div className="mt-8 pt-4">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
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
    );

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

            {/* Document Container - Inline */}
            <div className="bg-white border border-slate-200 shadow-xl rounded-lg p-8 md:p-12 max-w-4xl mx-auto">
                <DocumentContent />
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
