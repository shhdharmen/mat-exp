import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatFabButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatExpressiveFabMenuTrigger } from './fab-menu-trigger';

@Component({
  standalone: true,
  imports: [MatFabButton, MatMenu, MatMenuItem, MatMenuTrigger, MatExpressiveFabMenuTrigger],
  template: `
    <button matFab matExpressiveFabMenuTrigger [matMenuTriggerFor]="menu">Open</button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item</button>
    </mat-menu>
  `,
})
class FabMenuTriggerTestHost {}

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
