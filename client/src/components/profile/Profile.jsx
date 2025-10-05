import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../common/Navbar.jsx";
import "../../App.css"

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isEditing: false,
      formData: {
        username: '',
        email: '',
        branch: '',
        year: '',
        interests: []
      },
      loading: false,
      error: '',
      success: ''
    };
  }

  componentDidMount() {
    this.fetchUserProfile();
  }

  fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load profile');
      }

      const userData = data.user || data; // backend may return {user} or raw object
      this.setState({
        user: userData,
        formData: {
          username: userData.username || '',
          email: userData.email || '',
          branch: userData.branch || '',
          year: userData.year || '',
          interests: userData.interests || []
        },
        error: ''
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      this.setState({ error: 'Error connecting to server or invalid token' });
    }
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      formData: { ...prev.formData, [name]: value }
    }));
  };

  handleInterestChange = (e) => {
    const { value, checked } = e.target;
    this.setState((prev) => {
      const updated = checked
        ? [...prev.formData.interests, value]
        : prev.formData.interests.filter((i) => i !== value);
      return { formData: { ...prev.formData, interests: updated } };
    });
  };

  handleSaveProfile = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: '', success: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(this.state.formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');

      const updatedUser = data.user || data;
      this.setState({
        user: updatedUser,
        formData: {
          ...this.state.formData,
          username: updatedUser.username,
          email: updatedUser.email,
          branch: updatedUser.branch,
          year: updatedUser.year,
          interests: updatedUser.interests || []
        },
        isEditing: false,
        success: 'Profile updated successfully!',
        loading: false
      });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Save profile error:', error);
      this.setState({
        error: error.message || 'Error connecting to server',
        loading: false
      });
    }
  };

  handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    const confirmWord = window.prompt('Type "DELETE" to confirm account deletion:');
    if (confirmWord !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete account');

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Account deleted successfully.');
      window.location.href = '/';
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Error connecting to server.');
    }
  };

  render() {
    const { user, isEditing, formData, loading, error, success } = this.state;

    if (!user) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ color: 'white', fontSize: '18px' }}>
            {error ? 'Error loading profile' : 'Loading profile...'}
          </div>
        </div>
      );
    }

    const containerStyle = {
      minHeight: '100vh',
      background: 'black',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const cardStyle = {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      maxWidth: '600px',
      margin: '0 auto'
    };

    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    };

    const titleStyle = {
      fontSize: '32px',
      fontWeight: '700',
      color: '#333',
      margin: 0
    };

    const inputStyle = {
      width: '100%',
      padding: '12px',
      border: '2px solid #e1e8ed',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '15px',
      boxSizing: 'border-box'
    };

    const buttonStyle = {
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginRight: '10px'
    };

    const dangerButtonStyle = { ...buttonStyle, background: '#ff4757' };

    const branches = [
      'Computer Science',
      'Information Technology',
      'Electronics & Communication',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Chemical Engineering',
      'Aerospace Engineering',
      'Biotechnology',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Business Administration',
      'Economics',
      'Psychology'
    ];

    const interestOptions = [
      'Programming',
      'Web Development',
      'Data Science',
      'Machine Learning',
      'Mobile Development',
      'Game Development',
      'Cybersecurity',
      'Database Management',
      'UI/UX Design',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Literature',
      'History',
      'Philosophy',
      'Economics',
      'Business',
      'Marketing',
      'Finance'
    ];

    return (
      <div className='page-container'>
        <Navbar />
        <div className="main-content">
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>My Profile</h1>
            <Link
              to={`/dashboard/${user._id || ''}`}
              style={{ ...buttonStyle, textDecoration: 'none' }}
            >
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div
              style={{
                background: '#ffe6e6',
                color: '#d8000c',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: '#e6ffe6',
                color: '#4caf50',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            >
              {success}
            </div>
          )}

          {!isEditing ? (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px' }}>Username</h3>
                <p style={{ fontSize: '16px', color: '#666' }}>{user.username}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px' }}>Email</h3>
                <p style={{ fontSize: '16px', color: '#666' }}>{user.email}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px' }}>
                  Branch of Study
                </h3>
                <p style={{ fontSize: '16px', color: '#666' }}>{user.branch}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px' }}>
                  Year of Study
                </h3>
                <p style={{ fontSize: '16px', color: '#666' }}>{user.year}</p>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px' }}>Interests</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {user.interests && user.interests.length > 0 ? (
                    user.interests.map((interest, index) => (
                      <span
                        key={index}
                        style={{
                          background: '#667eea',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '14px'
                        }}
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p style={{ fontSize: '16px', color: '#666' }}>
                      No interests selected
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => this.setState({ isEditing: true })}
                  style={buttonStyle}
                >
                  Edit Profile
                </button>

                <Link
                  to="/reportbug"
                  style={{ ...buttonStyle, textDecoration: 'none' }}
                >
                  Report Issue
                </Link>

                <button
                  onClick={this.handleDeleteAccount}
                  style={dangerButtonStyle}
                >
                  Delete Account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={this.handleSaveProfile}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={this.handleInputChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={this.handleInputChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                  Branch of Study
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={this.handleInputChange}
                  style={inputStyle}
                  required
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                  Year of Study
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={this.handleInputChange}
                  style={inputStyle}
                  required
                >
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map(
                    (yearOption) => (
                      <option key={yearOption} value={yearOption}>
                        {yearOption}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                  Interests
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px'
                  }}
                >
                  {interestOptions.map((interest) => (
                    <label
                      key={interest}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <input
                        type="checkbox"
                        value={interest}
                        checked={formData.interests.includes(interest)}
                        onChange={this.handleInterestChange}
                        style={{ accentColor: '#667eea' }}
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...buttonStyle,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={() => this.setState({ isEditing: false })}
                  style={{ ...buttonStyle, background: '#666' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        </div>
      </div>
    );
  }
}

export default Profile;
