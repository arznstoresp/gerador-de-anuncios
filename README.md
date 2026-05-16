# ArznStoreSP — Gerador de Anúncios Shopee 2026

## Deploy no Render.com (Gratuito)

### Variáveis de Ambiente — configurar no painel do Render

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave Anthropic (Claude) — obrigatória |
| `OPENAI_API_KEY` | Chave OpenAI (DALL-E 3) — opcional, para fotos |

### Passo a passo

1. Crie conta em [render.com](https://render.com) com sua conta GitHub
2. Clique em **New → Web Service**
3. Conecte o repositório `arzn-shopee`
4. Configure:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Clique em **Advanced → Add Environment Variable**
   - Adicione `ANTHROPIC_API_KEY`
   - Adicione `OPENAI_API_KEY`
6. Clique em **Create Web Service**
7. Aguarde o deploy (2-3 minutos)
8. Acesse a URL gerada!

## Rodar Localmente

```bash
npm install
node server.js
```

Acesse: http://localhost:3355
