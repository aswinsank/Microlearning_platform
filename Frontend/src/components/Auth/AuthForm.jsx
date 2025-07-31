// src/components/Auth/AuthForm.jsx

import React, { useState } from 'react';
import './AuthForm.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('Learner');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const switchMode = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted!');
    console.log('User Type:', userType);

    if (isLogin) {
      console.log('Logging in with:', {
        username: formData.username,
        password: formData.password,
      });
      // TODO: Add API call for login
    } else {
      console.log('Signing up with:', formData);
      // TODO: Add API call for signup
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

        {/* Name and Email fields only show in "Sign Up" mode */}
        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your full name"
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
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          {isLogin ? 'Login' : 'Create Account'}
        </button>

        <button type="button" onClick={switchMode} className="switch-btn">
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;