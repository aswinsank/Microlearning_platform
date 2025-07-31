// UploadPage.jsx
import React, { useState } from "react";
import axios from "axios";
//import "./App.css"; // You'll need to create this CSS file

const UploadPage = () => {
  const [activeTab, setActiveTab] = useState("video"); // Default to video

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>📚 Upload Learning Content</h1>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === "video" ? "active" : ""}`}
            onClick={() => setActiveTab("video")}
          >
            🎥 Video Lesson
          </button>
          <button 
            className={`tab-button ${activeTab === "text" ? "active" : ""}`}
            onClick={() => setActiveTab("text")}
          >
            📝 Text Lesson
          </button>
          <button 
            className={`tab-button ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            🧠 Quiz
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "video" && <VideoUpload />}
          {activeTab === "text" && <TextUpload />}
          {activeTab === "quiz" && <QuizUpload />}
        </div>
      </div>
    </div>
  );
};

// Video Upload Component
const VideoUpload = () => {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [category, setCategory] = useState("");
  const [videoType, setVideoType] = useState("local");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [tutorId, setTutorId] = useState("");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const getYoutubeVideoId = (url) => {
    const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (videoType === "local" && !videoFile) {
      return setMessage("Please select a video file to upload.");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", about);
    formData.append("category", category);
    formData.append("video_type", videoType);
    formData.append("tutor_id", tutorId);

    if (videoType === "local") {
      formData.append("video_file", videoFile);
    } else {
      formData.append("youtube_url", youtubeUrl);
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/lessons/upload_video",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("✅ Video uploaded successfully!");
      const lesson = res.data.lesson;

      if (lesson.video_type === "local") {
        setPreviewUrl(`http://localhost:8000${lesson.content_url}`);
      } else {
        const videoId = getYoutubeVideoId(lesson.content_url);
        if (videoId) {
          setPreviewUrl(`https://www.youtube.com/embed/${videoId}`);
        } else {
          setMessage("❌ Upload failed: Invalid YouTube URL provided by the server.");
          setPreviewUrl(null);
        }
      }
    } catch (err) {
      setMessage("❌ Upload failed: " + (err?.response?.data?.detail || err.message));
      setPreviewUrl(null);
    }
  };

  return (
    <div className="upload-form">
      <h2>📤 Upload Video Lesson</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Lesson Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
          />
        </div>

        <div className="form-group">
          <label>About</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Brief description of the lesson"
            required
          />
        </div>

        <div className="form-group">
          <label>Tutor ID</label>
          <input
            type="text"
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
            placeholder="Enter Tutor ID"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Programming, Math, Science"
            required
          />
        </div>

        <div className="form-group">
          <label>Video Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="local"
                checked={videoType === "local"}
                onChange={() => setVideoType("local")}
              />
              Local Upload
            </label>
            <label>
              <input
                type="radio"
                value="youtube"
                checked={videoType === "youtube"}
                onChange={() => setVideoType("youtube")}
              />
              YouTube Link
            </label>
          </div>
        </div>

        {videoType === "local" && (
          <div className="form-group">
            <label>Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </div>
        )}

        {videoType === "youtube" && (
          <div className="form-group">
            <label>YouTube URL</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=your_video_id"
              required
            />
          </div>
        )}

        <button type="submit" className="submit-button">Upload Video</button>
      </form>

      {message && <div className="message">{message}</div>}

      {previewUrl && (
        <div className="video-preview">
          {previewUrl.includes("youtube.com/embed/") ? (
            <iframe
              width="100%"
              height="315"
              src={previewUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              controls
              width="100%"
              src={previewUrl}
              onError={() => alert("⚠️ Failed to load video.")}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Text Upload Component
const TextUpload = () => {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [category, setCategory] = useState("");
  const [contentType, setContentType] = useState("plain");
  const [textContent, setTextContent] = useState("");
  const [textFile, setTextFile] = useState(null);
  const [tutorId, setTutorId] = useState("");
  const [message, setMessage] = useState("");
  const [previewContent, setPreviewContent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (contentType === "file" && !textFile) {
      return setMessage("Please select a text file to upload.");
    }

    if (contentType === "plain" && !textContent.trim()) {
      return setMessage("Please enter some text content.");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", about);
    formData.append("category", category);
    formData.append("content_type", contentType);
    formData.append("tutor_id", tutorId);

    if (contentType === "file") {
      formData.append("text_file", textFile);
    } else {
      formData.append("text_content", textContent);
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/lessons/upload_text",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("✅ Text lesson uploaded successfully!");
      const lesson = res.data.lesson;
      
      if (lesson.content_type === "plain") {
        setPreviewContent(lesson.text_content);
      } else {
        setPreviewContent(lesson.text_content || "File uploaded successfully. Content will be processed.");
      }
    } catch (err) {
      setMessage("❌ Upload failed: " + (err?.response?.data?.detail || err.message));
      setPreviewContent(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setTextFile(file);
    
    if (file && file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        if (content.length > 1000) {
          setPreviewContent(content.substring(0, 1000) + "... (truncated for preview)");
        } else {
          setPreviewContent(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="upload-form">
      <h2>📝 Upload Text Lesson</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Lesson Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
          />
        </div>

        <div className="form-group">
          <label>About</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Brief description of the lesson"
            required
          />
        </div>

        <div className="form-group">
          <label>Tutor ID</label>
          <input
            type="text"
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
            placeholder="Enter Tutor ID"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Programming, Math, Science"
            required
          />
        </div>

        <div className="form-group">
          <label>Content Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="plain"
                checked={contentType === "plain"}
                onChange={() => setContentType("plain")}
              />
              Text Input
            </label>
            <label>
              <input
                type="radio"
                value="file"
                checked={contentType === "file"}
                onChange={() => setContentType("file")}
              />
              File Upload
            </label>
          </div>
        </div>

        {contentType === "plain" && (
          <div className="form-group">
            <label>Text Content</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter your lesson content here..."
              className="content-textarea"
              required
            />
          </div>
        )}

        {contentType === "file" && (
          <div className="form-group">
            <label>Text File</label>
            <input
              type="file"
              accept=".txt,.md,.doc,.docx,.pdf"
              onChange={handleFileChange}
              required
            />
            <small className="file-help">
              Supported formats: .txt, .md, .doc, .docx, .pdf
            </small>
          </div>
        )}

        <button type="submit" className="submit-button">Upload Text Lesson</button>
      </form>

      {message && <div className="message">{message}</div>}

      {previewContent && (
        <div className="text-preview">
          <h3>📄 Content Preview</h3>
          <div className="preview-content">
            <pre>{previewContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Quiz Upload Component
const QuizUpload = () => {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [category, setCategory] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correct_answer: ""
    }
  ]);
  const [message, setMessage] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: ""
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length < 6) {
      newQuestions[questionIndex].options.push("");
      setQuestions(newQuestions);
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length > 2) {
      if (newQuestions[questionIndex].correct_answer === newQuestions[questionIndex].options[optionIndex]) {
        newQuestions[questionIndex].correct_answer = "";
      }
      newQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const validateQuiz = () => {
    if (!title.trim()) return "Please enter a quiz title.";
    if (!about.trim()) return "Please enter quiz description.";
    if (!category.trim()) return "Please enter a category.";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        return `Question ${i + 1}: Please enter the question text.`;
      }
      
      const validOptions = q.options.filter(opt => opt.trim() !== "");
      if (validOptions.length < 2) {
        return `Question ${i + 1}: Please provide at least 2 options.`;
      }
      
      if (!q.correct_answer || !q.options.includes(q.correct_answer)) {
        return `Question ${i + 1}: Please select a valid correct answer.`;
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateQuiz();
    if (validationError) {
      setMessage(`❌ ${validationError}`);
      return;
    }

    const cleanedQuestions = questions.map(q => ({
      ...q,
      options: q.options.filter(opt => opt.trim() !== "")
    }));

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", about);
    formData.append("category", category);
    formData.append("tutor_id", tutorId);
    formData.append("quiz_data", JSON.stringify(cleanedQuestions));

    try {
      const res = await axios.post(
        "http://localhost:8000/api/lessons/upload_quiz",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      setMessage("✅ Quiz uploaded successfully!");
      console.log(res.data);
    } catch (err) {
      setMessage("❌ Upload failed: " + (err?.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="upload-form">
      <h2>🧠 Create a New Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Quiz Title</label>
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>About</label>
          <textarea
            placeholder="About this quiz..."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Tutor ID</label>
          <input
            type="text"
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
            placeholder="Enter Tutor ID"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            placeholder="Category (e.g., Programming, Math, Science)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <h3>Questions</h3>
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="question-card">
            <div className="question-header">
              <h4>Question {qIndex + 1}</h4>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="remove-question-btn"
                >
                  Remove Question
                </button>
              )}
            </div>

            <textarea
              placeholder="Enter your question"
              value={question.question}
              onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
              required
            />

            <h5>Options</h5>
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="option-row">
                <input
                  type="text"
                  placeholder={`Option ${oIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                />
                {question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(qIndex, oIndex)}
                    className="remove-option-btn"
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
            
            {question.options.length < 6 && (
              <button
                type="button"
                onClick={() => addOption(qIndex)}
                className="add-option-btn"
              >
                + Add Option
              </button>
            )}

            <div className="correct-answer">
              <label>Correct Answer: </label>
              <select
                value={question.correct_answer}
                onChange={(e) => updateQuestion(qIndex, "correct_answer", e.target.value)}
                required
              >
                <option value="">Select correct answer</option>
                {question.options
                  .filter(opt => opt.trim() !== "")
                  .map((option, oIndex) => (
                    <option key={oIndex} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="add-question-btn"
        >
          + Add Question
        </button>

        <button type="submit" className="submit-button">Create Quiz</button>
      </form>
      
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default UploadPage;