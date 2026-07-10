import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveButton,
  type MatExpressiveButtonShape,
  type MatExpressiveButtonSize,
  type MatExpressiveButtonToggle,
} from '@ngm-dev/mat-expressive';

/** @playgroundFor MatExpressiveButton */
@Component({
  selector: 'app-button-preview',
  standalone: true,
  imports: [MatButton, MatExpressiveButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-preview.component.html',
  styleUrl: './button-preview.component.scss',
})
export class ButtonPreviewComponent {
  readonly size = input<MatExpressiveButtonSize>('s');
  readonly shape = input<MatExpressiveButtonShape>('round');
  readonly toggle = input<MatExpressiveButtonToggle | undefined>(undefined);
  readonly appearance = input<MatButtonAppearance>('text');
  /**
   * @name Icon Position
   */
  readonly iconPosition = input<'before' | 'after'>('before');
  readonly disabled = input<boolean>(false);
}
