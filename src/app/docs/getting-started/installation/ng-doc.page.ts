import { NgDocPage } from '@ng-doc/core';
import GettingStartedCategory from '../ng-doc.category';

/**
 * This page describes how to install the library.
 */
const InstallationPage: NgDocPage = {
  title: `Installation`,
  mdFile: ['./automatic.md', './manual.md'],
  category: GettingStartedCategory,
};

export default InstallationPage;
