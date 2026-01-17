import Link from 'next/link';
import { SparklesIcon, RocketLaunchIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { AgencyBranding } from '@/lib/agency';

interface HeroProps {
  agencyBranding?: AgencyBranding;
}

export default function Hero({ agencyBranding }: HeroProps) {
  // Use agency branding or default
  const branding = agencyBranding || {
    logoUrl: '/logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    companyName: 'BlogAI',
    hideOriginalBranding: false,
    customFooter: '',
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient with agency colors */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 50%, #1e1b4b 100%)`
        }}
      ></div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            AI-Powered SEO
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Blog Generator
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {agencyBranding ? (
              <>
                Professional AI-powered blog generation service by <strong>{branding.companyName}</strong>. 
                Create high-ranking, SEO-optimized content in seconds.
              </>
            ) : (
              <>
                Generate high-ranking, SEO-optimized blog posts in seconds using advanced AI technology. 
                Boost your content marketing with professional-quality articles.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              style={{ color: branding.primaryColor }}
            >
              Start Free Trial 🚀
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white transition-colors"
              style={{ 
                '--hover-text-color': branding.primaryColor 
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = branding.primaryColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'white';
              }}
            >
              View Pricing
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Content</h3>
              <p className="text-blue-100">
                Generate engaging, original content using GPT-4 technology
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">SEO Optimized</h3>
              <p className="text-blue-100">
                Built-in SEO optimization for better search engine rankings
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <RocketLaunchIcon className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-blue-100">
                Generate professional blog posts in under 30 seconds
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </div>
  );
}