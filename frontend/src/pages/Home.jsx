import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js'; // Adjust path as needed
import axios from '../store/axiosInstance.js'; // Import your axios instance
import './Home.css'; // Add this CSS file

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout, isCheckingAuth, fetchUser } = useAuthStore();
  const [meetingId, setMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && !user) {
      navigate('/');
    }
  }, [user, isCheckingAuth, navigate]);

  // Fetch recent meetings when user is available
  useEffect(() => {
    if (user) {
      fetchRecentMeetings();
    }
  }, [user]);

  const fetchRecentMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const response = await axios.get('/get_all_activity');
      setRecentMeetings(response.data.activities || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setRecentMeetings([]);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const addMeetingToHistory = async (meetingCode) => {
    try {
      await axios.post('/add_to_activity', { meetingCode });
      // Refresh the meetings list
      fetchRecentMeetings();
    } catch (error) {
      console.error('Error adding meeting to history:', error);
    }
  };

  const generateMeetingId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleStartMeeting = async () => {
    setIsLoading(true);
    const newMeetingId = generateMeetingId();
    
    try {
      await addMeetingToHistory(newMeetingId);
      console.log('Starting new meeting:', newMeetingId);
      navigate(`/room/${newMeetingId}`);
    } catch (error) {
      console.error('Error starting meeting:', error);
      navigate(`/room/${newMeetingId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!meetingId.trim()) {
      alert('Please enter a meeting ID');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await addMeetingToHistory(meetingId.trim());
      console.log('Joining meeting:', meetingId);
      navigate(`/room/${meetingId.trim()}`);
    } catch (error) {
      console.error('Error joining meeting:', error);
      navigate(`/room/${meetingId.trim()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejoinMeeting = (meetingCode) => {
    navigate(`/room/${meetingCode}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <span className="video-icon">📹</span>
            </div>
            <h1 className="logo-text">Meetly</h1>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="username">{user?.username}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span className="logout-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h2 className="welcome-title">
            Welcome back, {user?.username}!
          </h2>
          <p className="welcome-description">
            Start a new meeting or join an existing one. Connect with your team instantly and collaborate seamlessly.
          </p>
        </div>

        {/* Action Cards */}
        <div className="action-cards">
          {/* Start New Meeting */}
          <div className="action-card">
            <div className="card-content">
              <div className="card-icon green">
                <span className="plus-icon">➕</span>
              </div>
              <h3 className="card-title">Start New Meeting</h3>
              <p className="card-description">
                Create an instant meeting and invite others to join you.
              </p>
              <button
                onClick={handleStartMeeting}
                disabled={isLoading}
                className="action-btn green"
              >
                {isLoading ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <>
                    <span>Start Meeting</span>
                    <span className="arrow-icon">→</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Join Meeting */}
          <div className="action-card">
            <div className="card-content">
              <div className="card-icon blue">
                <span className="users-icon">👥</span>
              </div>
              <h3 className="card-title">Join Meeting</h3>
              <p className="card-description">
                Enter a meeting ID to join an existing meeting.
              </p>
              <div className="join-form">
                <input
                  type="text"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder="Enter Meeting ID"
                  className="meeting-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinMeeting()}
                />
                <button
                  onClick={handleJoinMeeting}
                  disabled={isLoading || !meetingId.trim()}
                  className="action-btn blue"
                >
                  {isLoading ? (
                    <div className="btn-spinner"></div>
                  ) : (
                    <>
                      <span>Join Meeting</span>
                      <span className="arrow-icon">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Meetings Section */}
        <div className="recent-meetings">
          <h3 className="section-title">Recent Meetings</h3>
          
          {loadingMeetings ? (
            <div className="loading-meetings">
              <div className="spinner"></div>
              <p>Loading meetings...</p>
            </div>
          ) : recentMeetings.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p className="empty-title">No recent meetings found</p>
              <p className="empty-description">Your meeting history will appear here</p>
            </div>
          ) : (
            <div className="meetings-list">
              {recentMeetings.slice(0, 5).map((meeting, index) => (
                <div key={meeting._id || index} className="meeting-item">
                  <div className="meeting-info">
                    <div className="meeting-code">
                      <span className="code-label">Meeting ID:</span>
                      <span className="code-value">{meeting.meetingCode}</span>
                    </div>
                    <div className="meeting-date">
                      {formatDate(meeting.date)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRejoinMeeting(meeting.meetingCode)}
                    className="rejoin-btn"
                  >
                    <span>Rejoin</span>
                    <span className="arrow-icon">→</span>
                  </button>
                </div>
              ))}
              {recentMeetings.length > 5 && (
                <div className="show-more">
                  <p>{recentMeetings.length - 5} more meetings...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 VideoMeet. Secure video conferencing made simple.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;