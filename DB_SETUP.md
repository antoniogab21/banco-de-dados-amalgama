DB setup for Amalgama (MySQL)

This repository includes a ready-to-run MySQL service and initialization schema.

Quick start (uses Docker Compose):

1. Ensure Docker and Docker Compose are installed.

2. Start MySQL service:

```bash
docker compose -f docker-compose.mysql.yml up -d
```

3. The compose file creates a database `amalgama` and a user `amalgama` with password `amalgama_pass`.
   The root password is `rootpassword` (for local development only). You can change these values in the compose file or use environment overrides.

4. The schema will be applied automatically on first container start (files in `docker/mysql/init/` are executed by the MySQL image).

5. To connect your backend to the database, set the appropriate environment variables. Example `.env` values are in `.env.example`.

Optional: Import schema manually (if needed):

```bash
docker exec -i amalgama-mysql sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" amalgama' < docker/mysql/init/schema.sql
```

Notes:
- This adds only the MySQL service and schema; it does not modify frontend or backend source files.
- To use this DB with the backend, configure your backend to use the `DATABASE_URL` from `.env` (example shown in `.env.example`).
