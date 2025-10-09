import React, { Component } from 'react';
import Navbar from "../common/Navbar.jsx";
import { Link } from 'react-router-dom';

class ReportBug extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      issueType: '',
      description: '',
      stepsToReproduce: '',
      severity: 'Low', // default value to match backend enum
      status: 'Open',  // optional, backend default
      browser: '',
      os: '',
      pageUrl: '',
      reproducibility: '',
      feedback: '',
      notifyMe: false,
      dateReported: new Date().toISOString().split('T')[0]
    };
  }

  handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    this.setState({ [name]: type === 'checkbox' ? checked : value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Issue reported successfully!');
        window.location.href = '/profile';
      } else {
        alert(data.message || 'Error reporting issue');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  };

  render() {
    const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    const cardStyle = { background: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '40px', width: '100%', maxWidth: '650px', backdropFilter: 'blur(10px)', overflowY: 'auto', maxHeight: '90vh' };
    const inputGroupStyle = { marginBottom: '20px' };
    const labelStyle = { display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' };
    const inputStyle = { width: '100%', padding: '12px', border: '2px solid #e1e8ed', borderRadius: '10px', fontSize: '15px' };
    const selectStyle = { ...inputStyle, cursor: 'pointer' };
    const textareaStyle = { ...inputStyle, height: '80px', resize: 'vertical' };
    const buttonStyle = { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '15px' };

    return (
      <div className='page-container'>
        <Navbar />
        <div className="main-content" style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={cardStyle}>
          <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', color: '#333', marginBottom: '20px' }}>Report an Issue or Bug</h1>
          <form onSubmit={this.handleSubmit}>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" name="name" onChange={this.handleChange} style={inputStyle} required />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" onChange={this.handleChange} style={inputStyle} required />
            </div>


            <div style={inputGroupStyle}>
              <label style={labelStyle}>Type of Issue</label>
              <select name="issueType" onChange={this.handleChange} style={selectStyle} required>
                <option value="">Select type</option>
                <option>Bug / Error</option>
                <option>Feature Request</option>
                <option>UI/UX Problem</option>
                <option>Performance Issue</option>
                <option>Security Concern</option>
                <option>Other</option>
              </select>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" placeholder="Describe the issue..." onChange={this.handleChange} style={textareaStyle} required></textarea>
            </div>


            <div style={inputGroupStyle}>
              <label style={labelStyle}>Steps to Reproduce</label>
              <textarea name="stepsToReproduce" placeholder="Step 1: ... Step 2: ..." onChange={this.handleChange} style={textareaStyle}></textarea>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Severity</label>
              <select name="severity" onChange={this.handleChange} style={selectStyle}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>


            <div style={inputGroupStyle}>
              <label style={labelStyle}>Browser</label>
              <input type="text" name="browser" placeholder="e.g. Chrome 127, Firefox 143" onChange={this.handleChange} style={inputStyle} />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Operating System</label>
              <input type="text" name="os" placeholder="e.g. Windows 10, macOS Ventura" onChange={this.handleChange} style={inputStyle} />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Page URL / Section</label>
              <input type="url" name="pageUrl" placeholder="e.g. https://studyhive.com/profile" onChange={this.handleChange} style={inputStyle} />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Additional Feedback or Suggestions</label>
              <textarea name="feedback" placeholder="Share any other details..." onChange={this.handleChange} style={textareaStyle}></textarea>
            </div>

            <div style={inputGroupStyle}>
              <label>
                <input type="checkbox" name="notifyMe" onChange={this.handleChange} />
                &nbsp;Notify me when this issue is resolved
              </label>
            </div>

            <button type="submit" style={buttonStyle}>Submit Report</button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/profile" style={{ color: '#667eea', textDecoration: 'none' }}>← Back to Profile</Link>
          </div>
        </div>
        </div>
      </div>
    );
  }
}

export default ReportBug;