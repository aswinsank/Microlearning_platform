import React, { useState } from 'react';
import './AuthForm.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('Learner'); // This userType is not currently used in your FastAPI backend for auth, consider its purpose.
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState(''); // State to display messages to the user (e.g., success, error)

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
    setMessage(''); // Clear previous messages

    const apiUrl = 'http://127.0.0.1:8000/api/auth'; // Assuming your FastAPI runs on this address. Adjust if different.

    try {
      let response;
      let dataToSend;

      if (isLogin) {
        // Prepare data for login
        dataToSend = {
          email_or_username: formData.username, // Using username for the unified field
          password: formData.password,
        };
        response = await fetch(`${apiUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      } else {
        // Prepare data for registration
        dataToSend = formData; // formData already contains name, username, email, password
        response = await fetch(`${apiUrl}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Operation successful!');
        // You might want to do more here, e.g., redirect user, save token
        console.log('Success:', data);
        // For login, you'd typically save user data or a token to localStorage/sessionStorage
        if (isLogin && data.user) {
            console.log('Logged in user details:', data.user);
            // Example: localStorage.setItem('userToken', data.token); // If your backend returns a token
            // Example: localStorage.setItem('userName', data.user.name);
        }
      } else {
        setMessage(data.detail || 'Something went wrong.');
        console.error('Error:', data);
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      setMessage('Could not connect to the server. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? `${userType} Login` : `Create ${userType} Account`}</h2>

        {/* This role-selector is currently not used in your backend authentication logic.
            If 'Learner' vs 'Tutor' implies different registration/login flows or roles stored in the DB,
            you'll need to expand your backend logic to handle this.
        */}
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
                value={formData.name} // Add value prop for controlled components
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
                value={formData.email} // Add value prop
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
            value={formData.username} // Add value prop
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
            value={formData.password} // Add value prop
            onChange={handleInputChange}
            required
          />
        </div>

        {message && <p className="auth-message">{message}</p>} {/* Display messages here */}

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