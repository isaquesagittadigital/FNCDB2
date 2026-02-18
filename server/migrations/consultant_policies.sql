-- Políticas de acesso para Consultores

-- Resgates: Consultor pode ver se estiver vinculado (consultor_id)
CREATE POLICY "Consultores podem ver resgates vinculados" 
    ON public.resgates FOR SELECT 
    USING (consultor_id = auth.uid());

-- Renovações: Consultor pode ver se o contrato for dele
CREATE POLICY "Consultores podem ver renovacoes de seus contratos" 
    ON public.renovacoes FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.contratos c 
            WHERE c.id = renovacoes.contrato_id 
            AND c.consultor_id = auth.uid()
        )
    );
