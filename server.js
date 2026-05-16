const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || 'SUA_CHAVE_ANTHROPIC_AQUI';
const OPENAI_KEY    = process.env.OPENAI_API_KEY    || 'SUA_CHAVE_OPENAI_AQUI';

const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ===== PROXY CLAUDE =====
app.post('/api/claude', async (req, res) => {
  try {
    const { messages, system, max_tokens } = req.body;
    const params = { model: 'claude-sonnet-4-6', max_tokens: max_tokens || 3000, messages };
    if (system) params.system = system;
    const response = await client.messages.create(params);
    res.json(response);
  } catch (err) {
    console.error('[Claude]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== PROXY DALL-E — retorna imagem como base64 para download direto =====
app.post('/api/dalle', async (req, res) => {
  try {
    const { prompt, size, quality, style } = req.body;

    if (!OPENAI_KEY || OPENAI_KEY === 'SUA_CHAVE_OPENAI_AQUI') {
      return res.status(400).json({ error: 'Chave OpenAI não configurada no Render (variável OPENAI_API_KEY)' });
    }

    // 1. Gera a imagem na OpenAI
    const genResp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_KEY
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: size || '1024x1024',
        quality: quality || 'standard',
        style: style || 'natural',
        response_format: 'b64_json'  // Recebe base64 direto — sem URL que expira!
      })
    });

    const genData = await genResp.json();

    if (!genResp.ok) {
      const msg = genData?.error?.message || 'Erro OpenAI ' + genResp.status;
      console.error('[DALL-E]', msg);
      return res.status(genResp.status).json({ error: msg });
    }

    // 2. Retorna base64 diretamente para o browser
    const b64 = genData?.data?.[0]?.b64_json;
    if (!b64) return res.status(500).json({ error: 'Imagem não gerada pela OpenAI' });

    res.json({
      success: true,
      b64_json: b64,
      mime: 'image/png',
      dataUrl: 'data:image/png;base64,' + b64
    });

  } catch (err) {
    console.error('[DALL-E]', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3355;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n  ===================================');
  console.log('   Gerador de Anúncios em Marketplaces');
  console.log('  ===================================\n');
  if (ANTHROPIC_KEY === 'SUA_CHAVE_ANTHROPIC_AQUI') console.log('  ⚠  Configure ANTHROPIC_API_KEY');
  else console.log('  ✓  Claude conectado');
  if (OPENAI_KEY === 'SUA_CHAVE_OPENAI_AQUI') console.log('  ⚠  OPENAI_API_KEY não configurada (fotos DALL-E desativadas)');
  else console.log('  ✓  DALL-E conectado');
  console.log(`\n  → Porta ${PORT}\n`);
});
