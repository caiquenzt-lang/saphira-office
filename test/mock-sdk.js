export function atom(initial) {
  let val = initial;
  const subs = new Set();
  return {
    get: () => val,
    set: (next) => { val = next; subs.forEach(fn => fn(val)); },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); }
  };
}

export const host = {
  state: {
    gateway: atom('open'),
    profile: atom('saphira-v3'),
    busyBySession: atom({})
  },
  agents: async () => {
    return {
      agents: [
        {
          name: 'saphira-v3',
          profile: 'saphira-v3',
          display_name: 'Saphira 3.0 (Diretora)',
          canonical_session: { id: 'local-c5c2bbc5708b1ecc8c4d5ea1540caf2e4efcf6680639f44f4378ad1461e81ae0' },
          route: { connectionId: 'local', profile: 'saphira-v3', targetProfile: 'saphira-v3' }
        },
        {
          name: 'executor-ti',
          profile: 'executor-ti',
          display_name: 'Executor TI (Nemotron)',
          canonical_session: { id: 'local-137dea8360c4cad48411dd5eebf576c5d45e907753773df73fb5bf3fa3ac1a8d' },
          route: { connectionId: 'local', profile: 'executor-ti', targetProfile: 'executor-ti' }
        },
        {
          name: 'saphira-marketing',
          profile: 'saphira-marketing',
          display_name: 'Saphira Marketing Digital',
          canonical_session: { id: 'local-5dc74785374e556ce7ca75bce5f585c04ae6db5501883f77588b76bc9fd36027' },
          route: { connectionId: 'local', profile: 'saphira-marketing', targetProfile: 'saphira-marketing' }
        }
      ],
      primaryConnectionId: 'local',
      sources: [{ connectionId: 'local', reachable: true }]
    };
  },
  openSession: async (id, opts) => {
    console.log('[MockSDK] host.openSession chamado com:', id, opts);
  },
  navigate: (path) => {
    host._lastNavigatedPath = path;
    console.log('[MockSDK] host.navigate chamado com:', path);
  },
  composer: {
    submit: async (sessionId, text) => {
      host._lastSubmitted = { sessionId, text };
      console.log('[MockSDK] host.composer.submit chamado com:', sessionId, text);
      return { ok: true };
    }
  },
  _lastNavigatedPath: null,
  _lastSubmitted: null,
  request: async (method, params) => {
    if (method === 'profiles.list') {
      return [
        {
          name: 'saphira-v3',
          display_name: 'Saphira 3.0 (Diretora)',
          description: 'Diretora-Geral & Coordenadora',
          model: 'gemini-3.5-flash',
          is_default: true,
          route: { connectionId: 'local', profile: 'saphira-v3', targetProfile: 'saphira-v3' }
        },
        {
          name: 'executor-ti',
          display_name: 'Executor TI (Nemotron)',
          description: 'Engenheiro de Software & Execução Técnica',
          model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
          is_default: false,
          route: { connectionId: 'local', profile: 'executor-ti', targetProfile: 'executor-ti' }
        },
        {
          name: 'saphira-marketing',
          display_name: 'Saphira Marketing Digital',
          description: 'Head de Negócios Digitais & Crescimento',
          model: 'gemini-3.5-flash',
          is_default: false,
          route: { connectionId: 'local', profile: 'saphira-marketing', targetProfile: 'saphira-marketing' }
        }
      ];
    }
    if (method === 'pet.gallery') {
      return {
        enabled: true,
        active: 'rimuru-2',
        pets: [
          { slug: 'rimuru-2', displayName: 'Rimuru (Slime)', installed: true },
          { slug: 'eris-boreas-greyrat', displayName: 'Eris Boreas Greyrat', installed: true },
          { slug: 'cat-eris', displayName: 'Cat Eris', installed: true },
          { slug: 'rimuru-3', displayName: 'Rimuru (Forma 2)', installed: true },
          { slug: 'rimuru-flying', displayName: 'Rimuru Voador', installed: true },
          { slug: 'eris-greyrat-base', displayName: 'Eris Greyrat Base', installed: true },
          { slug: 'erii-2', displayName: 'Erii', installed: true },
          { slug: 'jue', displayName: 'Jue', installed: true },
          { slug: 'ray-2', displayName: 'Ray', installed: true }
        ]
      };
    }
    if (method === 'pet.thumb') {
      return { ok: true, slug: params?.slug || 'pet', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' };
    }
    if (method === 'session.list') {
      return {
        sessions: [
          { id: 'sess-saphira-1', title: 'Estratégia de Tráfego Q4', started_at: 1731234000, message_count: 14 },
          { id: 'sess-saphira-2', title: 'Automação Comercial Leads', started_at: 1731230000, message_count: 8 }
        ]
      };
    }
    if (method === 'session.create') {
      return {
        session_id: 'sess-created-' + Date.now(),
        stored_session_id: 'sess-created-' + Date.now()
      };
    }
    return {};
  },
  requestProfile: async (route, method, params) => {
    return host.request(method, params);
  },
  notify: ({ kind, message }) => console.log(`[Notification ${kind}] ${message}`)
};

export const Tip = ({ children }) => children;
export const Button = ({ children, onClick, className, style, disabled }) => {
  return {
    type: 'button',
    props: {
      onClick,
      disabled,
      className: className || '',
      style: style || {},
      children
    }
  };
};

export const ROUTES_AREA = 'routes';
export const SIDEBAR_NAV_AREA = 'sidebar_nav';
export const PALETTE_AREA = 'palette';
