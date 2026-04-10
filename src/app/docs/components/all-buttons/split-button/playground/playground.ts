import { Component, effect, input, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton, MatAnchor, MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveButtonGroup,
  MatExpressiveIconButtonAppearance,
  MatExpressiveIconButtonWidth,
  type MatExpressiveButtonShape,
  type MatExpressiveButtonGroupSize,
  type MatExpressiveButtonToggle,
  MatExpressiveButtonGroupSelection,
  MatExpressiveButtonGroupVariant,
  MatExpressiveButton,
  MatExpressiveIconButton,
  MatExpressiveButtonGroupShape,
  MatExpressiveButtonGroupAppearance,
  MatExpressiveSelectableButtonChange,
  MatExpressiveSplitButton,
  MatExpressiveSplitButtonAppearance,
  MatExpressiveButtonSize,
} from '@ngm-dev/mat-expressive';
import { JsonPipe } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-docs-split-button-playground',
  imports: [
    MatExpressiveSplitButton,
    MatExpressiveButton,
    MatIcon,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsSplitButtonPlayground {
  readonly size = input<MatExpressiveButtonSize>('s');
  readonly appearance = input<MatExpressiveSplitButtonAppearance>('tonal');
}
