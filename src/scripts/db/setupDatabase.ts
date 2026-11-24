/**
 * @file Set up a database.
 */

import { $ } from "bun";

import { DATABASE_URL } from "lib/config/env.config";

const databaseName = DATABASE_URL?.split("/").pop()?.split("?")[0];

console.info(`Creating ${databaseName} database...`);
await $`createdb -U postgres ${databaseName}`;
console.info("Database created");
