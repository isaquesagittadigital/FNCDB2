-- Migration: Adicionar campos à tabela renovacoes
-- Execute no Supabase SQL Editor

ALTER TABLE renovacoes ADD COLUMN IF NOT EXISTS periodo_meses INTEGER;
ALTER TABLE renovacoes ADD COLUMN IF NOT EXISTS data_vencimento TIMESTAMPTZ;
ALTER TABLE renovacoes ADD COLUMN IF NOT EXISTS data_renovacao TIMESTAMPTZ;
ALTER TABLE renovacoes ADD COLUMN IF NOT EXISTS nome_autorizador TEXT;
ALTER TABLE renovacoes ADD COLUMN IF NOT EXISTS email_autorizador TEXT;
