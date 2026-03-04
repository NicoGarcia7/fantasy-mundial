-- ============================================================
-- FANTASY MUNDIAL 2026 — Supabase Schema v1.0
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE player_position AS ENUM ('GK', 'DEF', 'MID', 'FWD');
CREATE TYPE formation_type  AS ENUM ('4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2');
CREATE TYPE league_type     AS ENUM ('public', 'private');
CREATE TYPE match_status    AS ENUM ('upcoming', 'live', 'finished');
CREATE TYPE event_type      AS ENUM (
  'goal', 'assist', 'clean_sheet', 'yellow_card', 'red_card',
  'save_3', 'penalty_saved', 'penalty_missed', 'own_goal'
);
CREATE TYPE match_stage AS ENUM (
  'group_a','group_b','group_c','group_d','group_e','group_f',
  'group_g','group_h','group_i','group_j','group_k','group_l',
  'round_of_32','round_of_16','quarter_final','semi_final',
  'third_place','final'
);

-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users with app-specific data
-- ============================================================

CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT UNIQUE NOT NULL,
  full_name        TEXT,
  avatar_id        TEXT NOT NULL DEFAULT 'star',
  favorite_team    TEXT,
  invites_sent     INTEGER NOT NULL DEFAULT 0,
  bonus_budget     NUMERIC(5,1) NOT NULL DEFAULT 0,   -- extra $M from invites
  total_points     INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: world_cup_teams
-- The 48 teams competing in the 2026 World Cup
-- ============================================================

CREATE TABLE world_cup_teams (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         TEXT UNIQUE NOT NULL,  -- 'ARG', 'BRA', etc.
  name         TEXT NOT NULL,
  flag_emoji   TEXT NOT NULL,
  group_name   TEXT,                  -- 'A', 'B', ..., 'L'
  eliminated   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: players
-- All 800+ players available for drafting
-- ============================================================

CREATE TABLE players (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  short_name      TEXT NOT NULL,
  nationality     TEXT NOT NULL,
  flag_emoji      TEXT NOT NULL DEFAULT '🏳️',
  team_code       TEXT NOT NULL REFERENCES world_cup_teams(code) ON DELETE CASCADE,
  position        player_position NOT NULL,
  price           NUMERIC(4,1) NOT NULL,   -- in $M, e.g. 12.5
  base_points     INTEGER NOT NULL DEFAULT 0,
  goals           INTEGER NOT NULL DEFAULT 0,
  assists         INTEGER NOT NULL DEFAULT 0,
  clean_sheets    INTEGER NOT NULL DEFAULT 0,
  yellow_cards    INTEGER NOT NULL DEFAULT 0,
  red_cards       INTEGER NOT NULL DEFAULT 0,
  saves           INTEGER NOT NULL DEFAULT 0,
  form            NUMERIC(3,1) NOT NULL DEFAULT 5.0,  -- 0-10
  is_injured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended    BOOLEAN NOT NULL DEFAULT FALSE,
  image_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_position  ON players(position);
CREATE INDEX idx_players_team_code ON players(team_code);
CREATE INDEX idx_players_price     ON players(price);

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: user_teams
-- A user's drafted squad for the tournament
-- ============================================================

CREATE TABLE user_teams (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL DEFAULT 'Mi Equipo',
  formation        formation_type NOT NULL DEFAULT '4-3-3',
  budget_used      NUMERIC(5,1) NOT NULL DEFAULT 0,
  total_points     INTEGER NOT NULL DEFAULT 0,
  is_locked        BOOLEAN NOT NULL DEFAULT FALSE,  -- locked once tournament starts
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_team_per_user UNIQUE (user_id)
);

CREATE INDEX idx_user_teams_user_id ON user_teams(user_id);

CREATE TRIGGER user_teams_updated_at
  BEFORE UPDATE ON user_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: user_team_players
-- The players selected for a user's team (11 starters + 4 bench)
-- ============================================================

CREATE TABLE user_team_players (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id      UUID NOT NULL REFERENCES user_teams(id) ON DELETE CASCADE,
  player_id    UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  slot_index   INTEGER NOT NULL,   -- 0-10 = starters, 11-14 = bench
  is_bench     BOOLEAN NOT NULL DEFAULT FALSE,
  points       INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_slot_per_team UNIQUE (team_id, slot_index),
  CONSTRAINT unique_player_per_team UNIQUE (team_id, player_id)
);

CREATE INDEX idx_utp_team_id   ON user_team_players(team_id);
CREATE INDEX idx_utp_player_id ON user_team_players(player_id);

-- Max 15 players per team trigger
CREATE OR REPLACE FUNCTION check_team_size()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT COUNT(*) FROM user_team_players WHERE team_id = NEW.team_id) >= 15 THEN
    RAISE EXCEPTION 'Squad cannot exceed 15 players (11 starters + 4 bench)';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_team_size
  BEFORE INSERT ON user_team_players
  FOR EACH ROW EXECUTE FUNCTION check_team_size();

-- ============================================================
-- TABLE: leagues
-- Public and private competition groups
-- ============================================================

CREATE TABLE leagues (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  type          league_type NOT NULL DEFAULT 'private',
  invite_code   TEXT UNIQUE NOT NULL DEFAULT UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
  created_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  max_members   INTEGER NOT NULL DEFAULT 50,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leagues_invite_code ON leagues(invite_code);
CREATE INDEX idx_leagues_type        ON leagues(type);
CREATE INDEX idx_leagues_created_by  ON leagues(created_by);

CREATE TRIGGER leagues_updated_at
  BEFORE UPDATE ON leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: league_members
-- Pivot between leagues and users
-- ============================================================

CREATE TABLE league_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id    UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_league_member UNIQUE (league_id, user_id)
);

CREATE INDEX idx_lm_league_id ON league_members(league_id);
CREATE INDEX idx_lm_user_id   ON league_members(user_id);

-- Enforce max_members limit
CREATE OR REPLACE FUNCTION check_league_capacity()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  max_cap INTEGER;
  cur_count INTEGER;
BEGIN
  SELECT max_members INTO max_cap FROM leagues WHERE id = NEW.league_id;
  SELECT COUNT(*) INTO cur_count FROM league_members WHERE league_id = NEW.league_id;
  IF cur_count >= max_cap THEN
    RAISE EXCEPTION 'League is full (max % members)', max_cap;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_league_capacity
  BEFORE INSERT ON league_members
  FOR EACH ROW EXECUTE FUNCTION check_league_capacity();

-- ============================================================
-- TABLE: league_chat
-- Real-time trash-talk / banter chat per league
-- ============================================================

CREATE TABLE league_chat (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id    UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message      TEXT NOT NULL CHECK (CHAR_LENGTH(message) BETWEEN 1 AND 500),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_league_id   ON league_chat(league_id);
CREATE INDEX idx_chat_created_at  ON league_chat(created_at DESC);

-- ============================================================
-- TABLE: match_fixtures
-- All 104 matches of the 2026 World Cup
-- ============================================================

CREATE TABLE match_fixtures (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team_code TEXT NOT NULL REFERENCES world_cup_teams(code),
  away_team_code TEXT NOT NULL REFERENCES world_cup_teams(code),
  kickoff        TIMESTAMPTZ NOT NULL,
  status         match_status NOT NULL DEFAULT 'upcoming',
  stage          match_stage NOT NULL DEFAULT 'group_a',
  home_score     INTEGER NOT NULL DEFAULT 0,
  away_score     INTEGER NOT NULL DEFAULT 0,
  venue          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fixtures_status  ON match_fixtures(status);
CREATE INDEX idx_fixtures_kickoff ON match_fixtures(kickoff);

CREATE TRIGGER fixtures_updated_at
  BEFORE UPDATE ON match_fixtures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: match_events
-- Individual scoring events (goals, cards, saves...)
-- Drives the live scoring feed
-- ============================================================

CREATE TABLE match_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id      UUID NOT NULL REFERENCES match_fixtures(id) ON DELETE CASCADE,
  player_id       UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  event           event_type NOT NULL,
  minute          INTEGER,
  points_awarded  INTEGER NOT NULL DEFAULT 0,
  processed       BOOLEAN NOT NULL DEFAULT FALSE, -- whether fantasy points have been applied
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_fixture_id ON match_events(fixture_id);
CREATE INDEX idx_events_player_id  ON match_events(player_id);
CREATE INDEX idx_events_processed  ON match_events(processed) WHERE NOT processed;

-- ============================================================
-- TABLE: invite_referrals
-- Tracks invite links so we can assign bonus budget
-- ============================================================

CREATE TABLE invite_referrals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  code          TEXT UNIQUE NOT NULL DEFAULT UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)),
  used          BOOLEAN NOT NULL DEFAULT FALSE,
  bonus_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at       TIMESTAMPTZ
);

CREATE INDEX idx_referrals_referrer_id ON invite_referrals(referrer_id);
CREATE INDEX idx_referrals_code        ON invite_referrals(code);

-- Auto-grant bonus when referrer hits 3 successful invites
CREATE OR REPLACE FUNCTION check_invite_bonus()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  invite_count INTEGER;
BEGIN
  IF NEW.used = TRUE AND OLD.used = FALSE THEN
    SELECT COUNT(*) INTO invite_count
    FROM invite_referrals
    WHERE referrer_id = NEW.referrer_id AND used = TRUE;

    -- Grant $5M bonus at 3, 6, 9... invites
    IF invite_count % 3 = 0 THEN
      UPDATE profiles
      SET bonus_budget = bonus_budget + 5,
          invites_sent = invites_sent + 1
      WHERE id = NEW.referrer_id;

      UPDATE invite_referrals SET bonus_granted = TRUE WHERE id = NEW.id;
    ELSE
      UPDATE profiles SET invites_sent = invites_sent + 1 WHERE id = NEW.referrer_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_invite_used
  AFTER UPDATE ON invite_referrals
  FOR EACH ROW EXECUTE FUNCTION check_invite_bonus();

-- ============================================================
-- FUNCTION: apply_match_event_points()
-- Called by an Edge Function after each match event is created.
-- Updates player base_points AND all user_team_players that hold that player.
-- ============================================================

CREATE OR REPLACE FUNCTION apply_match_event_points(event_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  ev RECORD;
  pts INTEGER;
BEGIN
  SELECT * INTO ev FROM match_events WHERE id = event_id AND NOT processed;
  IF NOT FOUND THEN RETURN; END IF;

  -- Calculate points based on event type and player position
  SELECT CASE ev.event
    WHEN 'goal' THEN
      CASE (SELECT position FROM players WHERE id = ev.player_id)
        WHEN 'GK'  THEN 10
        WHEN 'DEF' THEN 8
        WHEN 'MID' THEN 6
        WHEN 'FWD' THEN 5
      END
    WHEN 'assist'         THEN 4
    WHEN 'clean_sheet'    THEN
      CASE (SELECT position FROM players WHERE id = ev.player_id)
        WHEN 'GK'  THEN 6
        WHEN 'DEF' THEN 4
        WHEN 'MID' THEN 1
        ELSE 0
      END
    WHEN 'yellow_card'    THEN -1
    WHEN 'red_card'       THEN -3
    WHEN 'save_3'         THEN 1
    WHEN 'penalty_saved'  THEN 5
    WHEN 'penalty_missed' THEN -2
    WHEN 'own_goal'       THEN -2
    ELSE 0
  END INTO pts;

  -- Update player's aggregate points
  UPDATE players
  SET base_points = base_points + pts
  WHERE id = ev.player_id;

  -- Update points in every fantasy team that has this player (non-bench only)
  UPDATE user_team_players utp
  SET points = utp.points + pts
  WHERE utp.player_id = ev.player_id AND utp.is_bench = FALSE;

  -- Propagate to team totals
  UPDATE user_teams ut
  SET total_points = (
    SELECT COALESCE(SUM(points), 0)
    FROM user_team_players
    WHERE team_id = ut.id AND is_bench = FALSE
  )
  WHERE id IN (
    SELECT DISTINCT team_id FROM user_team_players WHERE player_id = ev.player_id
  );

  -- Propagate to profile total points (best team across all leagues)
  UPDATE profiles p
  SET total_points = COALESCE((
    SELECT total_points FROM user_teams WHERE user_id = p.id LIMIT 1
  ), 0)
  WHERE id IN (
    SELECT ut.user_id
    FROM user_teams ut
    JOIN user_team_players utp ON utp.team_id = ut.id
    WHERE utp.player_id = ev.player_id
  );

  -- Mark event as processed
  UPDATE match_events SET processed = TRUE WHERE id = event_id;
END;
$$;

-- ============================================================
-- FUNCTION: get_league_leaderboard(league_id)
-- Returns ranked members for a given league
-- ============================================================

CREATE OR REPLACE FUNCTION get_league_leaderboard(p_league_id UUID)
RETURNS TABLE (
  user_id       UUID,
  username      TEXT,
  avatar_id     TEXT,
  team_name     TEXT,
  total_points  INTEGER,
  rank          BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.id          AS user_id,
    p.username,
    p.avatar_id,
    COALESCE(ut.name, 'Sin equipo') AS team_name,
    COALESCE(ut.total_points, 0)    AS total_points,
    RANK() OVER (ORDER BY COALESCE(ut.total_points, 0) DESC) AS rank
  FROM league_members lm
  JOIN profiles p ON p.id = lm.user_id
  LEFT JOIN user_teams ut ON ut.user_id = lm.user_id
  WHERE lm.league_id = p_league_id
  ORDER BY total_points DESC;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE players            ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_cup_teams    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_teams         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_players  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues            ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_chat        ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_fixtures     ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_referrals   ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────────────────────
-- Public profiles visible to everyone (for leaderboards)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Disallow direct inserts (handled by trigger)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── players ─────────────────────────────────────────────────
-- Players are read-only for users; only service_role can mutate
CREATE POLICY "players_select_all"
  ON players FOR SELECT USING (TRUE);

-- ── world_cup_teams ──────────────────────────────────────────
CREATE POLICY "teams_select_all"
  ON world_cup_teams FOR SELECT USING (TRUE);

-- ── user_teams ───────────────────────────────────────────────
-- Users can only create/read/update their own team
CREATE POLICY "user_teams_select_own"
  ON user_teams FOR SELECT USING (auth.uid() = user_id);

-- Allow reading other users' teams for leaderboards
CREATE POLICY "user_teams_select_public"
  ON user_teams FOR SELECT USING (TRUE);

CREATE POLICY "user_teams_insert_own"
  ON user_teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_teams_update_own"
  ON user_teams FOR UPDATE
  USING (auth.uid() = user_id AND is_locked = FALSE)
  WITH CHECK (auth.uid() = user_id);

-- ── user_team_players ────────────────────────────────────────
CREATE POLICY "utp_select_own"
  ON user_team_players FOR SELECT
  USING (
    team_id IN (SELECT id FROM user_teams WHERE user_id = auth.uid())
  );

CREATE POLICY "utp_insert_own"
  ON user_team_players FOR INSERT
  WITH CHECK (
    team_id IN (SELECT id FROM user_teams WHERE user_id = auth.uid() AND is_locked = FALSE)
  );

CREATE POLICY "utp_update_own"
  ON user_team_players FOR UPDATE
  USING (
    team_id IN (SELECT id FROM user_teams WHERE user_id = auth.uid() AND is_locked = FALSE)
  );

CREATE POLICY "utp_delete_own"
  ON user_team_players FOR DELETE
  USING (
    team_id IN (SELECT id FROM user_teams WHERE user_id = auth.uid() AND is_locked = FALSE)
  );

-- ── leagues ──────────────────────────────────────────────────
-- Public leagues visible to all; private leagues visible to members only
CREATE POLICY "leagues_select_public"
  ON leagues FOR SELECT
  USING (
    type = 'public'
    OR created_by = auth.uid()
    OR id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
  );

CREATE POLICY "leagues_insert_own"
  ON leagues FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "leagues_update_own"
  ON leagues FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "leagues_delete_own"
  ON leagues FOR DELETE
  USING (auth.uid() = created_by);

-- ── league_members ───────────────────────────────────────────
CREATE POLICY "lm_select_member"
  ON league_members FOR SELECT
  USING (
    league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
    OR league_id IN (SELECT id FROM leagues WHERE created_by = auth.uid())
  );

CREATE POLICY "lm_insert_self"
  ON league_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lm_delete_self"
  ON league_members FOR DELETE
  USING (auth.uid() = user_id);

-- ── league_chat ──────────────────────────────────────────────
-- Only league members can read and post
CREATE POLICY "chat_select_member"
  ON league_chat FOR SELECT
  USING (
    league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
  );

CREATE POLICY "chat_insert_member"
  ON league_chat FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
  );

-- Users can only delete their own messages
CREATE POLICY "chat_delete_own"
  ON league_chat FOR DELETE
  USING (auth.uid() = user_id);

-- ── match_fixtures ───────────────────────────────────────────
CREATE POLICY "fixtures_select_all"
  ON match_fixtures FOR SELECT USING (TRUE);

-- ── match_events ─────────────────────────────────────────────
CREATE POLICY "events_select_all"
  ON match_events FOR SELECT USING (TRUE);

-- ── invite_referrals ─────────────────────────────────────────
CREATE POLICY "referrals_select_own"
  ON invite_referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "referrals_insert_own"
  ON invite_referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- ============================================================
-- REALTIME: Enable realtime for live-scoring tables
-- ============================================================

-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE match_fixtures;
ALTER PUBLICATION supabase_realtime ADD TABLE user_team_players;
ALTER PUBLICATION supabase_realtime ADD TABLE league_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ============================================================
-- STORAGE: Bucket for user avatars (optional)
-- ============================================================

-- Run this in the dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ============================================================
-- COMMENTS (documentation)
-- ============================================================

COMMENT ON TABLE profiles          IS 'User profiles, extends auth.users';
COMMENT ON TABLE players           IS 'All World Cup 2026 players available for drafting';
COMMENT ON TABLE world_cup_teams   IS '48 teams competing at WC 2026';
COMMENT ON TABLE user_teams        IS 'A user''s drafted fantasy squad';
COMMENT ON TABLE user_team_players IS 'Players in a user''s squad (starters + bench)';
COMMENT ON TABLE leagues           IS 'Fantasy competition groups (public or private)';
COMMENT ON TABLE league_members    IS 'League membership pivot table';
COMMENT ON TABLE league_chat       IS 'Real-time banter/trash-talk chat per private league';
COMMENT ON TABLE match_fixtures    IS 'All 104 WC 2026 match fixtures';
COMMENT ON TABLE match_events      IS 'Scoring events that drive live fantasy points';
COMMENT ON TABLE invite_referrals  IS 'Viral invite tracking for budget bonuses';
