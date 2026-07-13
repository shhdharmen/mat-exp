import { signal, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { type MatMenuTrigger } from '@angular/material/menu';
import { map, merge } from 'rxjs';

/**
 * Builds a `Signal<boolean>` that reactively tracks whether the given `MatMenuTrigger`'s menu
 * is currently open, fed by its `menuOpened`/`menuClosed` outputs.
 *
 * This is the single implementation shared by every button-family directive that renders a
 * `data-menu-open` host attribute (`MatExpButton`, `MatExpIconButton`,
 * `MatExpFabMenuTrigger`), replacing a plain `get isMenuOpen()` getter that happened to
 * work only because Angular Material's own state changes triggered change detection.
 *
 * Must be called within an injection context (e.g. a field initializer or the constructor of a
 * directive/component). Returns a signal that is always `false` when `matMenuTrigger` is
 * `null`/`undefined` (no menu attached to this host).
 */
export function injectIsMenuOpenSignal(
  matMenuTrigger: MatMenuTrigger | null | undefined,
): Signal<boolean> {
  if (!matMenuTrigger) {
    return signal(false);
  }

  return toSignal(
    merge(
      matMenuTrigger.menuOpened.pipe(map(() => true)),
      matMenuTrigger.menuClosed.pipe(map(() => false)),
    ),
    { initialValue: matMenuTrigger.menuOpen },
  );
}
