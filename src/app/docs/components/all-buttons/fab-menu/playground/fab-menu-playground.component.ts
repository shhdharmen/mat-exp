import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaygroundComponent } from '../../../../../shared/components/playground/playground.component';

@Component({
  selector: 'app-fab-menu-playground',
  standalone: true,
  imports: [PlaygroundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fab-menu-playground.component.html',
})
export class FabMenuPlaygroundComponent {}
