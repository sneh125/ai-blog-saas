'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DemoPage() {
  const [keyword, setKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState('');

  const handleDemo = () => {
    if (!keyword.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const demoBlog = `# ${keyword}: Complete Guide for 2024

## Introduction

${keyword} has become increasingly important in today's digital landscape. This comprehensive guide will help you understand everything you need to know about ${keyword} and how to implement it effectively.

## What is ${keyword}?

${keyword} refers to the practice of optimizing and utilizing specific strategies to achieve better results. Understanding ${keyword} is crucial for anyone looking to improve their performance in this area.

## Key Benefits of ${keyword}

- **Improved Performance**: ${keyword} can significantly enhance your overall performance
- **Better Results**: Implementing ${keyword} strategies leads to measurable improvements  
- **Cost Effective**: ${keyword} provides excellent return on investment
- **Scalable Solution**: ${keyword} can grow with your needs

## Best Practices for ${keyword}

### 1. Start with Research
Before implementing ${keyword}, conduct thorough research to understand your specific requirements and goals.

### 2. Create a Strategy  
Develop a comprehensive strategy that aligns with your objectives and incorporates ${keyword} best practices.

### 3. Monitor and Optimize
Continuously monitor your ${keyword} performance and make adjustments as needed.

## Conclusion

${keyword} is a powerful approach that can deliver significant results when implemented correctly. By following the guidelines and best practices outlined in this guide, you'll be well-equipped to succeed with ${keyword}.

---

*This demo blog post was generated using AI technology. Sign up to generate unlimited SEO-optimized content!*`;

      setGeneratedBlog(demoBlog);
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">BlogAI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Demo Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Try BlogAI Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            See how our AI generates professional, SEO-optimized blog posts in seconds
          </p>
        </div>

        {/* Demo Generator */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Generate Your Demo Blog
            </h2>
            <p className="text-gray-600">
              Enter any topic and watch our AI create a complete blog post
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Enter your keyword... (e.g., 'digital marketing')"
                className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDemo()}
              />
              <button
                onClick={handleDemo}
                disabled={isGenerating || !keyword.trim()}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all"
              >
                {isGenerating ? 'Generating...' : 'Generate Demo'}
              </button>
            </div>

            {isGenerating && (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-lg text-gray-600">AI is generating your blog post...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Blog */}
        {generatedBlog && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Generated Blog Post</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedBlog)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Copy
                </button>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up to Generate More
                </Link>
              </div>
            </div>
            
            <div className="prose max-w-none">
              {generatedBlog.split('\n').map((line, index) => (
                <div key={index} className="mb-2">
                  {line.startsWith('# ') ? (
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{line.substring(2)}</h1>
                  ) : line.startsWith('## ') ? (
                    <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">{line.substring(3)}</h2>
                  ) : line.startsWith('### ') ? (
                    <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">{line.substring(4)}</h3>
                  ) : line.startsWith('- ') ? (
                    <li className="text-gray-600 mb-2">{line.substring(2)}</li>
                  ) : line.trim() === '' ? (
                    <br />
                  ) : (
                    <p className="text-gray-600 leading-relaxed">{line}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Generate Unlimited Blogs?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of content creators using BlogAI to scale their content marketing
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}