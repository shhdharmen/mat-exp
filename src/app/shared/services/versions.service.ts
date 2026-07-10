import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VersionsService {
  private readonly http = inject(HttpClient);

  readonly versions = signal<string[]>([]);

  constructor() {
    this.http
      .get<string[]>('https://expressive.angular-material.dev/versions.json')
      .pipe(
        catchError(() => of([])),
        takeUntilDestroyed(),
      )
      .subscribe((v) => this.versions.set(v));
  }
}
