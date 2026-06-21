import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "cli/index": "src/cli/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  // The bundle inlines the full national dataset (~5 MB). Sourcemaps would duplicate
  // that as ~10 MB maps per output for no debugging value, so they are disabled.
  sourcemap: false,
  // Code-splitting lets the ESM outputs share one data chunk instead of inlining it
  // into both index.js and cli/index.js; minify strips whitespace from the inlined data.
  splitting: true,
  minify: true,
  shims: true
});
