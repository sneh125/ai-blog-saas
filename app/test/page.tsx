'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🚀 Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this page, the basic setup is working!
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-green-100 text-green-800 rounded">
            ✅ Next.js is working
          </div>
          <div className="p-3 bg-blue-100 text-blue-800 rounded">
            ✅ Tailwind CSS is working
          </div>
          <div className="p-3 bg-purple-100 text-purple-800 rounded">
            ✅ Components are rendering
          </div>
        </div>
        <div className="mt-6">
          <a 
            href="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}