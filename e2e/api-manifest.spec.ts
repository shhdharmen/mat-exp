import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// api-manifest.json — enriched manifest shape (Wave 6a)
// ---------------------------------------------------------------------------

test.describe('api-manifest.json — enriched manifest shape', () => {
  let manifest: Record<string, unknown>;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const response = await page.request.get('/api-manifest.json');
    manifest = await response.json();
    await ctx.close();
  });

  test('manifest is a non-empty object', () => {
    expect(typeof manifest).toBe('object');
    expect(Object.keys(manifest).length).toBeGreaterThan(0);
  });

  test('function entry has structured params[] and returnType', () => {
    // provideMatExpButtonOptions is a known exported function
    const entry = manifest['provideMatExpButtonOptions'] as Record<string, unknown>;
    expect(entry).toBeDefined();
    expect(entry.kind).toBe('function');
    // backwards-compat signature still present
    expect(typeof entry.signature).toBe('string');
    // new structured params
    expect(Array.isArray(entry.params)).toBe(true);
    const params = entry.params as { name: string; type: string }[];
    expect(params.length).toBeGreaterThan(0);
    expect(typeof params[0].name).toBe('string');
    expect(typeof params[0].type).toBe('string');
    // returnType
    expect(typeof entry.returnType).toBe('string');
  });

  test('interface entry has structured properties[] and methods[]', () => {
    // MatExpSelectableButton is a known exported interface with members
    const entry = manifest['MatExpSelectableButton'] as Record<string, unknown>;
    expect(entry).toBeDefined();
    expect(entry.kind).toBe('interface');
    // backwards-compat shape still present
    expect(typeof entry.shape).toBe('string');
    // new structured members
    expect(Array.isArray(entry.properties)).toBe(true);
    const props = entry.properties as { name: string; type: string }[];
    expect(props.length).toBeGreaterThan(0);
    expect(typeof props[0].name).toBe('string');
    expect(typeof props[0].type).toBe('string');
  });

  test('directive entry still has required fields (backwards compat)', () => {
    const entry = manifest['MatExpButton'] as Record<string, unknown>;
    expect(entry).toBeDefined();
    expect(entry.kind).toBe('directive');
    expect(typeof entry.selector).toBe('string');
    expect(Array.isArray(entry.inputs)).toBe(true);
    expect(Array.isArray(entry.outputs)).toBe(true);
  });

  test('every entry has a kind field', () => {
    const validKinds = new Set([
      'directive',
      'component',
      'type',
      'interface',
      'class',
      'const',
      'function',
    ]);
    for (const [name, entry] of Object.entries(manifest)) {
      const e = entry as Record<string, unknown>;
      expect(validKinds.has(e.kind as string), `${name} has invalid kind: ${e.kind}`).toBe(true);
    }
  });

  test('class with constructor parameter properties captures them in properties[]', () => {
    // MatExpSelectableButtonChange declares `source` and `value` via constructor shorthand
    const entry = manifest['MatExpSelectableButtonChange'] as Record<string, unknown>;
    expect(entry).toBeDefined();
    expect(entry.kind).toBe('class');
    expect(Array.isArray(entry.properties)).toBe(true);
    const props = entry.properties as { name: string; type: string }[];
    const names = props.map((p) => p.name);
    expect(names).toContain('source');
    expect(names).toContain('value');
    const sourceProp = props.find((p) => p.name === 'source');
    expect(sourceProp?.type).toBe('MatExpSelectableButton');
    const valueProp = props.find((p) => p.name === 'value');
    expect(valueProp?.type).toBe('unknown');
  });

  test('JSDoc tag fields are typed correctly when present', () => {
    // Scan all entries — any that have deprecated/remarks/example/see must be correct types
    for (const [name, entry] of Object.entries(manifest)) {
      const e = entry as Record<string, unknown>;
      if ('deprecated' in e) {
        expect(
          typeof e.deprecated === 'boolean' || typeof e.deprecated === 'string',
          `${name}.deprecated must be boolean or string`,
        ).toBe(true);
      }
      if ('remarks' in e) {
        expect(typeof e.remarks, `${name}.remarks must be string`).toBe('string');
      }
      if ('example' in e) {
        expect(typeof e.example, `${name}.example must be string`).toBe('string');
      }
      if ('see' in e) {
        expect(Array.isArray(e.see), `${name}.see must be array`).toBe(true);
      }
    }
  });
});
