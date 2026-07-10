import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaygroundComponent } from '../../../../../shared/components/playground/playground.component';

@Component({
  selector: 'app-button-group-playground',
  standalone: true,
  imports: [PlaygroundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-group-playground.component.html',
})
export class ButtonGroupPlaygroundComponent {}
