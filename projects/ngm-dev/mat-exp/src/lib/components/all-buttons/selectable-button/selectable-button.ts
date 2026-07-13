import { type ModelSignal } from '@angular/core';
import { MatExpButtonToggle } from '../../../types';

export interface MatExpSelectableButton {
  toggle: ModelSignal<MatExpButtonToggle | undefined>;
  value: ModelSignal<unknown>;

  _onButtonClick(): void;
}

/** Change event object emitted by button toggle. */
export class MatExpSelectableButtonChange {
  constructor(
    /** The button that emits the event. */
    public source: MatExpSelectableButton,

    /** The value assigned to the button. */
    public value: unknown,
  ) {}
}
