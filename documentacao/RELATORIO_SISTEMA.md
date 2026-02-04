# Relatório de Análise do Sistema - FNCD Capital

Este relatório apresenta um resumo detalhado de todos os componentes, funcionalidades e tecnologias integradas ao sistema FNCD Capital até o momento.

---

## 🚀 1. Stack Tecnológica

O sistema utiliza arquitetura moderna e escalável:

- **Frontend:**
  - **Framework:** React.js (v19) + TypeScript.
  - **Build Tool:** Vite.
  - **Estilização:** Tailwind CSS (layouts) + Vanilla CSS (estilos específicos).
  - **Animações:** Framer Motion.
  - **Ícones:** Lucide React.
  - **Componentes PDF:** @react-pdf/renderer.
  - **Comunicação:** Axios e Supabase SDK.

- **Backend:**
  - **Plataforma:** Node.js + Fastify + TypeScript.
  - **Integrações:** Supabase (Auth, DB, Storage).
  - **Serviços Externos:** BrasilAPI (CNPJ/Bancos) e ViaCEP.

- **Banco de Dados:**
  - **Engine:** PostgreSQL (via Supabase).
  - **Segurança:** RLS (Row Level Security) e RBAC (Role-Based Access Control).

- **Infraestrutura:**
  - **Docker:** Suporte para Frontend e Backend.
  - **Easypanel:** Configuração pronta para deploy em nuvem.

---

## 📂 2. Estrutura do Projeto

### 🎨 Frontend (`/components`)
Organizado por fluxos de experiência do usuário:
- **`admin/`**: Gestão completa de clientes, consultores, contratos e aprovação de notas fiscais.
- **`consultant/`**: Painel do consultor para prospecção, gestão de carteira e perfil pessoal.
- **`client/`**: Portal do investidor para visualização de patrimônio e documentos.
- **`auth/`**: Login unificado, seleção de ambiente e recuperação de senha.
- **`shared/`**: Componentes reutilizáveis (Modais, UI, Contextos de Permissão).
- **`layout/`**: Estruturas globais (Sidebar, Header, DashboardLayout).

### ⚙️ Backend (`/server`)
- **`routes/`**:
  - `admin.routes.ts`: Endpoints administrativos (CRUDs de Clientes/Consultores, Gestão de Contratos, Permissões).
  - `auth.routes.ts`: Lógica de autenticação e sessão.
- **`services/`**: Lógica de suporte como envio de e-mails de boas-vindas.

---

## 🗄️ 3. Banco de Dados (Tabelas Principais)

O sistema opera sobre as seguintes tabelas no Supabase:

- **`usuarios`**: Tabela centralizada para Perfis (Admin, Consultor, Cliente). Armazena dados cadastrais, de endereço e nível de acesso.
- **`meu_consultor`**: Relacionamento N:1 entre Clientes e Consultores.
- **`contas_bancarias`**: Dados para faturamento e repasses.
- **`contratos`**: Registro de documentos contratuais vinculados aos clientes.
- **`permissoes_usuario`**: Configuração granular de permissões por módulo (Visualizar, Cadastrar, Editar, Excluir).
- **`investimento_aluno`**: Registro de aportes e rendimentos (base para o Dashboard do Cliente).
- **`propositos`**: Sistema de metas/categorias associadas aos planos dos usuários.

---

## 🔄 4. Fluxos de Trabalho Implementados

1. **Gestão de Usuários:** Criação manual pelo admin com geração de link de recuperação e e-mail automático.
2. **RBAC:** Sistema que permite ao administrador definir exatamente o que cada usuário pode fazer em cada módulo.
3. **Dashboards Dinâmicos:** 
   - Admin vê KPIs globais.
   - Consultor vê métricas de sua carteira.
   - Cliente vê evolução de seus ativos.
4. **Segurança:** Bloqueio de acesso via Auth e Soft-Delete (inativação) de usuários.
5. **Automação:** Máscaras de formulários, validação via Zod e preenchimento automático de endereços via CEP.

---

## 📝 5. Documentação Existente
- `documentacao/documentacao_projeto.md`: Guia técnico de arquitetura e arquivos.
- `/documentacao`: Pasta contendo o presente relatório e demais guias.

---
*Relatório gerado em 04 de fevereiro de 2026.*
