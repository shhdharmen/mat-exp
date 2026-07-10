import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  MatExpressiveFabMenu,
  MatExpressiveFabMenuTrigger,
  type MatExpressiveFabMenuColor,
} from '@ngm-dev/mat-expressive';

/** @playgroundFor MatExpressiveFabMenu */
@Component({
  selector: 'app-fab-menu-preview',
  standalone: true,
  imports: [
    MatFabButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatExpressiveFabMenu,
    MatExpressiveFabMenuTrigger,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fab-menu-preview.component.html',
  styleUrl: './fab-menu-preview.component.scss',
})
export class FabMenuPreviewComponent {
  readonly color = input<MatExpressiveFabMenuColor>('primary');
}
