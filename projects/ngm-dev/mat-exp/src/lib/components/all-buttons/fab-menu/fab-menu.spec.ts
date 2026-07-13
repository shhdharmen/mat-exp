import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatExpFabMenu } from './fab-menu';
import type { MatExpFabMenuColor } from '../../../types/appearance';

@Component({
  standalone: true,
  imports: [MatMenuModule, MatExpFabMenu],
  template: `<mat-menu matExpFabMenu [color]="color()"></mat-menu>`,
})
class FabMenuTestHost {
  readonly color = signal<MatExpFabMenuColor>('primary');
}

describe('MatExpFabMenu panelClass', () => {
  function setup() {
    const fixture = TestBed.createComponent(FabMenuTestHost);
    const host = fixture.componentInstance;

    const menu = fixture.debugElement.query(By.directive(MatMenu)).injector.get(MatMenu);
    const panelClassSetter = vi.spyOn(menu, 'panelClass', 'set');

    fixture.detectChanges();

    return { fixture, host, panelClassSetter };
  }

  it('sets exactly one mat-exp-fab-menu-{color} class on initial render', () => {
    const { panelClassSetter } = setup();

    expect(panelClassSetter).toHaveBeenCalledTimes(1);
    expect(panelClassSetter.mock.calls[0][0]).toBe('mat-exp-fab-menu mat-exp-fab-menu-primary');
  });

  it('recomputes panelClass from scratch on each color change, without accumulating previous colors', () => {
    const { fixture, host, panelClassSetter } = setup();

    host.color.set('secondary');
    fixture.detectChanges();

    expect(panelClassSetter).toHaveBeenCalledTimes(2);
    const afterSecondary = panelClassSetter.mock.calls[1][0];
    expect(afterSecondary).toBe('mat-exp-fab-menu mat-exp-fab-menu-secondary');
    expect(afterSecondary).not.toContain('primary');

    host.color.set('tertiary');
    fixture.detectChanges();

    expect(panelClassSetter).toHaveBeenCalledTimes(3);
    const afterTertiary = panelClassSetter.mock.calls[2][0];
    expect(afterTertiary).toBe('mat-exp-fab-menu mat-exp-fab-menu-tertiary');
    expect(afterTertiary).not.toContain('primary');
    expect(afterTertiary).not.toContain('secondary');
  });
});
