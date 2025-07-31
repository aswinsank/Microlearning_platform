import React, { useState } from "react";
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
      setError("Failed to fetch lessons. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    const match = url.match(/^.*(?:youtu.be\/|v=)([^#&?]*).*/);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const navigate = useNavigate();

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
        
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading lessons...</p>}
      {error && <p className="error">{error}</p>}

      <div className="lesson-list">
        {Array.isArray(lessons) && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <div key={lesson._id} className="lesson-card">
              <h3>{lesson.title}</h3>
              <p><strong>Category:</strong> {lesson.category}</p>
              <p><strong>Format:</strong> {lesson.format}</p>
              <p><strong>Tutor ID:</strong> {lesson.tutor_id}</p> {/* Added for debugging */}

              {lesson.format === "video" && (
                lesson.video_type === "youtube" ? (
                  <iframe
                    width="100%"
                    height="315"
                    src={getYoutubeEmbedUrl(lesson.content_url)}
                    title="YouTube Preview"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video controls width="100%">
                    <source
                      src={`http://localhost:8000${lesson.content_url}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                )
              )}

              {lesson.format === "quiz" && Array.isArray(lesson.quiz_data) && (
                <div className="quiz-preview">
                  {lesson.quiz_data.map((q, index) => (
                    <div key={index} className="quiz-question">
                      <p><strong>Q{index + 1}:</strong> {q.question}</p>
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
                  download
                >
                  📄 Download DOCX
                </a>
              )}
            </div>
          ))
        ) : (
          !loading && <p>No lessons found. Try different filters.</p>
        )}
      </div>
    </div>
  );
}

export default StudentPage;
