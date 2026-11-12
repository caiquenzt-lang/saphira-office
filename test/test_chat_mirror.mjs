import assert from 'node:assert';
import { host } from './mock-sdk.js';

console.log('--- TESTE CHAT MIRROR: Extração e Espelhamento de Conversas ---');

// Mock messages matching Hermes Gateway SessionDB output
const rawMessages = [
  { id: '1', role: 'user', content: 'Saphira, analise os dados de vendas da clínica.', timestamp: '14:20' },
  { id: '2', role: 'assistant', content: [{ type: 'text', text: 'Analisei os dados: 19 agendamentos confirmados e conversão média de 4.2%.' }], timestamp: '14:21' },
  { id: '3', role: 'user', content: 'Qual o vendedor com maior taxa?', timestamp: '14:22' },
  { id: '4', role: 'assistant', text: 'Robson lidera com 4,74% de conversão.', timestamp: '14:23' }
];

function extractMessageText(msg) {
  if (!msg) return '';
  if (typeof msg === 'string') return msg;
  if (typeof msg.content === 'string') return msg.content;
  if (typeof msg.text === 'string') return msg.text;
  if (Array.isArray(msg.content)) {
    return msg.content.map(c => {
      if (typeof c === 'string') return c;
      if (c && typeof c.text === 'string') return c.text;
      return '';
    }).filter(Boolean).join('\n');
  }
  if (msg.content && typeof msg.content === 'object') {
    return msg.content.text || JSON.stringify(msg.content);
  }
  return '';
}

const parsed = rawMessages.map(m => ({
  id: m.id,
  role: m.role,
  text: extractMessageText(m),
  timestamp: m.timestamp
}));

assert.strictEqual(parsed.length, 4, 'Deve extrair todas as 4 mensagens');
assert.strictEqual(parsed[0].text, 'Saphira, analise os dados de vendas da clínica.');
assert.strictEqual(parsed[1].text, 'Analisei os dados: 19 agendamentos confirmados e conversão média de 4.2%.');
assert.strictEqual(parsed[3].text, 'Robson lidera com 4,74% de conversão.');
console.log('✔ Extração polimórfica de mensagens (string, array, object) validada com sucesso.');

// Teste de submissão do chat espelho
const promptPayload = {
  session_id: 'sess-saphira-123',
  profile: 'saphira-agent',
  text: 'Qual a prioridade comercial de hoje?'
};

await host.composer.submit(promptPayload.session_id, promptPayload.text);
assert.strictEqual(host._lastSubmitted.sessionId, 'sess-saphira-123');
assert.strictEqual(host._lastSubmitted.text, 'Qual a prioridade comercial de hoje?');
console.log('✔ Envio via prompt do chat espelho validado para a sessão canônica oficial.');

// Teste de Listagem e Alternância de Sessões
console.log('--- TESTE: Gaveta de Sessões do Chat Mirror ---');
const listedSessions = await host.request('session.list', { profile: 'saphira-marketing', limit: 25 });
assert.ok(Array.isArray(listedSessions.sessions), 'Deve retornar array de sessões');
assert.strictEqual(listedSessions.sessions.length, 2, 'Deve listar as 2 sessões mockadas');
assert.strictEqual(listedSessions.sessions[0].title, 'Estratégia de Tráfego Q4');
console.log(`✔ Listagem de sessões validada com sucesso (${listedSessions.sessions.length} encontradas).`);

// Teste de Criação de Nova Sessão
const createdSession = await host.request('session.create', {
  profile: 'saphira-marketing',
  title: 'Saphira Office • Nova Conversa',
  hidden: false,
  follow_profile_config: true
});
assert.ok(createdSession.session_id, 'Deve retornar o ID da nova sessão');
console.log(`✔ Criação de nova sessão validada com sucesso: ${createdSession.session_id}`);

console.log('======================================================');
console.log('TODOS OS TESTES DO CHAT ESPELHO E SESSÕES FORAM APROVADOS!');
console.log('======================================================');
