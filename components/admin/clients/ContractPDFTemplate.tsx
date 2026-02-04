import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font, Image } from '@react-pdf/renderer';

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
                <View style={styles.header}>
                    <Text style={styles.title}>CONTRATO</Text>
                    <View style={styles.titleContainer}>
                        <Text style={styles.subtitle}>PRESTAÇÃO DE SERVIÇO</Text>
                    </View>
                </View>

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
