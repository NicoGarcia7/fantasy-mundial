// ─── Player Types ──────────────────────────────────────────────────────────────
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: string;
  name: string;
  short_name: string;
  nationality: string;
  flag_emoji: string;
  team: string;
  team_short: string;
  position: PlayerPosition;
  price: number; // in millions
  points: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  yellow_cards: number;
  red_cards: number;
  image_url?: string;
  is_injured: boolean;
  is_suspended: boolean;
  form: number; // 0-10 form rating
}

// ─── Draft / Team Types ─────────────────────────────────────────────────────────
export type Formation = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '5-3-2';

export interface DraftSlot {
  position: PlayerPosition;
  slotIndex: number; // position on pitch
  player: Player | null;
  isBench: boolean;
}

export interface UserTeam {
  id: string;
  user_id: string;
  name: string;
  formation: Formation;
  budget_remaining: number;
  total_points: number;
  players: Player[];
  bench: Player[];
  created_at: string;
  updated_at: string;
}

// ─── League Types ───────────────────────────────────────────────────────────────
export type LeagueType = 'public' | 'private';

export interface League {
  id: string;
  name: string;
  type: LeagueType;
  invite_code: string;
  created_by: string;
  max_members: number;
  member_count: number;
  created_at: string;
}

export interface LeagueMember {
  user_id: string;
  username: string;
  avatar_url: string;
  team_name: string;
  total_points: number;
  rank: number;
  weekly_points: number;
}

export interface LeagueChat {
  id: string;
  league_id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  message: string;
  created_at: string;
}

// ─── User / Profile Types ───────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_id: string;
  favorite_team: string;
  invites_sent: number;
  bonus_budget: number; // extra budget earned via invites
  created_at: string;
}

// ─── Live Scoring Types ─────────────────────────────────────────────────────────
export interface LiveEvent {
  player_id: string;
  player_name: string;
  event_type: 'goal' | 'assist' | 'clean_sheet' | 'yellow_card' | 'red_card' | 'save';
  points_awarded: number;
  match: string;
  timestamp: string;
}

export interface MatchFixture {
  id: string;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  kickoff: string;
  status: 'upcoming' | 'live' | 'finished';
  home_score: number;
  away_score: number;
  stage: string; // 'Group A', 'Round of 16', etc.
}

// ─── Scoring Rules ──────────────────────────────────────────────────────────────
export const SCORING_RULES = {
  goal_gk: 10,
  goal_def: 8,
  goal_mid: 6,
  goal_fwd: 5,
  assist: 4,
  clean_sheet_gk: 6,
  clean_sheet_def: 4,
  clean_sheet_mid: 1,
  yellow_card: -1,
  red_card: -3,
  save_3: 1, // 1 point per 3 saves
} as const;

export const BUDGET_TOTAL = 100; // $100M
export const SQUAD_SIZE = 11;
export const BENCH_SIZE = 4;
export const INVITE_BONUS_THRESHOLD = 3; // invites needed for bonus
export const INVITE_BONUS_AMOUNT = 5; // $5M bonus
