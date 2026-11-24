import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "src/instrumentation.ts",
    "src/scripts/**/*.ts",
    "src/__tests__/**/*.ts",
    "src/test/**/*.ts",
  ],
  project: ["src/**/*.ts"],
  // The drizzle-kit config requires DATABASE_URL at load time; the schema it
  // points at is reached through lib/db anyway
  drizzle: false,
  ignoreDependencies: [
    // Used by PostGraphile plugins
    "@graphile/pg-aggregates",
    // Used in scripts
    "ms",
    // Dev tools
    "drizzle-seed",
    "@types/ms",
    // Transitive dep of postgraphile, used directly in plugins
    "graphile-utils",
  ],
  ignoreBinaries: ["createdb"],
};

export default config;
