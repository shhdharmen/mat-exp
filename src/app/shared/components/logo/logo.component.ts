import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.svg',
  styles: `
    :host {
      display: inline-block;
    }
  `,
})
export class LogoComponent {
  svgClass = input<string>('');
}
