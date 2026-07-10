import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface FooterLink {
  label: string;
  routerLink?: string;
  href?: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Docs', routerLink: '/docs/getting-started/installation' },
      { label: 'Pricing', routerLink: '/pricing' },
      { label: 'Changelog', routerLink: '/changelog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', routerLink: '/about-us' },
      { label: 'Contact', routerLink: '/contact-us' },
      { label: 'GitHub', href: 'https://github.com/Angular-Material-Dev/community' },
      { label: 'X', href: 'https://x.com/ngMaterialDev' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/angular-material-dev/' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'License', routerLink: '/license' },
      { label: 'Terms', routerLink: '/terms-and-conditions' },
      { label: 'Privacy', routerLink: '/privacy-policy' },
      { label: 'Refunds', routerLink: '/refund-policy' },
    ],
  },
];

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly columns = FOOTER_COLUMNS;
  protected readonly currentYear = new Date().getFullYear();
}
