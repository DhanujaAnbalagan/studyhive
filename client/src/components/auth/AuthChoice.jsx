import React from 'react';
import { Link } from 'react-router-dom';

function AuthChoice() {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    fontFamily: 'Arial, sans-serif',
  };

  const cardStyle = {
    background: '#fff',
    padding: '50px',
    borderRadius: '15px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  };

  const headingStyle = {
    fontSize: '2.2rem',
    marginBottom: '10px',
    color: '#333',
  };

  const subTextStyle = {
    marginBottom: '30px',
    color: '#666',
    fontSize: '1rem',
  };

  const buttonStyle = {
    margin: '10px',
    padding: '15px 40px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const loginButton = {
    ...buttonStyle,
    background: '#2575fc',
    color: '#fff',
  };

  const signupButton = {
    ...buttonStyle,
    background: '#6a11cb',
    color: '#fff',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Welcome to StudyHive</h1>
        <p style={subTextStyle}>A study environment built just for you 🚀</p>
        <div>
          <Link to="/login">
            <button style={loginButton}>Login</button>
          </Link>
          <Link to="/signup">
            <button style={signupButton}>Sign Up</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthChoice;
