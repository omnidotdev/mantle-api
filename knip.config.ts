import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: [
		"src/server.ts",
		"src/instrumentation.ts",
		"src/lib/config/drizzle.config.ts",
		"src/scripts/**/*.ts",
	],
	project: ["src/**/*.ts"],
	ignore: ["src/generated/**"],
	ignoreDependencies: [
		// Used by PostGraphile plugins
		"@graphile/pg-aggregates",
		// Used in scripts or planned
		"@tanstack/query-core",
		"jose",
		"ms",
		"unleash-client",
		// Dev tools
		"drizzle-seed",
		"@envelop/types",
		"@types/ms",
	],
	ignoreBinaries: ["createdb"],
};

export default config;
