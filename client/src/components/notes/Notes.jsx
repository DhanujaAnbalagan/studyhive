import React, { Component } from 'react';
import axios from 'axios';
import Navbar from "../common/Navbar.jsx";
import "../../App.css"
import { MdBook } from "react-icons/md";

class Notes extends Component {
    state = {
        title: '',
        tags: '',
        textContent: '',
        file: null,
        fileName: '',
        summary: '',
        originalText: '',
        savedNotes: [],
        loading: false,
        error: '',
        success: '',
        activeTab: 'create'
    };

    componentDidMount() {
        this.fetchNotes();
    }

    fetchNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/notes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            this.setState({ savedNotes: response.data });
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.setState({
                    error: 'File too large. Maximum size is 5MB.',
                    file: null,
                    fileName: ''
                });
                return;
            }
            this.setState({
                file,
                fileName: file.name,
                error: '',
                textContent: ''
            });
        }
    };

    clearFile = () => {
        this.setState({ file: null, fileName: '' });
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            this.setState({
                error: 'Authentication error. Please log in again.',
                loading: false
            });
            return;
        }

        const { title, tags, textContent, file } = this.state;

        if (!title.trim()) {
            this.setState({ error: 'Please provide a title for your note.' });
            return;
        }

        if (!textContent.trim() && !file) {
            this.setState({ error: 'Please provide either text content or upload a file.' });
            return;
        }

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('tags', tags.trim());
        if (file) {
            formData.append('file', file);
        }
        if (textContent.trim()) {
            formData.append('textContent', textContent.trim());
        }

        this.setState({ loading: true, error: '', summary: '', success: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/notes/summarize',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            this.setState({
                summary: response.data.summary,
                originalText: response.data.originalText,
                loading: false,
                success: 'Summary generated and saved successfully!',

                title: '',
                tags: '',
                textContent: '',
                file: null,
                fileName: ''
            });

            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            this.fetchNotes();

        } catch (error) {
            console.error('Error:', error);
            this.setState({
                error: error.response?.data?.message || 'Error generating summary. Please try again.',
                loading: false
            });
        }
    };

    deleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            this.fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    render() {
        const {
            title, tags, textContent, fileName, loading, error, success,
            summary, originalText, savedNotes, activeTab
        } = this.state;

        const containerStyle = {
            minHeight: '100vh',
            background: 'black',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        };

        const cardStyle = {
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            maxWidth: '1000px',
            margin: '16px'
        };

        const tabStyle = {
            display: 'flex',
            marginBottom: '30px',
            borderBottom: '2px solid #f0f0f0'
        };

        const tabButtonStyle = (isActive) => ({
            padding: '15px 25px',
            border: 'none',
            background: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            borderBottom: isActive ? '3px solid #667eea' : 'none',
            color: isActive ? '#667eea' : '#666'
        });

        const inputStyle = {
            width: '100%',
            padding: '15px',
            border: '2px solid #e1e8ed',
            borderRadius: '12px',
            fontSize: '16px',
            outline: 'none',
            marginBottom: '20px',
            boxSizing: 'border-box'
        };

        const textareaStyle = {
            ...inputStyle,
            minHeight: '120px',
            resize: 'vertical'
        };

        const buttonStyle = {
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginRight: '10px'
        };

        const fileUploadStyle = {
            border: '2px dashed #667eea',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center',
            marginBottom: '20px',
            backgroundColor: '#f8f9ff'
        };

        return (
            <div className='page-container'>
                <Navbar />
                <div className="main-content">

                    <div className="top-navbar enhanced-topbar">
                        <div className="page-header">
                            <div className="page-title">
                                <span className="page-icon page-icon-primary"><MdBook /></span>
                                <div>
                                    <h1>Smart Notes Summarizer</h1>
                                    <p className="page-subtitle"> Upload documents or paste text to generate AI-powered summaries using Facebook's BART model</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={cardStyle}>

                        <div style={tabStyle}>
                            <button
                                style={tabButtonStyle(activeTab === 'create')}
                                onClick={() => this.setState({ activeTab: 'create' })}
                            >
                                Create Summary
                            </button>
                            <button
                                style={tabButtonStyle(activeTab === 'saved')}
                                onClick={() => this.setState({ activeTab: 'saved' })}
                            >
                                Saved Notes ({savedNotes.length})
                            </button>
                        </div>

                        {activeTab === 'create' && (
                            <form onSubmit={this.handleSubmit}>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Note Title *"
                                    value={title}
                                    onChange={this.handleChange}
                                    style={inputStyle}
                                    required
                                />

                                <input
                                    type="text"
                                    name="tags"
                                    placeholder="Tags (comma separated, e.g., lecture, math, chapter1)"
                                    value={tags}
                                    onChange={this.handleChange}
                                    style={inputStyle}
                                />

                                <div style={fileUploadStyle}>
                                    <input
                                        type="file"
                                        accept=".pdf,.txt"
                                        onChange={this.handleFileChange}
                                        style={{ display: 'none' }}
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#667eea' }}>
                                            Click to upload PDF or TXT file
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                                            Maximum file size: 5MB
                                        </div>
                                    </label>
                                    {fileName && (
                                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
                                            <span style={{ color: '#667eea', fontWeight: '500' }}>📄 {fileName}</span>
                                            <button
                                                type="button"
                                                onClick={this.clearFile}
                                                style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>OR</div>

                                <textarea
                                    name="textContent"
                                    placeholder="Paste your text here to summarize..."
                                    value={textContent}
                                    onChange={this.handleChange}
                                    style={textareaStyle}
                                    disabled={!!fileName}
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        ...buttonStyle,
                                        opacity: loading ? 0.7 : 1,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? 'Generating Summary...' : 'Generate Summary'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'saved' && (
                            <div>
                                {savedNotes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
                                        <h3>No notes saved yet</h3>
                                        <p>Create your first summary to see it here!</p>
                                    </div>
                                ) : (
                                    <div>
                                        {savedNotes.map((note) => (
                                            <div key={note._id} style={{
                                                border: '1px solid #e1e8ed',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                marginBottom: '20px',
                                                backgroundColor: '#f8f9ff'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                                    <div>
                                                        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{note.title}</h3>
                                                        {note.tags && note.tags.length > 0 && (
                                                            <div>
                                                                {note.tags.map((tag, index) => (
                                                                    <span key={index} style={{
                                                                        background: '#667eea',
                                                                        color: 'white',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '12px',
                                                                        marginRight: '5px'
                                                                    }}>
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => this.deleteNote(note._id)}
                                                        style={{
                                                            background: '#ff4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            padding: '6px 12px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                                                    <strong>Summary:</strong>
                                                    <p style={{ marginTop: '10px', lineHeight: '1.6' }}>{note.summary}</p>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                                                    Created: {new Date(note.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div style={{
                                background: '#ffe6e6',
                                color: '#d8000c',
                                padding: '15px',
                                borderRadius: '8px',
                                marginTop: '20px'
                            }}>
                                ❌ {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                background: '#e6ffe6',
                                color: '#4caf50',
                                padding: '15px',
                                borderRadius: '8px',
                                marginTop: '20px'
                            }}>
                                ✅ {success}
                            </div>
                        )}

                        {summary && (
                            <div style={{
                                background: '#f0f8ff',
                                border: '2px solid #667eea',
                                borderRadius: '12px',
                                padding: '30px',
                                marginTop: '30px'
                            }}>
                                <h3 style={{ color: '#667eea', marginBottom: '20px' }}>📄 Generated Summary</h3>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    lineHeight: '1.7',
                                    fontSize: '16px'
                                }}>
                                    {summary}
                                </div>
                                {originalText && (
                                    <details style={{ marginTop: '20px' }}>
                                        <summary style={{ cursor: 'pointer', fontWeight: '500', color: '#667eea' }}>
                                            View Original Text Preview
                                        </summary>
                                        <div style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            marginTop: '10px',
                                            fontSize: '14px',
                                            fontStyle: 'italic'
                                        }}>
                                            {originalText}
                                        </div>
                                    </details>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default Notes;