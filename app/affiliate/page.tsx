'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import {
  createAffiliate,
  getAffiliateDashboard,
  generateAffiliateLink,
  COMMISSION_RATES
} from '@/lib/affiliate';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function AffiliatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    loadAffiliateData();
  }, [user, loading, router]);

  const loadAffiliateData = async () => {
    if (!user) return;

    try {
      // Try to get existing affiliate data
      // For now, we'll create a simple check - in real app, you'd query by email
      const data = await getAffiliateDashboard(user.uid);
      setAffiliateData(data);
    } catch (error) {
      console.error('Error loading affiliate data:', error);
    }
  };

  const handleCreateAffiliate = async () => {
    if (!user?.email) return;

    setIsCreating(true);
    try {
      const referralCode = await createAffiliate(user.email);
      await loadAffiliateData();
      alert(`Affiliate account created! Your referral code: ${referralCode}`);
    } catch (error) {
      console.error('Error creating affiliate:', error);
      alert('Failed to create affiliate account');
    } finally {
      setIsCreating(false);
    }
  };

  const copyAffiliateLink = () => {
    if (!affiliateData?.affiliate?.referralCode) return;

    const link = generateAffiliateLink(affiliateData.affiliate.referralCode);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // If no affiliate data, show signup
  if (!affiliateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Join Our Affiliate Program
            </h1>
            
            <p className="text-gray-600 mb-6">
              Earn 30% commission on every sale you refer. Start earning money by promoting BlogAI!
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What You Get:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 30% commission on all plans</li>
                <li>• Real-time tracking dashboard</li>
                <li>• Monthly payouts ($50 minimum)</li>
                <li>• Marketing materials provided</li>
              </ul>
            </div>

            <button
              onClick={handleCreateAffiliate}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all"
            >
              {isCreating ? 'Creating Account...' : 'Become an Affiliate'}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              By joining, you agree to our affiliate terms and conditions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { affiliate, stats } = affiliateData;
  const affiliateLink = generateAffiliateLink(affiliate.referralCode);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">💰 Affiliate Dashboard</h1>
              <p className="text-gray-600">Track your earnings and referrals</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliate Link */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Affiliate Link</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 font-mono break-all">{affiliateLink}</p>
            </div>
            <button
              onClick={copyAffiliateLink}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? (
                <CheckIcon className="h-5 w-5 mr-2" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this link to earn 30% commission on every sale!
          </p>
        </div>

        {/* Commission Rates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Commission Rates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Pro Plan</h3>
              <p className="text-blue-800">$29/month → $8.70 commission (30%)</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900">Unlimited Plan</h3>
              <p className="text-purple-800">$99/month → $29.70 commission (30%)</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Minimum payout: ${COMMISSION_RATES.MINIMUM_PAYOUT} • Paid monthly via PayPal/Bank transfer
          </p>
        </div>

        {/* Marketing Tips */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Marketing Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Best Platforms</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Instagram (content creators)</li>
                <li>• YouTube (tech reviewers)</li>
                <li>• LinkedIn (business professionals)</li>
                <li>• WhatsApp groups (bloggers)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Content Ideas</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "AI tool that writes blogs in seconds"</li>
                <li>• Screen record blog generation</li>
                <li>• Before/after content examples</li>
                <li>• SEO benefits demonstration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}