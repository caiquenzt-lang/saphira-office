export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@hermes/plugin-sdk') {
    return { url: new URL('./mock-sdk.js', import.meta.url).href, shortCircuit: true };
  }
  if (specifier === 'react') {
    return { url: new URL('./react-shim.js', import.meta.url).href, shortCircuit: true };
  }
  if (specifier === 'react/jsx-runtime') {
    return { url: new URL('./jsx-shim.js', import.meta.url).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
