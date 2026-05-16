const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== CHAVES API =====
// No Railway: configure as variáveis de ambiente no painel
// Localmente: coloque suas chaves aqui
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

// ===== PROXY DALL-E =====
app.post('/api/dalle', async (req, res) => {
  try {
    const { prompt, size, quality, style } = req.body;
    if (!OPENAI_KEY || OPENAI_KEY === 'SUA_CHAVE_OPENAI_AQUI') {
      return res.status(400).json({ error: 'Chave OpenAI não configurada' });
    }
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_KEY },
      body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: size || '1024x1024', quality: quality || 'standard', style: style || 'natural' })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Erro ' + response.status });
    res.json(data);
  } catch (err) {
    console.error('[DALL-E]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Railway usa PORT do ambiente, localmente usa 3355
const PORT = process.env.PORT || 3355;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n  ===================================');
  console.log('   ArznStoreSP — Gerador Shopee 2026');
  console.log('  ===================================\n');
  if (ANTHROPIC_KEY === 'SUA_CHAVE_ANTHROPIC_AQUI') console.log('  ⚠  Adicione ANTHROPIC_API_KEY nas variáveis de ambiente');
  else console.log('  ✓  Claude conectado');
  if (OPENAI_KEY === 'SUA_CHAVE_OPENAI_AQUI') console.log('  ⚠  OPENAI_API_KEY não configurada (fotos desativadas)');
  else console.log('  ✓  DALL-E conectado');
  console.log(`\n  → Rodando na porta ${PORT}\n`);
});
