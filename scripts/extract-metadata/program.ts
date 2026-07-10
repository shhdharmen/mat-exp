import * as ts from 'typescript';
import * as path from 'node:path';
import { LIB_TSCONFIG, APP_TSCONFIG } from './paths.js';

function createProgramFromTsconfig(tsconfigPath: string): ts.Program {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    const msg = ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n');
    throw new Error(`Failed to read tsconfig: ${msg}`);
  }
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
  );
  return ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: { ...parsedConfig.options, skipLibCheck: true },
  });
}

export function createLibProgram(): ts.Program {
  return createProgramFromTsconfig(LIB_TSCONFIG);
}

/**
 * Program scoped to the docs app (`tsconfig.app.json`). Used to extract
 * playground schemas from the preview wrapper components under
 * `src/app/shared/components/playground/previews/`, which may declare
 * inputs that don't exist on the underlying library directive.
 */
export function createAppProgram(): ts.Program {
  return createProgramFromTsconfig(APP_TSCONFIG);
}
