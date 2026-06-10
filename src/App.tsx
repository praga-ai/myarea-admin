import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { VerifyEmail } from './components/VerifyEmail';
import { Dashboard } from './components/Dashboard';
import { Survey } from './components/Survey';
import { Users } from './components/Users';
import { PendingRegistrations } from './components/PendingRegistrations';
import { MasterData } from './components/MasterData';
import { ThemeSettings } from './components/ThemeSettings';
import { Unauthorized } from './components/Unauthorized';
import { NotFound } from './components/NotFound';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/">
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/survey"
            element={
              <ProtectedRoute>
                <Survey />
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="Admin">
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pending-registrations"
            element={
              <ProtectedRoute requiredRole="Admin">
                <PendingRegistrations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/master-data"
            element={
              <ProtectedRoute requiredRole="Admin">
                <MasterData />
              </ProtectedRoute>
            }
          />

          <Route
            path="/theme-settings"
            element={
              <ProtectedRoute requiredRole="Admin">
                <ThemeSettings />
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
