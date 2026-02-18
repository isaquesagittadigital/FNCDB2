-- Tabela de Resgates
CREATE TABLE IF NOT EXISTS public.resgates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    consultor_id UUID REFERENCES public.usuarios(id),
    status TEXT DEFAULT 'Pendente', -- Pendente, Aprovado, Recusado, Pago
    data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    
    -- Campos específicos de resgate
    valor_resgate NUMERIC NOT NULL,
    tipo_resgate TEXT NOT NULL, -- 'Integral' ou 'Parcial'
    
    -- Campos de auditoria/aprovação
    nome_autorizador TEXT,
    email_autorizador TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.resgates ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Cliente vê seus próprios resgates
CREATE POLICY "Usuarios podem ver seus proprios resgates" 
    ON public.resgates FOR SELECT 
    USING (auth.uid() = user_id);

-- Cliente cria solicitações
CREATE POLICY "Usuarios podem criar solicitacoes de resgate" 
    ON public.resgates FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Admins/Backend (Service Role) têm acesso total por padrão (bypass RLS)
-- Se precisar de acesso via Client para Admins, usar a tabela de permissões correta
-- Por enquanto, vou deixar apenas acesso do proprietário dados, pois o Admin usa a API (Service Role)
