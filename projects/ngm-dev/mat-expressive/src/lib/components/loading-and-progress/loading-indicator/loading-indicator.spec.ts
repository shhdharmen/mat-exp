import { PLATFORM_ID, type AnimationCallbackEvent } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { MatExpressiveLoadingIndicator } from './loading-indicator';

// The Angular unit-test builder does not support `vi.mock` for relative imports ("Please use
// Angular TestBed for mocking dependencies"), so GSAP itself - a real, non-relative package
// import shared as a singleton between this spec and `loading-indicator.animation.ts` - is spied
// on directly instead. `gsap.matchMedia` is the single entry point the rotation/morph timeline is
// built through (`setupRotationAndMorph`), so intercepting it is enough to keep the real
// recursive `gsap.to(...).onComplete(...)` morph loop (which never settles without a real
// `requestAnimationFrame` ticker) from ever starting, while still observing exactly what the
// component asks GSAP to do.

/** Stubs `window.matchMedia` so `prefers-reduced-motion` resolves to a fixed value. */
function stubMatchMedia(reduceMotion: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? reduceMotion : !reduceMotion,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('MatExpressiveLoadingIndicator', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  describe('defaults', () => {
    function setup() {
      // `prefers-reduced-motion: reduce` keeps the real (unmocked) `gsap.matchMedia()` call the
      // constructor makes from ever starting the recursive morph/rotation tween loop.
      stubMatchMedia(true);
      const fixture = TestBed.createComponent(MatExpressiveLoadingIndicator);
      fixture.detectChanges();
      return fixture;
    }

    it('renders the default config/ariaLabel/speed inputs', () => {
      const fixture = setup();
      const component = fixture.componentInstance;

      expect(component.config()).toBe('default');
      expect(component.ariaLabel()).toBe('Loading');
      expect(component.speed()).toBe('default');
    });

    it('sets the aria-* and data-speed host attributes correctly', () => {
      const fixture = setup();
      const host: HTMLElement = fixture.debugElement.nativeElement;

      expect(host.getAttribute('role')).toBe('progressbar');
      expect(host.getAttribute('aria-valuemin')).toBe('0');
      expect(host.getAttribute('aria-valuemax')).toBe('100');
      expect(host.getAttribute('aria-busy')).toBe('true');
      expect(host.getAttribute('aria-label')).toBe('Loading');
      expect(host.getAttribute('data-speed')).toBe('default');
      expect(host.classList.contains('mat-expressive-loading-indicator')).toBe(true);
    });
  });

  describe('server platform guard', () => {
    function setupOnServer() {
      stubMatchMedia(true);
      TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
      const fixture = TestBed.createComponent(MatExpressiveLoadingIndicator);
      fixture.detectChanges();
      return fixture;
    }

    it('does not throw when constructed with PLATFORM_ID set to "server"', () => {
      expect(() => setupOnServer()).not.toThrow();
    });

    it('never registers GSAP plugins/eases or builds the rotation+morph timeline', () => {
      const registerPluginSpy = vi.spyOn(gsap, 'registerPlugin');
      const createEaseSpy = vi.spyOn(CustomEase, 'create');
      const matchMediaSpy = vi.spyOn(gsap, 'matchMedia');

      setupOnServer();

      expect(registerPluginSpy).not.toHaveBeenCalled();
      expect(createEaseSpy).not.toHaveBeenCalled();
      expect(matchMediaSpy).not.toHaveBeenCalled();
    });

    it('resolves onEnter/onLeave synchronously without touching the DOM/GSAP', () => {
      const fixture = setupOnServer();
      const component = fixture.componentInstance;
      const animationComplete = vi.fn();

      component.onEnter({ animationComplete } as unknown as AnimationCallbackEvent);
      expect(animationComplete).toHaveBeenCalledTimes(1);

      component.onLeave({ animationComplete } as unknown as AnimationCallbackEvent);
      expect(animationComplete).toHaveBeenCalledTimes(2);
    });
  });

  describe('speed changes', () => {
    it('tears down the previous GSAP matchMedia context and rebuilds it when speed changes', async () => {
      stubMatchMedia(false);
      const revertFirst = vi.fn();
      const revertSecond = vi.fn();
      const matchMediaSpy = vi
        .spyOn(gsap, 'matchMedia')
        .mockImplementationOnce(() => ({ add: vi.fn(), revert: revertFirst }) as never)
        .mockImplementationOnce(() => ({ add: vi.fn(), revert: revertSecond }) as never);

      const fixture = TestBed.createComponent(MatExpressiveLoadingIndicator);
      fixture.componentRef.setInput('speed', 'fast');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(matchMediaSpy).toHaveBeenCalledTimes(1);
      expect(revertFirst).not.toHaveBeenCalled();

      fixture.componentRef.setInput('speed', 'slow');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(revertFirst).toHaveBeenCalledTimes(1);
      expect(matchMediaSpy).toHaveBeenCalledTimes(2);
      expect(revertSecond).not.toHaveBeenCalled();
    });
  });

  describe('prefers-reduced-motion enter/leave', () => {
    function setup() {
      stubMatchMedia(true);
      const fixture = TestBed.createComponent(MatExpressiveLoadingIndicator);
      fixture.detectChanges();
      return fixture;
    }

    it('calls animationComplete() synchronously from onEnter when prefers-reduced-motion: reduce', () => {
      const fixture = setup();
      const component = fixture.componentInstance;
      const animationComplete = vi.fn();

      component.onEnter({ animationComplete } as unknown as AnimationCallbackEvent);

      expect(animationComplete).toHaveBeenCalledTimes(1);
    });

    it('calls animationComplete() synchronously from onLeave when prefers-reduced-motion: reduce', () => {
      const fixture = setup();
      const component = fixture.componentInstance;
      const animationComplete = vi.fn();

      component.onLeave({ animationComplete } as unknown as AnimationCallbackEvent);

      expect(animationComplete).toHaveBeenCalledTimes(1);
    });
  });
});
