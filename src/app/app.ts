import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ShellComponent } from './shell';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShellComponent],
  template: `<app-shell />`,
})
export class App {}
