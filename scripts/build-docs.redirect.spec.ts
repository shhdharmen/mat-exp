import { describe, expect, it } from 'vitest';
import { collectSectionRedirects, firstNavigableChildPath, type NavPage } from './build-docs';

describe('section redirect helpers', () => {
  const sectionWithoutIndex: NavPage = {
    label: 'All Buttons',
    path: '/components/all-buttons',
    isSection: true,
    hasIndexPage: false,
    order: 1,
    children: [
      {
        label: 'Button',
        path: '/components/all-buttons/button',
        order: 2,
        isComponentPage: true,
        children: [
          { label: 'Overview', path: '/components/all-buttons/button', order: 1 },
          { label: 'API', path: '/components/all-buttons/button/api', order: 2 },
        ],
      },
      {
        label: 'Icon Button',
        path: '/components/all-buttons/icon-button',
        order: 1,
        isComponentPage: true,
        children: [{ label: 'Overview', path: '/components/all-buttons/icon-button', order: 1 }],
      },
    ],
  };

  it('picks the lowest-order navigable child', () => {
    expect(firstNavigableChildPath(sectionWithoutIndex)).toBe(
      '/components/all-buttons/icon-button',
    );
  });

  it('collects redirects for sections without index.md', () => {
    expect(collectSectionRedirects([sectionWithoutIndex])).toEqual({
      '/components/all-buttons': '/components/all-buttons/icon-button',
    });
  });

  it('skips sections that have an index page', () => {
    const withIndex: NavPage = { ...sectionWithoutIndex, hasIndexPage: true };
    expect(collectSectionRedirects([withIndex])).toEqual({});
  });
});
