# Guia de Deploy: Backend no Render.com

Este guia explica como colocar sua API Node.js/Prisma no ar gratuitamente no Render.

## 1. Preparação no GitHub
Certifique-se de que a pasta `server/` está na raiz do seu repositório ou que você configurou o Render para olhar para essa subpasta.

## 2. Configurações no Render
1. No Dashboard do Render, clique em **New +** e selecione **Web Service**.
2. Conecte seu repositório do GitHub.
3. Preencha as configurações básicas:
    - **Name:** `vigia-saude-api`
    - **Runtime:** `Node`
    - **Root Directory:** `server` (Muito importante!)
    - **Build Command:** `npm install && npx prisma generate && npm run build`
    - **Start Command:** `npm start`

## 3. Variáveis de Ambiente (Environment Variables)
Clique na aba **Environment** e adicione as seguintes chaves (copie do seu `.env` local):

- `DATABASE_URL`: URL do Supabase (Transaction Mode - Porta 6543)
- `DIRECT_URL`: URL do Supabase (Session Mode - Porta 5432)
- `JWT_SECRET`: Sua chave secreta de tokens
- `NODE_ENV`: `production`

## 4. Finalização
Clique em **Create Web Service**. O Render irá baixar seu código, rodar o build do Prisma e iniciar o servidor. 
Anote a URL gerada (ex: `https://vigia-saude-api.onrender.com`), você precisará dela no Frontend.
