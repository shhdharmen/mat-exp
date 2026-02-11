import { NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent } from '@ng-doc/app';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('mat-expressive-docs');
}
