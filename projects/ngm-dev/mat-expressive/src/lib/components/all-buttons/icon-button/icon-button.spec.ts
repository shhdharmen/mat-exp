import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatExpressiveIconButton } from './icon-button';
import { provideMatExpressiveIconButtonOptions } from './icon-button.options';
import { MatExpressiveButtonGroup } from '../button-group';
import type {
  MatExpressiveButtonGroupAppearance,
  MatExpressiveButtonShape,
  MatExpressiveButtonSize,
  MatExpressiveButtonToggle,
  MatExpressiveIconButtonAppearance,
  MatExpressiveIconButtonWidth,
} from '../../../types';

/** Host that never binds any input, so the directive's own defaults apply. */
@Component({
  standalone: true,
  imports: [MatIconButton, MatExpressiveIconButton],
  template: `
    <button matIconButton matExpressiveIconButton>
      <span>icon</span>
    </button>
  `,
})
class IconButtonDefaultsTestHost {}

/** Host that binds every input so tests can drive value changes through it. */
@Component({
  standalone: true,
  imports: [MatIconButton, MatExpressiveIconButton],
  template: `
    <button
      matIconButton
      matExpressiveIconButton
      [size]="size()"
      [shape]="shape()"
      [width]="width()"
      [appearance]="appearance()"
      [toggle]="toggle()"
    >
      <span>icon</span>
    </button>
  `,
})
class IconButtonBoundTestHost {
  readonly size = signal<MatExpressiveButtonSize>('s');
  readonly shape = signal<MatExpressiveButtonShape>('round');
  readonly width = signal<MatExpressiveIconButtonWidth>('default');
  readonly appearance = signal<MatExpressiveIconButtonAppearance>('text');
  readonly toggle = signal<MatExpressiveButtonToggle | undefined>(undefined);
}

/** Host that projects icon buttons into a `MatExpressiveButtonGroup`. */
@Component({
  standalone: true,
  imports: [MatIconButton, MatExpressiveIconButton, MatExpressiveButtonGroup],
  template: `
    <mat-expressive-button-group
      [size]="size()"
      [shape]="shape()"
      [appearance]="appearance()"
      [disabled]="disabled()"
    >
      <button matIconButton matExpressiveIconButton [value]="'a'"><span>a</span></button>
      <button matIconButton matExpressiveIconButton [value]="'b'"><span>b</span></button>
    </mat-expressive-button-group>
  `,
})
class IconButtonGroupTestHost {
  readonly size = signal<MatExpressiveButtonSize>('s');
  readonly shape = signal<MatExpressiveButtonShape>('round');
  readonly appearance = signal<MatExpressiveButtonGroupAppearance | undefined>(undefined);
  readonly disabled = signal(false);
}

/** Host with a `MatMenuTrigger` attached to the icon button. */
@Component({
  standalone: true,
  imports: [MatIconButton, MatExpressiveIconButton, MatMenu, MatMenuItem, MatMenuTrigger],
  template: `
    <button matIconButton matExpressiveIconButton [matMenuTriggerFor]="menu">
      <span>icon</span>
    </button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item</button>
    </mat-menu>
  `,
})
class IconButtonMenuTestHost {}

describe('MatExpressiveIconButton', () => {
  it('renders with the default size and shape', () => {
    const fixture = TestBed.createComponent(IconButtonDefaultsTestHost);
    fixture.detectChanges();

    const iconButton = fixture.debugElement
      .query(By.directive(MatExpressiveIconButton))
      .injector.get(MatExpressiveIconButton);

    expect(iconButton.size()).toBe('s');
    expect(iconButton.shape()).toBe('round');
  });

  it('exposes the default class and reflects size/shape as host attributes', () => {
    const fixture = TestBed.createComponent(IconButtonDefaultsTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpressiveIconButton));
    const iconButton = debugElement.injector.get(MatExpressiveIconButton);

    expect(iconButton.matExpressiveIconButtonClass).toBe('mat-expressive-icon-button');

    const nativeElement = debugElement.nativeElement as HTMLElement;
    expect(nativeElement.getAttribute('data-size')).toBe('s');
    expect(nativeElement.getAttribute('data-shape')).toBe('round');
  });

  it('reflects size/shape/width/appearance/toggle as host attributes', () => {
    const fixture = TestBed.createComponent(IconButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpressiveIconButton))
      .nativeElement as HTMLElement;

    expect(nativeElement.getAttribute('data-size')).toBe('s');
    expect(nativeElement.getAttribute('data-shape')).toBe('round');
    expect(nativeElement.getAttribute('data-width')).toBe('default');
    expect(nativeElement.getAttribute('data-appearance')).toBe('text');
    expect(nativeElement.hasAttribute('data-toggle')).toBe(false);

    host.size.set('l');
    host.shape.set('square');
    host.width.set('wide');
    host.appearance.set('filled');
    host.toggle.set('selected');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-size')).toBe('l');
    expect(nativeElement.getAttribute('data-shape')).toBe('square');
    expect(nativeElement.getAttribute('data-width')).toBe('wide');
    expect(nativeElement.getAttribute('data-appearance')).toBe('filled');
    expect(nativeElement.getAttribute('data-toggle')).toBe('selected');
  });
});

describe('MatExpressiveIconButton with provideMatExpressiveIconButtonOptions', () => {
  it('overrides the default size, shape, width, and appearance', () => {
    TestBed.configureTestingModule({
      providers: [
        provideMatExpressiveIconButtonOptions({
          size: 'l',
          shape: 'square',
          width: 'wide',
          appearance: 'filled',
        }),
      ],
    });

    const fixture = TestBed.createComponent(IconButtonDefaultsTestHost);
    fixture.detectChanges();

    const iconButton = fixture.debugElement
      .query(By.directive(MatExpressiveIconButton))
      .injector.get(MatExpressiveIconButton);

    expect(iconButton.size()).toBe('l');
    expect(iconButton.shape()).toBe('square');
    expect(iconButton.width()).toBe('wide');
    expect(iconButton.appearance).toBe('filled');
  });
});

describe('MatExpressiveIconButton inside MatExpressiveButtonGroup', () => {
  function setup() {
    const fixture = TestBed.createComponent(IconButtonGroupTestHost);
    fixture.detectChanges();

    const group = fixture.debugElement
      .query(By.directive(MatExpressiveButtonGroup))
      .injector.get(MatExpressiveButtonGroup);

    const iconButtons = group._matExpressiveIconButtons() as MatExpressiveIconButton[];

    return { fixture, host: fixture.componentInstance, group, iconButtons };
  }

  it('broadcasts size/shape/appearance/disabled to every projected icon button via the ButtonGroupChild adapter', () => {
    const { fixture, host, iconButtons } = setup();

    expect(iconButtons.length).toBe(2);

    host.size.set('l');
    host.shape.set('square');
    host.appearance.set('filled');
    host.disabled.set(true);
    fixture.detectChanges();

    for (const button of iconButtons) {
      expect(button.size()).toBe('l');
      expect(button.shape()).toBe('square');
      expect(button.appearance).toBe('filled');
      expect(button.disabled).toBe(true);
    }
  });

  it('selects the clicked icon button and syncs its toggle state via the group', () => {
    const { fixture, group, iconButtons } = setup();

    iconButtons[0]._onButtonClick();
    fixture.detectChanges();

    expect(iconButtons[0].toggle()).toBe('selected');
    expect(iconButtons[1].toggle()).toBe('unselected');
    expect(group.value).toBe('a');
  });
});

describe('MatExpressiveIconButton isMenuOpen', () => {
  it('starts closed and reflects `isMenuOpen`/`data-menu-open` as the menu opens/closes', () => {
    const fixture = TestBed.createComponent(IconButtonMenuTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpressiveIconButton));
    const iconButton = debugElement.injector.get(MatExpressiveIconButton);
    const matMenuTrigger = debugElement.injector.get(MatMenuTrigger);
    const nativeElement = debugElement.nativeElement as HTMLElement;

    expect(iconButton.isMenuOpen).toBe(false);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('false');

    matMenuTrigger.openMenu();
    fixture.detectChanges();

    expect(iconButton.isMenuOpen).toBe(true);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('true');

    matMenuTrigger.closeMenu();
    fixture.detectChanges();

    expect(iconButton.isMenuOpen).toBe(false);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('false');
  });
});
