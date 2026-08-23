-- Reusable trigger function: stamp updated_at on every UPDATE.
-- PostGraphile/Grafast issues its own SQL against the pg pool and bypasses
-- Drizzle, so a DB-level trigger is the only place that covers every mutation path.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Attach a BEFORE UPDATE trigger to every base table in public that has an
-- updated_at column. Idempotent and future proof: re-runnable, and covers any
-- updated_at table by name.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND c.column_name = 'updated_at'
      AND t.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', r.table_name);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      r.table_name
    );
  END LOOP;
END $$;
