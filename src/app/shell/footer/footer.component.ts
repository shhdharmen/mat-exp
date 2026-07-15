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
      { label: 'Changelog', routerLink: '/changelog' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'GitHub', href: 'https://github.com/Angular-Material-Dev/community' },
      { label: 'X', href: 'https://x.com/ngMaterialDev' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/angular-material-dev/' },
      { label: 'Sponsor', routerLink: '/sponsor' },
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
