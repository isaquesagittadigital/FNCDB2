
# Estágio de Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependência
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm install

# Argumentos de build para o Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

# Copiar o restante do código fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Estágio de Produção
FROM nginx:alpine

# Copiar a configuração do Nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos estáticos gerados no build para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80

# Comando padrão para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
