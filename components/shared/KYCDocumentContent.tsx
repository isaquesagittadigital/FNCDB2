
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface KYCDocumentContentProps {
    data: any;
}

const KYCDocumentContent: React.FC<KYCDocumentContentProps> = ({ data }) => {

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    // Detect PF vs PJ
    const isPJ = !!(data?.cnpj && data.cnpj.replace(/\D/g, '').length > 11);

    // Unified getters
    const getDisplayName = () => {
        if (isPJ) return data?.razao_social || data?.nome_fantasia || '___';
        return data?.nome_fantasia || data?.razao_social || '___';
    };

    const getDocument = () => isPJ ? (data?.cnpj || '___') : (data?.cpf || '___');

    // Function to calculate current quarter and year
    const getCurrentQuarterAndYear = () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        let quarter;
        if (month >= 1 && month <= 3) quarter = '1T';
        else if (month >= 4 && month <= 6) quarter = '2T';
        else if (month >= 7 && month <= 9) quarter = '3T';
        else quarter = '4T';
        return `${quarter}-${year}`;
    };

    // Correspondence address
    const getCorrespondenceAddress = () => {
        const has = data?.logradouro_correspondencia && data?.cidade_correspondencia;
        if (has) {
            return `${data.logradouro_correspondencia}, ${data.numero_correspondencia || 'S/N'}${data.complemento_correspondencia ? ' - ' + data.complemento_correspondencia : ''}, ${data.bairro_correspondencia || ''}, ${data.cidade_correspondencia}/${data.uf_correspondencia || ''} - ${data.cep_correspondencia || ''}`;
        }
        return null;
    };

    const getFullAddress = () => {
        const parts = [
            data?.logradouro,
            data?.numero ? `, ${data.numero}` : '',
            data?.complemento ? ` - ${data.complemento}` : '',
            data?.bairro ? `, ${data.bairro}` : '',
        ].join('');
        return parts || '___';
    };

    const acceptanceDate = data?.declarations_accepted_at ? new Date(data.declarations_accepted_at) : new Date();

    // Helpers for checkbox display
    const check = (condition: boolean | undefined | null) => condition ? 'X' : ' ';
    const includes = (arr: any, val: string) => Array.isArray(arr) ? arr.includes(val) : (arr === val);

    return (
        <div className="bg-white text-slate-700" style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '11.5pt', lineHeight: '1.6', textAlign: 'justify' }}>

            {/* ═══════════ HEADER ═══════════ */}
            <div className="text-center mb-8 border-b pb-6" style={{ textAlign: 'center' }}>
                <h1 className="font-bold uppercase tracking-wider text-slate-900 mb-2" style={{ fontSize: '14pt' }}>
                    FORMULÁRIO DO INVESTIDOR
                </h1>
                <h2 className="font-bold text-slate-700" style={{ fontSize: '13pt' }}>
                    FNCD CAPITAL LTDA SCP {getCurrentQuarterAndYear()}
                </h2>
            </div>

            <div className="mb-6">
                <p className="mb-3 text-slate-800" style={{ textAlign: 'left' }}>
                    São Paulo, {acceptanceDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.
                </p>
                <p className="mb-4" style={{ textAlign: 'justify', textIndent: '1.25cm' }}>
                    Este Formulário integra o Contrato-Base da SCP e deve ser preenchido e assinado antes do Termo de Adesão e da emissão do Recibo.
                </p>
            </div>

            {/* ═══════════ 1. IDENTIFICAÇÃO DO INVESTIDOR ═══════════ */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1.5 uppercase" style={{ fontSize: '13pt', textAlign: 'left' }}>
                    1) IDENTIFICAÇÃO DO INVESTIDOR
                </h3>

                {/* 1.1. Tipo */}
                <p className="font-bold mb-2">1.1. Tipo de Investidor (marcar):</p>
                <p className="mb-4 pl-2">
                    [{check(!isPJ)}] Pessoa Física (PF) &nbsp;&nbsp; [{check(isPJ)}] Pessoa Jurídica (PJ)
                </p>

                {!isPJ ? (
                    /* ── PF ── */
                    <div className="border-l-2 border-slate-200 pl-4 mb-4">
                        <p className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Se PF:</p>
                        <div className="space-y-1">
                            <p><span className="font-bold">Nome completo:</span> {data?.nome_fantasia || '___'}</p>
                            <p>
                                <span className="font-bold">Nacionalidade:</span> {data?.nacionalidade || '___'}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">Estado civil:</span> {data?.estado_civil || '___'}
                            </p>
                            <p>
                                <span className="font-bold">Profissão:</span> {data?.profissao || '___'}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">Nasc.:</span> {formatDate(data?.data_nascimento)}
                            </p>
                            <p>
                                <span className="font-bold">CPF:</span> {data?.cpf || '___'}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">RG/Órgão/UF:</span> {data?.rg || '___'}/{data?.orgao_emissor || '___'}/{data?.uf_rg || '___'}
                            </p>
                            <p><span className="font-bold">Endereço residencial:</span> {getFullAddress()}</p>
                            <p>
                                <span className="font-bold">Cidade/UF:</span> {data?.cidade || '___'}/{data?.uf || '___'}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">CEP:</span> {data?.cep || '___'}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">País:</span> Brasil
                            </p>
                            <p>
                                <span className="font-bold">E-mail:</span> {data?.email || '___'}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">Tel.:</span> {data?.celular || '___'}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* ── PJ ── */
                    <div className="border-l-2 border-slate-200 pl-4 mb-4">
                        <p className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Se PJ:</p>
                        <div className="space-y-1">
                            <p><span className="font-bold">Razão social:</span> {data?.razao_social || '___'}</p>
                            <p><span className="font-bold">Nome fantasia:</span> {data?.nome_fantasia || '___'}</p>
                            <p>
                                <span className="font-bold">CNPJ:</span> {data?.cnpj || '___'}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">Inscr. Estadual/Municipal:</span> {data?.inscricao_estadual || '___'}
                            </p>
                            <p>
                                <span className="font-bold">Data de constituição:</span> {formatDate(data?.data_constituicao)}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">País:</span> Brasil
                            </p>
                            <p><span className="font-bold">CNAE principal:</span> {data?.cnae_principal || '___'}</p>
                            <p><span className="font-bold">Sede (endereço):</span> {getFullAddress()}, {data?.cidade || '___'}/{data?.uf || '___'} - {data?.cep || '___'}</p>
                            <p>
                                <span className="font-bold">Representante legal:</span> {data?.representante_nome || '___'}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">Cargo:</span> {data?.representante_cargo || '___'}
                            </p>
                            <p>
                                <span className="font-bold">CPF do representante:</span> {data?.representante_cpf || data?.cpf || '___'}
                                &nbsp;&nbsp;&nbsp;
                                <span className="font-bold">E-mail:</span> {data?.email || '___'}
                            </p>
                        </div>
                    </div>
                )}

                {/* 1.2. Endereço para correspondência */}
                <p className="mb-2">
                    <span className="font-bold">1.2. Endereço para correspondência (se diferente):</span>{' '}
                    {getCorrespondenceAddress() || '___'}
                </p>

                {/* 1.3. Dados bancários */}
                <div className="mt-3">
                    <p className="font-bold mb-1">1.3. Dados bancários para distribuições:</p>
                    <p className="pl-2">
                        <span className="font-bold">Banco:</span> {data?.banco || '___'}
                        &nbsp;&nbsp;
                        <span className="font-bold">Agência:</span> {data?.agencia || '___'}
                        &nbsp;&nbsp;
                        <span className="font-bold">Conta:</span> {data?.conta || '___'}
                        &nbsp;&nbsp;
                        <span className="font-bold">Titular:</span> {getDisplayName()}
                        &nbsp;&nbsp;
                        <span className="font-bold">CPF/CNPJ:</span> {getDocument()}
                    </p>
                </div>
            </div>

            {/* ═══════════ 2. COMPLIANCE KYC/KYB E SANÇÕES ═══════════ */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1.5 uppercase" style={{ fontSize: '13pt', textAlign: 'left' }}>
                    2) COMPLIANCE KYC/KYB E SANÇÕES
                </h3>

                <p className="font-bold mb-2">2.1. Declarações (marcar):</p>
                <ul className="list-none space-y-1.5 pl-2 mb-4">
                    <li>[{check(data?.pep_status === 'Não' || !data?.pep_status)}] Não sou/somos PEP (Pessoa(s) Exposta(s) Politicamente), tampouco familiar/estreito colaborador.</li>
                    <li>[{check(data?.pep_status === 'Sim')}] Sou/somos PEP. Detalhar (cargo/entidade/país/período): {data?.pep_details || '___'}</li>
                    <li>[{check(data?.resource_origin_confirmed)}] Recursos de origem lícita e sob minha/nossa titularidade; concordo/concordamos em comprovar quando solicitado.</li>
                    <li>[{check(data?.kyc_authorization)}] Autorizo/autorizamos a FNCD a realizar consultas a lista de sanções, mídias negativas e bureaus de KYC/KYB, inclusive internacionais, para fins de PLD/FT e integridade.</li>
                    <li>[{check(data?.irregularity_awareness)}] Estou/estamos ciente(s) de que a FNCD pode declinar ou encerrar a relação em caso de suspeita de irregularidades.</li>
                </ul>

                <p className="font-bold mb-2">2.2. Origem dos recursos (marcar/explicar):</p>
                <p className="pl-2 mb-1">
                    [{check(includes(data?.resource_origin, 'Salários/Honorários'))}] Salários/Honorários
                    &nbsp;&nbsp;
                    [{check(includes(data?.resource_origin, 'Lucros/Dividendos'))}] Lucros/Dividendos
                    &nbsp;&nbsp;
                    [{check(includes(data?.resource_origin, 'Venda de bens'))}] Venda de bens
                    &nbsp;&nbsp;
                    [{check(includes(data?.resource_origin, 'Receitas operacionais'))}] Receitas operacionais
                    &nbsp;&nbsp;
                    [{check(includes(data?.resource_origin, 'Herança/Doação'))}] Herança/Doação
                </p>
                <p className="pl-2 mb-1">
                    [{check(includes(data?.resource_origin, 'Aplicações financeiras resgatadas'))}] Aplicações financeiras resgatadas
                </p>
                <p className="pl-2 mb-2">
                    [{check(includes(data?.resource_origin, 'Outros'))}] Outros: {data?.resource_origin_other || '___'}
                </p>
                <p className="pl-2 mb-4">
                    Comprovantes disponíveis: [{check(data?.resource_proof_available)}] Sim [{check(!data?.resource_proof_available)}] Não — Detalhar: {data?.resource_proof_details || '___'}
                </p>

                <p className="font-bold mb-2">2.3. Impostos internacionais (se aplicável):</p>
                <p className="pl-2">
                    Residência fiscal em outros países? [{check(!data?.international_tax_residency)}] Não [{check(data?.international_tax_residency)}] Sim → País(es): {data?.international_tax_countries || '___'}
                </p>
            </div>

            {/* ═══════════ 3. SUITABILITY ═══════════ */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1.5 uppercase" style={{ fontSize: '13pt', textAlign: 'left' }}>
                    3) SUITABILITY (PERFIL DO INVESTIDOR)
                </h3>

                {/* 3.1 */}
                <p className="font-bold mb-2">3.1. Horizonte e liquidez</p>
                <p className="pl-2 mb-1">
                    a) Horizonte do investimento nesta Série:
                </p>
                <p className="pl-4 mb-2">
                    [{check(data?.investment_horizon === '< 6 meses')}] {'< 6 meses'}
                    &nbsp;&nbsp;
                    [{check(data?.investment_horizon === '6–12 meses')}] 6–12 meses
                    &nbsp;&nbsp;
                    [{check(data?.investment_horizon === '12–24 meses')}] 12–24 meses
                    &nbsp;&nbsp;
                    [{check(data?.investment_horizon === '> 24 meses')}] {'> 24 meses'}
                </p>
                <p className="pl-2 mb-1">b) Tolerância a lock-up:</p>
                <p className="pl-4 mb-2">
                    [{check(data?.lockup_tolerance === 'Baixa')}] Baixa
                    &nbsp;&nbsp;
                    [{check(data?.lockup_tolerance === 'Média')}] Média
                    &nbsp;&nbsp;
                    [{check(data?.lockup_tolerance === 'Alta')}] Alta
                </p>
                <p className="pl-2 mb-1">c) Tolerância a baixa liquidez:</p>
                <p className="pl-4 mb-3">
                    [{check(data?.liquidity_tolerance === 'Baixa')}] Baixa
                    &nbsp;&nbsp;
                    [{check(data?.liquidity_tolerance === 'Média')}] Média
                    &nbsp;&nbsp;
                    [{check(data?.liquidity_tolerance === 'Alta')}] Alta
                </p>

                {/* 3.2 */}
                <p className="font-bold mb-2">3.2. Experiência prévia</p>
                <p className="pl-2 mb-1">
                    [{check(data?.experience_level === 'Nenhuma')}] Nenhuma
                    &nbsp;&nbsp;
                    [{check(data?.experience_level === 'Básica')}] Básica
                    &nbsp;&nbsp;
                    [{check(data?.experience_level === 'Intermediária')}] Intermediária
                    &nbsp;&nbsp;
                    [{check(data?.experience_level === 'Avançada')}] Avançada
                    &nbsp;— Em:&nbsp;
                    [{check(includes(data?.experience_areas, 'câmbio/FX'))}] câmbio/FX
                    &nbsp;
                    [{check(includes(data?.experience_areas, 'crédito/recebíveis'))}] crédito/recebíveis
                    &nbsp;
                    [{check(includes(data?.experience_areas, 'fundos'))}] fundos
                </p>
                <p className="pl-2 mb-1">
                    Anos de experiência: {data?.experience_years || '___'}
                </p>
                <p className="pl-2 mb-3">
                    Já investiu em estruturas SCP? [{check(data?.scp_experience === 'Não' || !data?.scp_experience)}] Não [{check(data?.scp_experience === 'Sim')}] Sim
                </p>

                {/* 3.3 */}
                <p className="font-bold mb-2">3.3. Capacidade de absorção de perdas</p>
                <p className="pl-2 mb-1">Risco de perder parte/substancial do capital?</p>
                <p className="pl-4 mb-3">
                    [{check(data?.loss_absorption_capacity === 'Não aceito')}] Não aceito
                    &nbsp;&nbsp;
                    [{check(data?.loss_absorption_capacity === 'Aceito perdas moderadas')}] Aceito perdas moderadas
                    &nbsp;&nbsp;
                    [{check(data?.loss_absorption_capacity === 'Aceito perdas significativas')}] Aceito perdas significativas
                </p>

                {/* 3.4 */}
                <p className="font-bold mb-2">3.4. Concentração nesta Série</p>
                <p className="pl-2 mb-1">% do seu patrimônio financeiro que pretende alocar nesta Série:</p>
                <p className="pl-4 mb-3">
                    [{check(data?.patrimony_allocation === '≤ 5%')}] ≤ 5%
                    &nbsp;&nbsp;
                    [{check(data?.patrimony_allocation === '5–10%')}] 5–10%
                    &nbsp;&nbsp;
                    [{check(data?.patrimony_allocation === '10–20%')}] 10–20%
                    &nbsp;&nbsp;
                    [{check(data?.patrimony_allocation === '> 20%')}] {'> 20%'}
                </p>

                {/* 3.5 */}
                <p className="font-bold mb-2">3.5. Objetivo principal</p>
                <p className="pl-2 mb-4">
                    [{check(data?.investment_objective === 'Renda')}] Renda
                    &nbsp;&nbsp;
                    [{check(data?.investment_objective === 'Preservação')}] Preservação
                    &nbsp;&nbsp;
                    [{check(data?.investment_objective === 'Crescimento')}] Crescimento
                    &nbsp;&nbsp;
                    [{check(data?.investment_objective === 'Diversificação')}] Diversificação
                    &nbsp;&nbsp;
                    [{check(data?.investment_objective === 'Exposição cambial')}] Exposição cambial
                </p>

                {/* Classificação FNCD */}
                <div className="bg-slate-50 border border-slate-200 rounded p-3 mt-2">
                    <p className="font-bold mb-1">Classificação (preencher pela FNCD):</p>
                    <p className="pl-2">
                        Pontuação/critério interno → Perfil:
                        &nbsp;&nbsp;
                        [{check(data?.suitability_profile === 'Conservador')}] Conservador
                        &nbsp;&nbsp;
                        [{check(data?.suitability_profile === 'Moderado')}] Moderado
                        &nbsp;&nbsp;
                        [{check(data?.suitability_profile === 'Arrojado')}] Arrojado
                    </p>
                </div>
            </div>

            {/* ═══════════ 4. TERMOS ESSENCIAIS DA SÉRIE ═══════════ */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-2 bg-slate-50 p-1.5 uppercase" style={{ fontSize: '13pt', textAlign: 'left' }}>
                    4) TERMOS ESSENCIAIS DA SÉRIE (RESUMO EXECUTIVO)
                </h3>
                <div className="space-y-1.5 pl-2 text-slate-700">
                    <p><span className="font-bold">Conta Bancária Dedicada da Série (uso exclusivo):</span> Banco 422 | Ag. 0034 | Conta 47.993-1 | Titular: FNCD CAPITAL LTDA</p>
                    <p><span className="font-bold">Lock-up:</span> 18 meses a contar da integralização.</p>
                    <p><span className="font-bold">Distribuições:</span> mensais até o dia 10 (se houver), conforme Suplemento.</p>
                </div>
            </div>

            {/* ═══════════ 5. TERMO DE CIÊNCIA DE RISCOS ═══════════ */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1.5 uppercase" style={{ fontSize: '13pt', textAlign: 'left' }}>
                    5) TERMO DE CIÊNCIA DE RISCOS (LEIA COM ATENÇÃO)
                </h3>
                <p className="mb-3 text-slate-700">
                    Ao assinar este Formulário, declaro que li e compreendi os riscos abaixo, entre outros previstos no Contrato-Base e no Suplemento:
                </p>
                <ul className="list-none space-y-2 text-slate-700 mb-4">
                    <li className="pl-2"><span className="font-bold">Risco de Mercado e Câmbio:</span> variações de taxas de câmbio, spreads, volumes e regulamentação podem afetar receitas e resultados.</li>
                    <li className="pl-2"><span className="font-bold">Risco de Execução/Contraparte:</span> as operações de câmbio são executadas e liquidadas exclusivamente por Instituição Autorizada; atrasos, falhas ou mudanças contratuais podem impactar o desempenho.</li>
                    <li className="pl-2"><span className="font-bold">Risco de Liquidez:</span> lock-up e janelas/eventos de liquidez limitam resgates; não há garantia de mercado secundário das UPs.</li>
                    <li className="pl-2"><span className="font-bold">Risco de Crédito/Operacional:</span> falhas operacionais, fraudes, contingências legais, chargebacks e inadimplementos podem gerar perdas.</li>
                    <li className="pl-2"><span className="font-bold">Risco de Concentração:</span> alocações altas do patrimônio nesta Série aumentam a volatilidade do resultado individual.</li>
                    <li className="pl-2"><span className="font-bold">Risco Regulatória/Legal:</span> alterações normativas (cambiais, tributárias, de correspondentes) podem exigir ajustes ou liquidação ordenada da Série.</li>
                    <li className="pl-2"><span className="font-bold">Taxas e Performance:</span> a Taxa de Operação e Performance de mercado impactam o resultado líquido do investidor.</li>
                    <li className="pl-2"><span className="font-bold">Ausência de Garantia:</span> NÃO há garantia de rentabilidade, preservação de capital ou distribuição mínima.</li>
                    <li className="pl-2"><span className="font-bold">Sem Voto:</span> não tenho direito a voto/gestão; meus direitos são econômicos e informacionais.</li>
                    <li className="pl-2"><span className="font-bold">Proibição de Adiantamento de Lucros:</span> distribuições ocorrem apenas conforme o Contrato-Base, Suplemento, Termo de Adesão e documentos da Série.</li>
                </ul>

                <p className="font-bold mb-2">Confirmação:</p>
                <p className="pl-2">
                    [{check(data?.risk_acknowledged)}] Confirmo que compreendi os riscos, recebi/acessei o Suplemento, o Contrato-Base e o Termo de Adesão, e aceito os termos.
                </p>
            </div>

            {/* ═══════════ 6. PRIVACIDADE E PROTEÇÃO DE DADOS ═══════════ */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1.5 uppercase" style={{ fontSize: '13pt', textAlign: 'left' }}>
                    6) PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)
                </h3>
                <div className="space-y-2.5 text-slate-700">
                    <p><span className="font-bold">Controladora:</span> FNCD CAPITAL LTDA, CNPJ 56.441.252/0001-00, com sede à Avenida Copacabana, 325 – sala 1318 – setor 02 – Dezoito do Forte Empresarial, Alphaville – Barueri/SP – CEP 06472-001.</p>
                    <p><span className="font-bold">Finalidades:</span> onboarding KYC/KYB, avaliação de suitability, prevenção à PLD/FT, execução do Contrato-Base e obrigações legais/tributárias, gestão da relação com investidores, envio de relatórios e comunicações dirigidas (captação privada, sem oferta pública).</p>
                    <p><span className="font-bold">Bases legais:</span> execução de contrato, cumprimento de obrigação legal/regulatória e legítimo interesse (art. 7º, I, II e IX, LGPD).</p>
                    <p><span className="font-bold">Compartilhamento:</span> contabilidade, auditoria, bancos, provedores KYC/KYB, plataformas de assinatura/arquivo e Instituição Autorizada (quando necessário).</p>
                    <p><span className="font-bold">Transferências internacionais:</span> quando necessárias e com salvaguardas adequadas.</p>
                    <p><span className="font-bold">Direitos do titular:</span> acesso/correção/eliminação/portabilidade, oposição e revisão de decisões automatizadas.</p>
                    <p><span className="font-bold">Retenção:</span> manutenção pelo prazo necessário à Série e às exigências legais; após, eliminação ou anonimização.</p>
                    <p><span className="font-bold">Incidentes:</span> comunicação tempestiva em caso de incidente relevante de segurança, conforme políticas internas.</p>
                </div>
                <div className="mt-4">
                    <p className="font-bold mb-2">Consentimentos específicos (marcar quando aplicável):</p>
                    <ul className="list-none space-y-1.5 pl-2">
                        <li>[{check(data?.marketing_consent)}] Autorizo comunicações dirigidas sobre Séries/relatórios por e-mail ou canal seguro (captação privada, sem publicidade).</li>
                        <li>[{check(data?.data_verification_consent)}] Autorizo verificação em bureaus de KYC/KYB e listas de sanções nacionais/internacionais.</li>
                    </ul>
                </div>
            </div>

            {/* ═══════════ 7. DECLARAÇÕES FINAIS ═══════════ */}
            <div className="mb-8">
                <h3 className="font-bold text-slate-900 mb-3 bg-slate-50 p-1.5 uppercase" style={{ fontSize: '13pt', textAlign: 'left' }}>
                    7) DECLARAÇÕES FINAIS DO INVESTIDOR
                </h3>
                <ul className="list-none space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                        <span className="font-bold">[{check(data?.declaration_truth)}]</span>
                        <span>Declaro que as informações são verdadeiras e me comprometo a atualizá-las em caso de mudança.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">[{check(data?.declaration_nda)}]</span>
                        <span>Declaro ter lido e aceitado o NDA (Anexo D).</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">[{check(data?.declaration_adhesion)}]</span>
                        <span>Reconheço que o Termo de Adesão (Anexo C) vincula minha participação à Série definida no Suplemento (Anexo A).</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">[X]</span>
                        <span>Estou ciente de que distribuições e relatórios seguirão o calendário do Suplemento.</span>
                    </li>
                </ul>
            </div>

            {/* ═══════════ ASSINATURAS ═══════════ */}
            <div className="mt-12 pb-8 border-b border-slate-200">
                <p className="mb-8 font-bold text-slate-800">
                    São Paulo, {acceptanceDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.
                </p>

                <div className="flex justify-center">
                    {/* FNCD */}
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <img
                                src="/Assinaturas.png"
                                alt="Assinaturas FNCD"
                                className="h-20 object-contain opacity-95"
                            />
                        </div>
                        <div className="border-t border-slate-300 pt-2 mx-16">
                            <p className="font-bold text-slate-900">FNCD</p>
                            <p className="text-slate-600 text-xs">56.441.252/0001-00</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ VALIDAÇÃO FOOTER ═══════════ */}
            <div className="mt-6 pt-4">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="text-left space-y-1 flex-1">
                        <p className="text-xs text-slate-400">Documento assinado digitalmente.</p>
                        <p className="text-xs text-slate-400">
                            Aceite dos termos em:{' '}
                            <span className="font-medium text-slate-600">
                                {formatDate(data?.declarations_accepted_at)} às {formatTime(data?.declarations_accepted_at)}
                            </span>
                        </p>
                        <p className="text-xs text-slate-400">IP: {data?.ip_address || 'Registrado'}</p>
                    </div>

                    {data?.validation_token && (
                        <div className="flex flex-col items-center md:items-end">
                            <div className="bg-white p-2 border border-slate-100 rounded mb-2">
                                <QRCodeSVG
                                    value={`https://fncd-capital.com/validate/${data.validation_token}`}
                                    size={80}
                                    level="M"
                                />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Código de Autenticação</p>
                                <p className="text-[9px] font-mono bg-slate-100 px-2 py-1.5 rounded text-slate-600 border border-slate-200 max-w-[260px] break-all leading-relaxed">
                                    {data.validation_token}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-4">
                    <p className="text-[10px] text-slate-300 font-medium">FNCD Capital · Formulário do Investidor · {new Date().getFullYear()}</p>
                </div>
            </div>

        </div>
    );
};

export default KYCDocumentContent;
