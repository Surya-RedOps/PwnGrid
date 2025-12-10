import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Register() {
  const [step, setStep] = useState('registration'); // 'registration' or 'otp'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otpData, setOtpData] = useState({
    otp: '',
    email: ''
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const onOtpChange = (e) => {
    setOtpData({ ...otpData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 'registration') {
      await handleRegistration();
    } else {
      await handleOtpVerification();
    }
  };

  const handleRegistration = async () => {
    // Validation
    if (!username || !email || !password) {
      setFormError('Please enter all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password
      });

      if (response.data.success) {
        setOtpData({ ...otpData, email });
        setSuccessMessage('Registration successful! OTP sent to your email.');
        setFormError('');
        setStep('otp');
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otpData.otp || !otpData.email) {
      setFormError('Please enter OTP');
      return;
    }

    if (otpData.otp.length !== 6) {
      setFormError('OTP must be 6 digits');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        email: otpData.email,
        otp: otpData.otp
      });

      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        setSuccessMessage('Email verified! Logging you in...');
        setFormError('');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/auth/resend-otp', {
        email: otpData.email
      });

      if (response.data.success) {
        setSuccessMessage('OTP resent to your email');
        setFormError('');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Join <span className="highlight">pwngrid Horizon</span></h2>
          <p>{step === 'registration' ? 'Create an account to start your hacking journey' : 'Verify your email address'}</p>
        </div>

        {formError && <div className="auth-error">{formError}</div>}
        {successMessage && <div className="auth-success">{successMessage}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          {step === 'registration' ? (
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={onChange}
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Register'}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otpData.otp}
                  onChange={onOtpChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                />
                <small style={{ color: '#999', marginTop: '5px' }}>
                  OTP sent to {otpData.email}
                </small>
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                className="auth-button"
                style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
                onClick={handleResendOtp}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resending...' : 'Resend OTP'}
              </button>
            </>
          )}
        </form>

        <div className="auth-footer">
          <p>
            {step === 'registration' 
              ? 'Already have an account? '
              : 'Changed your mind? '}
            <Link to="/login" className="auth-link">
              {step === 'registration' ? 'Login' : 'Back to Login'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
