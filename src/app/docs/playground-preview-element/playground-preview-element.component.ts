import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PLAYGROUND_PREVIEW_REGISTRY } from '../playground-preview-registry';

/**
 * Renders as the `<playground-preview>` custom element (see
 * `CustomElementsService`) so markdown authors can embed a live, interactive
 * component Playground directly in a doc page's content, e.g.
 * `<playground-preview preview="button"></playground-preview>`.
 */
@Component({
  selector: 'app-playground-preview-element',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  template: `
    @if (previewComponent(); as cmp) {
      <ng-container *ngComponentOutlet="cmp" />
    }
  `,
})
export class PlaygroundPreviewElementComponent {
  readonly preview = input('');

  protected readonly previewComponent = computed(
    () => PLAYGROUND_PREVIEW_REGISTRY[this.preview()] ?? null,
  );
}
