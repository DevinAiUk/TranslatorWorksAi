/**
 * WorksAI Live Interpreter — Canonical Src Entry Alias (`src/interpreter-worker.mjs`)
 * Re-exports the root Wrangler entry point (`../worksai-live-interpreter-worker.mjs`)
 * so imports from either `worksai-live-interpreter-worker.mjs` or `src/interpreter-worker.mjs`
 * resolve identically without code duplication or drift.
 */
export * from "../worksai-live-interpreter-worker.mjs";
export { default } from "../worksai-live-interpreter-worker.mjs";
