import React, { useState } from "react";
import axios from "axios";

const UploadLesson = () => {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [category, setCategory] = useState("");
  const [videoType, setVideoType] = useState("local");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [tutorId, setTutorId] = useState("tutor123"); // Replace with auth later
  const [message, setMessage] = useState("");

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
      console.log(res.data);
    } catch (err) {
      setMessage("❌ Upload failed: " + err?.response?.data?.detail || err.message);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      <h2>Upload a New Lesson</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Lesson Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        /><br />

        <textarea
          placeholder="About this lesson..."
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          required
        /><br />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        /><br />

        <label>
          <input
            type="radio"
            value="local"
            checked={videoType === "local"}
            onChange={() => setVideoType("local")}
          />
          Upload File
        </label>
        <label>
          <input
            type="radio"
            value="youtube"
            checked={videoType === "youtube"}
            onChange={() => setVideoType("youtube")}
          />
          YouTube Link
        </label><br />

        {videoType === "local" && (
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            required
          />
        )}

        {videoType === "youtube" && (
          <input
            type="url"
            placeholder="YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            required
          />
        )}
        <br />

        <button type="submit">Upload Lesson</button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
};

export default UploadLesson;
