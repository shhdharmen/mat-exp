import type { SchematicContext, Tree } from '@angular-devkit/schematics';
import { CSS_STYLES_ENTRY } from './constants';

interface WorkspaceTargetOptions {
  styles?: (string | { input?: string })[];
}

interface WorkspaceTarget {
  options?: WorkspaceTargetOptions;
}

interface WorkspaceProject {
  architect?: Record<string, WorkspaceTarget>;
  // Newer `angular.json` schemas (Angular CLI v20+) use `targets` instead of `architect`.
  targets?: Record<string, WorkspaceTarget>;
}

interface WorkspaceDefinition {
  defaultProject?: string;
  projects?: Record<string, WorkspaceProject>;
}

/** A resolved reference to the project's global stylesheet and its syntax. */
export interface GlobalStylesheet {
  path: string;
  type: 'scss' | 'sass' | 'css';
}

function resolveProject(
  tree: Tree,
  projectName?: string,
): { name: string; project: WorkspaceProject } | null {
  const raw = tree.read('/angular.json');
  if (!raw) {
    return null;
  }

  const workspace = JSON.parse(raw.toString('utf-8')) as WorkspaceDefinition;
  const projects = workspace.projects ?? {};
  const name = projectName ?? workspace.defaultProject ?? Object.keys(projects)[0];
  const project = name ? projects[name] : undefined;

  return project ? { name, project } : null;
}

/**
 * Resolves the project's global stylesheet path and syntax from `angular.json`'s `styles` array,
 * e.g. `projects.<name>.architect.build.options.styles`.
 */
export function findGlobalStylesheet(tree: Tree, projectName?: string): GlobalStylesheet | null {
  const resolved = resolveProject(tree, projectName);
  if (!resolved) {
    return null;
  }

  const targets = resolved.project.architect ?? resolved.project.targets ?? {};
  const buildTarget = targets['build'];
  const styles = buildTarget?.options?.styles ?? [];

  for (const style of styles) {
    const stylePath = typeof style === 'string' ? style : style.input;
    const match = stylePath?.match(/\.(scss|sass|css)$/);
    if (stylePath && match) {
      return {
        path: stylePath.startsWith('/') ? stylePath : `/${stylePath}`,
        type: match[1] as GlobalStylesheet['type'],
      };
    }
  }

  return null;
}

/**
 * Adds `@ngm-dev/mat-expressive/styles.css` as the first entry of the project's build target
 * `styles` array in `angular.json` (library base styles before app-level overrides in cascade
 * order, matching how Angular Material's own schematics position their prebuilt theme CSS).
 * Idempotent — no-ops if already present.
 */
export function addCssStylesheetEntry(
  tree: Tree,
  projectName: string | undefined,
  context: SchematicContext,
): void {
  const raw = tree.read('/angular.json');
  if (!raw) {
    context.logger.warn('mat-expressive: could not read "angular.json".');
    return;
  }

  const workspace = JSON.parse(raw.toString('utf-8')) as WorkspaceDefinition;
  const projects = workspace.projects ?? {};
  const name = projectName ?? workspace.defaultProject ?? Object.keys(projects)[0];
  const project = name ? projects[name] : undefined;
  if (!project) {
    context.logger.warn('mat-expressive: could not resolve a project in "angular.json".');
    return;
  }

  const targets = project.architect ?? project.targets;
  const buildTarget = targets?.['build'];
  if (!buildTarget) {
    context.logger.warn('mat-expressive: could not find a "build" target in "angular.json".');
    return;
  }

  buildTarget.options = buildTarget.options ?? {};
  buildTarget.options.styles = buildTarget.options.styles ?? [];
  const styles = buildTarget.options.styles;

  const alreadyPresent = styles.some(
    (style) => (typeof style === 'string' ? style : style.input) === CSS_STYLES_ENTRY,
  );
  if (alreadyPresent) {
    context.logger.info(
      `mat-expressive: "angular.json" already includes "${CSS_STYLES_ENTRY}". Skipping.`,
    );
    return;
  }

  styles.unshift(CSS_STYLES_ENTRY);
  tree.overwrite('/angular.json', `${JSON.stringify(workspace, null, 2)}\n`);
  context.logger.info(
    `mat-expressive: added "${CSS_STYLES_ENTRY}" to the "styles" array in "angular.json".`,
  );
}
