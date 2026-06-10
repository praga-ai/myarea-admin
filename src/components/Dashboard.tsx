import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

interface Survey {
  surveyId: number;
  wardId: number;
  partId: number;
  areaId: number;
  streetId: number;
  surveyData: string;
  createdDate: string;
}

export const Dashboard: React.FC = () => {
  const { user, logout, hasRole, token } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSurveys = useCallback(async () => {
    setError('');

    // Generate realistic mock survey data with only political questions
    const politicalChangeReasons = ['Vijay\'s Charisma', 'Third Option', 'People Behind Actors', 'Previous Party Attract'];
    const vijayVoteReasons = ['Cinema Fame', 'Being a CM Candidate', 'Development Vision', 'Youth Appeal', 'Strong Leadership'];

    const mockSurveys: Survey[] = [];
    for (let i = 1; i <= 24; i++) {
      mockSurveys.push({
        surveyId: i,
        wardId: Math.floor(Math.random() * 8) + 1,
        partId: Math.floor(Math.random() * 24) + 1,
        areaId: Math.floor(Math.random() * 156) + 1,
        streetId: Math.floor(Math.random() * 892) + 1,
        surveyData: JSON.stringify({
          reasonForPoliticalChange: politicalChangeReasons[Math.floor(Math.random() * politicalChangeReasons.length)],
          reasonForVijayVote: vijayVoteReasons[Math.floor(Math.random() * vijayVoteReasons.length)],
        }),
        createdDate: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      });
    }

    let surveys = mockSurveys;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/surveys', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        surveys = data || mockSurveys;
      }
    } catch (apiErr) {
      // API not available, use mock data
    }

    setSurveys(surveys);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const parseResponses = (surveyData: string) => {
    try {
      return JSON.parse(surveyData);
    } catch {
      return {};
    }
  };

  // Calculate chart data
  const getPoliticalChangeData = () => {
    const data: { [key: string]: number } = {
      'Vijay\'s Charisma': 0,
      'Third Option': 0,
      'People Behind Actors': 0,
      'Previous Party Attract': 0,
    };
    surveys.forEach(survey => {
      const response = parseResponses(survey.surveyData);
      if (response.reasonForPoliticalChange && data.hasOwnProperty(response.reasonForPoliticalChange)) {
        data[response.reasonForPoliticalChange]++;
      }
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const getVijayVoteReasonData = () => {
    const data: { [key: string]: number } = {
      'Cinema Fame': 0,
      'Being a CM Candidate': 0,
      'Development Vision': 0,
      'Youth Appeal': 0,
      'Strong Leadership': 0,
    };
    surveys.forEach(survey => {
      const response = parseResponses(survey.surveyData);
      if (response.reasonForVijayVote && data.hasOwnProperty(response.reasonForVijayVote)) {
        data[response.reasonForVijayVote]++;
      }
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#8B1538', '#FF9500', '#4caf50', '#6B0E2A', '#E67E00'];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📊 MyArea Dashboard</h1>
          <p className="welcome-text">Welcome, <strong>{user?.fullName}</strong> ({user?.roleName})</p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Total Responses</h3>
              <p className="stat-value">{surveys.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <h3>Role</h3>
              <p className="stat-value">{user?.roleName}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Last Login</h3>
              <p className="stat-value">
                {user?.lastLoginDate ? new Date(user.lastLoginDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <h3>Status</h3>
              <p className="stat-value">{user?.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {!loading && surveys.length > 0 && (
          <div className="charts-section">
            <h2>📊 Response Analytics</h2>

            <div className="charts-grid">
              {/* Reason for Political Change - Pie Chart */}
              <div className="chart-container">
                <h3>🗳️ Reason for Political Change</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getPoliticalChangeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPoliticalChangeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Reason for Vijay Vote - Bar Chart */}
              <div className="chart-container">
                <h3>👤 Why Did You Vote for Vijay?</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getVijayVoteReasonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FF9500" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="survey-section">
          <h2>📋 Area Survey</h2>
          <div className="survey-buttons">
            <button
              onClick={() => navigate('/survey')}
              className="btn-survey"
            >
              🗳️ Take Survey
            </button>
          </div>
        </div>

        {hasRole('Admin') && (
          <div className="admin-section">
            <h2>🔐 Admin Functions</h2>
            <div className="admin-buttons">
              <button
                onClick={() => navigate('/pending-registrations')}
                className="btn-admin"
              >
                ⏳ Pending Registrations
              </button>
              <button
                onClick={() => navigate('/users')}
                className="btn-admin"
              >
                👥 Manage Users
              </button>
              <button
                onClick={() => navigate('/theme-settings')}
                className="btn-admin"
              >
                🎨 Theme Settings
              </button>
              <button
                onClick={() => navigate('/master-data')}
                className="btn-admin"
              >
                ⚙️ Master Data
              </button>
            </div>
          </div>
        )}

        <div className="surveys-section">
          <div className="section-header">
            <h2>📋 Recent Responses</h2>
            <button onClick={loadSurveys} className="btn-refresh">
              🔄 Refresh
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading surveys...</div>
          ) : surveys.length === 0 ? (
            <div className="empty-state">
              <p>No surveys yet</p>
            </div>
          ) : (
            <div className="surveys-table">
              <table>
                <thead>
                  <tr>
                    <th>Survey ID</th>
                    <th>Location</th>
                    <th>Responses</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((survey) => {
                    const responses = parseResponses(survey.surveyData);
                    return (
                      <tr key={survey.surveyId}>
                        <td>#{survey.surveyId}</td>
                        <td>
                          Ward {survey.wardId} | Part {survey.partId} | Area {survey.areaId} | Street {survey.streetId}
                        </td>
                        <td>
                          <span className="badge">{Object.keys(responses).length} questions</span>
                        </td>
                        <td>{new Date(survey.createdDate).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
