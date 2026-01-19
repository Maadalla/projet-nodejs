import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import useAuthStore from './store/useAuthStore';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout
import Layout from './components/layout/Layout';
import RequireAuth from './components/auth/RequireAuth';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Settings from './pages/Settings';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { fetchUser } = useAuthStore();

  // Charger l'utilisateur au montage de l'application
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Routes protégées */}
            <Route element={<Layout />}>
              <Route path="/" element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } />
              <Route path="/projects" element={
                <RequireAuth>
                  <Projects />
                </RequireAuth>
              } />
              <Route path="/team" element={
                <RequireAuth>
                  <Team />
                </RequireAuth>
              } />
              <Route path="/settings" element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              } />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
