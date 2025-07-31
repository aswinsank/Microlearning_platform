import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Eye, Plus, BookOpen, Video, FileText, HelpCircle, Users, TrendingUp, Calendar, Music, UploadCloud, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TutorDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [contentList, setContentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [viewingContent, setViewingContent] = useState(null);

  // Fixed tutor IDs instead of fetching from API
  const tutorIds = ['tutor123', 'tutor234'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const defaultTutorId = user?._id || user?.id || 'tutor123';
    setSelectedTutorId(defaultTutorId);
  }, []);

  useEffect(() => {
    if (selectedTutorId) {
      console.log('Fetching lessons for tutor:', selectedTutorId);
      axios.get(`http://localhost:8000/api/lessons/by_tutor/${selectedTutorId}`)
        .then(res => {
          console.log('API Response:', res.data);
          setContentList(res.data.lessons || []);
        })
        .catch(error => {
          console.error('Error fetching lessons:', error);
          setContentList([]);
        });
    }
  }, [selectedTutorId]);

  // Filter content based on search and filters
  const filteredContent = contentList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Get content type icon
  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video className="w-5 h-5 text-blue-600" />;
      case 'text': return <FileText className="w-5 h-5 text-green-600" />;
      case 'audio': return <Music className="w-5 h-5 text-purple-600" />;
      case 'quiz': return <HelpCircle className="w-5 h-5 text-orange-600" />;
      default: return <BookOpen className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate total stats
  const totalViews = contentList.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalCompletions = contentList.reduce((sum, item) => sum + (item.completions || 0), 0);
  const avgRating = contentList.length > 0 ? (contentList.reduce((sum, item) => sum + (item.rating || 0), 0) / contentList.length).toFixed(1) : 'N/A';

  // Handle view content
  const handleViewContent = (content) => {
    setViewingContent(content);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-8 lg:px-12">
          <div className="flex justify-between items-center py-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
              <p className="text-gray-600">Manage your content and track performance</p>
            </div>
            <div className="flex items-center gap-6">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
                onClick={() => navigate('/upload')}
              >
                <Plus className="w-5 h-5" />
                Upload Content
              </button>
              <button 
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                value={selectedTutorId}
                onChange={e => setSelectedTutorId(e.target.value)}
                style={{ minWidth: 140 }}
              >
                {tutorIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-8 lg:px-12 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-3xl font-bold text-gray-900">{contentList.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Completions</p>
                <p className="text-3xl font-bold text-gray-900">{totalCompletions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-3xl font-bold text-gray-900">{avgRating}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Content</h2>
            
            {/* Search and Filters */}
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search content..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-40"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Science">Science</option>
                  <option value="Math">Math</option>
                  <option value="Social">Social</option>
                  <option value="Design">Design</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
                
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                  <option value="audio">Audio</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="divide-y divide-gray-200">
            {filteredContent.length === 0 ? (
              <div className="p-16 text-center">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">No content found</h3>
                <p className="text-gray-500">Try adjusting your search or filters, or upload your first content.</p>
              </div>
            ) : (
              filteredContent.map((content) => (
                <div key={content._id || content.id} className="p-8 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-8">
                    <img
                      src={content.thumbnail || '/api/placeholder/150/100'}
                      alt={content.title || 'Untitled'}
                      className="w-32 h-24 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA0MEw2MCA1MEw1MCA2MEw0MCA1MEw1MCA0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                    
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-center gap-4">
                        {getTypeIcon(content.type || content.format)}
                        <h3 className="text-xl font-semibold text-gray-900 truncate">{content.title || 'Untitled'}</h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(content.status || 'published')}`}>
                          {content.status || 'published'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-8 text-sm text-gray-600">
                        <span className="bg-gray-100 px-3 py-1 rounded-md font-medium">{content.category || 'Uncategorized'}</span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Duration:</span> {content.duration || 'N/A'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{content.uploadDate || content.created_at || 'Unknown'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-12 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">{content.views || 0}</span>
                          <span>views</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{content.completions || 0}</span>
                          <span>completed</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>⭐</span>
                          <span className="font-medium">{content.rating || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button 
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => handleViewContent(content)}
                        title="View Content"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* View Content Modal */}
        {viewingContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-5xl max-h-[90vh] overflow-y-auto w-full shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">{viewingContent.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-3 py-1 rounded-md font-medium">{viewingContent.category}</span>
                    <span className="font-medium">{viewingContent.type}</span>
                    <span>{viewingContent.duration}</span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(viewingContent.status)}`}>
                      {viewingContent.status}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingContent(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              
              <div className="space-y-8">
                {viewingContent.thumbnail && (
                  <div>
                    <img 
                      src={viewingContent.thumbnail} 
                      alt={viewingContent.title}
                      className="w-full max-w-md rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{viewingContent.description || 'No description available'}</p>
                </div>
                
                {/* Render content based on type */}
                {viewingContent.type === 'video' && viewingContent.video_type === 'youtube' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">YouTube Video</h3>
                    <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                      <iframe
                        src={viewingContent.content_url?.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                
                {viewingContent.type === 'video' && viewingContent.video_type === 'local' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Video</h3>
                    <video controls className="w-full max-w-2xl rounded-lg border border-gray-200">
                      <source src={`http://localhost:8000${viewingContent.content_url}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                
                {viewingContent.type === 'text' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Content</h3>
                    <div className="bg-gray-50 p-6 rounded-lg max-h-80 overflow-y-auto border border-gray-200">
                      <pre className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{viewingContent.text_content}</pre>
                    </div>
                  </div>
                )}
                
                {viewingContent.type === 'quiz' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Questions ({viewingContent.total_questions} questions)</h3>
                    <div className="space-y-6 max-h-80 overflow-y-auto">
                      {viewingContent.quiz_data?.map((question, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <p className="font-semibold text-gray-900 mb-4 text-lg">{index + 1}. {question.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options?.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg text-sm border ${
                                  option === question.correct_answer
                                    ? 'bg-green-100 text-green-800 font-semibold border-green-200'
                                    : 'bg-white text-gray-700 border-gray-200'
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center pt-8 border-t border-gray-200">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Views</p>
                    <p className="text-2xl font-bold text-gray-900">{viewingContent.views || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Completions</p>
                    <p className="text-2xl font-bold text-gray-900">{viewingContent.completions || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{viewingContent.rating || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboard;
