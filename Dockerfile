# Estágio de Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependência
COPY package.json package-lock.json ./

# Instalar dependências
# Nota: Se houver package-lock.json, copie-o também e use 'npm ci'
RUN npm install

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
