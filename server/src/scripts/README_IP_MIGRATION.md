# Migração: Adicionar coluna ip_address

## Descrição
Esta migração adiciona a coluna `ip_address` à tabela `user_onboarding` para armazenar o endereço IP do dispositivo que realizou a confirmação das declarações.

## Como executar

### Opção 1: Via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `add_ip_address_column.sql`
4. Execute o script

### Opção 2: Via CLI do Supabase
```bash
supabase db push
```

### Opção 3: Manualmente via psql
```bash
psql -h [seu-host] -U [seu-usuario] -d [seu-database] -f add_ip_address_column.sql
```

## Verificação
Após executar a migração, verifique se a coluna foi criada:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_onboarding' 
AND column_name = 'ip_address';
```

## Rollback
Se necessário reverter a migração:

```sql
ALTER TABLE user_onboarding DROP COLUMN IF EXISTS ip_address;
```
