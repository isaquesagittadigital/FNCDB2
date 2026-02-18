# Log de Implementações e Alterações (16/02/2026 - 18/02/2026)

Este documento resume as atividades de desenvolvimento, novas funcionalidades e refatorações realizadas no projeto **FNCD Capital** durante o período de 16 a 18 de fevereiro de 2026.

## 1. Módulo de Beneficiários: Setor de Doações

*   **Novos Componentes:**
    *   `DonationForm.tsx`: Formulário para cadastro de doações de itens avulsos.
    *   `StockDonationForm.tsx`: Formulário para doação de cestas pré-definidas (controle de estoque).
*   **Funcionalidades:**
    *   Integração da seção de "Doações" no perfil do beneficiário.
    *   Busca de itens/cestas, definição de quantidades, observações e marcação de urgência.

## 2. Gestão de Contratos e Comprovantes

*   **Melhorias de UI/UX:**
    *   Refatoração do modal de upload de comprovantes para melhor experiência visual.
    *   Substituição de diálogos nativos do navegador (`window.confirm`) por um componente customizado `ConfirmDialog` (visual moderno com Framer Motion).
*   **Lógica de Negócio:**
    *   Implementação de regras visuais para exibição de comprovantes e status de aprovação.

## 3. Fluxo de Resgate (Redemption)

*   **Banco de Dados:**
    *   Criação da tabela `resgates` no Supabase via migração.
    *   Definição de colunas: `contrato_id`, `consultor_id`, `valor_solicitado`, `motivo`, `pix_chave`, etc.
*   **Componentes:**
    *   `RedeemRequestModal.tsx`: Modal para o cliente solicitar o resgate (parcial ou total).
    *   `RedeemViewModal.tsx`: Modal para visualização dos detalhes da solicitação realizada.
*   **Notificações (Email):**
    *   Criação do template de email `ConsultantResgateEmail.tsx` (React Email).
    *   Implementação do envio automático de email para o consultor quando um cliente solicita resgate.

## 4. Fluxo de Renovação (Renewal)

*   **Lógica de Visibilidade:**
    *   Ajuste nas regras de exibição do card "Renovação Contratual":
        *   **Clientes:** Visível apenas 2 meses antes do vencimento.
        *   **Consultores/Admins:** Visível sempre que houver uma solicitação existente (histórico).
*   **Integração:**
    *   Conexão com a tabela `renovacoes` para buscar status em tempo real.

## 5. Refatoração do Painel do Consultor

*   **Visualização de Contratos (`ContractsView.tsx`):**
    *   Remoção do botão de ação "Visualizar" (ícone de olho).
    *   Implementação de interação via **clique na linha da tabela** (`tr onClick`) para abrir detalhes.
    *   Cursor pointer adicionado às linhas para indicar interatividade.
*   **Modal de Detalhes Dedicado:**
    *   **Criação do componente `ConsultantContractDetailModal.tsx`**:
        *   Cópia isolada e adaptada do modal original (`ContractDetailModal.tsx`).
        *   Localizado em `components/consultant/modals/`.
        *   Objetivo: Permitir customizações exclusivas para a visão do consultor sem impactar a visão do cliente ou admin.
    *   Ajuste nos imports para garantir funcionamento correto no novo diretório.
    *   Integração completa deste novo modal ao fluxo de listagem de contratos.

## 6. Segurança e Permissões (RLS)

*   **Políticas de Acesso (Row Level Security):**
    *   Criação/Atualização de políticas para as tabelas `resgates` e `renovacoes`.
    *   Permissão para que **Consultores** possam visualizar (`SELECT`) solicitações vinculadas aos seus contratos/clientes (arquivo `consultant_policies.sql`).
    *   Correção de bugs onde o consultor não via solicitações devido a bloqueios do RLS.

---
**Status Atual:** O sistema possui fluxos completos de doação, upload de comprovantes, solicitação de resgate (com email) e renovação. O painel do consultor foi desacoplado visualmente, possuindo agora seus próprios componentes de modal para maior flexibilidade futura.
