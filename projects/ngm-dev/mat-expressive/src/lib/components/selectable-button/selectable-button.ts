import { EventEmitter, ModelSignal } from '@angular/core';

export interface MatExpressiveSelectableButton {
  /** Whether the button is checked. */
  checked: boolean;
  /** The value assigned to the button. */
  value: ModelSignal<any>;
  /** Marks the button as needing checking for change detection. */
  _markForCheck: () => void;
  /** Event emitted when the button value changes. */
  readonly change: EventEmitter<MatExpressiveSelectableButtonChange>;
}

/** Change event object emitted by button toggle. */
export class MatExpressiveSelectableButtonChange {
  constructor(
    /** The button that emits the event. */
    public source: MatExpressiveSelectableButton,

    /** The value assigned to the button. */
    public value: any,
  ) {}
}
