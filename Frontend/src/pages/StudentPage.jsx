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

  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});
  const [quizScores, setQuizScores] = useState({});

  const handleQuizOptionChange = (lessonId, questionIdx, option) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [lessonId]: {
        ...(prev[lessonId] || {}),
        [questionIdx]: option,
      },
    }));
  };

  const handleQuizSubmit = (lesson) => {
    const answers = quizAnswers[lesson._id] || {};
    let score = 0;
    lesson.quiz_data.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) score += 1;
    });
    setQuizScores((prev) => ({ ...prev, [lesson._id]: score }));
    setQuizSubmitted((prev) => ({ ...prev, [lesson._id]: true }));
  };
  
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setLessons([]);

    // Debug logging
    const params = {
      tutor_id: tutorId || undefined,
      category: category || undefined,
      format: format || undefined,
    };
    
    console.log("🔍 Search Parameters:", params);
    console.log("📝 Selected tutorId:", tutorId);
    console.log("📝 Selected category:", category);
    console.log("📝 Selected format:", format);

    try {
      const response = await axios.get("http://localhost:8000/api/lessons", {
        params: params,
      });
<<<<<<< HEAD
      setLessons(response.data.results || []);
    } catch (err) {
      console.error("Error fetching lessons:", err);
=======
      
      console.log("✅ API Response:", response.data);
      console.log("📊 Results count:", response.data.results?.length || 0);
      
      // Log unique tutor IDs in the response to verify what's in your database
      if (response.data.results && Array.isArray(response.data.results)) {
        const uniqueTutorIds = [...new Set(response.data.results.map(lesson => lesson.tutor_id))];
        console.log("🎯 Unique tutor IDs in database:", uniqueTutorIds);
      }
      
      setLessons(response.data.results || []);
    } catch (err) {
      console.error("❌ API Error:", err);
      console.error("❌ Error response:", err.response?.data);
>>>>>>> be0a17461c1e1d960c7b5bba6e532d89fe61073d
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

<<<<<<< HEAD
=======
  const navigate = useNavigate();

>>>>>>> be0a17461c1e1d960c7b5bba6e532d89fe61073d
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
      {/* --- End Gamification Section --- */}

      <div className="filters">
        <select
          value={tutorId}
          onChange={(e) => {
            console.log("🔄 Tutor ID changed to:", e.target.value);
            setTutorId(e.target.value);
          }}
        >
          <option value="">All Tutors</option>
          <option value="tutor123">tutor123</option>
          <option value="tutor234">tutor234</option>
        </select>
        
        <select
          value={category}
          onChange={(e) => {
            console.log("🔄 Category changed to:", e.target.value);
            setCategory(e.target.value);
          }}
        >
          <option value="">All Categories</option>
          <option value="Math">Math</option>
          <option value="social">Social</option>
          <option value="Science">Science</option>
          <option value="Programming">Programming</option>
          <option value="design">Design</option>
          <option value="soft skills">Soft Skills</option>
        </select>
        
        <select 
          value={format} 
          onChange={(e) => {
            console.log("🔄 Format changed to:", e.target.value);
            setFormat(e.target.value);
          }}
        >
          <option value="">All Formats</option>
          <option value="video">video</option>
          <option value="quiz">Quiz</option>
          <option value="text">Text</option>
        </select>
<<<<<<< HEAD
        <button onClick={handleSearch} className="search-button">Search</button>
=======
        
        <button onClick={handleSearch}>Search</button>
>>>>>>> be0a17461c1e1d960c7b5bba6e532d89fe61073d
      </div>

      {loading && <p className="message">Loading lessons...</p>}
      {error && <p className="message error">{error}</p>}

      <div className="lesson-grid">
        {Array.isArray(lessons) && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <div key={lesson._id} className="lesson-card">
              <h3>{lesson.title}</h3>
              <p><strong>Category:</strong> {lesson.category}</p>
<<<<<<< HEAD
              <p className="meta"><strong>Format:</strong> {lesson.format}</p>
=======
              <p><strong>Format:</strong> {lesson.format}</p>
              <p><strong>Tutor ID:</strong> {lesson.tutor_id}</p> {/* Added for debugging */}
>>>>>>> be0a17461c1e1d960c7b5bba6e532d89fe61073d

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

<<<<<<< HEAD
              {lesson.format === "quiz" && Array.isArray(lesson.quiz_data) && lesson.quiz_data.length > 0 && (
=======
              {lesson.format === "quiz" && Array.isArray(lesson.quiz_data) && (
>>>>>>> be0a17461c1e1d960c7b5bba6e532d89fe61073d
                <div className="quiz-preview">
                  {lesson.quiz_data.map((q, index) => (
                    <div key={index} className="quiz-question">
                      <p><strong>Q{index + 1}:</strong> {q.question}</p>
<<<<<<< HEAD
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
=======
                      {q.options.map((option, i) => (
                        <div key={i} className="quiz-option">
                          <label>
                            <input
                              type="radio"
                              name={`question-${lesson._id}-${index}`}
                              value={option}
                              disabled={quizSubmitted[lesson._id]}
                              checked={quizAnswers[lesson._id]?.[index] === option}
                              onChange={() => handleQuizOptionChange(lesson._id, index, option)}
                            />
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                  {!quizSubmitted[lesson._id] ? (
                    <button onClick={() => handleQuizSubmit(lesson)}>Submit Quiz</button>
                  ) : (
                    <div className="quiz-score">
                      Score: {quizScores[lesson._id]} / {lesson.quiz_data.length}
                    </div>
                  )}
                </div>
              )}

              {lesson.format === "text" && (
                <a
                  href={`http://localhost:8000${lesson.content_url}`}
>>>>>>> be0a17461c1e1d960c7b5bba6e532d89fe61073d
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