'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PLANS } from '@/lib/stripe';
import { CreditCard, Calendar, Users, FileText, TrendingUp } from 'lucide-react';

interface UserData {
  plan: string;
  blogCredits: number;
  wordsUsed: number;
  teamMembersCount: number;
  billingCycleEnd: any;
  stripeCustomerId?: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStripePortal = async () => {
    if (!userData?.stripeCustomerId) {
      alert('No billing information found. Please subscribe to a plan first.');
      return;
    }

    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userData.stripeCustomerId }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view billing information.</p>
        </div>
      </div>
    );
  }

  const currentPlan = PLANS[userData.plan as keyof typeof PLANS];
  const wordLimitPercentage = currentPlan?.wordLimit > 0 
    ? (userData.wordsUsed / currentPlan.wordLimit) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and monitor usage</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                Current Plan
              </h2>
              <p className="text-gray-600 mt-1">Your active subscription details</p>
            </div>
            {userData.stripeCustomerId && (
              <button
                onClick={openStripePortal}
                disabled={portalLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {portalLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900">{currentPlan?.name || 'Unknown'}</h3>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                ${currentPlan?.price || 0}/month
              </p>
              <p className="text-sm text-indigo-700 mt-1">
                {currentPlan?.type === 'agency' ? 'Agency Plan' : 'Individual Plan'}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Billing Cycle
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {userData.billingCycleEnd 
                  ? `Renews ${new Date(userData.billingCycleEnd.toDate()).toLocaleDateString()}`
                  : 'No billing cycle'
                }
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Team Members
              </h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {userData.teamMembersCount || 1}
                {currentPlan?.teamLimit > 0 && ` / ${currentPlan.teamLimit}`}
              </p>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Blog Credits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Blog Credits
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Used this month</span>
                  <span>
                    {currentPlan?.blogCredits === -1 
                      ? 'Unlimited' 
                      : `${userData.blogCredits || 0} / ${currentPlan?.blogCredits || 0}`
                    }
                  </span>
                </div>
                {currentPlan?.blogCredits > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((userData.blogCredits || 0) / currentPlan.blogCredits) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Word Usage */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Word Usage
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Words generated</span>
                  <span>
                    {currentPlan?.wordLimit === -1 
                      ? `${userData.wordsUsed || 0} (Unlimited)` 
                      : `${userData.wordsUsed || 0} / ${currentPlan?.wordLimit || 0}`
                    }
                  </span>
                </div>
                {currentPlan?.wordLimit > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        wordLimitPercentage > 90 ? 'bg-red-600' : 
                        wordLimitPercentage > 70 ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(wordLimitPercentage, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
              {wordLimitPercentage > 80 && currentPlan?.wordLimit > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ You're approaching your word limit. Consider upgrading your plan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPlan?.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade CTA */}
        {userData.plan === 'FREE' && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mt-8 text-white">
            <h3 className="text-xl font-semibold mb-2">Ready to scale your content?</h3>
            <p className="text-indigo-100 mb-4">
              Upgrade to Pro or Agency plans for more credits, advanced features, and team collaboration.
            </p>
            <a 
              href="/pricing" 
              className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
}