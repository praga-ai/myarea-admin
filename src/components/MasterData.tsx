import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MasterData.css';

interface MasterDataItem {
  id: number;
  type: string;
  name: string;
  count?: number;
}

export const MasterData: React.FC = () => {
  const { token, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMasterData = useCallback(async () => {
    setError('');

    // Mock data for demo
    const mockData: MasterDataItem[] = [
      { id: 1, type: 'Wards', name: 'Ward Locations', count: 8 },
      { id: 2, type: 'Parts', name: 'Ward Parts', count: 24 },
      { id: 3, type: 'Areas', name: 'Areas', count: 156 },
      { id: 4, type: 'Streets', name: 'Streets', count: 892 },
    ];

    let data = mockData;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const [wardsRes, partsRes, areasRes, streetsRes] = await Promise.all([
        fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/wards', {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        }),
        fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/parts', {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        }),
        fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/areas', {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        }),
        fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/streets', {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        }),
      ]);

      clearTimeout(timeout);

      const items: MasterDataItem[] = [];

      if (wardsRes.ok) {
        const wards = await wardsRes.json();
        items.push({ id: 1, type: 'Wards', name: 'Ward Locations', count: wards.length });
      }

      if (partsRes.ok) {
        const parts = await partsRes.json();
        items.push({ id: 2, type: 'Parts', name: 'Ward Parts', count: parts.length });
      }

      if (areasRes.ok) {
        const areas = await areasRes.json();
        items.push({ id: 3, type: 'Areas', name: 'Areas', count: areas.length });
      }

      if (streetsRes.ok) {
        const streets = await streetsRes.json();
        items.push({ id: 4, type: 'Streets', name: 'Streets', count: streets.length });
      }

      // If API calls succeeded, use API data
      if (items.length > 0) {
        data = items;
      }
    } catch (apiError) {
      // API not available, use mock data
    }

    setData(data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!hasRole('Admin')) {
      navigate('/unauthorized');
      return;
    }
    loadMasterData();
  }, [hasRole, loadMasterData, navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="master-data-container">
      <header className="master-data-header">
        <div className="header-left">
          <button onClick={handleBack} className="btn-back">
            ← Back
          </button>
          <h1>⚙️ Master Data Management</h1>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="master-data-content">
        <div className="master-data-card">
          <div className="card-header">
            <h2>Master Data Overview</h2>
            <button onClick={loadMasterData} className="btn-refresh">
              🔄 Refresh
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading master data...</div>
          ) : (
            <div className="master-data-grid">
              {data.map((item) => (
                <div key={item.id} className="master-data-item">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    {item.count !== undefined && (
                      <span className="item-count">{item.count}</span>
                    )}
                  </div>
                  <p className="item-type">{item.type}</p>
                </div>
              ))}
            </div>
          )}

          <div className="master-data-info">
            <h3>📋 About Master Data</h3>
            <ul>
              <li><strong>Wards:</strong> Top-level administrative divisions</li>
              <li><strong>Parts:</strong> Sub-divisions within each ward</li>
              <li><strong>Areas:</strong> Geographic areas within parts</li>
              <li><strong>Streets:</strong> Individual street locations within areas</li>
            </ul>
            <p className="info-note">
              ℹ️ Master data is managed through the database. Contact your database administrator to add or modify entries.
            </p>
          </div>
        </div>

        <div className="questionnaire-card">
          <div className="card-header">
            <h2>📋 Questionnaire Management</h2>
          </div>
          <div className="questionnaire-info">
            <p>Currently configured questionnaires:</p>
            <ul>
              <li>Satisfaction Rating (5 options)</li>
              <li>Service Quality (Yes/No)</li>
              <li>Multiple Choice Question (3 options)</li>
              <li>Feedback Question (Yes/No)</li>
              <li>Recommendation (Yes/No/Maybe)</li>
            </ul>
            <p className="info-note">
              ℹ️ To add new questionnaires, please contact your database administrator or use the SQL scripts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
