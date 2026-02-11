export const fetchBanks = async (): Promise<{ code: string; name: string }[]> => {
    try {
        const response = await fetch('https://brasilapi.com.br/api/banks/v1');
        if (!response.ok) throw new Error('Failed to fetch banks');
        const data = await response.json();

        return data
            .map((bank: any) => ({
                code: bank.code,
                name: bank.name || bank.fullName
            }))
            .sort((a: any, b: any) => {
                // Priority banks
                const priorityCodes = ['001', '237', '341', '033', '104', '260', '077'];
                const aPriority = priorityCodes.indexOf(a.code?.toString());
                const bPriority = priorityCodes.indexOf(b.code?.toString());

                if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
                if (aPriority !== -1) return -1;
                if (bPriority !== -1) return 1;

                return a.name.localeCompare(b.name);
            });
    } catch (error) {
        console.error('Error fetching banks:', error);
        // Fallback list
        return [
            { code: "001", name: "Banco do Brasil S.A." },
            { code: "237", name: "Banco Bradesco S.A." },
            { code: "341", name: "Itaú Unibanco S.A." },
            { code: "033", name: "Banco Santander (Brasil) S.A." },
            { code: "104", name: "Caixa Econômica Federal" },
            { code: "260", name: "Nu Pagamentos S.A." },
            { code: "077", name: "Banco Inter S.A." },
            { code: "212", name: "Banco Original S.A." },
            { code: "655", name: "Banco Votorantim S.A." },
            { code: "422", name: "Banco Safra S.A." },
            { code: "748", name: "Banco Cooperativo Sicredi S.A." },
            { code: "756", name: "Banco Cooperativo do Brasil S.A. - BANCOOB" },
            { code: "633", name: "Banco Rendimento S.A." },
            { code: "041", name: "Banco do Estado do Rio Grande do Sul S.A." },
            { code: "047", name: "Banco do Estado de Sergipe S.A." },
            { code: "037", name: "Banco do Estado do Pará S.A." },
            { code: "036", name: "Banco Bradesco BBI S.A." },
        ];
    }
};
