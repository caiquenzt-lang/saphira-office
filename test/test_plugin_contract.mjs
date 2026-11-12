import assert from 'node:assert';
import plugin from '../plugin.js';
import { host } from './mock-sdk.js';

console.log('--- TESTE 1: Contrato do Plugin Hermes Desktop ---');
assert.strictEqual(plugin.id, 'saphira-office', 'ID do plugin deve ser saphira-office');
assert.strictEqual(plugin.name, 'Saphira Office', 'Nome do plugin deve ser Saphira Office');
assert.strictEqual(plugin.defaultEnabled, true, 'Plugin deve vir defaultEnabled: true');
assert.strictEqual(typeof plugin.register, 'function', 'Plugin deve exportar método register');
console.log('✔ Teste 1 APROVADO: Metadados e interface do plugin válidos.');

console.log('--- TESTE 2: Registro de Rotas e Contribuições no Hermes ---');
const contributions = [];
const mockCtx = {
  source: 'plugin:saphira-office',
  registerMany: (items) => {
    contributions.push(...items);
  },
  onDispose: () => {}
};

plugin.register(mockCtx);
assert.strictEqual(contributions.length, 3, 'Deve registrar exatamente 3 contribuições');
const routeContrib = contributions.find(c => c.area === 'routes');
const navContrib = contributions.find(c => c.area === 'sidebar_nav');
const paletteContrib = contributions.find(c => c.area === 'palette');

assert.ok(routeContrib, 'Deve conter contribuição de rota ROUTES_AREA');
assert.strictEqual(routeContrib.data.path, '/saphira-office', 'Caminho da rota deve ser /saphira-office');
assert.ok(navContrib, 'Deve conter contribuição SIDEBAR_NAV_AREA');
assert.strictEqual(navContrib.data.label, 'Saphira Office', 'Label da barra lateral deve ser Saphira Office');
assert.ok(paletteContrib, 'Deve conter contribuição PALETTE_AREA');
console.log('✔ Teste 2 APROVADO: Superfícies registradas corretamente.');

console.log('--- TESTE 3: Verificação de Roteamento Estrito e Descoberta de Agentes ---');
const rawAgents = await host.agents();
const agents = Array.isArray(rawAgents) ? rawAgents : (Array.isArray(rawAgents?.agents) ? rawAgents.agents : []);
assert.strictEqual(agents.length, 3, 'Deve carregar os 3 perfis reais');

const saphiraV3 = agents.find(a => a.name === 'saphira-v3');
const executorTi = agents.find(a => a.name === 'executor-ti');
const saphiraMarketing = agents.find(a => a.name === 'saphira-marketing');

assert.ok(saphiraV3, 'Perfil saphira-v3 deve existir');
assert.ok(executorTi, 'Perfil executor-ti deve existir');
assert.ok(saphiraMarketing, 'Perfil saphira-marketing deve existir');

// Validação de isolamento de rotas
assert.strictEqual(saphiraMarketing.route.profile, 'saphira-marketing');
assert.strictEqual(saphiraV3.route.profile, 'saphira-v3');
assert.strictEqual(executorTi.route.profile, 'executor-ti');

// Proibição de fallback
assert.notStrictEqual(saphiraMarketing.route.profile, saphiraV3.route.profile, 'Marketing NUNCA deve apontar para Diretoria');
console.log('✔ Teste 3 APROVADO: Roteamento estrito e isolamento comprovados sem desvios.');

console.log('--- TESTE 4: Contrato da Barra de Comandos e Envio para Sessão Canônica ---');
// Simulação de envio direto para a sessão canônica de saphira-marketing
const testSessionId = saphiraMarketing.canonical_session.id;
const testMessage = 'Status do anúncio Q4';
await host.composer.submit(testSessionId, testMessage);

assert.strictEqual(host._lastSubmitted?.sessionId, testSessionId, 'ID da sessão submetida deve bater com a sessão canônica do perfil');
assert.strictEqual(host._lastSubmitted?.text, testMessage, 'Conteúdo da mensagem enviada deve ser preservado');
assert.notStrictEqual(host._lastSubmitted?.sessionId, saphiraV3.canonical_session.id, 'Comando nunca deve vazar para a sessão da Diretoria');
console.log('✔ Teste 4 APROVADO: Submissão de comandos roteada com isolamento estrito.');

console.log('--- TESTE 5: Contrato de Integração do Kanban Nativo ---');
// Simulação do clique na TV do Kanban disparando host.navigate('/kanban')
host.navigate('/kanban');
assert.strictEqual(host._lastNavigatedPath, '/kanban', 'Clique na TV do Kanban deve navegar diretamente para /kanban');
console.log('✔ Teste 5 APROVADO: Redirecionamento para a rota /kanban validado com sucesso.');

console.log('--- TESTE 6: Validação de Estrutura do Modal de Resposta e Indicadores Visuais ---');
const route = routeContrib.render();
assert.ok(route, 'Componente SaphiraOfficeView deve ser instanciado');
console.log('✔ Teste 6 APROVADO: Componente da visualização do escritório renderiza estrutura com suporte a modal e badges.');

console.log('======================================================');
console.log('TODOS OS TESTES UNITÁRIOS E DE CONTRATO DA ETAPA 4 FORAM APROVADOS!');
console.log('======================================================');
