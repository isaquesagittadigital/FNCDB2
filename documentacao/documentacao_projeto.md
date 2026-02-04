Documentação do Sistema - FNCD Capital

Este documento detalha a arquitetura, estrutura e os diferentes ambientes (fluxos) do sistema FNCD Capital.

---

🏗️ Visão Geral Tecnológica

O sistema é uma plataforma web moderna para gestão de investimentos e faturamento, construída com as seguintes tecnologias:

Frontend: React.js com TypeScript.
Estilização: Tailwind CSS para layout e componentes personalizados com animações em Framer Motion.
Backend: Node.js com Fastify e TypeScript.
Banco de Dados / Auth: Supabase (PostgreSQL, Authentication, Storage).
- Icons: Lucide React.
- APIs Externas: BrasilAPI (CNPJ, Bancos) e ViaCEP.

---

📂 Estrutura de Ambientes (Roles)

O sistema é dividido em três ambientes principais, baseados no perfil do usuário logado:

1. 🛡️ Ambiente Administrador (`AdminFlow`)
O controle central do sistema.
Dashboard: KPIs em tempo real (Total investido, Nº de consultores/clientes).
Gestão de Clientes: CRUD completo, incluindo dados de acesso, endereço, e contratos vinculados.
estão de Consultores: Cadastro de consultores, definição de metas de comissionamento e equipe.
Faturamento: Aprovação de Notas Fiscais, visualização de anexos e controle de status.
Relatórios: Visão analítica de carteira e comissões.

2. 🤝 Ambiente Consultor (`ConsultantFlow`)
Foco na prospecção e gestão de sua própria carteira.
Dashboard Personalizado: Visualização de métricas de seus clientes.
Cadastros: Registro de Clientes, Contratos e Notas Fiscais (com os dados dos seus clientes).
Aprovação: Área para acompanhamento de documentos pendentes.
Perfil (Meus Dados):
Dados de Acesso: Editáveis (Login, Senha, Foto).
Dados Cadastrais: Somente leitura (Gerais, Endereço, Bancário).
Suporte: Botão de solicitação de alteração de dados via email para o administrador.

3. 👤 Ambiente Cliente (`ClientFlow`)
Visualização transparente para o investidor.
Dashboard de Investimentos: Visualização da evolução do patrimônio.
Carteira: Detalhamento de ativos e rendimentos.
Documentos: Download de contratos assinados e informes.

📁 Estrutura Detalhada de Arquivos (por Fluxo)

Abaixo estão listados os principais arquivos organizados por ambiente e responsabilidade.

🏛️ Base e Layout (Compartilhado)
Ponto de entrada e estruturas que compõem a moldura do sistema.
- `App.tsx`: Gerenciador de rotas e estado global de autenticação.
- `index.tsx`: Entrada principal do React.
- `components/layout/`:
    - `DashboardLayout.tsx`: Container principal das páginas internas.
    - `Header.tsx`: Barra superior com notificações e perfil.
    - `Sidebar.tsx`: Menu lateral adaptativo por role.
- `components/shared/ui/`:
    - `FormElements.tsx`: Componentes de input, select e campos mascarados.
    - `SplashScreen.tsx`: Tela de carregamento inicial.

🛡️ Ambiente Administrador (`components/admin`)
- `AdminFlow.tsx`: Orquestrador das abas administrativas.
- `menu.ts`: Definição dos itens do menu lateral do admin.
- `dashboard/`:
    - `AdminDashboard.tsx`: Visão geral com KPIs.
    - `EvolutionChart.tsx`: Gráfico de crescimento (se aplicável).
    - `KPICards.tsx`: Cards de métricas rápidas.
- `clients/`: Gestão completa de base de clientes.
- `consultants/`: Gestão de equipe e comissões.
- `invoices/`:
    - `InvoicesView.tsx`: Tela principal de notas.
    - `InvoiceApprovalModal.tsx`: Interface de decisão de aprovação.
- `users/`: Gestão de usuários do sistema e permissões.

🤝 Ambiente Consultor (`components/consultant`)
- `ConsultantFlow.tsx`: Orquestrador das abas do consultor.
- `ConsultantProfileView.tsx`: Gestão de perfil (Modo Leitura + Acesso).
- `menu.ts`: Itens de menu específicos do consultor.
- `ConsultantDashboard.tsx`: Performance individual do consultor.
- `ClientsView.tsx` / `ContractsView.tsx`: Gestão da própria carteira.

👤 Ambiente Cliente (`components/client`)
- `ClientFlow.tsx`: Fluxo simplificado para investidores.
- `ClientDashboard.tsx`: Resumo de investimentos e evolução.
- `menu.ts`: Menu limitado a visualização e documentos.

🔑 Autenticação e Portas (`components/auth`)
- `LoginForm.tsx`: Login unificado.
- `EnvironmentSelection.tsx`: Escolha de role para usuários multi-perfil.
- `ForgotPassword.tsx`: Recuperação de conta.

⚙️ Backend e Serviços (`server` & `services`)
- `server/src/index.ts`: Ponto de entrada da API.
- `server/src/routes/`:
    - `admin.routes.ts`: Endpoints de gestão e faturamento.
    - `auth.routes.ts`: Lógica de sessão e token.
- `services/api.ts`: Cliente Axios/Fetch para APIs de CNPJ, CEP e Bancos.
- `lib/supabase.ts`: Instância e configuração do SDK Supabase.

---

📁 Estrutura de Pastas e Componentes (Resumo)

Abaixo apresentamos a árvore completa de diretórios do projeto e suas finalidades:

`/` (Raiz): Contém arquivos de configuração global (Docker, Vite, Git, TSConfig, Easypanel).
`/arquivos`: Diretório destinado ao armazenamento local de documentos e anexos.
`/components`: Núcleo da interface do usuário, subdividido por fluxos:
`/admin`: Módulos administrativos (Aprovações, Clientes, Consultores, Contratos, Dashboard, Usuários).
`/approval/modals`: Modais específicos do fluxo de compliance.
`/clients/tabs`: Abas do formulário de edição de cliente.
`/clients/wizard`: Fluxo de cadastro passo-a-passo.
`/consultants/tabs`: Abas do formulário de consultor.
`/auth`: Componentes de login, seleção de ambiente e recuperação de conta.
`/client`: Componentes exclusivos do portal do investidor.
`/consultant`: Componentes exclusivos do portal do consultor e perfil.
`/layout`: Estruturas globais (Sidebar, Header, DashboardLayout).
`/shared`: Componentes reutilizáveis entre todos os fluxos:
`/contexts`: Contextos do React (ex: Permissões).
`/modals`: Modais genéricos (Sucesso, Confirmação, Detalhes).
`/profile`: Sub-componentes das abas de perfil (Acesso, Endereço, Banco).
`/ui`: Elementos de interface base (Inputs, Logos, Spinners, Splash).
`/simulator`: Componentes do simulador de investimentos.
`/DOC`: Documentação técnica e funcional do projeto.
`/lib`: Configurações de bibliotecas externas (Supabase SDK).
`/media`: Armazenamento de assets de mídia estáticos.
`/public`: Arquivos públicos servidos diretamente (Favicon, Logos, Assets).
`/assets/logos`: Coleção de logotipos da marca.
`/server`: Código-fonte do Backend (Node.js/Fastify):
`/src`: Código principal:
`/routes`: Definição dos endpoints REST da aplicação.
`/lib`: Conectores de banco e utilitários de servidor.
`/scripts`: Scripts de automação (Criação de tabelas, Seed de dados).
`/services`: Serviços de apoio (Envio de e-mail, etc).
`/services`: Abstrações de serviços de integração Frontend (BrasilAPI, ViaCEP).
`/src`: Código experimental ou utilitários legados.
`/utils`: Funções utilitárias globais (Formatação de moeda, datas, validações).

🚀 Infraestrutura e Deploy

O sistema está preparado para ambientes de produção modularizados via Docker:
`Dockerfile`: Configuração de build (Vite/Node) e servidor web (Nginx).
`docker-compose.yml`: Orquestra o Frontend e o Backend localmente.
`easypanel.json`: Template de instalação automatizada para o painel de nuvem **Easypanel**.

---

🔒 Segurança e Regras de Negócio

RBAC (Role Based Access Control): Controle de acesso rigoroso baseado na role (`Admin`, `Consultor`, `Cliente`).
Validação de Dados: Máscaras de CPF/CNPJ, CEP e Telefone em todos os formulários.
Auditoria: O administrador é o único responsável pela alteração de dados bancários e de comissionamento de consultores.

---

*Documento atualizado em: 04 de Fevereiro de 2026.*
