/**
 * TypeScript compiler-API pass over the library source.
 *
 * Produces two JSON manifests:
 *   public/playground-schemas.json  – per-component input control descriptors
 *   public/api-manifest.json        – full API surface for all exported symbols
 *
 * Called from build-docs.ts via `runMetadataExtraction()`.
 *
 * Implementation is split across scripts/extract-metadata/:
 *   types.ts       – exported interfaces / types
 *   paths.ts       – path constants
 *   program.ts     – TypeScript program creation
 *   jsdoc.ts       – JSDoc helpers
 *   members.ts     – extractClassMembers
 *   playground.ts  – type resolution, signal helpers, decorator detection
 *   processors.ts  – per-symbol processors (processClass, processPlainClass, …)
 *   index.ts       – collectExports, writeJson, runMetadataExtraction
 */

export * from './extract-metadata/index.js';
