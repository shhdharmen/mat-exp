import { describe, expect, it } from 'vitest';
import {
  collectDocLinks,
  formatLink,
  parseFrontmatterFields,
  type NavPage,
} from './generate-llms-txt';
import { SITE_URL } from './site-config';

describe('parseFrontmatterFields', () => {
  it('extracts title and description', () => {
    const raw = '---\ntitle: License\ndescription: Dual-licensed package.\n---\n\nBody text.';
    expect(parseFrontmatterFields(raw)).toEqual({
      title: 'License',
      description: 'Dual-licensed package.',
    });
  });

  it('strips surrounding double or single quotes from values', () => {
    const raw = '---\ntitle: "Quoted Title"\ndescription: \'Single quoted\'\n---\n';
    expect(parseFrontmatterFields(raw)).toEqual({
      title: 'Quoted Title',
      description: 'Single quoted',
    });
  });

  it('returns undefined fields when frontmatter is missing', () => {
    expect(parseFrontmatterFields('Just a body, no frontmatter.')).toEqual({
      title: undefined,
      description: undefined,
    });
  });
});

describe('formatLink', () => {
  it('renders a markdown link with a description', () => {
    expect(
      formatLink({ label: 'Pricing', url: `${SITE_URL}/pricing`, description: 'Free tier.' }),
    ).toBe(`- [Pricing](${SITE_URL}/pricing): Free tier.`);
  });

  it('renders a markdown link without a description', () => {
    expect(formatLink({ label: 'Pricing', url: `${SITE_URL}/pricing` })).toBe(
      `- [Pricing](${SITE_URL}/pricing)`,
    );
  });
});

describe('collectDocLinks', () => {
  it('emits a link for a section landing page, then descends into its children', () => {
    const nav: NavPage[] = [
      {
        label: 'Getting Started',
        path: '/docs/getting-started',
        description: 'Get started.',
        isSection: true,
        hasIndexPage: true,
        children: [
          {
            label: 'Installation',
            path: '/docs/getting-started/installation',
            description: 'Install it.',
          },
        ],
      },
    ];

    const links = collectDocLinks(nav);
    expect(links).toEqual([
      {
        label: 'Getting Started',
        url: `${SITE_URL}/docs/getting-started/index.md`,
        description: 'Get started.',
      },
      {
        label: 'Installation',
        url: `${SITE_URL}/docs/getting-started/installation/index.md`,
        description: 'Install it.',
      },
    ]);
  });

  it('skips a landing-page link for sections without their own index.md', () => {
    const nav: NavPage[] = [
      {
        label: 'All Buttons',
        path: '/docs/components/all-buttons',
        isSection: true,
        hasIndexPage: false,
        children: [
          { label: 'Button', path: '/docs/components/all-buttons/button', isComponentPage: true },
        ],
      },
    ];

    const links = collectDocLinks(nav);
    expect(links).toHaveLength(1);
    expect(links[0].label).toBe('Button');
  });

  it('emits exactly one link per Component Page, skipping API/Styling/Playground tab children', () => {
    const nav: NavPage[] = [
      {
        label: 'Button',
        path: '/docs/components/all-buttons/button',
        description: 'A button.',
        isComponentPage: true,
        children: [
          { label: 'Overview', path: '/docs/components/all-buttons/button' },
          { label: 'API', path: '/docs/components/all-buttons/button/api' },
          { label: 'Styling', path: '/docs/components/all-buttons/button/styling' },
          { label: 'Playground', path: '/docs/components/all-buttons/button/playground' },
        ],
      },
    ];

    const links = collectDocLinks(nav);
    expect(links).toEqual([
      {
        label: 'Button',
        url: `${SITE_URL}/docs/components/all-buttons/button/index.md`,
        description: 'A button.',
      },
    ]);
  });

  it('emits a link for a plain content page with no children', () => {
    const nav: NavPage[] = [
      { label: 'Changelog', path: '/docs/changelog', description: 'Release history.' },
    ];

    expect(collectDocLinks(nav)).toEqual([
      {
        label: 'Changelog',
        url: `${SITE_URL}/docs/changelog/index.md`,
        description: 'Release history.',
      },
    ]);
  });
});
