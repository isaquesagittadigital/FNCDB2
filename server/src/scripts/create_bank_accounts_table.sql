
-- Create contas_bancarias table if not exists
CREATE TABLE IF NOT EXISTS contas_bancarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    banco VARCHAR(255) NOT NULL,
    agencia VARCHAR(20) NOT NULL,
    digito_agencia VARCHAR(5),
    conta VARCHAR(20) NOT NULL,
    digito_conta VARCHAR(5),
    tipo_conta VARCHAR(20), -- 'Corrente', 'Poupança', etc.
    cpf_cnpj VARCHAR(20),
    titular VARCHAR(255),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Simplistic for now, assuming service role or admin access)
ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON contas_bancarias FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON contas_bancarias FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON contas_bancarias FOR UPDATE USING (auth.uid() = user_id);
