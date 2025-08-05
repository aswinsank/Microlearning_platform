import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Upload, Video, FileText, Award, Plus, Trash2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const { user, token } = useAuth();
  const [contentType, setContentType] = useState<'video' | 'quiz' | 'text'>('video');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // Common form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  // Video specific fields
  const [videoType, setVideoType] = useState<'local' | 'youtube'>('local');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Text specific fields
  const [textContentType, setTextContentType] = useState<'plain' | 'file'>('plain');
  const [textContent, setTextContent] = useState('');
  const [textFile, setTextFile] = useState<File | null>(null);

  // Quiz specific fields
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { question: '', options: ['', ''], correct_answer: '' }
  ]);

  const categories = ['Math', 'Programming', 'Science', 'History', 'Language', 'Art', 'Business', 'Other'];

  const resetForm = () => {
    setFormData({ title: '', description: '', category: '' });
    setVideoType('local');
    setVideoFile(null);
    setYoutubeUrl('');
    setTextContentType('plain');
    setTextContent('');
    setTextFile(null);
    setQuizQuestions([{ question: '', options: ['', ''], correct_answer: '' }]);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: '', options: ['', ''], correct_answer: '' }]);
  };

  const removeQuizQuestion = (index: number) => {
    if (quizQuestions.length > 1) {
      setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
    }
  };

  const updateQuizQuestion = (index: number, field: keyof QuizQuestion, value: string | string[]) => {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizQuestions(updated);
  };

  const addQuizOption = (questionIndex: number) => {
    const updated = [...quizQuestions];
    updated[questionIndex].options.push('');
    setQuizQuestions(updated);
  };

  const removeQuizOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...quizQuestions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      setQuizQuestions(updated);
    }
  };

  const updateQuizOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...quizQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setQuizQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);

    try {
      const baseData = new FormData();
      baseData.append('title', formData.title);
      baseData.append('description', formData.description);
      baseData.append('category', formData.category);
      baseData.append('tutor_id', user?.username || '');

      let endpoint = '';
      let uploadData = baseData;

      switch (contentType) {
        case 'video':
          endpoint = '/api/lessons/upload_video';
          uploadData.append('video_type', videoType);
          
          if (videoType === 'local' && videoFile) {
            uploadData.append('video_file', videoFile);
          } else if (videoType === 'youtube' && youtubeUrl) {
            uploadData.append('youtube_url', youtubeUrl);
          } else {
            throw new Error('Please provide video file or YouTube URL');
          }
          break;

        case 'quiz':
          endpoint = '/api/lessons/upload_quiz';
          
          // Validate quiz questions
          for (let i = 0; i < quizQuestions.length; i++) {
            const q = quizQuestions[i];
            if (!q.question.trim()) {
              throw new Error(`Question ${i + 1} is empty`);
            }
            if (q.options.some(opt => !opt.trim())) {
              throw new Error(`Question ${i + 1} has empty options`);
            }
            if (!q.correct_answer.trim()) {
              throw new Error(`Question ${i + 1} has no correct answer selected`);
            }
            if (!q.options.includes(q.correct_answer)) {
              throw new Error(`Question ${i + 1} correct answer doesn't match any option`);
            }
          }
          
          uploadData.append('quiz_data', JSON.stringify(quizQuestions));
          break;

        case 'text':
          endpoint = '/api/lessons/upload_text';
          uploadData.append('content_type', textContentType);
          
          if (textContentType === 'plain' && textContent) {
            uploadData.append('text_content', textContent);
          } else if (textContentType === 'file' && textFile) {
            uploadData.append('text_file', textFile);
          } else {
            throw new Error('Please provide text content or file');
          }
          break;
      }

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Upload Content</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Content Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setContentType('video')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  contentType === 'video'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Video className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium">Video</span>
              </button>
              
              <button
                type="button"
                onClick={() => setContentType('quiz')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  contentType === 'quiz'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Award className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <span className="text-sm font-medium">Quiz</span>
              </button>
              
              <button
                type="button"
                onClick={() => setContentType('text')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  contentType === 'text'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <span className="text-sm font-medium">Text</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content title"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your content"
              />
            </div>

            {/* Content Type Specific Fields */}
            {contentType === 'video' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Video Source</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="local"
                        checked={videoType === 'local'}
                        onChange={(e) => setVideoType(e.target.value as 'local' | 'youtube')}
                        className="mr-2"
                      />
                      Upload File
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="youtube"
                        checked={videoType === 'youtube'}
                        onChange={(e) => setVideoType(e.target.value as 'local' | 'youtube')}
                        className="mr-2"
                      />
                      YouTube URL
                    </label>
                  </div>
                </div>

                {videoType === 'local' && (
                  <div>
                    <label htmlFor="videoFile" className="block text-sm font-medium text-gray-700 mb-1">
                      Video File *
                    </label>
                    <input
                      type="file"
                      id="videoFile"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {videoType === 'youtube' && (
                  <div>
                    <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube URL *
                    </label>
                    <input
                      type="url"
                      id="youtubeUrl"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                )}
              </div>
            )}

            {contentType === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Text Source</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="plain"
                        checked={textContentType === 'plain'}
                        onChange={(e) => setTextContentType(e.target.value as 'plain' | 'file')}
                        className="mr-2"
                      />
                      Plain Text
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="file"
                        checked={textContentType === 'file'}
                        onChange={(e) => setTextContentType(e.target.value as 'plain' | 'file')}
                        className="mr-2"
                      />
                      Upload File
                    </label>
                  </div>
                </div>

                {textContentType === 'plain' && (
                  <div>
                    <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-1">
                      Text Content *
                    </label>
                    <textarea
                      id="textContent"
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      rows={8}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your text content here..."
                    />
                  </div>
                )}

                {textContentType === 'file' && (
                  <div>
                    <label htmlFor="textFile" className="block text-sm font-medium text-gray-700 mb-1">
                      Text File * (.txt, .md, .doc, .docx, .pdf)
                    </label>
                    <input
                      type="file"
                      id="textFile"
                      accept=".txt,.md,.doc,.docx,.pdf"
                      onChange={(e) => setTextFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {contentType === 'quiz' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Quiz Questions</label>
                  <button
                    type="button"
                    onClick={addQuizQuestion}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Question</span>
                  </button>
                </div>

                {quizQuestions.map((question, qIndex) => (
                  <div key={qIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                      {quizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuizQuestion(qIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your question"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => addQuizOption(qIndex)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeQuizOption(qIndex, oIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                      <select
                        value={question.correct_answer}
                        onChange={(e) => updateQuizQuestion(qIndex, 'correct_answer', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select correct answer</option>
                        {question.options.map((option, oIndex) => (
                          <option key={oIndex} value={option}>
                            {option || `Option ${oIndex + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{isUploading ? 'Uploading...' : 'Upload Content'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;