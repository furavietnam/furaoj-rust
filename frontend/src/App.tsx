import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { SubmissionDetailPage } from './pages/SubmissionDetailPage';
import { ContestsPage } from './pages/ContestsPage';
import { ContestDetailPage } from './pages/ContestDetailPage';
import { ScoreboardPage } from './pages/ScoreboardPage';
import { UsersPage } from './pages/UsersPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { LoginPage } from './pages/LoginPage';

/**
 * Logic: Root application router mapping URL paths to page views wrapped in AuthProvider and AppShell.
 * Input: None.
 * Output: JSX.Element top-level component tree.
 */
export function App(): JSX.Element {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problem/:code" element={<ProblemDetailPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/submission/:id" element={<SubmissionDetailPage />} />
            <Route path="/contests" element={<ContestsPage />} />
            <Route path="/contest/:slug" element={<ContestDetailPage />} />
            <Route path="/contest/:slug/scoreboard" element={<ScoreboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/user/:username" element={<UserProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
