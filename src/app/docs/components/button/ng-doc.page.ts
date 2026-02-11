import { NgDocPage } from '@ng-doc/core';
import ComponentsCategory from '../ng-doc.category';
import { DocsButtonPlayground } from './playground/playground';

const ButtonPage: NgDocPage = {
  title: `Button`,
  mdFile: ['./index.md', './playground.md'],
  category: ComponentsCategory,
  playgrounds: {
    DocsButtonPlayground: {
      target: DocsButtonPlayground,
      template: `<app-docs-button-playground />`,
    },
  },
  demos: { DocsButtonPlayground },
};

export default ButtonPage;
