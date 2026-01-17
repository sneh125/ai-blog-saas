'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { isAdmin, canGenerateBlog, PlanType } from '@/lib/admin';
import { PLANS } from '@/lib/stripe';
import { countWords } from '@/lib/utils';
import BlogCard from '@/components/BlogCard';
import Analytics from '@/components/Analytics';
import { 
  PlusIcon, 
  SparklesIcon, 
  DocumentTextIcon, 
  CreditCardIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Blog {
  id: string;
  keyword: string;
  content: string;
  wordCount: number;
  createdAt: Date;
}

interface UserData {
  email: string;
  plan: PlanType;
  blogCredits: number;
  createdAt: Date;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<{ content: string; keyword: string } | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isPostingToWP, setIsPostingToWP] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Set demo user data with admin check
    const userPlan: PlanType = isAdmin(user.email) ? 'UNLIMITED' : 'FREE';
    setUserData({
      email: user.email || '',
      plan: userPlan,
      blogCredits: isAdmin(user.email) ? -1 : 3,
      createdAt: new Date(),
    });

    // Load blogs from localStorage
    const savedBlogs = localStorage.getItem(`blogs_${user.uid}`);
    if (savedBlogs) {
      try {
        const parsedBlogs = JSON.parse(savedBlogs).map((blog: any) => ({
          ...blog,
          createdAt: new Date(blog.createdAt)
        }));
        setBlogs(parsedBlogs);
        console.log('Loaded blogs from localStorage:', parsedBlogs);
      } catch (error) {
        console.error('Error parsing saved blogs:', error);
      }
    }

  }, [user, loading, router]);

  const handleGenerateBlog = async () => {
    console.log('handleGenerateBlog called', { user: user?.uid, keyword });
    
    if (!user || !keyword.trim()) {
      console.log('Missing user or keyword');
      return;
    }

    if (!userData) return;

    if (!canGenerateBlog(userData.plan, userData.blogCredits)) {
      alert('You have no credits remaining. Please upgrade your plan.');
      return;
    }

    setIsGenerating(true);
    console.log('Starting blog generation...');

    try {
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          userId: user.uid,
        }),
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (data.success) {
        setKeyword('');
        
        // Add the new blog to local state
        const newBlog = {
          id: data.blog.id,
          keyword: data.blog.keyword,
          content: data.blog.content,
          wordCount: data.blog.wordCount,
          createdAt: new Date(data.blog.createdAt),
        };
        
        console.log('Adding new blog to state:', newBlog);
        const updatedBlogs = [newBlog, ...blogs];
        setBlogs(updatedBlogs);
        
        // Save to localStorage
        localStorage.setItem(`blogs_${user.uid}`, JSON.stringify(updatedBlogs));
        console.log('Saved blogs to localStorage');
        
        // Update user credits (only if not unlimited)
        if (userData.plan !== 'UNLIMITED') {
          setUserData({
            ...userData,
            blogCredits: Math.max(0, userData.blogCredits - 1),
          });
        }
        
        console.log('Blog generation completed successfully');
        alert('✅ Blog generated successfully!');
      } else {
        console.error('Blog generation failed:', data.error);
        alert(data.error || 'Failed to generate blog');
      }
    } catch (error) {
      console.error('Error generating blog:', error);
      alert('Failed to generate blog. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      const updatedBlogs = blogs.filter(blog => blog.id !== blogId);
      setBlogs(updatedBlogs);
      
      // Update localStorage
      if (user) {
        localStorage.setItem(`blogs_${user.uid}`, JSON.stringify(updatedBlogs));
        console.log('Updated blogs in localStorage after deletion');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const handleViewBlog = (content: string, keyword: string) => {
    setSelectedBlog({ content, keyword });
  };

  const handlePostToWordPress = async (blog: Blog) => {
    setIsPostingToWP(true);
    
    try {
      const response = await fetch('/api/wordpress/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: blog.keyword,
          content: blog.content,
          userId: user?.uid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Blog successfully published to WordPress!\nPost URL: ${data.postUrl}`);
      } else {
        alert(`❌ Failed to publish to WordPress: ${data.error}`);
      }
    } catch (error) {
      console.error('Error posting to WordPress:', error);
      alert('❌ Failed to publish to WordPress. Please try again.');
    } finally {
      setIsPostingToWP(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  const currentPlan = PLANS[userData.plan];
  const totalWords = blogs.reduce((total, blog) => total + (blog.wordCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            Welcome back, {user.email?.split('@')[0]}!
            {isAdmin(user.email) && (
              <SparklesIcon className="h-8 w-8 text-yellow-500 ml-2" title="Admin" />
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Generate SEO-optimized blog posts with AI
          </p>
        </div>
        
        {isAdmin(user.email) && (
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              👑 Admin Panel
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
          </div>
        )}
        
        {userData.plan !== 'UNLIMITED' && (
          <button
            onClick={() => router.push('/pricing')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Upgrade Plan
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Plan</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{currentPlan.name}</p>
                {userData.plan === 'UNLIMITED' && (
                  <SparklesIcon className="h-5 w-5 text-yellow-500 ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credits Left</p>
              <p className="text-2xl font-bold text-gray-900">
                {userData.blogCredits === -1 ? '∞' : userData.blogCredits}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Blogs</p>
              <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Words</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalWords.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="mb-8">
          <Analytics
            blogCount={blogs.length}
            totalWords={totalWords}
            planDistribution={{
              FREE: userData.plan === 'FREE' ? 1 : 0,
              PRO: userData.plan === 'PRO' ? 1 : 0,
              UNLIMITED: userData.plan === 'UNLIMITED' ? 1 : 0,
            }}
            weeklyData={[2, 5, 3, 8, 4, 6, 7]} // Mock data - replace with real data
          />
        </div>
      )}

      {/* Blog Generator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generate New Blog Post
          </h2>
          <p className="text-gray-600">
            Enter any topic or keyword to generate a professional, SEO-optimized blog post
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter your keyword or topic... (e.g., 'digital marketing strategies')"
                className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateBlog()}
              />
            </div>
            <button
              onClick={handleGenerateBlog}
              disabled={isGenerating || !keyword.trim() || !canGenerateBlog(userData.plan, userData.blogCredits)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Generate Blog
                </>
              )}
            </button>
          </div>

          {!canGenerateBlog(userData.plan, userData.blogCredits) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">No credits remaining</p>
                <p className="text-yellow-700 text-sm mt-1">
                  You've used all your credits for this month.{' '}
                  <button
                    onClick={() => router.push('/pricing')}
                    className="font-medium text-yellow-900 underline hover:text-yellow-800"
                  >
                    Upgrade your plan
                  </button>{' '}
                  to generate more blogs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blog List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Blog Posts ({blogs.length})
          </h2>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No blog posts yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Generate your first AI-powered blog post by entering a keyword above. 
              Our AI will create a complete, SEO-optimized article for you.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                keyword={blog.keyword}
                content={blog.content}
                createdAt={blog.createdAt}
                onDelete={handleDeleteBlog}
                onView={handleViewBlog}
                onPostToWordPress={handlePostToWordPress}
              />
            ))}
          </div>
        )}
      </div>

      {/* Blog Viewer Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedBlog.keyword}
              </h3>
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none">
                {selectedBlog.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}