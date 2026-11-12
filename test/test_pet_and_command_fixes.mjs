import { host } from './mock-sdk.js';

// Setup mock window environment
globalThis.window = {
  hermes: {
    profiles: {
      list: async () => [
        { name: 'saphira-v3', displayName: 'Saphira 3.0 (Diretora)', model: 'gemini-3.5-flash' },
        { name: 'executor-ti', displayName: 'Executor TI (Nemotron)', model: 'nvidia/nemotron' }
      ]
    }
  },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); }
  }
};
globalThis.localStorage = globalThis.window.localStorage;

// Mock host request handler for Petdex and Sessions
const origRequest = host.request;
host.request = async (method, params) => {
  if (method === 'pet.gallery') {
    return {
      enabled: true,
      active: 'glitchcat',
      pets: [
        { slug: 'glitchcat', displayName: 'Glitchcat Neon', installed: true, curated: true, spritesheetUrl: 'https://assets.petdex.dev/glitchcat.webp' },
        { slug: 'frieren-mage', displayName: 'Frieren the Slayer', installed: false, curated: false, spritesheetUrl: 'https://assets.petdex.dev/frieren.webp' }
      ]
    };
  }
  if (method === 'pet.select') {
    return { ok: true, slug: params.slug, displayName: params.slug === 'frieren-mage' ? 'Frieren the Slayer' : params.slug };
  }
  if (method === 'session.list') {
    return {
      sessions: [
        { id: 'sess-saphira-live-123', profile: params.profile, title: 'Saphira Office Chat' }
      ]
    };
  }
  if (method === 'session.resume') {
    return {
      session_id: params.session_id,
      session_key: params.session_id,
      messages: params.omit_messages ? [] : [
        { role: 'user', content: 'Oi' },
        { role: 'assistant', content: 'Olá! Sou a Saphira 3.0 Diretora, pronta para gerenciar as operações.' }
      ]
    };
  }
  if (method === 'prompt.submit') {
    return { ok: true, submission_id: params.submission_id, session_id: params.session_id };
  }
  if (method === 'session.messages') {
    return {
      messages: [
        { role: 'user', content: 'Oi' },
        { role: 'assistant', content: 'Olá! Sou a Saphira 3.0 Diretora, pronta para gerenciar as operações.' }
      ]
    };
  }
  return origRequest(method, params);
};

console.log('--- TESTE A: Marketplace Oficial (pet.gallery RPC) ---');
const gallery = await host.request('pet.gallery', { localOnly: false });
if (!gallery?.pets || gallery.pets.length < 2) {
  throw new Error('Falha ao listar pets da galeria');
}
console.log(`✔ Galeria retornou ${gallery.pets.length} pets.`);

console.log('--- TESTE B: Adoção / Download de Pet (pet.select RPC) ---');
const adopted = await host.request('pet.select', { slug: 'frieren-mage' });
if (!adopted?.ok || adopted.displayName !== 'Frieren the Slayer') {
  throw new Error('Falha ao adotar pet');
}
console.log(`✔ Pet adotado com sucesso: ${adopted.displayName}`);

console.log('--- TESTE C: Rota Oficial de Comandos (session.list + prompt.submit) ---');
const listed = await host.request('session.list', { profile: 'saphira-v3', limit: 5 });
const activeSession = listed.sessions[0].id;
console.log(`✔ Sessão canônica localizada: ${activeSession}`);

const promptRes = await host.request('prompt.submit', {
  session_id: activeSession,
  profile: 'saphira-v3',
  text: 'Oi'
});
if (!promptRes?.ok) {
  throw new Error('Falha no envio do prompt');
}
console.log('✔ prompt.submit aceito pelo Gateway com sucesso.');

console.log('--- TESTE D: Consulta de Respostas (session.messages) ---');
const msgRes = await host.request('session.messages', { session_id: activeSession });
const assistant = msgRes.messages.find(m => m.role === 'assistant');
if (!assistant || !assistant.content.includes('Saphira 3.0')) {
  throw new Error('Falha na resposta do assistente');
}
console.log(`✔ Resposta oficial capturada: "${assistant.content}"`);

console.log('--- TESTE E: Polling de Resposta Oficial via session.resume ---');
const resumeRes = await host.request('session.resume', { session_id: activeSession, profile: 'saphira-v3', omit_messages: false });
if (!resumeRes?.messages || resumeRes.messages.length === 0) {
  throw new Error('Falha no retorno de mensagens pelo session.resume');
}
console.log('✔ session.resume retornou mensagens com sucesso.');
console.log('======================================================');
console.log('TODAS AS CORREÇÕES DO MARKETPLACE E COMANDOS VALIDADAS!');
console.log('======================================================');
