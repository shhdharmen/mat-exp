import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatExpressiveButton } from './button';
import { provideMatExpressiveButtonOptions } from './button.options';
import { MatExpressiveButtonGroup } from '../button-group';
import type {
  MatExpressiveButtonShape,
  MatExpressiveButtonSize,
  MatExpressiveButtonToggle,
} from '../../../types';

/** Host that never binds any input, so the directive's own defaults apply. */
@Component({
  standalone: true,
  imports: [MatButton, MatExpressiveButton],
  template: `<button matButton matExpressiveButton>Click</button>`,
})
class ButtonDefaultsTestHost {}

/** Host that binds `size`/`shape`/`toggle` so tests can drive value changes through it. */
@Component({
  standalone: true,
  imports: [MatButton, MatExpressiveButton],
  template: `
    <button matButton matExpressiveButton [size]="size()" [shape]="shape()" [toggle]="toggle()">
      Click
    </button>
  `,
})
class ButtonBoundTestHost {
  readonly size = signal<MatExpressiveButtonSize>('s');
  readonly shape = signal<MatExpressiveButtonShape>('round');
  readonly toggle = signal<MatExpressiveButtonToggle | undefined>(undefined);
}

/** Host that projects a button into a `MatExpressiveButtonGroup`. */
@Component({
  standalone: true,
  imports: [MatButton, MatExpressiveButton, MatExpressiveButtonGroup],
  template: `
    <mat-expressive-button-group>
      <button matButton matExpressiveButton [value]="'a'">A</button>
    </mat-expressive-button-group>
  `,
})
class ButtonGroupBroadcastTestHost {}

/** Host that pairs a button with a `MatMenuTrigger`. */
@Component({
  standalone: true,
  imports: [MatButton, MatExpressiveButton, MatMenu, MatMenuItem, MatMenuTrigger],
  template: `
    <button matButton matExpressiveButton [matMenuTriggerFor]="menu">Open</button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item</button>
    </mat-menu>
  `,
})
class ButtonWithMenuTestHost {}

describe('MatExpressiveButton defaults', () => {
  it('renders with the default size and shape', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpressiveButton))
      .injector.get(MatExpressiveButton);

    expect(button.size()).toBe('s');
    expect(button.shape()).toBe('round');
  });

  it('exposes the default class and reflects size/shape as host attributes', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpressiveButton));
    const button = debugElement.injector.get(MatExpressiveButton);

    expect(button.matExpressiveButtonClass).toBe('mat-expressive-button');

    const nativeElement = debugElement.nativeElement as HTMLElement;
    expect(nativeElement.getAttribute('data-size')).toBe('s');
    expect(nativeElement.getAttribute('data-shape')).toBe('round');
  });
});

describe('MatExpressiveButton input -> host attribute mapping', () => {
  it('reflects `size` as `data-size`', () => {
    const fixture = TestBed.createComponent(ButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpressiveButton))
      .nativeElement as HTMLElement;

    host.size.set('l');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-size')).toBe('l');
  });

  it('reflects `shape` as `data-shape`', () => {
    const fixture = TestBed.createComponent(ButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpressiveButton))
      .nativeElement as HTMLElement;

    host.shape.set('square');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-shape')).toBe('square');
  });

  it('reflects `toggle` as `data-toggle`', () => {
    const fixture = TestBed.createComponent(ButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpressiveButton))
      .nativeElement as HTMLElement;

    expect(nativeElement.hasAttribute('data-toggle')).toBe(false);

    host.toggle.set('selected');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-toggle')).toBe('selected');

    host.toggle.set('unselected');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-toggle')).toBe('unselected');
  });
});

describe('MatExpressiveButton with provideMatExpressiveButtonOptions', () => {
  it('overrides the default size, shape, and toggle', () => {
    TestBed.configureTestingModule({
      providers: [
        provideMatExpressiveButtonOptions({ size: 'l', shape: 'square', toggle: 'selected' }),
      ],
    });

    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpressiveButton))
      .injector.get(MatExpressiveButton);

    expect(button.size()).toBe('l');
    expect(button.shape()).toBe('square');
    expect(button.toggle()).toBe('selected');
  });
});

describe('MatExpressiveButton appearance/disabled passthrough', () => {
  it('delegates `appearance` and `disabled` to the underlying MatButton', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpressiveButton))
      .injector.get(MatExpressiveButton);

    button.appearance = 'filled';
    expect(button.appearance).toBe('filled');

    button.disabled = true;
    expect(button.disabled).toBe(true);
  });
});

describe('MatExpressiveButton inside a MatExpressiveButtonGroup', () => {
  it('delegates `_onButtonClick()` to the group with itself as the argument', () => {
    const fixture = TestBed.createComponent(ButtonGroupBroadcastTestHost);
    fixture.detectChanges();

    const group = fixture.debugElement
      .query(By.directive(MatExpressiveButtonGroup))
      .injector.get(MatExpressiveButtonGroup);
    const button = fixture.debugElement
      .query(By.directive(MatExpressiveButton))
      .injector.get(MatExpressiveButton);

    const onButtonClickSpy = vi.spyOn(group, '_onButtonClick');

    button._onButtonClick();

    expect(onButtonClickSpy).toHaveBeenCalledTimes(1);
    expect(onButtonClickSpy).toHaveBeenCalledWith(button);
  });
});

describe('MatExpressiveButton without a MatExpressiveButtonGroup', () => {
  it('does not throw when `_onButtonClick()` is called with no group present', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpressiveButton))
      .injector.get(MatExpressiveButton);

    expect(() => button._onButtonClick()).not.toThrow();
  });
});

describe('MatExpressiveButton isMenuOpen', () => {
  it('returns false when no MatMenuTrigger is present', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpressiveButton))
      .injector.get(MatExpressiveButton);

    expect(button.isMenuOpen).toBe(false);
  });

  it('reflects `MatMenuTrigger.menuOpen` (and `data-menu-open`) as the menu opens/closes', () => {
    const fixture = TestBed.createComponent(ButtonWithMenuTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpressiveButton));
    const button = debugElement.injector.get(MatExpressiveButton);
    const matMenuTrigger = debugElement.injector.get(MatMenuTrigger);
    const nativeElement = debugElement.nativeElement as HTMLElement;

    expect(button.isMenuOpen).toBe(false);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('false');

    matMenuTrigger.openMenu();
    fixture.detectChanges();

    expect(button.isMenuOpen).toBe(true);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('true');

    matMenuTrigger.closeMenu();
    fixture.detectChanges();

    expect(button.isMenuOpen).toBe(false);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('false');
  });
});
