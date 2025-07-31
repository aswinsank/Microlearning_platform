import React, { useState } from 'react';
import { Search, Filter, Eye, Edit3, Trash2, Plus, BookOpen, Video, FileText, HelpCircle, Users, TrendingUp, Calendar, Music, UploadCloud, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './TutorDashboard.css'; 
const TutorDashboard = ({ onLogout }) => {
  const navigate = useNavigate(); // Initialize navigate

  // Sample data for uploaded content
  const [contentList, setContentList] = useState([
    {
      id: 1,
      title: "Introduction to React Hooks",
      type: "video",
      category: "Programming",
      duration: "12 min",
      views: 245,
      completions: 180,
      rating: 4.6,
      status: "published",
      uploadDate: "2025-07-25",
      thumbnail: "https://via.placeholder.com/80x60/4f46e5/ffffff?text=Video"
    },
    {
      id: 2,
      title: "JavaScript ES6 Features Quiz",
      type: "quiz",
      category: "Programming",
      duration: "8 min",
      views: 189,
      completions: 145,
      rating: 4.4,
      status: "published",
      uploadDate: "2025-07-23",
      thumbnail: "https://via.placeholder.com/80x60/059669/ffffff?text=Quiz"
    },
    {
      id: 3,
      title: "UI Design Principles",
      type: "text",
      category: "Design",
      duration: "5 min",
      views: 167,
      completions: 134,
      rating: 4.8,
      status: "published",
      uploadDate: "2025-07-20",
      thumbnail: "https://via.placeholder.com/80x60/dc2626/ffffff?text=Text"
    },
    {
      id: 4,
      title: "Advanced CSS Animations",
      type: "video",
      category: "Design",
      duration: "15 min",
      views: 98,
      completions: 67,
      rating: 4.3,
      status: "draft",
      uploadDate: "2025-07-28",
      thumbnail: "https://via.placeholder.com/80x60/7c3aed/ffffff?text=Video"
    },
    {
      id: 5,
      title: "Communication Skills Assessment",
      type: "quiz",
      category: "Soft Skills",
      duration: "10 min",
      views: 234,
      completions: 201,
      rating: 4.7,
      status: "published",
      uploadDate: "2025-07-18",
      thumbnail: "https://via.placeholder.com/80x60/ea580c/ffffff?text=Quiz"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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
      case 'video': return <Video className="w-4 h-4 text-blue-600" />;
      case 'text': return <FileText className="w-4 h-4 text-green-600" />;
      case 'audio': return <Music className="w-4 h-4 text-purple-600" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-orange-600" />;
      default: return <BookOpen className="w-4 h-4 text-gray-600" />;
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
  const totalViews = contentList.reduce((sum, item) => sum + item.views, 0);
  const totalCompletions = contentList.reduce((sum, item) => sum + item.completions, 0);
  const avgRating = contentList.length > 0 ? (contentList.reduce((sum, item) => sum + item.rating, 0) / contentList.length).toFixed(1) : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Tutor Dashboard</h1>
              <p className="text-gray-600">Manage your content and track performance</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                onClick={() => navigate('/upload')} // Updated onClick handler
              >
                <Plus className="w-4 h-4" />
                Upload Content
              </button>
              <button 
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completions</p>
                <p className="text-3xl font-bold text-gray-900">{totalCompletions.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-3xl font-bold text-gray-900">{avgRating}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Content Management */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Content</h2>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search content..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
                
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                  <option value="audio">Audio</option>
                  <option value="quiz">Quiz</option>
                </select>
                
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="divide-y divide-gray-200">
            {filteredContent.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                <p className="text-gray-500">Try adjusting your search or filters, or upload your first content.</p>
              </div>
            ) : (
              filteredContent.map((content) => (
                <div key={content.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={content.thumbnail}
                      alt={content.title}
                      className="w-20 h-15 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(content.type)}
                        <h3 className="text-lg font-medium text-gray-900 truncate">{content.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(content.status)}`}>
                          {content.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">{content.category}</span>
                        <span>{content.duration}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {content.uploadDate}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {content.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {content.completions} completed
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⭐</span>
                          {content.rating}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;