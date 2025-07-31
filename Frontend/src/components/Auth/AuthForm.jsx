import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('Learner');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const switchMode = () => {
    // Only allow switching to registration mode for Learners
    if (userType === 'Tutor' && !isLogin) {
      return; // Prevent tutors from accessing registration
    }
    
    setIsLogin((prevIsLogin) => !prevIsLogin);
    setMessage('');
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
    });
  };

  const handleUserTypeChange = (newUserType) => {
    setUserType(newUserType);
    // If switching to Tutor, force login mode
    if (newUserType === 'Tutor') {
      setIsLogin(true);
      setMessage('');
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    // Prevent tutors from registering
    if (!isLogin && userType === 'Tutor') {
      setMessage('Tutors can only log in. Registration is not available for tutors.');
      setIsLoading(false);
      return;
    }

    // Validation
    if (!formData.username || !formData.password) {
      setMessage('Username and password are required.');
      setIsLoading(false);
      return;
    }

    if (!isLogin && userType === 'Learner') {
      if (!formData.name || !formData.email) {
        setMessage('Name and email are required for registration.');
        setIsLoading(false);
        return;
      }
    }

    const apiUrl = 'http://127.0.0.1:8000/api';

    try {
      let response;
      let dataToSend;
      let endpoint;

      if (isLogin) {
        dataToSend = {
          email_or_username: formData.username || formData.email,
          password: formData.password,
        };
        endpoint = `${apiUrl}/auth/login`;
      } else {
        // Only allow Learner registration
        if (userType !== 'Learner') {
          setMessage('Only students can create new accounts.');
          setIsLoading(false);
          return;
        }
        
        dataToSend = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          user_type: userType,
        };
        endpoint = `${apiUrl}/auth/register`;
      }

      console.log('Sending request to:', endpoint);
      console.log('Request data:', { ...dataToSend, password: '[REDACTED]' });

      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      console.log('Server response:', response.status, data);

      if (response.ok) {
        if (isLogin && data.user) {
          console.log('Login successful:', data.user);
          const loggedInUserType = data.user.user_type || userType;

          // Store both token and user data in localStorage
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userType', loggedInUserType);

          setMessage('Login successful! Redirecting...');

          // Call the auth success callback to update App state
          if (onAuthSuccess) {
            onAuthSuccess(data.user, loggedInUserType);
          }

          // Navigate with a small delay to ensure state updates
          setTimeout(() => {
            try {
              if (loggedInUserType === 'Tutor') {
                navigate('/tutor-dashboard', { replace: true });
              } else {
                navigate('/learner-dashboard', { replace: true });
              }
            } catch (navError) {
              console.error('Navigation failed, using window.location:', navError);
              // Fallback to window.location
              if (loggedInUserType === 'Tutor') {
                window.location.href = '/tutor-dashboard';
              } else {
                window.location.href = '/learner-dashboard';
              }
            }
          }, 200);

        } else if (!isLogin) {
          // Registration successful (only for Learners)
          setMessage(data.message || 'Registration successful! You can now log in.');
          setFormData({
            name: '',
            username: '',
            email: '',
            password: '',
          });
          setIsLogin(true); // Switch to login mode
        } else {
          // Login but no user data
          setMessage('Login failed: Invalid response from server.');
        }
      } else {
        // Handle different error status codes
        if (response.status === 401) {
          setMessage('Invalid username/email or password.');
        } else if (response.status === 400) {
          setMessage(data.detail || 'Bad request. Please check your input.');
        } else if (response.status >= 500) {
          setMessage('Server error. Please try again later.');
        } else {
          setMessage(data.detail || 'Something went wrong. Please try again.');
        }
        console.error('Error response:', data);
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage('Could not connect to the server. Please check if the server is running.');
      } else {
        setMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? `${userType} Login` : `Create ${userType} Account`}</h2>

        <div className="role-selector">
          <button
            type="button"
            className={userType === 'Learner' ? 'active' : ''}
            onClick={() => handleUserTypeChange('Learner')}
            disabled={isLoading}
          >
            Student
          </button>
          <button
            type="button"
            className={userType === 'Tutor' ? 'active' : ''}
            onClick={() => handleUserTypeChange('Tutor')}
            disabled={isLoading}
          >
            Tutor
          </button>
        </div>

        {/* Show registration fields only for Learners and when not in login mode */}
        {!isLogin && userType === 'Learner' && (
          <>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>

        {message && (
          <div className={`auth-message ${message.includes('successful') || message.includes('Redirecting') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <span>
              {isLogin ? 'Logging in...' : 'Creating account...'}
              <span className="loading-spinner"></span>
            </span>
          ) : (
            isLogin ? 'Login' : 'Create Account'
          )}
        </button>

        {/* Only show the switch button for Learners or when in login mode */}
        {(userType === 'Learner' || isLogin) && (
          <button 
            type="button" 
            onClick={switchMode} 
            className="switch-btn" 
            disabled={isLoading || (userType === 'Tutor' && !isLogin)}
            style={{
              display: userType === 'Tutor' && !isLogin ? 'none' : 'block'
            }}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        )}

        {/* Show info message for tutors */}
        {userType === 'Tutor' && (
          <div className="info-message" style={{ 
            fontSize: '0.9em', 
            color: '#666', 
            textAlign: 'center', 
            marginTop: '10px',
            padding: '8px',
            backgroundColor: '#f0f8ff',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            📝 Tutors can only log in. Contact an administrator for account creation.
          </div>
        )}
      </form>
    </div>
  );
};

export default AuthForm;