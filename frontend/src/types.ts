/**
 * Logic: Core TypeScript data contract definitions matching FuraOJ PostgreSQL database schema and REST/WebSocket API v2.
 * Input: None (Type declarations).
 * Output: Exported TypeScript interfaces and union types.
 */

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined?: string;
  rating?: number;
  points?: number;
  solved_count?: number;
}

export interface ProblemListItem {
  id: number;
  code: string;
  name: string;
  points: number;
  time_limit: number;
  memory_limit: number;
  is_public: boolean;
}

export interface Problem {
  id: number;
  code: string;
  title: string;
  name?: string;
  description: string;
  time_limit: number;
  memory_limit: number;
  points: number;
  is_public: boolean;
  author_id?: number;
  submission_count?: number;
  accepted_count?: number;
}

export interface TestCaseResult {
  index: number;
  verdict: string;
  time_ms: number;
  memory_kb: number;
  points: number;
  error?: string;
}

export interface Submission {
  id: number;
  problem_id?: number;
  user_id?: number;
  contest_id?: number | null;
  language: string;
  source_code?: string;
  verdict?: string;
  result?: string;
  status?: string;
  time_taken?: number | null;
  time?: number | null;
  memory_used?: number | null;
  memory?: number | null;
  score?: number | null;
  points?: number | null;
  error_message?: string | null;
  test_cases_result?: TestCaseResult[] | string | null;
  cases?: any[];
  created_at?: string;
  date?: string;
  problem_code?: string;
  problem_title?: string;
  username?: string;
}

export interface Contest {
  id: number;
  title: string;
  slug: string;
  description: string;
  start_time: string;
  end_time: string;
  is_visible: boolean;
  is_frozen: boolean;
  frozen_time?: string | null;
}

export interface ScoreboardProblemResult {
  solved: boolean;
  attempts: number;
  time_minutes: number;
  points: number;
}

export interface ScoreboardRow {
  rank: number;
  user_id: number;
  username: string;
  score: number;
  penalty: number;
  problem_results: Record<string, ScoreboardProblemResult>;
}

export interface ScoreboardData {
  contest: Contest;
  problems: { code: string; title: string; points: number }[];
  rows: ScoreboardRow[];
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface LivePacket {
  type: 'submission_update' | 'case_update' | 'contest_update' | 'ping';
  submission_id?: number;
  verdict?: string;
  time_ms?: number;
  memory_kb?: number;
  score?: number;
  case_index?: number;
  case_verdict?: string;
  payload?: Record<string, unknown>;
}
