import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Survey.css';

interface SurveyResponse {
  reasonForPoliticalChange: string;
  reasonForVijayVote: string;
}

export const Survey = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<SurveyResponse>({
    reasonForPoliticalChange: '',
    reasonForVijayVote: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof SurveyResponse, value: string) => {
    setResponses(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responses.reasonForPoliticalChange || !responses.reasonForVijayVote) {
      alert('Please answer all questions');
      return;
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setResponses({
      reasonForPoliticalChange: '',
      reasonForVijayVote: '',
    });
    setSubmitted(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="header-left">
          <h1>🗳️ Area Survey</h1>
          <p className="welcome-text">Welcome, <strong>{user?.fullName}</strong> to MyArea</p>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Dashboard
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="survey-content">
        {!submitted ? (
          <div className="survey-form-container">
            <div className="survey-info">
              <h2>📋 Please answer the following questions</h2>
              <p>Your responses will help us understand political preferences and voting patterns.</p>
            </div>

            <form onSubmit={handleSubmit} className="survey-form">
              {/* Question 1 */}
              <div className="question-container">
                <div className="question-number">1</div>
                <div className="question-content">
                  <h3>What is the main reason for political change in your opinion?</h3>
                  <p className="question-subtitle">Select the primary reason you believe people are changing their political stance</p>

                  <div className="options">
                    {[
                      { value: "Vijay's Charisma", label: "Vijay's Charisma", icon: '✨' },
                      { value: 'Third Option', label: 'Third Option', icon: '🆕' },
                      { value: 'People Behind Actors', label: 'People Behind Actors', icon: '👥' },
                      { value: 'Previous Party Attract', label: 'Previous Party Attract', icon: '🎯' },
                    ].map(option => (
                      <label key={option.value} className="option-label">
                        <input
                          type="radio"
                          name="reasonForPoliticalChange"
                          value={option.value}
                          checked={responses.reasonForPoliticalChange === option.value}
                          onChange={(e) => handleChange('reasonForPoliticalChange', e.target.value)}
                          className="option-input"
                        />
                        <span className="option-icon">{option.icon}</span>
                        <span className="option-text">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* Question 2 */}
              <div className="question-container">
                <div className="question-number">2</div>
                <div className="question-content">
                  <h3>Why did you vote for Vijay? (Beyond caste/religion)</h3>
                  <p className="question-subtitle">Select the main reason for your voting preference</p>

                  <div className="options">
                    {[
                      { value: 'Cinema Fame', label: 'Cinema Fame', icon: '🎬' },
                      { value: 'Being a CM Candidate', label: 'Being a CM Candidate', icon: '🏛️' },
                      { value: 'Development Vision', label: 'Development Vision', icon: '🚀' },
                      { value: 'Youth Appeal', label: 'Youth Appeal', icon: '👨‍👩‍👧‍👦' },
                      { value: 'Strong Leadership', label: 'Strong Leadership', icon: '💪' },
                    ].map(option => (
                      <label key={option.value} className="option-label">
                        <input
                          type="radio"
                          name="reasonForVijayVote"
                          value={option.value}
                          checked={responses.reasonForVijayVote === option.value}
                          onChange={(e) => handleChange('reasonForVijayVote', e.target.value)}
                          className="option-input"
                        />
                        <span className="option-icon">{option.icon}</span>
                        <span className="option-text">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn-submit">
                  ✓ Submit Survey
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="survey-success">
            <div className="success-icon">✅</div>
            <h2>Thank You for Your Response!</h2>
            <p className="success-message">Your survey has been submitted successfully.</p>

            <div className="response-summary">
              <h3>Your Responses:</h3>
              <div className="response-item">
                <div className="response-label">1. Reason for Political Change:</div>
                <div className="response-value">{responses.reasonForPoliticalChange}</div>
              </div>
              <div className="response-item">
                <div className="response-label">2. Why Did You Vote for Vijay?</div>
                <div className="response-value">{responses.reasonForVijayVote}</div>
              </div>
            </div>

            <div className="success-buttons">
              <button onClick={handleReset} className="btn-new-survey">
                📝 Take Survey Again
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
                📊 View Analytics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
