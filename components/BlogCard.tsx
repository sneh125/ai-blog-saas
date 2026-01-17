'use client';

import { useState } from 'react';
import { formatDate, countWords, truncateText } from '@/lib/utils';
import { 
  DocumentDuplicateIcon, 
  EyeIcon, 
  TrashIcon,
  CalendarIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

interface BlogCardProps {
  id: string;
  keyword: string;
  content: string;
  createdAt: Date;
  onDelete: (id: string) => void;
  onView: (content: string, keyword: string) => void;
  onPostToWordPress?: (blog: { id: string; keyword: string; content: string; createdAt: Date }) => void;
}

export default function BlogCard({
  id,
  keyword,
  content,
  createdAt,
  onDelete,
  onView,
  onPostToWordPress,
}: BlogCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setIsDeleting(true);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Failed to delete blog:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const wordCount = countWords(content);
  const preview = truncateText(content.replace(/[#*]/g, ''), 150);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {keyword}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(createdAt)}
            </div>
            <div className="flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              {wordCount} words
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm leading-relaxed">
          {preview}
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(content, keyword)}
            className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
          
          <button
            onClick={handleCopy}
            className="flex items-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
            Copy
          </button>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}