import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  MatExpressiveLoadingIndicator,
  type MatExpressiveLoadingIndicatorConfig,
  type MatExpressiveLoadingIndicatorSpeed,
} from '@ngm-dev/mat-expressive';

/** @playgroundFor MatExpressiveLoadingIndicator */
@Component({
  selector: 'app-loading-indicator-preview',
  standalone: true,
  imports: [MatExpressiveLoadingIndicator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-indicator-preview.component.html',
  styleUrl: './loading-indicator-preview.component.scss',
})
export class LoadingIndicatorPreviewComponent {
  readonly config = input<MatExpressiveLoadingIndicatorConfig>('default');
  readonly speed = input<MatExpressiveLoadingIndicatorSpeed>('default');
  readonly ariaLabel = input<string | null>(null);
}
