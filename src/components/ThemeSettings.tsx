import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeName } from '../context/ThemeContext';
import './ThemeSettings.css';

export const ThemeSettings: React.FC = () => {
  const { logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();

  React.useEffect(() => {
    if (!hasRole('Admin')) {
      navigate('/unauthorized');
      return;
    }
  }, [hasRole, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="theme-settings-container">
      <header className="theme-settings-header">
        <div className="header-left">
          <button onClick={handleBack} className="btn-back">
            ← Back
          </button>
          <h1>🎨 Theme Settings</h1>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="theme-settings-content">
        <div className="settings-card">
          <div className="card-header">
            <h2>Application Theme</h2>
            <p className="card-subtitle">Select a color theme for the entire application</p>
          </div>

          <div className="theme-grid">
            {availableThemes.map((theme) => (
              <div
                key={theme.name}
                className={`theme-option ${themeName === theme.name ? 'active' : ''}`}
                onClick={() => setTheme(theme.name as ThemeName)}
              >
                <div className="theme-preview">
                  <div
                    className="preview-primary"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="preview-accent"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <div
                    className="preview-success"
                    style={{ backgroundColor: theme.colors.success }}
                  />
                  <div
                    className="preview-background"
                    style={{ backgroundColor: theme.colors.background }}
                  />
                </div>
                <div className="theme-info">
                  <h3>{theme.label}</h3>
                  {themeName === theme.name && <span className="active-badge">✓ Active</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="theme-details">
            <h3>Current Theme: {currentTheme.label}</h3>
            <div className="color-palette">
              <div className="color-item">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                />
                <span>Primary: {currentTheme.colors.primary}</span>
              </div>
              <div className="color-item">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                />
                <span>Accent: {currentTheme.colors.accent}</span>
              </div>
              <div className="color-item">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: currentTheme.colors.success }}
                />
                <span>Success: {currentTheme.colors.success}</span>
              </div>
              <div className="color-item">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: currentTheme.colors.background }}
                />
                <span>Background: {currentTheme.colors.background}</span>
              </div>
            </div>
          </div>

          <div className="theme-info-box">
            <p>
              <strong>✓ Theme changes are applied instantly</strong> to the entire application
              and saved to your browser.
            </p>
            <p>All users will see the theme based on their browser preferences.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
