export type ControlType = 'select' | 'slide-toggle' | 'text' | 'number';

export interface ControlDef {
  name: string;
  /** Display label in the controls panel. */
  label: string;
  type: ControlType;
  options?: string[];
  default?: unknown;
  nullable?: boolean;
  description?: string;
}

/** Raw source of a preview's `.ts`/`.html`/`.scss` file, shown in the playground's "View source" tabs. */
export interface SourceFile {
  filename: string;
  content: string;
  lang: string;
}

export interface ComponentSchema {
  selector: string;
  className: string;
  inputs: ControlDef[];
  sourceFiles: SourceFile[];
}

export type PlaygroundSchemas = Record<string, ComponentSchema>;
