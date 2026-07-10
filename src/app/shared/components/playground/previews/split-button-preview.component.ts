import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveButton,
  MatExpressiveIconButton,
  MatExpressiveSplitButton,
  type MatExpressiveButtonSize,
  type MatExpressiveSplitButtonAppearance,
} from '@ngm-dev/mat-expressive';
import { MatMenu, MatMenuTrigger, MatMenuItem } from '@angular/material/menu';

/** @playgroundFor MatExpressiveSplitButton */
@Component({
  selector: 'app-split-button-preview',
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatExpressiveButton,
    MatExpressiveIconButton,
    MatExpressiveSplitButton,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './split-button-preview.component.html',
  styleUrl: './split-button-preview.component.scss',
})
export class SplitButtonPreviewComponent {
  readonly size = input<MatExpressiveButtonSize>('s');
  readonly appearance = input<MatExpressiveSplitButtonAppearance>('tonal');
}
