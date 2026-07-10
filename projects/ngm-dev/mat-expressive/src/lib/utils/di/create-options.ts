import { type FactoryProvider, inject, InjectionToken } from '@angular/core';

/**
 * Everything a `*.options.ts` file needs to expose for a single options bag:
 * the injection token, a `provide*` function for overriding defaults down the
 * injector tree, and an `inject*` function that resolves the merged options
 * for the current injector.
 */
export interface MatExpressiveOptionsFactory<T> {
  /** Injection token holding the merged options for the current injector. */
  readonly token: InjectionToken<T>;
  /**
   * Creates a provider that merges `options` (partial overrides, static or
   * computed) on top of whatever is provided further up the injector tree —
   * falling back to `defaults` at the root.
   */
  readonly provide: (options: Partial<T> | (() => Partial<T>)) => FactoryProvider;
  /**
   * Resolves the merged options object for the current injector. Must be
   * called within an injection context (e.g. a field initializer or the
   * constructor of a directive/component).
   */
  readonly inject: () => T;
}

/**
 * Deep factory that collapses the "InjectionToken + factory-provider that
 * merges partial overrides down the injector tree" ceremony into a single
 * call. Every `*.options.ts` file should call this once with its defaults
 * and re-export `token` / `provide` / `inject` (optionally renamed).
 */
export function matExpressiveCreateOptions<T>(defaults: T): MatExpressiveOptionsFactory<T> {
  const token = new InjectionToken<T>(ngDevMode ? 'Options token' : '', {
    factory: () => defaults,
  });

  const provide = (options: Partial<T> | (() => Partial<T>)): FactoryProvider => ({
    provide: token,
    useFactory: (): T => ({
      ...(inject(token, { optional: true, skipSelf: true }) ?? defaults),
      ...(typeof options === 'function' ? options() : options),
    }),
  });

  const injectOptions = (): T => inject(token);

  return { token, provide, inject: injectOptions };
}
