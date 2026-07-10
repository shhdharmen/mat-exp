import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatFabButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatExpressiveFabMenuTrigger } from './fab-menu-trigger';
import type { MatExpressiveFabMenuTriggerColor } from '../../../types/appearance';

@Component({
  standalone: true,
  imports: [MatFabButton, MatMenu, MatMenuItem, MatMenuTrigger, MatExpressiveFabMenuTrigger],
  template: `
    <button matFab matExpressiveFabMenuTrigger [matMenuTriggerFor]="menu" [color]="color()">
      Open
    </button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item</button>
    </mat-menu>
  `,
})
class FabMenuTriggerTestHost {
  readonly color = signal<MatExpressiveFabMenuTriggerColor>('primary');
}

describe('MatExpressiveFabMenuTrigger isMenuOpen', () => {
  it('starts closed and reactively flips `isMenuOpen()` (and `data-menu-open`) as the menu opens/closes', () => {
    const fixture = TestBed.createComponent(FabMenuTriggerTestHost);
    fixture.detectChanges();

    const triggerDebugEl = fixture.debugElement.query(By.directive(MatExpressiveFabMenuTrigger));
    const fabMenuTrigger = triggerDebugEl.injector.get(MatExpressiveFabMenuTrigger);
    const matMenuTrigger = triggerDebugEl.injector.get(MatMenuTrigger);

    expect(fabMenuTrigger.isMenuOpen()).toBe(false);
    expect(triggerDebugEl.nativeElement.getAttribute('data-menu-open')).toBe('false');

    matMenuTrigger.openMenu();
    fixture.detectChanges();

    expect(fabMenuTrigger.isMenuOpen()).toBe(true);
    expect(triggerDebugEl.nativeElement.getAttribute('data-menu-open')).toBe('true');

    matMenuTrigger.closeMenu();
    fixture.detectChanges();

    expect(fabMenuTrigger.isMenuOpen()).toBe(false);
    expect(triggerDebugEl.nativeElement.getAttribute('data-menu-open')).toBe('false');
  });
});

describe('MatExpressiveFabMenuTrigger data-color', () => {
  function setup() {
    const fixture = TestBed.createComponent(FabMenuTriggerTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const triggerDebugEl = fixture.debugElement.query(By.directive(MatExpressiveFabMenuTrigger));

    return { fixture, host, triggerDebugEl };
  }

  it('reflects the default color input onto the data-color host attribute', () => {
    const { triggerDebugEl } = setup();

    expect(triggerDebugEl.nativeElement.getAttribute('data-color')).toBe('primary');
  });

  it('reflects color input changes onto the data-color host attribute', () => {
    const { fixture, host, triggerDebugEl } = setup();

    host.color.set('secondary');
    fixture.detectChanges();
    expect(triggerDebugEl.nativeElement.getAttribute('data-color')).toBe('secondary');

    host.color.set('tertiary');
    fixture.detectChanges();
    expect(triggerDebugEl.nativeElement.getAttribute('data-color')).toBe('tertiary');
  });
});
