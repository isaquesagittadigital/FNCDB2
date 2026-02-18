-- =====================================================
-- Migration: Create renovacoes table
-- Tabela de solicitações de renovação de contrato
-- =====================================================

CREATE TABLE IF NOT EXISTS renovacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Pendente',
    valor_renovacao NUMERIC(15,2),
    taxa_renovacao NUMERIC(5,2),
    data_solicitacao TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_aprovacao TIMESTAMPTZ,
    aprovado_por UUID REFERENCES auth.users(id),
    observacoes TEXT,
    novo_contrato_id UUID REFERENCES contratos(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index para buscar renovações por contrato
CREATE INDEX IF NOT EXISTS idx_renovacoes_contrato_id ON renovacoes(contrato_id);

-- Index para buscar renovações por usuário
CREATE INDEX IF NOT EXISTS idx_renovacoes_user_id ON renovacoes(user_id);

-- Index para filtrar por status
CREATE INDEX IF NOT EXISTS idx_renovacoes_status ON renovacoes(status);

-- Enable RLS
ALTER TABLE renovacoes ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own renewals
CREATE POLICY "Users can view own renewals"
    ON renovacoes FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: users can insert their own renewals
CREATE POLICY "Users can request renewals"
    ON renovacoes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: service role can do everything (for admin operations)
CREATE POLICY "Service role full access on renovacoes"
    ON renovacoes FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');
