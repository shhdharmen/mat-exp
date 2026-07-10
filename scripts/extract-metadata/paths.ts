import * as path from 'node:path';

export const LIB_ROOT = path.resolve(process.cwd(), 'projects/ngm-dev/mat-expressive');
export const LIB_TSCONFIG = path.join(LIB_ROOT, 'tsconfig.lib.json');
export const PUBLIC_API_PATH = path.normalize(path.join(LIB_ROOT, 'src/public-api.ts'));
export const PLAYGROUND_SCHEMAS_OUT = path.resolve(process.cwd(), 'public/playground-schemas.json');
export const API_MANIFEST_OUT = path.resolve(process.cwd(), 'public/api-manifest.json');

// Playground schemas are sourced from the docs app's preview wrapper
// components, not the library directives directly — a preview component may
// declare convenience inputs (e.g. `appearance` on ButtonPreviewComponent)
// that don't exist on the underlying library class.
export const APP_TSCONFIG = path.resolve(process.cwd(), 'tsconfig.app.json');
export const PREVIEWS_ROOT = path.normalize(
  path.resolve(process.cwd(), 'src/app/shared/components/playground/previews'),
);
