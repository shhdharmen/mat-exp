import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveButton,
  MatExpressiveButtonGroup,
  MatExpressiveIconButton,
  type MatExpressiveButtonGroupAppearance,
  type MatExpressiveButtonGroupSelection,
  type MatExpressiveButtonGroupShape,
  type MatExpressiveButtonGroupSize,
  type MatExpressiveButtonGroupVariant,
} from '@ngm-dev/mat-expressive';

/**
 * Preview wrapper for MatExpressiveButtonGroup.
 * Used by the playground as the override component — ButtonGroup needs projected
 * button content that cannot be auto-generated from the schema alone.
 * @playgroundFor MatExpressiveButtonGroup
 */
@Component({
  selector: 'app-button-group-preview',
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatExpressiveButton,
    MatExpressiveButtonGroup,
    MatExpressiveIconButton,
    ReactiveFormsModule,
    JsonPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-group-preview.component.html',
  styleUrl: './button-group-preview.component.scss',
})
export class ButtonGroupPreviewComponent {
  readonly size = input<MatExpressiveButtonGroupSize>('s');
  readonly shape = input<MatExpressiveButtonGroupShape>('round');
  readonly variant = input<MatExpressiveButtonGroupVariant>('standard');
  readonly appearance = input<MatExpressiveButtonGroupAppearance>('tonal');
  readonly selection = input<MatExpressiveButtonGroupSelection>('single-select');
  readonly disabled = input<boolean>(false);

  readonly control = new FormControl<string | string[] | null>(null);
}
