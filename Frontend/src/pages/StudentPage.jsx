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
      setLessons(response.data.results || []); // ✅ FIXED HERE
    } catch (err) {
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
    onLogout();  // Triggers logout logic in App.jsx
  } else {
    navigate("/login"); // Fallback
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
                name={`question-${index}`} // Grouping by question index
                value={option}
              />
              {option}
            </label>
          </div>
        ))}
      </div>
    ))}
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
