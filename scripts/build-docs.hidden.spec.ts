import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { walkDir } from './build-docs';

function write(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

describe('isHidden frontmatter', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'build-docs-hidden-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('hides a content page', () => {
    write(path.join(root, 'index.md'), '---\ntitle: Secret\nisHidden: true\n---\n');
    expect(walkDir(root, 'secret')).toBeNull();
  });

  it('hides a component page (all tabs) when index.md is hidden', () => {
    write(path.join(root, 'index.md'), '---\ntitle: Button\nisHidden: true\n---\n');
    write(path.join(root, 'api.md'), '---\ntitle: API\n---\n');
    write(path.join(root, 'styling.md'), '---\ntitle: Styling\n---\n');
    expect(walkDir(root, 'button')).toBeNull();
  });

  it('hides just the api tab when api.md is hidden', () => {
    write(path.join(root, 'index.md'), '---\ntitle: Button\n---\n');
    write(path.join(root, 'api.md'), '---\ntitle: API\nisHidden: true\n---\n');
    write(path.join(root, 'styling.md'), '---\ntitle: Styling\n---\n');

    const node = walkDir(root, 'button');
    expect(node?.isComponentPage).toBe(true);
    const labels = node?.children?.map((c) => c.label);
    expect(labels).toContain('Overview');
    expect(labels).toContain('Styling');
    expect(labels).toContain('Playground');
    expect(labels).not.toContain('API');
  });

  it('hides an entire section, including descendants, via the section index.md', () => {
    write(path.join(root, 'index.md'), '---\ntitle: All Buttons\nisHidden: true\n---\n');
    write(path.join(root, 'button', 'index.md'), '---\ntitle: Button\n---\n');
    expect(walkDir(root, 'all-buttons')).toBeNull();
  });

  it('drops a section with no index.md once every child is hidden', () => {
    write(path.join(root, 'a', 'index.md'), '---\ntitle: A\nisHidden: true\n---\n');
    write(path.join(root, 'b', 'index.md'), '---\ntitle: B\nisHidden: true\n---\n');
    expect(walkDir(root, 'section')).toBeNull();
  });

  it('leaves visible siblings untouched', () => {
    write(path.join(root, 'a', 'index.md'), '---\ntitle: A\nisHidden: true\n---\n');
    write(path.join(root, 'b', 'index.md'), '---\ntitle: B\n---\n');

    const node = walkDir(root, 'section');
    expect(node?.children?.map((c) => c.label)).toEqual(['B']);
  });
});

describe('frontmatter key validation', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'build-docs-frontmatter-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('rejects an unrecognized key on index.md', () => {
    write(path.join(root, 'index.md'), '---\ntitle: Button\nisHideen: true\n---\n');
    expect(() => walkDir(root, 'button')).toThrowError(/unknown key\(s\) "isHideen"/);
  });

  it('rejects an unrecognized key on api.md', () => {
    write(path.join(root, 'index.md'), '---\ntitle: Button\n---\n');
    write(path.join(root, 'api.md'), '---\ntitle: API\nhidden: true\n---\n');
    write(path.join(root, 'styling.md'), '---\ntitle: Styling\n---\n');
    expect(() => walkDir(root, 'button')).toThrowError(/unknown key\(s\) "hidden"/);
  });

  it('accepts all known keys together', () => {
    write(
      path.join(root, 'index.md'),
      '---\ntitle: Button\norder: 1\ndescription: A button.\nisHidden: false\n---\n',
    );
    expect(() => walkDir(root, 'button')).not.toThrow();
  });
});
