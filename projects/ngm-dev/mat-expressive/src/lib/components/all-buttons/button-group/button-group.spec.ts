import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButton } from '@angular/material/button';
import { MatExpressiveButton } from '../button';
import { MatExpressiveButtonGroup } from './button-group';
import { MatExpressiveSelectableButtonChange } from '../selectable-button/selectable-button';
import type { MatExpressiveButtonGroupSelection, MatExpressiveButtonSize } from '../../../types';

@Component({
  standalone: true,
  imports: [MatButton, MatExpressiveButton, MatExpressiveButtonGroup],
  template: `
    <mat-expressive-button-group
      [selection]="selection()"
      [size]="size()"
      [disabled]="disabled()"
      (selectionChange)="onSelectionChange($event)"
    >
      <button matButton matExpressiveButton [value]="'a'">A</button>
      <button matButton matExpressiveButton [value]="'b'">B</button>
      <button matButton matExpressiveButton [value]="'c'">C</button>
    </mat-expressive-button-group>
  `,
})
class ButtonGroupTestHost {
  readonly selection = signal<MatExpressiveButtonGroupSelection>('single-select');
  readonly size = signal<MatExpressiveButtonSize>('s');
  readonly disabled = signal(false);
  readonly changes: MatExpressiveSelectableButtonChange[] = [];

  onSelectionChange(change: MatExpressiveSelectableButtonChange): void {
    this.changes.push(change);
  }
}

describe('MatExpressiveButtonGroup selection-sync', () => {
  function setup() {
    const fixture = TestBed.createComponent(ButtonGroupTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const group = fixture.debugElement
      .query(By.directive(MatExpressiveButtonGroup))
      .injector.get(MatExpressiveButtonGroup);

    // `_allButtonGroupChildren`/`_allExpressiveButtons` are populated from real projected
    // `MatExpressiveButton` content children - this is the seam the `ButtonGroupChild`
    // adapters wrap, exercised end-to-end here.
    const buttons = group._allExpressiveButtons() as MatExpressiveButton[];

    return { fixture, host, group, buttons };
  }

  it('selects the clicked button, syncs toggle state, and emits selectionChange', () => {
    const { fixture, host, group, buttons } = setup();

    buttons[0]._onButtonClick();
    fixture.detectChanges();

    expect(buttons[0].toggle()).toBe('selected');
    expect(buttons[1].toggle()).toBe('unselected');
    expect(buttons[2].toggle()).toBe('unselected');
    expect(group.value).toBe('a');
    expect(host.changes.length).toBe(1);
    expect(host.changes[0].value).toBe('a');
  });

  it('replaces the previous selection when a different button is clicked (single-select)', () => {
    const { fixture, group, buttons } = setup();

    buttons[0]._onButtonClick();
    fixture.detectChanges();
    buttons[1]._onButtonClick();
    fixture.detectChanges();

    expect(buttons[0].toggle()).toBe('unselected');
    expect(buttons[1].toggle()).toBe('selected');
    expect(group.value).toBe('b');
  });

  it('deselects a button when it is clicked again', () => {
    const { fixture, group, buttons } = setup();

    buttons[0]._onButtonClick();
    fixture.detectChanges();
    buttons[0]._onButtonClick();
    fixture.detectChanges();

    expect(buttons[0].toggle()).toBe('unselected');
    expect(group.value).toBeUndefined();
  });

  it('accumulates selections when switched to multi-select', () => {
    const { fixture, host, group, buttons } = setup();

    host.selection.set('multi-select');
    fixture.detectChanges();

    buttons[0]._onButtonClick();
    buttons[2]._onButtonClick();
    fixture.detectChanges();

    expect(group.value).toEqual(['a', 'c']);
    expect(buttons[0].toggle()).toBe('selected');
    expect(buttons[1].toggle()).toBe('unselected');
    expect(buttons[2].toggle()).toBe('selected');
  });

  it('syncs button toggle state from a programmatically-set value', () => {
    const { fixture, group, buttons } = setup();

    group.value = 'b';
    fixture.detectChanges();

    expect(buttons[0].toggle()).toBe('unselected');
    expect(buttons[1].toggle()).toBe('selected');
    expect(buttons[2].toggle()).toBe('unselected');
  });

  it('broadcasts size/disabled to every projected button via the ButtonGroupChild adapters', () => {
    const { fixture, host, buttons } = setup();

    host.size.set('l');
    host.disabled.set(true);
    fixture.detectChanges();

    for (const button of buttons) {
      expect(button.size()).toBe('l');
      expect(button.disabled).toBe(true);
    }
  });
});
