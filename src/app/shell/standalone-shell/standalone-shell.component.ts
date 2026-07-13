import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { ThemeService } from '../theme.service';
import { FooterComponent, FOOTER_COLUMNS, FooterColumn } from '../footer/footer.component';
import { CommunityDialogComponent } from '../community-dialog/community-dialog.component';
import { MatExpButton } from '@ngm-dev/mat-exp';
import { LogoComponent } from '../../shared/components/logo/logo.component';

@Component({
  selector: 'app-standalone-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    FooterComponent,
    MatExpButton,
    LogoComponent,
  ],
  host: { class: 'standalone-shell' },
  templateUrl: './standalone-shell.component.html',
  // styles: `
  //   :host {
  //     display: flex;
  //     flex-direction: column;
  //     min-height: 100vh;
  //   }
  // `,
})
export class StandaloneShellComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly drawerOpen = signal(false);
  protected readonly navColumns: FooterColumn[] = FOOTER_COLUMNS;

  private readonly matDialog = inject(MatDialog);

  protected openCommunity(): void {
    this.matDialog.open(CommunityDialogComponent, {
      autoFocus: false,
      panelClass: 'dialog-outlined',
    });
  }
}
