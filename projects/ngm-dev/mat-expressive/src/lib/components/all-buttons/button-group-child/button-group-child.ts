import { effect, type Signal } from '@angular/core';
import { type MatButtonAppearance } from '@angular/material/button';
import { MatExpressiveButton } from '../button';
import { MatExpressiveIconButton } from '../icon-button';
import type {
  MatExpressiveButtonShape,
  MatExpressiveButtonSize,
  MatExpressiveIconButtonAppearance,
} from '../../../types';

/**
 * Narrow contract that `MatExpressiveButtonGroup` and `MatExpressiveSplitButton` depend on
 * instead of reaching into the full public surface of `MatExpressiveButton` /
 * `MatExpressiveIconButton`.
 *
 * Keeping this interface narrow means a change to either button directive's public setters
 * no longer ripples silently into both group/split-button implementations - only the adapter
 * for the affected directive needs to change.
 */
export interface ButtonGroupChild {
  setSize(size: MatExpressiveButtonSize): void;
  setShape(shape: MatExpressiveButtonShape): void;
  setAppearance(appearance: MatButtonAppearance): void;
  setDisabled(disabled: boolean): void;
}

/** Adapts a `MatExpressiveButton` directive instance to the `ButtonGroupChild` contract. */
export class ButtonAdapter implements ButtonGroupChild {
  constructor(private readonly button: MatExpressiveButton) {}

  setSize(size: MatExpressiveButtonSize): void {
    this.button.size.set(size);
  }

  setShape(shape: MatExpressiveButtonShape): void {
    this.button.shape.set(shape);
  }

  setAppearance(appearance: MatButtonAppearance): void {
    this.button.appearance = appearance;
  }

  setDisabled(disabled: boolean): void {
    this.button.disabled = disabled;
  }
}

/** Adapts a `MatExpressiveIconButton` directive instance to the `ButtonGroupChild` contract. */
export class IconButtonAdapter implements ButtonGroupChild {
  constructor(private readonly button: MatExpressiveIconButton) {}

  setSize(size: MatExpressiveButtonSize): void {
    this.button.size.set(size);
  }

  setShape(shape: MatExpressiveButtonShape): void {
    this.button.shape.set(shape);
  }

  setAppearance(appearance: MatButtonAppearance): void {
    // `MatExpressiveIconButton` supports a narrower appearance union than `MatButtonAppearance`
    // (no `elevated`); callers are expected to only pass values relevant to icon buttons.
    this.button.appearance = appearance as MatExpressiveIconButtonAppearance;
  }

  setDisabled(disabled: boolean): void {
    this.button.disabled = disabled;
  }
}

/** Wraps a projected button/icon-button directive instance in its `ButtonGroupChild` adapter. */
export function toButtonGroupChild(
  button: MatExpressiveButton | MatExpressiveIconButton,
): ButtonGroupChild {
  return button instanceof MatExpressiveIconButton
    ? new IconButtonAdapter(button)
    : new ButtonAdapter(button);
}

/** Reactive sources that can drive a broadcast to a set of `ButtonGroupChild` instances. */
export interface ButtonGroupChildBroadcastConfig {
  /** The current set of children to broadcast style/state changes to. */
  children: Signal<readonly ButtonGroupChild[]>;
  size?: Signal<MatExpressiveButtonSize | undefined>;
  shape?: Signal<MatExpressiveButtonShape | undefined>;
  appearance?: Signal<MatButtonAppearance | undefined>;
  disabled?: Signal<boolean | undefined>;
}

/**
 * Registers the effects that broadcast `size`/`shape`/`appearance`/`disabled` from a
 * group-like host (`MatExpressiveButtonGroup`, `MatExpressiveSplitButton`) down to its
 * projected `ButtonGroupChild` instances.
 *
 * This is the single implementation of the broadcast-effect logic that was previously
 * duplicated between `button-group.ts` and `split-button.ts`. Must be called from within
 * an injection context (e.g. a component/directive constructor).
 */
export function bindButtonGroupChildren(config: ButtonGroupChildBroadcastConfig): void {
  const { children, size, shape, appearance, disabled } = config;

  if (size) {
    effect(() => {
      const value = size();
      if (value) {
        children().forEach((child) => child.setSize(value));
      }
    });
  }

  if (shape) {
    effect(() => {
      const value = shape();
      if (value) {
        children().forEach((child) => child.setShape(value));
      }
    });
  }

  if (appearance) {
    effect(() => {
      const value = appearance();
      if (value) {
        children().forEach((child) => child.setAppearance(value));
      }
    });
  }

  if (disabled) {
    effect(() => {
      const value = disabled();
      children().forEach((child) => child.setDisabled(value ?? false));
    });
  }
}
