'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { AgencyConfig, getUserAgency, createAgency, updateAgency, validateCustomDomain, isDomainAvailable } from '@/lib/agency';
import { Building2, Globe, Palette, Settings, Save, Plus } from 'lucide-react';

export default function AgencyManagementPage() {
  const { user } = useAuth();
  const [agency, setAgency] = useState<AgencyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    customDomain: '',
    companyName: '',
    supportEmail: '',
    customFooter: '',
    hideOriginalBranding: false,
  });

  useEffect(() => {
    if (user) {
      loadAgency();
    }
  }, [user]);

  const loadAgency = async () => {
    try {
      const userAgency = await getUserAgency(user!.uid);
      
      if (userAgency) {
        setAgency(userAgency);
        setFormData({
          name: userAgency.name,
          logoUrl: userAgency.logoUrl,
          primaryColor: userAgency.primaryColor,
          secondaryColor: userAgency.secondaryColor,
          customDomain: userAgency.customDomain,
          companyName: userAgency.settings?.companyName || '',
          supportEmail: userAgency.settings?.supportEmail || '',
          customFooter: userAgency.settings?.customFooter || '',
          hideOriginalBranding: userAgency.settings?.hideOriginalBranding || false,
        });
      }
    } catch (err) {
      console.error('Error loading agency:', err);
      setError('Failed to load agency configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate domain
      if (!validateCustomDomain(formData.customDomain)) {
        throw new Error('Invalid domain format');
      }

      // Check domain availability
      const isAvailable = await isDomainAvailable(formData.customDomain, agency?.id);
      if (!isAvailable) {
        throw new Error('Domain is already taken');
      }

      const agencyData = {
        name: formData.name,
        logoUrl: formData.logoUrl,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        customDomain: formData.customDomain,
        ownerId: user!.uid,
        plan: 'AGENCY_BASIC', // Default plan
        isActive: true,
        settings: {
          companyName: formData.companyName,
          supportEmail: formData.supportEmail,
          customFooter: formData.customFooter,
          hideOriginalBranding: formData.hideOriginalBranding,
        },
      };

      if (agency) {
        // Update existing agency
        await updateAgency(agency.id, agencyData);
        setSuccess('Agency configuration updated successfully!');
      } else {
        // Create new agency
        const agencyId = await createAgency(agencyData);
        setSuccess('Agency created successfully!');
        
        // Reload to get the new agency data
        await loadAgency();
      }

    } catch (err: any) {
      setError(err.message || 'Failed to save agency configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to manage your agency.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-indigo-600" />
            Agency Management
          </h1>
          <p className="text-gray-600 mt-2">
            Configure your white-label agency settings and branding
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Agency Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-indigo-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agency Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your Agency Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Display Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Name shown to clients"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="support@youragency.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://yourdomain.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Domain Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-indigo-600" />
              Custom Domain
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Domain
              </label>
              <input
                type="text"
                value={formData.customDomain}
                onChange={(e) => handleInputChange('customDomain', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="blogs.youragency.com"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter your custom domain (e.g., blogs.youragency.com). Make sure to point your DNS to our servers.
              </p>
            </div>

            {agency && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Your agency is live at:</strong>{' '}
                  <a 
                    href={`https://${formData.customDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    {formData.customDomain}
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Branding */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-indigo-600" />
              Branding & Colors
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Color Preview</h3>
              <div className="flex space-x-4">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  Primary
                </div>
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: formData.secondaryColor }}
                >
                  Secondary
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Advanced Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hideOriginalBranding}
                    onChange={(e) => handleInputChange('hideOriginalBranding', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Hide "Powered by BlogAI" footer
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Remove original branding from your white-label site
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Footer HTML
                </label>
                <textarea
                  value={formData.customFooter}
                  onChange={(e) => handleInputChange('customFooter', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="<p>© 2024 Your Agency. All rights reserved.</p>"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Custom HTML for your footer section
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {agency ? 'Update Agency' : 'Create Agency'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}