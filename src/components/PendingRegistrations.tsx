import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Users.css';

interface PendingRegistration {
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  createdAt: string;
  emailVerified: boolean;
  verifiedAt?: string;
}

export const PendingRegistrations: React.FC = () => {
  const { logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRole('Admin')) {
      navigate('/unauthorized');
      return;
    }
    loadPendingRegistrations();
  }, [hasRole, navigate]);

  const loadPendingRegistrations = async () => {
    try {
      // Fetch pending registrations from backend
      const response = await fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/auth/pending-registrations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRegistrations(data.registrations || []);
      } else {
        // Show empty list if API fails
        setPendingRegistrations([]);
      }
    } catch (err) {
      console.error('Error loading pending registrations:', err);
      setPendingRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (email: string) => {
    try {
      // Send approval request to backend
      const response = await fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/auth/approve-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert(`Account created for ${email} and confirmation email sent!`);
        // Reload pending registrations
        loadPendingRegistrations();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to approve registration'}`);
      }
    } catch (err) {
      alert('Error approving registration. Please try again.');
      console.error('Approval error:', err);
    }
  };

  const handleReject = async (email: string) => {
    if (window.confirm(`Are you sure you want to reject registration for ${email}?`)) {
      try {
        // Send rejection request to backend
        const response = await fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/auth/reject-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          alert(`Registration rejected for ${email}`);
          // Reload pending registrations
          loadPendingRegistrations();
        } else {
          const error = await response.json();
          alert(`Error: ${error.message || 'Failed to reject registration'}`);
        }
      } catch (err) {
        alert('Error rejecting registration. Please try again.');
        console.error('Rejection error:', err);
      }
    }
  };

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
          <h1>⏳ Pending Registrations</h1>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="users-content">
        <div className="users-card">
          <div className="card-header">
            <h2>Registration Requests Awaiting Approval</h2>
          </div>

          {loading ? (
            <div className="loading">Loading pending registrations...</div>
          ) : pendingRegistrations.length === 0 ? (
            <div className="empty-state">
              <p>No pending registration requests</p>
            </div>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Email Verified</th>
                    <th>Requested</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRegistrations.map((reg) => (
                    <tr key={reg.email}>
                      <td className="email">{reg.email}</td>
                      <td>{reg.fullName}</td>
                      <td>
                        <span className={`role-badge role-${reg.roleName.toLowerCase()}`}>
                          {reg.roleName}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          color: reg.emailVerified ? '#2e7d32' : '#FF9500',
                          fontWeight: '600'
                        }}>
                          {reg.emailVerified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprove(reg.email)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}
                          disabled={!reg.emailVerified}
                          title={!reg.emailVerified ? 'Email must be verified first' : 'Approve and create account'}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(reg.email)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}
                          title="Reject registration"
                        >
                          ✗ Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="users-footer">
            <p>
              <strong>Workflow:</strong> User registers → Email verification → Admin approval → Account created → Confirmation sent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
