import axios from 'axios';
import { Problem, Submission, Contest, User, ScoreboardData } from '../types';

// Logic: Configured Axios HTTP client instance for communicating with Axum REST API v2.
// Input: Axios client configuration with dynamic Authorization bearer interceptor.
// Output: Configured Axios instance with request/response interceptors.
export const apiClient = axios.create({
  baseURL: '/api/v2',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('furaoj_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Logic: Authenticates user credentials with Axum backend and stores JWT in local storage.
 * Input: `username` (string), `password` (string).
 * Output: Promise resolving to authentication response with token and user profile.
 */
export async function loginUser(username: string, password: string): Promise<{ token: string; user: User }> {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
}

/**
 * Logic: Fetches the authenticated user profile using active JWT bearer token.
 * Input: None.
 * Output: Promise resolving to User model.
 */
export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

/**
 * Logic: Fetches paginated problem list with optional keyword and difficulty filters.
 * Input: `page` (number), `keyword` (optional string).
 * Output: Promise resolving to array of Problem objects.
 */
export async function fetchProblems(page = 1, keyword?: string): Promise<any[]> {
  const response = await apiClient.get('/problems', {
    params: { page, keyword },
  });
  return response.data;
}

/**
 * Logic: Fetches single problem detail including statement and metadata by code slug.
 * Input: `code` (string problem identifier).
 * Output: Promise resolving to Problem object.
 */
export async function fetchProblem(code: string): Promise<any> {
  const response = await apiClient.get(`/problem/${code}`);
  return response.data;
}

/**
 * Logic: Submits source code solution for asynchronous grading by Rust Judge Server.
 * Input: `data` containing problem_code, language, source_code.
 * Output: Promise resolving to created Submission record.
 */
export async function submitSolution(data: {
  problem_code?: string;
  problem_id?: number;
  language: string;
  source_code: string;
  contest_id?: number | null;
}): Promise<any> {
  const code = data.problem_code || 'aplusb';
  const response = await apiClient.post(`/problem/${code}/submit`, {
    language: data.language,
    source_code: data.source_code,
  });
  return response.data;
}

/**
 * Logic: Queries submissions list filtered by problem, user, status, or contest.
 * Input: Filter parameters object.
 * Output: Promise resolving to array of Submission items.
 */
export async function fetchSubmissions(params?: {
  page?: number;
  problem_code?: string;
  username?: string;
  verdict?: string;
  contest_id?: number;
}): Promise<any[]> {
  const response = await apiClient.get('/submissions', { params });
  return response.data;
}

/**
 * Logic: Fetches single submission details including testcase breakdowns and source code.
 * Input: `id` (number submission ID).
 * Output: Promise resolving to detailed Submission object.
 */
export async function fetchSubmission(id: number): Promise<any> {
  const response = await apiClient.get(`/submission/${id}`);
  return response.data;
}

/**
 * Logic: Fetches active, upcoming, and past competitive programming contests.
 * Input: None.
 * Output: Promise resolving to array of Contest objects.
 */
export async function fetchContests(): Promise<Contest[]> {
  const response = await apiClient.get('/contests');
  return response.data;
}

/**
 * Logic: Fetches single contest detail by unique slug identifier.
 * Input: `slug` (string contest identifier).
 * Output: Promise resolving to Contest object.
 */
export async function fetchContest(slug: string): Promise<Contest> {
  const response = await apiClient.get(`/contest/${slug}`);
  return response.data;
}

/**
 * Logic: Fetches contest scoreboard standing matrix with frozen status and penalties.
 * Input: `slug` (string contest identifier).
 * Output: Promise resolving to ScoreboardData.
 */
export async function fetchScoreboard(slug: string): Promise<ScoreboardData> {
  const response = await apiClient.get(`/contest/${slug}/scoreboard`);
  return response.data;
}

/**
 * Logic: Fetches competitive programming user leaderboard sorted by rating.
 * Input: None.
 * Output: Promise resolving to array of User profiles.
 */
export async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get('/users');
  return response.data;
}

/**
 * Logic: Fetches single user public profile and contest history by username.
 * Input: `username` (string username identifier).
 * Output: Promise resolving to User profile.
 */
export async function fetchUser(username: string): Promise<User> {
  const response = await apiClient.get(`/user/${username}`);
  return response.data;
}

export const api = {
  getProblems: fetchProblems,
  getProblem: fetchProblem,
  submitProblem: submitSolution,
  getSubmissions: fetchSubmissions,
  getSubmission: fetchSubmission,
  getContests: fetchContests,
  getContest: fetchContest,
  getScoreboard: fetchScoreboard,
  getUsers: fetchUsers,
  getUser: fetchUser,
  login: loginUser,
  getMe: fetchCurrentUser,
};
