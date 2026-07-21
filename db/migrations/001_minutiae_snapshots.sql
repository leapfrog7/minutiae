CREATE TABLE IF NOT EXISTS public.minutiae_snapshots (
  owner_id text PRIMARY KEY DEFAULT auth.user_id(),
  payload jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint

ALTER TABLE public.minutiae_snapshots ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON public.minutiae_snapshots TO authenticated;
--> statement-breakpoint

CREATE POLICY "minutiae_select_own_snapshot"
  ON public.minutiae_snapshots
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.user_id()) = owner_id);
--> statement-breakpoint

CREATE POLICY "minutiae_insert_own_snapshot"
  ON public.minutiae_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.user_id()) = owner_id);
--> statement-breakpoint

CREATE POLICY "minutiae_update_own_snapshot"
  ON public.minutiae_snapshots
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.user_id()) = owner_id)
  WITH CHECK ((SELECT auth.user_id()) = owner_id);
--> statement-breakpoint

CREATE POLICY "minutiae_delete_own_snapshot"
  ON public.minutiae_snapshots
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.user_id()) = owner_id);
