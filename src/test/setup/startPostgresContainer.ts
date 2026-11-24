// TODO: Switch back to testcontainers once Bun compatibility is confirmed
// @see https://github.com/testcontainers/testcontainers-node/issues/807
// The issue is marked resolved but still hangs with Bun as of testcontainers v11.11.0

const CONTAINER_LABEL = "mantle-api-test";
// One container per test process, so concurrent runs (several worktrees, CI
// and a local run) never share, or tear down, each other's database
const CONTAINER_NAME = `mantle-api-test-postgres-${process.pid}`;
const POSTGRES_IMAGE = "postgres:16-alpine";
const POSTGRES_USER = "test";
const POSTGRES_PASSWORD = "test";
const POSTGRES_DB = "mantle_api_test";

/** A free local port (host networking), unless TEST_POSTGRES_PORT pins one */
const pickPort = (): string => {
	if (process.env.TEST_POSTGRES_PORT) return process.env.TEST_POSTGRES_PORT;
	const probe = Bun.listen({
		hostname: "127.0.0.1",
		port: 0,
		socket: { data() {} },
	});
	const { port } = probe;
	probe.stop(true);
	return String(port);
};

const POSTGRES_PORT = pickPort();

/** Whether a process id is still running */
const isAlive = (pid: number): boolean => {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
};

interface PostgresContainer {
	getConnectionUri: () => string;
	stop: () => Promise<void>;
}

let container: PostgresContainer | null = null;

/**
 * Wait for PostgreSQL to be ready to accept connections.
 * Uses pg_isready first, then verifies with an actual query.
 */
const waitForPostgres = async (
	containerName: string,
	timeoutMs = 30000,
): Promise<void> => {
	const startTime = Date.now();

	// Wait for pg_isready
	while (Date.now() - startTime < timeoutMs) {
		const result = Bun.spawnSync({
			cmd: [
				"docker",
				"exec",
				containerName,
				"pg_isready",
				"-U",
				POSTGRES_USER,
				"-d",
				POSTGRES_DB,
				"-p",
				POSTGRES_PORT,
			],
		});

		if (result.exitCode === 0) {
			break;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	// Verify with actual query to ensure database is ready
	while (Date.now() - startTime < timeoutMs) {
		const result = Bun.spawnSync({
			cmd: [
				"docker",
				"exec",
				containerName,
				"psql",
				"-U",
				POSTGRES_USER,
				"-d",
				POSTGRES_DB,
				"-p",
				POSTGRES_PORT,
				"-c",
				"SELECT 1",
			],
		});

		if (result.exitCode === 0) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	throw new Error(`PostgreSQL not ready after ${timeoutMs}ms`);
};

/**
 * Clean up test containers left behind by runs whose process has exited. A
 * container whose run is still going (another worktree, CI) is left alone
 */
export const cleanupOrphanedContainers = async (): Promise<void> => {
	try {
		const result = Bun.spawnSync({
			cmd: [
				"docker",
				"ps",
				"-a",
				"--filter",
				`label=${CONTAINER_LABEL}`,
				"--format",
				`{{.ID}} {{.Label "${CONTAINER_LABEL}.pid"}}`,
			],
		});

		const containerIds = result.stdout
			.toString()
			.trim()
			.split("\n")
			.filter(Boolean)
			.map((line) => line.split(" "))
			.filter(([, pid]) => !!pid && !isAlive(Number(pid)))
			.map(([id]) => id as string);

		if (containerIds.length > 0) {
			console.log(
				`[preload] Removing ${containerIds.length} orphaned container(s)...`,
			);
			Bun.spawnSync({
				cmd: ["docker", "rm", "-f", ...containerIds],
			});
		}
	} catch {
		// Ignore errors - cleanup is best-effort
	}
};

/**
 * Start a PostgreSQL container for testing using Docker directly.
 * Uses host networking to avoid Docker port mapping issues.
 */
export const startPostgresContainer = async (): Promise<PostgresContainer> => {
	// Start the container with host networking
	const startResult = Bun.spawnSync({
		cmd: [
			"docker",
			"run",
			"-d",
			"--name",
			CONTAINER_NAME,
			"--label",
			`${CONTAINER_LABEL}=true`,
			"--label",
			`${CONTAINER_LABEL}.pid=${process.pid}`,
			"--network",
			"host",
			"-e",
			`POSTGRES_USER=${POSTGRES_USER}`,
			"-e",
			`POSTGRES_PASSWORD=${POSTGRES_PASSWORD}`,
			"-e",
			`POSTGRES_DB=${POSTGRES_DB}`,
			"-e",
			"POSTGRES_HOST_AUTH_METHOD=trust",
			"-e",
			`PGPORT=${POSTGRES_PORT}`,
			POSTGRES_IMAGE,
			"-c",
			`port=${POSTGRES_PORT}`,
		],
	});

	if (startResult.exitCode !== 0) {
		throw new Error(
			`Failed to start PostgreSQL container: ${startResult.stderr.toString()}`,
		);
	}

	const connectionUri = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:${POSTGRES_PORT}/${POSTGRES_DB}`;

	// Wait for PostgreSQL to be ready
	await waitForPostgres(CONTAINER_NAME);

	container = {
		getConnectionUri: () => connectionUri,
		stop: async () => {
			Bun.spawnSync({ cmd: ["docker", "rm", "-f", CONTAINER_NAME] });
		},
	};

	return container;
};

/**
 * Get the running container instance.
 */
export const getContainer = (): PostgresContainer | null => container;

/**
 * Stop the PostgreSQL container.
 */
export const stopPostgresContainer = async (): Promise<void> => {
	if (container) {
		await container.stop();
		container = null;
	}
};
