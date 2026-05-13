# Guia de Deploy: Frontend na Vercel

Este guia explica como hospedar o frontend React (Vite) na Vercel.

## 1. Configurações na Vercel
1. No dashboard da Vercel, clique em **Add New > Project**.
2. Importe seu repositório do GitHub.
3. Configure o projeto:
    - **Framework Preset:** `Vite`
    - **Root Directory:** `./` (ou selecione a pasta onde está o `package.json` do frontend)
    - **Build Command:** `npm run build`
    - **Output Directory:** `dist`

## 2. Variáveis de Ambiente
Na seção **Environment Variables**, adicione:

- `VITE_API_URL`: A URL da API que você acabou de criar no Render (ex: `https://vigia-saude-api.onrender.com`)

## 3. Corrigindo o Erro 404 (React Router)
Como o React Router gerencia as rotas no navegador, se você atualizar a página em `/dashboard`, a Vercel tentará buscar um arquivo físico chamado `dashboard` e dará erro 404.

Para resolver isso, já incluímos o arquivo **`vercel.json`** na raiz do projeto com a seguinte regra:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Isso diz à Vercel para sempre carregar o `index.html` e deixar o React Router decidir o que exibir.

## 4. Finalização
Clique em **Deploy**. Sua aplicação estará online em instantes!
