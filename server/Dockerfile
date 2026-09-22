FROM node:22-slim

# Dependências do sistema (OpenSSL necessário para Prisma Client e CA certs para conexões TLS)
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia manifestos de dependência e configurações
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma.config.ts* ./

# Instala dependências
RUN npm install

# Copia schemas do Prisma e código-fonte
COPY prisma ./prisma
COPY src ./src

# Gera clientes do Prisma e compila o TypeScript
RUN npx prisma generate --schema=prisma/schema.prisma && \
    npx prisma generate --schema=prisma/schema.tenant.prisma && \
    npm run build

# Cria diretório para uploads
RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "--dns-result-order=ipv4first", "dist/index.js"]
