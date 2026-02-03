
export interface Bank {
    ispb: string;
    name: string;
    code: number;
    fullName: string;
}

export interface CNPJData {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    data_inicio_atividade: string; // yyyy-mm-dd
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    ddd_telefone_1: string;
    qsa: { nome_socio: string; qualificador_socio: string }[];
}

export interface CepData {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

export const api = {
    getBanks: async (): Promise<Bank[]> => {
        try {
            const response = await fetch('https://brasilapi.com.br/api/banks/v1');
            if (!response.ok) throw new Error('Falha ao buscar bancos');
            return await response.json();
        } catch (error) {
            console.error('Error fetching banks:', error);
            return [];
        }
    },

    getCnpj: async (cnpj: string): Promise<CNPJData | null> => {
        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return null;

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error fetching CNPJ:', error);
            return null;
        }
    },

    getCep: async (cep: string): Promise<CepData | null> => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return null;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();
            if (data.erro) return null;
            return data;
        } catch (error) {
            console.error('Error fetching CEP:', error);
            return null;
        }
    }
};
