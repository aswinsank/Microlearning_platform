import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentPage.css";
import { useNavigate } from "react-router-dom";

function StudentPage({ onLogout }) {
  const [tutorId, setTutorId] = useState("");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State for gamification and leaderboard
  const [userStats, setUserStats] = useState({ points: 0, rank: "N/A" });
  const [leaderboard, setLeaderboard] = useState([]);

  const navigate = useNavigate();

  // Fetch gamification and leaderboard data on component mount
  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("user");
        
        // Fetch user stats (points, rank)
        const statsResponse = await axios.get("http://localhost:8000/api/user/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserStats(statsResponse.data);

        // Fetch leaderboard data
        const leaderboardResponse = await axios.get("http://localhost:8000/api/leaderboard");
        setLeaderboard(leaderboardResponse.data);

      } catch (err) {
        console.error("Failed to fetch gamification data:", err);
        // Set default values on error
        setUserStats({ points: 0, rank: "N/A" });
        setLeaderboard([]);
      }
    };

    fetchGamificationData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setLessons([]);

    try {
      const response = await axios.get("http://localhost:8000/api/lessons", {
        params: {
          tutor_id: tutorId || undefined,
          category: category || undefined,
          format: format || undefined,
        },
      });
      setLessons(response.data.results || []);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      setError("Failed to fetch lessons. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="student-page">
      <div className="logout-wrapper">
        <button onClick={handleLogout} className="logout-button">
          🔒 Logout
        </button>
      </div>
      <h2>📚 Explore Lessons</h2>

      {/* --- Gamification & Leaderboard Section --- */}
      <div className="gamification-container">
        <div className="user-stats-card">
          <h3>🏆 My Stats & Ranking</h3>
          <p><strong>Points:</strong> {userStats.points}</p>
          <p><strong>Rank:</strong> {userStats.rank}</p>
        </div>
        <div className="leaderboard">
          <h3>🥇 Leaderboard</h3>
          {leaderboard.length > 0 ? (
            <ol>
              {leaderboard.map((user, index) => (
                <li key={user.id || index}>
                  <span className="rank">{index + 1}</span>
                  <span className="name">{user.username || 'Unknown User'}</span>
                  <span className="points">{user.points || 0} pts</span>
                </li>
              ))}
            </ol>
          ) : (
            <p>No leaderboard data available</p>
          )}
        </div>
      </div>
      {/* --- End Gamification & Leaderboard Section --- */}

      <div className="filters">
        <input
          type="text"
          placeholder="Tutor ID"
          value={tutorId}
          onChange={(e) => setTutorId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="">All Formats</option>
          <option value="video">Video</option>
          <option value="quiz">Quiz</option>
          <option value="text">Text</option>
        </select>
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>

      {loading && <p className="message">Loading lessons...</p>}
      {error && <p className="message error">{error}</p>}

      <div className="lesson-grid">
        {Array.isArray(lessons) && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <div key={lesson._id} className="lesson-card">
              <h3>{lesson.title}</h3>
              <p><strong>Category:</strong> {lesson.category}</p>
              <p className="meta"><strong>Format:</strong> {lesson.format}</p>

              {lesson.format === "video" && lesson.content_url && (
                <div className="video-container">
                  {getYoutubeEmbedUrl(lesson.content_url) ? (
                    <iframe
                      src={getYoutubeEmbedUrl(lesson.content_url)}
                      title={`Video: ${lesson.title}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <p>Invalid video URL</p>
                  )}
                </div>
              )}

              {lesson.format === "quiz" && Array.isArray(lesson.quiz_data) && lesson.quiz_data.length > 0 && (
                <div className="quiz-preview">
                  {lesson.quiz_data.map((q, index) => (
                    <div key={index} className="quiz-question">
                      <p><strong>Q{index + 1}:</strong> {q.question}</p>
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <ul>
                          {q.options.map((option, i) => (
                            <li key={i}>{option}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {lesson.format === "text" && lesson.content_url && (
                <a 
                  href={`http://localhost:8000${lesson.content_url}`} 
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Download Content
                </a>
              )}

              {/* Add lesson metadata */}
              {lesson.created_at && (
                <p className="lesson-date">
                  <small>Created: {new Date(lesson.created_at).toLocaleDateString()}</small>
                </p>
              )}
            </div>
          ))
        ) : (
          !loading && <p className="message">No lessons found. Try different filters.</p>
        )}
      </div>
    </div>
  );
}

export default StudentPage;