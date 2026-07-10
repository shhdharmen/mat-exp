import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveIconButton,
  MatExpressiveIconButtonAppearance,
  type MatExpressiveButtonShape,
  type MatExpressiveButtonSize,
  type MatExpressiveButtonToggle,
  type MatExpressiveIconButtonWidth,
} from '@ngm-dev/mat-expressive';

/** @playgroundFor MatExpressiveIconButton */
@Component({
  selector: 'app-icon-button-preview',
  standalone: true,
  imports: [MatIconButton, MatExpressiveIconButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon-button-preview.component.html',
  styleUrl: './icon-button-preview.component.scss',
})
export class IconButtonPreviewComponent {
  readonly size = input<MatExpressiveButtonSize>('s');
  readonly shape = input<MatExpressiveButtonShape>('round');
  readonly width = input<MatExpressiveIconButtonWidth>('default');
  readonly toggle = input<MatExpressiveButtonToggle | undefined>(undefined);
  readonly appearance = input<MatExpressiveIconButtonAppearance>('text');
  readonly disabled = input<boolean>(false);
}
