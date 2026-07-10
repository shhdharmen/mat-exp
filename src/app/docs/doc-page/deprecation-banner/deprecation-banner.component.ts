import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Stub — full implementation deferred to issue #37 (DeprecationBannerComponent). */
@Component({
  selector: 'app-deprecation-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: '',
})
export class DeprecationBannerComponent {
  readonly currentPath = input.required<string>();
}
