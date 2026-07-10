import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconButton } from '@angular/material/button';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

const BRAND_ICONS: Record<string, string> = {
  'brand-github': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.28 3.438 9.75 8.205 11.325.6.113.82-.262.82-.577 0-.285-.01-1.04-.016-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.332-1.756-1.332-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.238 1.84 1.238 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.763-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 6.845c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.604-.014 2.896-.014 3.29 0 .318.216.694.825.576C20.565 22.247 24 17.777 24 12.5 24 5.87 18.627.5 12 .5z"/></svg>`,
  'brand-x': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  'brand-linkedin': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11-.001-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.558V9h3.556v11.452z"/></svg>`,
};

@Component({
  selector: 'app-community-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogClose, MatIconButton, MatIcon],
  templateUrl: './community-dialog.component.html',
  styleUrl: './community-dialog.component.scss',
})
export class CommunityDialogComponent {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    for (const [name, svg] of Object.entries(BRAND_ICONS)) {
      this.iconRegistry.addSvgIconLiteral(name, this.sanitizer.bypassSecurityTrustHtml(svg));
    }
  }
}
