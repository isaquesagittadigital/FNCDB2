import axios from 'axios';

interface ViaCEPResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
}

export const fetchAddressByCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
    try {
        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length !== 8) return null;

        const response = await axios.get(`https://viacep.com.br/ws/${cleanCEP}/json/`);

        if (response.data.erro) {
            return null;
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching address:', error);
        return null;
    }
};
