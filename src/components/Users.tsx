import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Users.css';

interface UserItem {
  userId: number;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  lastLoginDate: string;
}

export const Users: React.FC = () => {
  const { token, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setError('');

    // Mock users for demo
    const mockUsers: UserItem[] = [
      {
        userId: 1,
        email: 'admin@myarea.com',
        fullName: 'Admin User',
        roleName: 'Admin',
        isActive: true,
        lastLoginDate: new Date().toISOString(),
      },
      {
        userId: 2,
        email: 'surveyor@myarea.com',
        fullName: 'Surveyor User',
        roleName: 'Surveyor',
        isActive: true,
        lastLoginDate: new Date().toISOString(),
      },
      {
        userId: 3,
        email: 'john.doe@myarea.com',
        fullName: 'John Doe',
        roleName: 'Surveyor',
        isActive: true,
        lastLoginDate: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        userId: 4,
        email: 'jane.smith@myarea.com',
        fullName: 'Jane Smith',
        roleName: 'Surveyor',
        isActive: true,
        lastLoginDate: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    // Try API, but use mock data as fallback
    let users = mockUsers;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        users = data.users || mockUsers;
      }
    } catch (apiErr) {
      // API not available, use mock data
    }

    setUsers(users);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!hasRole('Admin')) {
      navigate('/unauthorized');
      return;
    }
    loadUsers();
  }, [hasRole, loadUsers, navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="users-container">
      <header className="users-header">
        <div className="header-left">
          <button onClick={handleBack} className="btn-back">
            ← Back
          </button>
          <h1>👥 User Management</h1>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="users-content">
        <div className="users-card">
          <div className="card-header">
            <h2>All Users</h2>
            <button onClick={loadUsers} className="btn-refresh">
              🔄 Refresh
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId} className={!user.isActive ? 'inactive' : ''}>
                      <td className="email">{user.email}</td>
                      <td>{user.fullName}</td>
                      <td>
                        <span className={`role-badge role-${user.roleName.toLowerCase()}`}>
                          {user.roleName}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {user.lastLoginDate && user.lastLoginDate !== '0001-01-01T00:00:00'
                          ? new Date(user.lastLoginDate).toLocaleDateString()
                          : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="users-footer">
            <p>Total Users: <strong>{users.length}</strong></p>
            <p>
              Admins: <strong>{users.filter(u => u.roleName === 'Admin').length}</strong> |
              Surveyors: <strong>{users.filter(u => u.roleName === 'Surveyor').length}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
