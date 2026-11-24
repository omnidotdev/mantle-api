# 🌋 Mantle API

GraphQL API for [Mantle](https://mantle.omni.dev), the Omni business operations suite. Built with [Elysia](https://elysiajs.com), [PostGraphile](https://postgraphile.org), and [Drizzle](https://orm.drizzle.team).

Product documentation lives at [docs.omni.dev](https://docs.omni.dev/products/mantle). To run the whole stack (database, API, and app) together, see the [Mantle metarepo](https://github.com/omnidotdev/mantle-stack).

## Prerequisites

- [Bun](https://bun.sh)
- [PostgreSQL](https://www.postgresql.org) (or [Docker](https://www.docker.com) to run it in a container)
- [mkcert](https://github.com/FiloSottile/mkcert), for the local TLS certificate the dev server serves over HTTPS

## Local Development

1. Copy the environment template and fill in the values:

   ```sh
   cp .env.local.template .env.local
   ```

   `DATABASE_URL` is required. `AUTH_JWKS_URL` points at the identity provider's JWKS endpoint; without it, every request is anonymous. Set `AUTH_AUDIENCE` to the resource the provider mints this API's tokens for, so a token minted for another API is refused. Optional integrations (billing, events, feature flags, workspace deletion) log a warning on boot and stay disabled when their variables are unset.

2. Generate the local TLS certificate (`key.pem` and `cert.pem` in the repository root):

   ```sh
   mkcert -key-file key.pem -cert-file cert.pem localhost
   ```

3. Install dependencies, create the database, and run migrations:

   ```sh
   bun install
   bun db:setup
   bun db:migrate
   ```

4. Start the dev server (or run `tilt up`):

   ```sh
   bun dev
   ```

The API serves GraphQL at `https://localhost:4000/graphql`.

## Diagnostics

- `GET /health` reports liveness and the running commit
- `GET /ready` checks the database connection and returns `503` when it is unreachable
- Missing optional configuration is reported on boot as `<VAR> not set, <feature> disabled`

## Common Commands

| Command | Description |
|---------|-------------|
| `bun dev` | Start the dev server with hot reloading |
| `bun test` | Run the test suite (starts a disposable PostgreSQL container) |
| `bun check` | Lint and format check with Biome |
| `bun knip` | Find unused files, exports, and dependencies |
| `bun db:generate` | Generate a migration from schema changes |
| `bun db:migrate` | Apply pending migrations and regenerate the GraphQL schema |
| `bun db:studio` | Open Drizzle Studio |
| `bun graphql:generate` | Regenerate `schema.graphql` from the database |

## Docker

```sh
docker build -t mantle-api .
docker run -p 4000:4000 -e DATABASE_URL=... mantle-api
```

Migrations run on boot.

## License

The code in this repository is licensed under Apache 2.0, &copy; [Omni LLC](https://omni.dev). See [LICENSE.md](LICENSE.md) for more information.
