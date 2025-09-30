This file shows how to create the `history` table in Supabase/Postgres.

Files:

- `db/schema.sql` — SQL to create the `history` table used by the backend.

How to run

1. Use the Supabase SQL editor (recommended if you're using Supabase hosted project)

   - Open your Supabase project → SQL Editor → New query
   - Paste the contents of `packages/backend/db/schema.sql` and run it.

2. Use the Supabase CLI (if you have it installed and are connected to the project)

```bash
# from repository root (zsh)
# run the SQL file against the current project
supabase db query < packages/backend/db/schema.sql
```

3. Use psql (direct DB connection)

```bash
# replace <CONN_STRING> with your DB connection string, e.g. from Supabase
psql "<CONN_STRING>" -f packages/backend/db/schema.sql
```

Notes

- The database schema now uses snake_case column names (job_description, created_at). The application maps between camelCase in TypeScript and snake_case in the database when using Supabase.
- After creating the table, you can verify with:

```bash
# using supabase CLI
supabase db query "select * from public.history limit 5;"
```

Need me to run this against a Supabase project or update the code to use snake_case instead? I can also add a small migration runner or a dev script if you'd like.
