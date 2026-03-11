-- Fix: infinite recursion in league_members RLS policy
-- The old policy referenced league_members within league_members (recursive)
-- Replace with a direct non-recursive check

DROP POLICY IF EXISTS "lm_select_member" ON league_members;

CREATE POLICY "lm_select_member"
  ON league_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR league_id IN (SELECT id FROM leagues WHERE created_by = auth.uid())
  );

-- Also fix leagues SELECT policy to avoid potential recursion
DROP POLICY IF EXISTS "leagues_select_public" ON leagues;

CREATE POLICY "leagues_select_public"
  ON leagues FOR SELECT
  USING (
    type = 'public'
    OR created_by = auth.uid()
    OR id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
  );
