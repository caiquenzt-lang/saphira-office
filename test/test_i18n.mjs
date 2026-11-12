import assert from 'node:assert';
import plugin from '../plugin.js';

console.log('--- TESTE i18n: Dicionários e Resolução de Idioma ---');

// 1. Simular contexto com mock de i18n e registerMany
let registeredBundles = null;
const mockCtx = {
  i18n: {
    register: (bundles) => {
      registeredBundles = bundles;
    }
  },
  storage: {
    get: (k, d) => d,
    set: () => {}
  },
  registerPanel: () => {},
  registerTab: () => {},
  registerMany: () => {}
};

plugin.register(mockCtx);

// 2. Verificar registro no SDK i18n do Hermes
assert(registeredBundles, 'ctx.i18n.register deve ser chamado durante register(ctx)');
assert(registeredBundles['en'], 'Dicionário inglês (en) deve estar registrado');
assert(registeredBundles['pt-BR'], 'Dicionário português (pt-BR) deve estar registrado');

console.log('✔ Teste i18n: Registro de bundles no SDK do Hermes validado com sucesso.');

// 3. Comparar paridade de chaves entre en e pt-BR
const enKeys = Object.keys(registeredBundles['en']);
const ptKeys = Object.keys(registeredBundles['pt-BR']);

assert.strictEqual(enKeys.length, ptKeys.length, `Paridade de chaves i18n: en(${enKeys.length}) vs pt-BR(${ptKeys.length})`);

for (const k of enKeys) {
  assert(registeredBundles['pt-BR'][k], `Chave "${k}" presente em EN deve existir em pt-BR`);
}

console.log(`✔ Teste i18n: Paridade total comprovada (${enKeys.length} chaves bilaterais).`);

// 4. Testar termos chave em EN e PT
assert.strictEqual(registeredBundles['en'].appTitle, 'Saphira Office');
assert.strictEqual(registeredBundles['pt-BR'].appTitle, 'Saphira Office');

assert.strictEqual(registeredBundles['en'].motionSeated, 'Seated at Desks');
assert.strictEqual(registeredBundles['pt-BR'].motionSeated, 'Parados na Mesa');

assert.strictEqual(registeredBundles['en'].marketplaceBtn, 'Petdex Marketplace');
assert.strictEqual(registeredBundles['pt-BR'].marketplaceBtn, 'Marketplace Petdex');

console.log('✔ Teste i18n: Tradução de termos de navegação e botões validada.');

// 5. Testar interpolação de variáveis
const enTemplate = registeredBundles['en'].cmdPlaceholder;
const ptTemplate = registeredBundles['pt-BR'].cmdPlaceholder;

assert(enTemplate.includes('{name}'), 'Template EN deve conter marcador {name}');
assert(ptTemplate.includes('{name}'), 'Template PT deve conter marcador {name}');

const enInterpolated = enTemplate.replace('{name}', 'Hermes');
const ptInterpolated = ptTemplate.replace('{name}', 'Hermes');

assert(enInterpolated.includes('instruction for Hermes'), 'Interpolação EN deve conter "instruction for Hermes"');
assert(ptInterpolated.includes('instrução para Hermes'), 'Interpolação PT deve conter "instrução para Hermes"');

console.log('✔ Teste i18n: Interpolação dinâmica de parâmetros validada.');
console.log('======================================================');
console.log('TODOS OS TESTES DE INTERNACIONALIZAÇÃO (i18n) FORAM APROVADOS!');
console.log('======================================================');
