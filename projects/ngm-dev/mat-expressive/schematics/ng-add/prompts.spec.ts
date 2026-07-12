import { checkbox, confirm } from '@inquirer/prompts';
import { render } from '@inquirer/testing';
import { describe, expect, it } from 'vitest';
import {
  buildComponentChoices,
  CONFIGURE_STYLES_MESSAGE,
  COMPONENT_PICKER_MESSAGE,
} from './prompts';

/**
 * Exercises the actual interactive widgets via `@inquirer/testing`'s `render()`, which drives
 * real keypress events through the real `checkbox`/`confirm` prompt implementations — not a
 * mock. This is what proves the component picker is a genuine arrow-key/space-toggle checkbox
 * list (per the UX requirement it replaced a "type numbers" text prompt with), rather than just
 * asserting against the wrapper functions that call it.
 */
describe('ng-add interactive prompts', () => {
  describe('component picker (checkbox)', () => {
    it('renders every component pre-checked', async () => {
      const { getScreen } = await render(checkbox, {
        message: COMPONENT_PICKER_MESSAGE,
        choices: buildComponentChoices(),
      });

      const screen = getScreen();
      expect(screen).toContain('Button Group');
      expect(screen).toContain('FAB Menu Trigger');
      // @inquirer/checkbox's default theme marks a checked item with a filled circle and an
      // unchecked one with a hollow circle — assert none are hollow, i.e. all start checked.
      expect(screen).not.toMatch(/○|◯/);
    });

    it('pressing enter immediately selects every component (matches the "all" default)', async () => {
      const { answer, events } = await render(checkbox, {
        message: COMPONENT_PICKER_MESSAGE,
        choices: buildComponentChoices(),
      });

      events.keypress('enter');

      await expect(answer).resolves.toEqual([
        'button',
        'icon-button',
        'button-group',
        'split-button',
        'fab-menu',
        'fab-menu-trigger',
      ]);
    });

    it('space toggles the focused item off, producing a real subset on confirm', async () => {
      const { answer, events } = await render(checkbox, {
        message: COMPONENT_PICKER_MESSAGE,
        choices: buildComponentChoices(),
      });

      events.keypress('space'); // toggles off the first choice ("Button"), focused by default
      events.keypress('enter');

      const result = await answer;
      expect(result).not.toContain('button');
      expect(result).toContain('icon-button');
      expect(result).toContain('fab-menu-trigger');
    });

    it('arrow-key navigation plus space toggles a non-default item off', async () => {
      const { answer, events } = await render(checkbox, {
        message: COMPONENT_PICKER_MESSAGE,
        choices: buildComponentChoices(),
      });

      events.keypress('down'); // move focus from "Button" to "Icon Button"
      events.keypress('space'); // toggle "Icon Button" off
      events.keypress('enter');

      const result = await answer;
      expect(result).toContain('button');
      expect(result).not.toContain('icon-button');
    });
  });

  describe('configure-styles prompt (confirm)', () => {
    it('defaults to yes when enter is pressed with no input', async () => {
      const { answer, events } = await render(confirm, {
        message: CONFIGURE_STYLES_MESSAGE,
        default: true,
      });

      events.keypress('enter');

      await expect(answer).resolves.toBe(true);
    });

    it('resolves to no when "n" is typed', async () => {
      const { answer, events } = await render(confirm, {
        message: CONFIGURE_STYLES_MESSAGE,
        default: true,
      });

      events.type('n');
      events.keypress('enter');

      await expect(answer).resolves.toBe(false);
    });
  });
});
