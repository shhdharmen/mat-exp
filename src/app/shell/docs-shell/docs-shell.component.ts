import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarNavComponent } from '../sidebar-nav/sidebar-nav.component';
import { DocPrevNextComponent } from '../doc-prev-next/doc-prev-next.component';
import { DeviceService } from '../../shared/services/device.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-docs-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    HeaderComponent,
    SidebarNavComponent,
    DocPrevNextComponent,
    FooterComponent,
  ],
  host: { class: 'shell' },
  templateUrl: './docs-shell.component.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class DocsShellComponent {
  protected readonly isMobile = inject(DeviceService).isHandset;
  protected readonly drawerOpen = linkedSignal(() => (this.isMobile() ? false : true));

  private readonly router = inject(Router);
  private readonly drawerContent = viewChild('drawerContent', { read: ElementRef });

  /**
   * `mat-drawer-content` — not `window` — is the actual scroll container (its own
   * `overflow-y: auto` wins over the Tailwind `overflow-hidden` utility on the same element), so
   * the router's `withInMemoryScrolling` (which only resets `window.scrollTo`) never runs. Reset
   * this container's scroll position on every navigation instead — but only when there's no
   * fragment, so TOC/jump-to-link navigation (which relies on `ViewportScroller.scrollToAnchor`'s
   * `scrollIntoView`, unaffected by this bug) isn't clobbered back to the top.
   */
  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    ),
  );

  constructor() {
    effect(() => {
      const event = this.navigationEnd();
      if (event && !event.urlAfterRedirects.includes('#')) {
        if (this.drawerContent()) {
          this.drawerContent()!.nativeElement.scrollTop = 0;
        }
      }
    });
  }
}
