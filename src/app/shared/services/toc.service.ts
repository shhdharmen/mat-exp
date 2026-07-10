import { Injectable, signal } from '@angular/core';

export interface TocItem {
  id: string;
  label: string;
  level: number;
}

@Injectable({ providedIn: 'root' })
export class TocService {
  private readonly _items = signal<TocItem[]>([]);

  readonly items = this._items.asReadonly();

  setItems(items: TocItem[]): void {
    this._items.set(items);
  }

  clear(): void {
    this._items.set([]);
  }
}
