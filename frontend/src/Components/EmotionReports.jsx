import React, { useState, useEffect } from 'react';
import './EmotionReports.css';

const EmotionReports = () => {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, high-risk, recent

  useEffect(() => {
    fetchReports();
    fetchAnalytics();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/emotion-reports');
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
        
        // Extract unique users
        const uniqueUsers = [...new Set(data.reports.map(r => r.userEmail))];
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/emotion-analytics');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUserReports = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:3001/api/emotion-reports/user/${userEmail}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching user reports:', error);
    }
  };

  const handleUserChange = (userEmail) => {
    setSelectedUser(userEmail);
    if (userEmail === 'all') {
      fetchReports();
    } else {
      fetchUserReports(userEmail);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      anger: '#dc3545',
      fear: '#6f42c1',
      sadness: '#0dcaf0',
      joy: '#198754',
      surprise: '#fd7e14',
      disgust: '#6c757d',
      neutral: '#6c757d'
    };
    return colors[emotion] || '#6c757d';
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: '#198754',
      medium: '#ffc107',
      high: '#dc3545'
    };
    return colors[risk] || '#6c757d';
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      low: '#198754',
      medium: '#ffc107',
      high: '#dc3545'
    };
    return colors[intensity] || '#6c757d';
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'high-risk') {
      return report.emotionAnalysis.riskAssessment === 'high';
    }
    if (filter === 'recent') {
      const reportDate = new Date(report.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return reportDate > weekAgo;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="emotion-reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading emotion reports...</p>
      </div>
    );
  }

  return (
    <div className="emotion-reports">
      <div className="reports-header">
        <h2>Emotion Analysis Reports</h2>
        <p>Monitor emotional patterns and sentiment analysis for complaint cases</p>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="analytics-dashboard">
          <div className="analytics-card">
            <h3>📊 Overview</h3>
            <div className="analytics-grid">
              <div className="stat-item">
                <span className="stat-number">{analytics.totalReports}</span>
                <span className="stat-label">Total Reports</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{analytics.uniqueUsers}</span>
                <span className="stat-label">Unique Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{(analytics.averageConfidence * 100).toFixed(1)}%</span>
                <span className="stat-label">Avg Confidence</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>🎭 Emotion Breakdown</h3>
            <div className="emotion-breakdown">
              {Object.entries(analytics.emotionBreakdown).map(([emotion, count]) => (
                <div key={emotion} className="emotion-item">
                  <span 
                    className="emotion-dot" 
                    style={{ backgroundColor: getEmotionColor(emotion) }}
                  ></span>
                  <span className="emotion-name">{emotion}</span>
                  <span className="emotion-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h3>⚠️ Risk Assessment</h3>
            <div className="risk-breakdown">
              {Object.entries(analytics.riskLevels).map(([risk, count]) => (
                <div key={risk} className="risk-item">
                  <span 
                    className="risk-dot" 
                    style={{ backgroundColor: getRiskColor(risk) }}
                  ></span>
                  <span className="risk-name">{risk}</span>
                  <span className="risk-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="reports-controls">
        <div className="filter-group">
          <label>Filter by User:</label>
          <select 
            value={selectedUser} 
            onChange={(e) => handleUserChange(e.target.value)}
            className="user-select"
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user} value={user}>
                {user === 'anonymous' ? 'Anonymous Users' : user}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Type:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Reports</option>
            <option value="high-risk">High Risk Only</option>
            <option value="recent">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        <h3>Emotion Analysis Reports ({filteredReports.length})</h3>
        
        {filteredReports.length === 0 ? (
          <div className="no-reports">
            <p>No emotion reports found for the selected criteria.</p>
          </div>
        ) : (
          <div className="reports-grid">
            {filteredReports.map((report, index) => (
              <div key={index} className="report-card">
                <div className="report-header">
                  <div className="report-meta">
                    <span className="user-email">
                      {report.userEmail === 'anonymous' ? 'Anonymous User' : report.userEmail}
                    </span>
                    <span className="report-date">
                      {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="report-risk">
                    <span 
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(report.emotionAnalysis.riskAssessment) }}
                    >
                      {report.emotionAnalysis.riskAssessment.toUpperCase()} RISK
                    </span>
                  </div>
                </div>

                <div className="report-content">
                  <div className="original-text">
                    <strong>Original Text:</strong>
                    <p>{report.originalText}</p>
                  </div>

                  <div className="emotion-analysis">
                    <div className="emotion-primary">
                      <span 
                        className="emotion-badge"
                        style={{ backgroundColor: getEmotionColor(report.emotionAnalysis.primaryEmotion) }}
                      >
                        {report.emotionAnalysis.primaryEmotion.toUpperCase()}
                      </span>
                      <span 
                        className="intensity-badge"
                        style={{ backgroundColor: getIntensityColor(report.emotionAnalysis.emotionalIntensity) }}
                      >
                        {report.emotionAnalysis.emotionalIntensity.toUpperCase()} INTENSITY
                      </span>
                    </div>

                    <div className="sentiment-analysis">
                      <span className="sentiment-label">Sentiment:</span>
                      <span className={`sentiment-value ${report.emotionAnalysis.sentiment}`}>
                        {report.emotionAnalysis.sentiment}
                      </span>
                    </div>

                    <div className="confidence-score">
                      <span className="confidence-label">Confidence:</span>
                      <span className="confidence-value">
                        {(report.emotionAnalysis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="emotional-indicators">
                    <h4>Emotional Indicators:</h4>
                    <div className="indicators-list">
                      {report.emotionAnalysis.emotionalIndicators.map((indicator, idx) => (
                        <span key={idx} className="indicator-tag">{indicator}</span>
                      ))}
                    </div>
                  </div>

                  <div className="potential-triggers">
                    <h4>Potential Triggers:</h4>
                    <div className="triggers-list">
                      {report.emotionAnalysis.potentialTriggers.map((trigger, idx) => (
                        <span key={idx} className="trigger-tag">{trigger}</span>
                      ))}
                    </div>
                  </div>

                  <div className="analysis-summary">
                    <h4>Analysis Summary:</h4>
                    <p>{report.emotionAnalysis.analysis}</p>
                  </div>

                  <div className="report-metadata">
                    <span>Words: {report.metadata.wordCount}</span>
                    <span>Characters: {report.metadata.characterCount}</span>
                    <span>Processed: {new Date(report.metadata.processingTime).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionReports; 