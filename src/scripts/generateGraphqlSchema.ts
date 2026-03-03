import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

import { exportSchema } from "graphile-export";
import { printSchema } from "graphql";
import graphilePreset from "lib/config/graphile.config";
import { makeSchema } from "postgraphile";
import { replaceInFile } from "replace-in-file";

const SRC_DIR = `${__dirname}/..`;
const CACHE_DIR = `${__dirname}/../../.cache`;
const HASH_FILE = `${CACHE_DIR}/schema-hash`;

/**
 * Directories and files that affect the generated GraphQL schema.
 */
const SCHEMA_DEPENDENCIES = {
	directories: ["lib/db/schema", "lib/graphql/plugins"],
	files: ["lib/config/graphile.config.ts"],
};

/**
 * Get all TypeScript files from a directory recursively.
 */
const getFilesFromDirectory = (dir: string): string[] => {
	const fullPath = join(SRC_DIR, dir);
	if (!existsSync(fullPath)) return [];

	return readdirSync(fullPath, { recursive: true })
		.filter((f): f is string => typeof f === "string" && f.endsWith(".ts"))
		.map((f) => join(dir, f))
		.sort();
};

/**
 * Compute hash of all files that affect schema generation.
 */
const computeSchemaHash = (): string => {
	const hash = createHash("sha256");

	const allFiles: string[] = [];

	for (const dir of SCHEMA_DEPENDENCIES.directories) {
		allFiles.push(...getFilesFromDirectory(dir));
	}

	for (const file of SCHEMA_DEPENDENCIES.files) {
		if (existsSync(join(SRC_DIR, file))) {
			allFiles.push(file);
		}
	}

	allFiles.sort();

	for (const file of allFiles) {
		const fullPath = join(SRC_DIR, file);
		const content = readFileSync(fullPath);
		hash.update(file);
		hash.update(content);
	}

	return hash.digest("hex");
};

/**
 * Check if schema dependencies have changed since last generation.
 */
const hasSchemaChanged = (): boolean => {
	const outputFile = `${SRC_DIR}/generated/graphql/schema.executable.ts`;

	// Always regenerate if output doesn't exist (e.g. fresh container)
	if (!existsSync(outputFile)) return true;
	if (!existsSync(HASH_FILE)) return true;

	const currentHash = computeSchemaHash();
	const storedHash = readFileSync(HASH_FILE, "utf-8").trim();

	return currentHash !== storedHash;
};

/**
 * Generate a GraphQL schema from a Postgres database.
 * @see https://postgraphile.org/postgraphile/next/exporting-schema
 */
const generateGraphqlSchema = async () => {
	if (!hasSchemaChanged()) {
		console.info("[graphql:generate] Schema unchanged, skipping generation");
		return;
	}

	const { schema } = await makeSchema(graphilePreset);

	const generatedDirectory = `${__dirname}/../generated/graphql`;
	const schemaFilePath = `${generatedDirectory}/schema.executable.ts`;

	if (!existsSync(generatedDirectory))
		mkdirSync(generatedDirectory, { recursive: true });

	await exportSchema(schema, schemaFilePath, {
		mode: "typeDefs",
	});

	await replaceInFile({
		files: schemaFilePath,
		from: /\/\* eslint-disable graphile-export\/[^*]+\*\//g,
		to: "// @ts-nocheck\n/* eslint-disable */",
	});

	writeFileSync(`${generatedDirectory}/schema.graphql`, printSchema(schema));

	if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
	writeFileSync(HASH_FILE, computeSchemaHash());

	console.info("[graphql:generate] Schema generated successfully");
};

await generateGraphqlSchema()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
