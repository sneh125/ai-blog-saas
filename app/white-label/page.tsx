'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { CheckIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const WHITE_LABEL_PLANS = {
  STARTER: {
    name: 'White-Label Starter',
    price: 199,
    originalPrice: 299,
    planType: 'AGENCY_BASIC',
    features: [
      'Custom domain & branding',
      'Your logo & company colors',
      'Up to 5 team members',
      '100 AI blog posts/month',
      'White-label dashboard',
      'Remove "Powered by BlogAI"',
      'Priority AI processing',
      'Email support'
    ],
    target: 'Small agencies & freelancers',
    popular: false,
  },
  PRO: {
    name: 'White-Label Pro',
    price: 399,
    originalPrice: 599,
    planType: 'AGENCY_PRO',
    features: [
      'Everything in Starter',
      'Up to 15 team members',
      '300 AI blog posts/month',
      'Custom footer & branding',
      'Client management system',
      'Advanced analytics',
      'API access',
      'Priority phone support',
      'Onboarding assistance'
    ],
    target: 'Growing agencies',
    popular: true,
  },
  ENTERPRISE: {
    name: 'White-Label Enterprise',
    price: 799,
    originalPrice: 1199,
    planType: 'AGENCY_ENTERPRISE',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Unlimited AI blog posts',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee (99.9%)',
      'Custom deployment options',
      'Training & onboarding',
      '24/7 priority support'
    ],
    target: 'Enterprise agencies',
    popular: false,
  },
};

export default function WhiteLabelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleGetStarted = async (planKey: string) => {
    if (!user) {
      router.push('/register?redirect=white-label');
      return;
    }

    const plan = WHITE_LABEL_PLANS[planKey as keyof typeof WHITE_LABEL_PLANS];
    setIsLoading(planKey);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan.planType,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process upgrade');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Launch Your Own AI Blog Platform
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Without Building Anything
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
            Turn our AI technology into your own branded SaaS in minutes. 
            Your logo, your domain, your pricing - we handle the tech.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => handleGetStarted('PRO')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start White-Label Trial 🎯
            </button>
          </div>

          <p className="text-blue-200 text-sm">
            ✅ Used by content agencies, SEO firms, and freelancers worldwide
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              White-Label Pricing Plans
            </h2>
            <p className="text-xl text-gray-600">
              Launch your AI platform with complete branding control
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(WHITE_LABEL_PLANS).map(([planKey, plan]) => (
              <div
                key={planKey}
                className={`bg-white rounded-2xl shadow-xl border-2 p-8 relative ${
                  plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <StarIcon className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.target}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleGetStarted(planKey)}
                  disabled={isLoading === planKey}
                  className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } ${isLoading === planKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading === planKey ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Start {plan.name}
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}