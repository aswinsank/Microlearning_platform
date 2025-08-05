import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import Header from '../components/Header';
import { ArrowLeft, Play, FileText, Award, Clock, User } from 'lucide-react';

interface ContentData {
  _id: string;
  title: string;
  description: string;
  format: string;
  category: string;
  tutor_id: string;
  created_at: string;
  content_url?: string;
  video_type?: string;
  text_content?: string;
  quiz_data?: QuizQuestion[];
  total_questions?: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

function ContentViewer() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { updateProgress } = useGame();
  
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quiz specific state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/lessons/${contentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.lesson);
      } else {
        setError('Content not found');
      }
    } catch (err) {
      setError('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (content?.quiz_data && currentQuestionIndex < content.quiz_data.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!content?.quiz_data) return;

    let correctCount = 0;
    content.quiz_data.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);
    
    // Update progress
    updateProgress(content._id, content.format);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
  };

  const handleContentComplete = () => {
    if (content) {
      updateProgress(content._id, content.format);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The requested content could not be loaded.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderVideoContent = () => {
    if (content.video_type === 'youtube' && content.content_url) {
      const videoId = content.content_url.includes('watch?v=') 
        ? content.content_url.split('watch?v=')[1].split('&')[0]
        : content.content_url.split('youtu.be/')[1]?.split('?')[0];
      
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={content.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            onLoad={handleContentComplete}
          />
        </div>
      );
    } else if (content.content_url) {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={`http://localhost:8000${content.content_url}`}
            controls
            className="w-full h-full"
            onEnded={handleContentComplete}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    return (
      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Video content not available</p>
      </div>
    );
  };

  const renderTextContent = () => {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {content.text_content || 'Text content not available'}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleContentComplete}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark as Complete
          </button>
        </div>
      </div>
    );
  };

  const renderQuizContent = () => {
    if (!content.quiz_data || content.quiz_data.length === 0) {
      return (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">Quiz content not available</p>
        </div>
      );
    }

    if (showResults) {
      const percentage = Math.round((score / content.quiz_data.length) * 100);
      
      return (
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-3xl font-bold ${
                  percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {percentage}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
              <p className="text-gray-600">
                You scored {score} out of {content.quiz_data.length} questions correctly
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {content.quiz_data.map((question, index) => (
                <div key={index} className="text-left p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
                  <div className="space-y-1">
                    {question.options.map((option) => (
                      <div
                        key={option}
                        className={`p-2 rounded text-sm ${
                          option === question.correct_answer
                            ? 'bg-green-100 text-green-800 font-medium'
                            : selectedAnswers[index] === option
                            ? 'bg-red-100 text-red-800'
                            : 'text-gray-600'
                        }`}
                      >
                        {option}
                        {option === question.correct_answer && ' ✓'}
                        {selectedAnswers[index] === option && option !== question.correct_answer && ' ✗'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentQuestion = content.quiz_data[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / content.quiz_data.length) * 100;

    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {content.quiz_data.length}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h3>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuizAnswer(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestionIndex] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={nextQuestion}
            disabled={!selectedAnswers[currentQuestionIndex]}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestionIndex === content.quiz_data.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    );
  };

  const getContentIcon = (format: string) => {
    switch (format) {
      case 'video':
        return <Play className="h-6 w-6" />;
      case 'quiz':
        return <Award className="h-6 w-6" />;
      case 'text':
        return <FileText className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getContentColor = (format: string) => {
    switch (format) {
      case 'video':
        return 'text-blue-600 bg-blue-100';
      case 'quiz':
        return 'text-green-600 bg-green-100';
      case 'text':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Content Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${getContentColor(content.format)}`}>
              {getContentIcon(content.format)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h1>
              <p className="text-gray-600 mb-4">{content.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>By @{content.tutor_id}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(content.created_at).toLocaleDateString()}</span>
                </div>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {content.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="mb-8">
          {content.format === 'video' && renderVideoContent()}
          {content.format === 'text' && renderTextContent()}
          {content.format === 'quiz' && renderQuizContent()}
        </div>
      </div>
    </div>
  );
}

export default ContentViewer;