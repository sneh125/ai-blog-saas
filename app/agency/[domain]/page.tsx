'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AgencyConfig, getAgencyByDomain, getAgencyBranding, AgencyBranding } from '@/lib/agency';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';

interface AgencyPageProps {
  params: {
    domain: string;
  };
}

export default function AgencyPage() {
  const params = useParams();
  const domain = params.domain as string;
  
  const [agency, setAgency] = useState<AgencyConfig | null>(null);
  const [branding, setBranding] = useState<AgencyBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgencyConfig() {
      try {
        console.log('Loading agency config for domain:', domain);
        
        const agencyConfig = await getAgencyByDomain(domain);
        
        if (!agencyConfig) {
          setError('Agency not found or inactive');
          return;
        }
        
        setAgency(agencyConfig);
        setBranding(getAgencyBranding(agencyConfig));
        
        // Apply custom branding to document
        applyBranding(getAgencyBranding(agencyConfig));
        
      } catch (err) {
        console.error('Error loading agency config:', err);
        setError('Failed to load agency configuration');
      } finally {
        setLoading(false);
      }
    }

    if (domain) {
      loadAgencyConfig();
    }
  }, [domain]);

  const applyBranding = (branding: AgencyBranding) => {
    // Apply CSS custom properties for theming
    const root = document.documentElement;
    root.style.setProperty('--primary-color', branding.primaryColor);
    root.style.setProperty('--secondary-color', branding.secondaryColor);
    
    // Update page title
    document.title = `${branding.companyName} - AI Blog Generator`;
    
    // Update favicon if custom logo exists
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && branding.logoUrl !== '/logo.png') {
      favicon.href = branding.logoUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !agency || !branding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agency Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || 'The requested agency domain is not configured or inactive.'}
          </p>
          <a 
            href="https://blogai.com" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Visit BlogAI
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS for branding */}
      <style jsx global>{`
        :root {
          --primary-color: ${branding.primaryColor};
          --secondary-color: ${branding.secondaryColor};
        }
        
        .bg-blue-600 {
          background-color: var(--primary-color) !important;
        }
        
        .text-blue-600 {
          color: var(--primary-color) !important;
        }
        
        .border-blue-600 {
          border-color: var(--primary-color) !important;
        }
        
        .hover\\:bg-blue-700:hover {
          background-color: color-mix(in srgb, var(--primary-color) 90%, black) !important;
        }
        
        .from-blue-600 {
          --tw-gradient-from: var(--primary-color) var(--tw-gradient-from-position);
        }
        
        .to-purple-600 {
          --tw-gradient-to: var(--secondary-color) var(--tw-gradient-to-position);
        }
      `}</style>

      {/* Pass agency branding to components */}
      <Navbar agencyBranding={branding} />
      
      <main>
        <Hero agencyBranding={branding} />
        
        {/* Agency-specific content */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Powered by {branding.companyName}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional AI-powered blog generation service, customized and branded for your business needs.
            </p>
          </div>
        </section>
        
        {/* Custom footer if provided */}
        {branding.customFooter && (
          <section className="py-8 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div 
                className="text-gray-600"
                dangerouslySetInnerHTML={{ __html: branding.customFooter }}
              />
            </div>
          </section>
        )}
        
        {/* Original branding (hidden if agency chooses to hide it) */}
        {!branding.hideOriginalBranding && (
          <footer className="py-4 bg-gray-800 text-white text-center text-sm">
            <p>Powered by <a href="https://blogai.com" className="text-blue-400 hover:text-blue-300">BlogAI</a></p>
          </footer>
        )}
      </main>
    </div>
  );
}