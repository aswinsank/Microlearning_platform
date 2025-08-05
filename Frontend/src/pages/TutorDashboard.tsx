import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import UploadModal from '../components/UploadModal';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Video, FileText, Award, Eye, Users, TrendingUp, Calendar, Edit, Trash2 } from 'lucide-react';

interface Lesson {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  status: string;
  duration?: string;
  uploadDate: string;
  views: number;
  completions: number;
  rating: number;
  thumbnail?: string;
}

function TutorDashboard() {
  const { user, token } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'analytics'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalViews: 0,
    totalCompletions: 0,
    averageRating: 0,
  });

  useEffect(() => {
    if (user) {
      fetchLessons();
    }
  }, [user]);

  const fetchLessons = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/lessons/by_tutor/${user?.username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
        calculateStats(data.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (lessonsData: Lesson[]) => {
    const totalLessons = lessonsData.length;
    const totalViews = lessonsData.reduce((sum, lesson) => sum + (lesson.views || 0), 0);
    const totalCompletions = lessonsData.reduce((sum, lesson) => sum + (lesson.completions || 0), 0);
    const averageRating = lessonsData.length > 0 
      ? lessonsData.reduce((sum, lesson) => sum + (lesson.rating || 0), 0) / lessonsData.length 
      : 0;

    setStats({
      totalLessons,
      totalViews,
      totalCompletions,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  };

  const handleUploadSuccess = () => {
    fetchLessons();
    setIsUploadModalOpen(false);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'quiz':
        return <Award className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name} 👨‍🏫
            </h1>
            <p className="text-gray-600">
              Manage your content and track your teaching impact
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Upload Content</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLessons}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCompletions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'content'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Content
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Content</h3>
                {lessons.slice(0, 5).map((lesson) => (
                  <div key={lesson._id} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getContentIcon(lesson.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                      <p className="text-sm text-gray-600">{lesson.category}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{lesson.views} views</div>
                      <div>{new Date(lesson.uploadDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <div 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 cursor-pointer hover:shadow-md transition-all"
              >
                <Video className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Upload Video</h3>
                <p className="text-sm text-gray-600">Create engaging video lessons for your students</p>
              </div>
              
              <div 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 cursor-pointer hover:shadow-md transition-all"
              >
                <Award className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Create Quiz</h3>
                <p className="text-sm text-gray-600">Design interactive quizzes to test knowledge</p>
              </div>
              
              <div 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 cursor-pointer hover:shadow-md transition-all"
              >
                <FileText className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Add Text Content</h3>
                <p className="text-sm text-gray-600">Upload documents and reading materials</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">All Content ({lessons.length})</h3>
              </div>
              
              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                  <p className="text-gray-600 mb-4">Start by uploading your first lesson</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Content
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Content</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Views</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.map((lesson) => (
                        <tr key={lesson._id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getContentIcon(lesson.type)}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                <p className="text-sm text-gray-600 truncate max-w-xs">
                                  {lesson.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="capitalize text-sm text-gray-600">{lesson.type}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{lesson.category}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lesson.status)}`}>
                              {lesson.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">{lesson.views}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">{lesson.rating}/5</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance</h3>
              <div className="space-y-4">
                {lessons.slice(0, 5).map((lesson) => (
                  <div key={lesson._id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">{lesson.title}</h4>
                      <p className="text-sm text-gray-600">{lesson.views} views • {lesson.completions} completions</p>
                    </div>
                    <div className="ml-4">
                      <span className="text-sm font-medium text-gray-900">{lesson.rating}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Categories</h3>
              <div className="space-y-3">
                {Array.from(new Set(lessons.map(l => l.category))).map((category) => {
                  const categoryLessons = lessons.filter(l => l.category === category);
                  const totalViews = categoryLessons.reduce((sum, l) => sum + l.views, 0);
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-gray-900">{category}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{categoryLessons.length} lessons</div>
                        <div className="text-xs text-gray-600">{totalViews} views</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default TutorDashboard;