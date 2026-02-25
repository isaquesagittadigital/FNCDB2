import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font, Image, Svg, Path } from '@react-pdf/renderer';

// Registrar fontes para melhor aparência
Font.register({
    family: 'Open Sans',
    src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf'
});
Font.register({
    family: 'Open Sans Bold',
    src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf'
});

const styles = StyleSheet.create({
    page: {
        padding: 60,
        fontFamily: 'Open Sans',
        fontSize: 10,
        lineHeight: 1.5,
        color: '#333',
    },
    header: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#CB9965',
        paddingBottom: 10,
    },
    logo: {
        width: 120,
    },
    titleContainer: {
        textAlign: 'right',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Open Sans Bold',
        color: '#002B49',
    },
    subtitle: {
        fontSize: 10,
        color: '#666',
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Open Sans Bold',
        backgroundColor: '#CB9965',
        color: '#FFFFFF',
        padding: 4,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 100,
        fontFamily: 'Open Sans Bold',
    },
    value: {
        flex: 1,
    },
    clauseTitle: {
        fontFamily: 'Open Sans Bold',
        marginTop: 15,
        marginBottom: 5,
        fontSize: 10,
        color: '#002B49',
    },
    text: {
        textAlign: 'justify',
        marginBottom: 10,
    },
    signatureContainer: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    signatureBox: {
        width: 200,
        alignItems: 'center',
    },
    signatureLine: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        width: '100%',
        marginBottom: 5,
    },
});

interface ContractData {
    cliente: any;
    empresa?: {
        nome: string;
        cnpj: string;
        telefone: string;
        email: string;
        endereco: string;
    };
}

export const ContractPDF: React.FC<ContractData> = ({ cliente, empresa }) => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Valores default para a empresa contratada (FNCD Capital)
    const infoEmpresa = empresa || {
        nome: 'FNCD CAPITAL GESTÃO DE ATIVOS LTDA',
        cnpj: '00.000.000/0001-00',
        telefone: '(11) 99999-9999',
        email: 'contato@fncdcapital.com.br',
        endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP'
    };

    const enderecoCliente = `${cliente.logradouro_end || ''}, ${cliente.numero_end || ''}${cliente.complemento_end ? ' - ' + cliente.complemento_end : ''}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 10 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Svg width={48} height={48} viewBox="0 0 48 48">
                            <Path d="M45.3118 30.596L29.8474 46.3121C27.6328 48.5627 24.0405 48.5627 21.8233 46.3121L21.0967 45.5737C20.973 45.4479 20.973 45.2456 21.0967 45.1225L39.4484 26.4722C40.7912 25.1076 40.7912 22.8952 39.4484 21.5306L21.0994 2.88304C20.973 2.75451 20.973 2.54941 21.0994 2.42088L21.8206 1.688C24.0352 -0.562624 27.6275 -0.562624 29.8447 1.688L45.3118 17.4068C48.8961 21.0493 48.8961 26.9535 45.3118 30.596Z" fill="#00305B" />
                            <Path d="M13.1614 11.2183C13.6376 14.2401 15.0288 17.1361 17.316 19.4605C19.6033 21.785 22.4422 23.1878 25.4102 23.6856C25.4102 23.6856 25.5151 23.6856 25.6012 23.7731C25.7385 23.9043 25.7331 24.1067 25.5958 24.2462C25.5313 24.3091 25.4371 24.3227 25.4371 24.3227C22.4637 24.8068 19.6033 26.2096 17.316 28.545C15.0288 30.8804 13.6376 33.7655 13.1614 36.7873C13.1614 36.7873 13.1587 36.8885 13.0726 36.9732C12.9461 37.1018 12.7416 37.0908 12.6259 36.9732C12.5371 36.883 12.5344 36.749 12.5344 36.749C12.0447 33.7491 10.6777 30.8804 8.37969 28.5423C6.08169 26.2069 3.24283 24.804 0.269419 24.32C0.269419 24.32 0.172555 24.3118 0.0918286 24.2298C-0.0292604 24.1067 -0.0319513 23.9125 0.0918286 23.7758C0.164482 23.702 0.212913 23.6938 0.272112 23.6856C3.21054 23.1988 6.08169 21.7822 8.37969 19.4578C10.6777 17.1333 12.0635 14.251 12.5371 11.2292C12.5371 11.2292 12.5451 11.1198 12.6259 11.0378C12.747 10.9147 12.9515 10.912 13.0753 11.0378C13.1318 11.0952 13.1506 11.1499 13.164 11.2183H13.1614Z" fill="#00B1CE" />
                        </Svg>
                        <Text style={[styles.title, { marginLeft: 10, marginTop: 4 }]}>FNCD Capital</Text>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.subtitle}>PRESTAÇÃO DE SERVIÇO</Text>
                    </View>
                </View>
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#CB9965', marginBottom: 20 }} />

                {/* Partes - CONTRATADO (CLIENTE) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONTRATADO:</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nome:</Text>
                        <Text style={styles.value}>{cliente.nome_fantasia || cliente.razao_social || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>CNPJ/CPF:</Text>
                        <Text style={styles.value}>{cliente.cpf || cliente.cnpj || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Telefone:</Text>
                        <Text style={styles.value}>{cliente.celular || cliente.telefone_principal || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>E-mail:</Text>
                        <Text style={styles.value}>{cliente.email || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Endereço:</Text>
                        <Text style={styles.value}>
                            {enderecoCliente}, {cliente.bairro || ''}, {cliente.cidade || ''}/{cliente.uf || ''} - {cliente.cep || ''}
                        </Text>
                    </View>
                </View>

                {/* Partes - CONTRATANTE (EMPRESA) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONTRATANTE:</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nome:</Text>
                        <Text style={styles.value}>{infoEmpresa.nome}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>CNPJ/CPF:</Text>
                        <Text style={styles.value}>{infoEmpresa.cnpj}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Telefone:</Text>
                        <Text style={styles.value}>{infoEmpresa.telefone}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>E-mail:</Text>
                        <Text style={styles.value}>{infoEmpresa.email}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Endereço:</Text>
                        <Text style={styles.value}>{infoEmpresa.endereco}</Text>
                    </View>
                </View>

                {/* Cláusulas */}
                <View style={styles.section}>
                    <Text style={styles.clauseTitle}>CLÁUSULA PRIMEIRA - OBJETO DO CONTRATO</Text>
                    <Text style={styles.text}>
                        1.1 O presente contrato tem como objeto a prestação, pelo CONTRATADO, dos serviços de gestão de ativos e assessoria financeira, conforme solicitado pelo CONTRATANTE.
                    </Text>

                    <Text style={styles.clauseTitle}>CLÁUSULA SEGUNDA - PRAZO</Text>
                    <Text style={styles.text}>
                        2.1 O presente contrato terá início na data de sua assinatura e vigência por prazo indeterminado, podendo ser prorrogado mediante acordo entre as partes.
                    </Text>

                    <Text style={styles.clauseTitle}>CLÁUSULA TERCEIRA - REMUNERAÇÃO</Text>
                    <Text style={styles.text}>
                        3.1 Pela prestação dos serviços, o CONTRATANTE pagará ao CONTRATADO os valores acordados em propostas anexas ou tabelas de serviços vigentes no momento da contratação.
                    </Text>

                    <Text style={styles.clauseTitle}>CLÁUSULA QUARTA - OBRIGAÇÕES DO CONTRATADO</Text>
                    <Text style={styles.text}>
                        4.1 O CONTRATADO se obriga a executar com diligência, responsabilidade e dentro dos prazos acordados todas as informações e documentos a que tiver acesso em razão deste contrato.
                    </Text>

                    <Text style={styles.clauseTitle}>CLÁUSULA QUINTA - OBRIGAÇÕES DO CONTRATANTE</Text>
                    <Text style={styles.text}>
                        5.1 O CONTRATANTE se compromete a fornecer todas as informações e documentos necessários para a execução dos serviços descritos na Cláusula Primeira, bem como garantir acesso aos locais, plataformas ou sistemas indispensáveis à realização das atividades contratadas.
                    </Text>

                    <Text style={styles.clauseTitle}>CLÁUSULA SEXTA - RESCISÃO</Text>
                    <Text style={styles.text}>
                        6.1 O presente contrato poderá ser rescindido por qualquer uma das partes, mediante notificação prévia por escrito com antecedência mínima de 30 dias.
                    </Text>
                    <Text style={styles.text}>
                        6.2 Em caso de descumprimento de quaisquer cláusulas, a parte prejudicada, o CONTRATANTE ou CONTRATADO, poderá rescindir o contrato de forma imediata, sem prejuízo das medidas legais cabíveis.
                    </Text>
                </View>

                <Text style={{ marginTop: 30 }}>São Paulo, {dataAtual}</Text>

                {/* Signatures */}
                <View style={styles.signatureContainer}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text>Assinatura do Contratado</Text>
                        <Text style={{ fontSize: 8 }}>{cliente.nome_fantasia || cliente.razao_social}</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text>Assinatura do Contratante</Text>
                        <Text style={{ fontSize: 8 }}>Representante da Empresa</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default ContractPDF;
