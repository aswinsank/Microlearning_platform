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
    setIsLogin((prevIsLogin) => !prevIsLogin);
    setMessage('');
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    const apiUrl = 'http://127.0.0.1:8000/api/auth';

    try {
      let response;
      let dataToSend;
      let endpoint;

      if (isLogin) {
        dataToSend = {
          email_or_username: formData.username || formData.email,
          password: formData.password,
        };
        endpoint = `${apiUrl}/login`;
      } else {
        dataToSend = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          user_type: userType,
        };
        endpoint = `${apiUrl}/register`;
      }

      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin && data.user) {
          console.log('Login successful:', data.user);
          const loggedInUserType = data.user.user_type || userType;

          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userType', loggedInUserType);

          // Call the auth success callback
          if (onAuthSuccess) {
            onAuthSuccess(data.user, loggedInUserType);
          }

          // Navigate based on user type
          if (loggedInUserType === 'Tutor') {
            navigate('/tutor-dashboard', { replace: true });
          } else {
            navigate('/learner-dashboard', { replace: true });
          }

          setMessage('Login successful! Redirecting...');
        } else if (!isLogin) {
          // Registration successful
          setMessage(data.message || 'Registration successful! You can now log in.');
          setFormData({
            name: '',
            username: '',
            email: '',
            password: '',
          });
          setIsLogin(true); // Switch to login mode
        }
      } else {
        setMessage(data.detail || 'Something went wrong. Please check your credentials.');
        console.error('Error:', data);
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      setMessage('Could not connect to the server. Please try again later.');
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
            onClick={() => setUserType('Learner')}
          >
            Learner
          </button>
          <button
            type="button"
            className={userType === 'Tutor' ? 'active' : ''}
            onClick={() => setUserType('Tutor')}
          >
            Tutor
          </button>
        </div>

        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email ID</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        {message && <p className="auth-message">{message}</p>}

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Login' : 'Create Account')}
        </button>

        <button type="button" onClick={switchMode} className="switch-btn" disabled={isLoading}>
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;