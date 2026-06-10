import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';

export const VerifyEmail: React.FC = () => {
  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'code-input' | 'verified'>('code-input');
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from session/localStorage
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (!pendingEmail) {
      navigate('/register');
      return;
    }
    setEmail(pendingEmail);
  }, [navigate]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send verification code to backend
      const response = await fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          verificationCode: inputCode.trim(),
        }),
      });

      if (response.ok) {
        setSuccess('Email verified successfully!');
        setStep('verified');
        setLoading(false);
      } else {
        const error = await response.json();
        setError(error.message || 'Invalid verification code. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Unable to verify email. Please try again later.');
      console.error('Verification error:', err);
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    // In a real app, this would call an API to resend the email
    setTimeout(() => {
      setSuccess(`Verification code sent to ${email}. Check your inbox.`);
      setLoading(false);
    }, 1000);
  };

  if (!email) {
    return <div className="auth-container"><div className="auth-card">Loading...</div></div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>📍 MyArea</h1>
          <p>Verify Email Address</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 'code-input' ? (
          <>
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #FF9500'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#333', fontWeight: '500' }}>
                A verification code has been sent to:
              </p>
              <p style={{ margin: '0', color: '#8B1538', fontWeight: '600', fontSize: '16px' }}>
                {email}
              </p>
            </div>

            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label htmlFor="code">Verification Code</label>
                <input
                  id="code"
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  style={{ fontSize: '24px', textAlign: 'center', letterSpacing: '8px' }}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Didn't receive the code?
                <button
                  onClick={handleResendCode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8B1538',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: '700',
                    marginLeft: '5px'
                  }}
                  disabled={loading}
                >
                  Resend
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <div style={{
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ color: '#333', marginBottom: '10px' }}>Email Verified!</h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>
                Your email has been verified. Your registration request is now pending admin approval.
              </p>
              <p style={{
                backgroundColor: '#f0fdf4',
                padding: '15px',
                borderRadius: '8px',
                color: '#2e7d32',
                marginBottom: '30px',
                borderLeft: '4px solid #4caf50'
              }}>
                You will receive a confirmation email once your account is approved and created.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
