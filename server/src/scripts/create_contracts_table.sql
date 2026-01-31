
CREATE TABLE IF NOT EXISTS contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    data_assinatura TIMESTAMPTZ,
    arquivo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON contratos FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON contratos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
