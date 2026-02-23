# Documentação: Fluxo de Dividendos e Comissões na FNCD Capital

Este documento aborda o fluxo, a lógica e o status dos valores financeiros distribuídos entre os **Clientes**, **Consultores** (Comissões Diretas) e **Líderes de Consultores** (Comissões de Liderança), detalhando como os registros operam e são visualizados hoje pelo sistema.

A FNCD Capital gerencia esses vencimentos via banco de dados (Supabase) sob a tabela unificada chamada `calendario/pagamentos`.

---

## 1. Regra e Fluxo de Clientes (Dividendos)

### Quando e como é criado:
Quando um novo **Contrato** é emitido e seu status se torna **Vigente**, a lógica processa a quantia de investimento inicial (`valor_aporte`) multiplicada pela rentabilidade mensal estipulada (`taxa_mensal`).

**Geração dos Lançamentos:**
As parcelas são criadas mês a mês durante toda a duração (ex: 6 meses, 12 meses) no calendário do cliente. 
- Durante meses intermédios, o valor pago representa o rendimento exato do mês sobre o montante investido.
- Em meses fracionados (primeiro ou último mês, dependendo dos dias até o "Dia de Pagamento", o famoso *“pro-rata”*), os dividendos sofrem uma proporção baseada nos dias correntes.

**Como identificar na tabela:**
Na tabela `calendario/pagamentos`, a transação do cliente tem a coluna identificadora `dividendos_clientes = true`, e o valor monetário na coluna `valor`.

**Visualização na Aplicação:**
A rota `GET /api/admin/calendar-payments` assegura que os clientes visualizem apenas registros onde seus IDs de cliente coincidem com os pagamentos gerados atrelados ao que está apenas na classificação `"Vigente"`.

---

## 2. Fluxo do Consultor (Comissões Diretas)

### Quando e como é criado:
A comissão do **Consultor** é vinculada como contrapartida à entrada do aporte do cliente prospectado por ele (o `consultor_id` preenchido no Contrato).

**Geração dos Lançamentos:**
Os lançamentos não são isolados, mas seguem parceladamente o ciclo vitalício e pagador do contrato do cliente. Assim, o consultor recebe "pingos" de comissão mês a mês, desde que o investidor final pague a mensalidade/mantenha o fundo na empresa, ou sob uma taxa predefinida no momento que o aporte cai. 

**Como identificar na tabela:**
Sempre que o registro na base for característico do agenciador do contrato, a flag `comissao_consultor = true` é setada, e o respectivo `consultor_id` acompanha a linha, sob o exato montante na coluna `valor`. Em alguns meses o evento recebe a flag `evento = "Comissão Mês"`.

**Visualização na Aplicação (Calendário & Nota Fiscal):**
Nos dois portais — Calendário e Notas Fiscais —, a aplicação faz a somatória universal através do comando:
1. Filtra-se via GET apenas os contratos cujo status foi batido como `Vigente` perante o sistema;
2. Se o consultor estiver no ID listado em `consultor_id` das parcelas liberadas, soma tudo em uma linha cronológica separada por mês.

---

## 3. Fluxo do Consultor Líder (Comissões de Liderança)

### Quando e como é criado:
A plataforma recompensa níveis hierárquicos. Contratos trazidos à casa onde um consultor base pertence a uma equipe supervisionada (o `lider_id` inserido no cadastro do consultor ou no contrato fixo), gera dividendos para a figura sênior.

**Como identificar na tabela:**
A FNCD espelha uma parcela fracionária do `valor` do evento à conta do Líder. Essa verba constará com a flag booleana `comissao_consultor_lider = true`. Neste caso, o "Consultor Líder" não fica fixado como o agenciador direto necessariamente, mas como o `lider_id` associado ao ecossistema do contrato.

**Visualização na Aplicação:**
A rota de verificação foi recém atualizada para que, sempre que o sistema baixar a lista global de contratos pagantes aos Consultores, faça um `OR`:

> `if (contrato.consultor_id == SEU_ID || contrato.lider_id == SEU_ID) e Status == "Vigente"`

Isso amarra logicamente para que os Líderes não percam os valores nas suas Notas Fiscais e Calendários sempre que seus liderados produzirem.

---

## 4. Análise Técnica e do Backend (React/Node.js + Supabase)

### Estado do Backend:
Analisando as tabelas e o backend rodando via MCP, aqui está o que roda por debaixo dos panos:

- **Contratos:** Localizada na API `/api/admin/contracts`, essa API gerencia todo o ciclo de vida. O Frontend insere o Payload informando tanto o `user_id` (Cliente) quanto o `consultor_id` e salva.
- **Webhook de Assinatura:** Existe um listener no backend (em `webhook.routes.ts`) que percebe quando todas as assinaturas rolam via **Clicksign**. Uma vez que o Clicksign acusa `envelope.closed`, automaticamente o sistema transpõe o Status para `"Assinado"`, gravando os *logs* sem intervenção humana.
- **Gerador de Parcela:** Hoje, as inserções diretas em `calendario/pagamentos` fluem externas a um processo unificado local; elas ocorrem majoritariamente por importações nativas / manipulação direta de backoffice e via cronograma de Bubble. O array resultante contém flags perfeitas mapeando quem engatilhou o pagamento (se foi originário de `lider`, `cliente` ou `consultor base`).

### Resumo Lógico Final
A segurança foi reforçada em `admin.routes.ts` (`server.get('/calendar-payments')`). Hoje, qualquer quantia de dinheiro transacionada em gráficos não reflete o histórico bruto isolado (pois contratos "Cancelados" ou ex-clientes mostravam valores na tela). 

A requisição atual lê todas as linhas devidas de pagamento sob o banco de dados; mas **antes de entregar ao aplicativo**, bate à porta da tabela `contratos` confirmando se a vigência real é legítima, para só depois renderizar o total no seu Dashboard Financeiro para geração das faturas e notas.
