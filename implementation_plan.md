# Plano de Organização e Limpeza do Projeto

## Objetivo
Analisar e corrigir a estrutura de pastas do projeto, removendo duplicações e diretórios desnecessários para manter a árvore de arquivos limpa e organizada.

## Análise Atual
Foi identificada a existência de uma pasta aninhada redundante `fncd-capital` dentro do diretório raiz. Além disso, existe uma pasta `src` na raiz que aparentemente não está sendo utilizada conforme o padrão do projeto (o código fonte principal está em `components`, `server`, etc).

### Diretórios Identificados para Remoção:
1. **`c:\Projeto Code IA\fncd-capital\fncd-capital`**: Pasta duplicada contendo uma cópia recursiva do projeto.
2. **`c:\Projeto Code IA\fncd-capital\src`**: Pasta contendo apenas subpastas vazias (`lib`), sem uso prático no projeto atual.

## Plano de Ação

### 1. Remoção de Redundâncias
- **Excluir** o diretório `fncd-capital` (aninhado).
- **Excluir** o diretório `src` (raiz).

### 2. Estrutura Final Pretendida
Após a limpeza, o projeto manterá a seguinte estrutura limpa:

```
/ (Raiz)
├── arquivos/        -> Armazenamento local
├── components/      -> Frontend React (Admin, Consultant, Client, Shared)
├── DOC/             -> Documentação
├── lib/             -> Configuração Supabase Frontend
├── media/           -> Assets de mídia
├── public/          -> Arquivos estáticos
├── server/          -> Backend API (Node/Fastify)
├── services/        -> Integrações (BrasilAPI, etc)
├── utils/           -> Utilitários
└── arquivos de config (Dockerfile, package.json, etc)
```

## Verificação
- Garantir que nenhum arquivo único ou não versionado exista apenas na pasta a ser excluída. A análise confirmou que o conteúdo é duplicado.
