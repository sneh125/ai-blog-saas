'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: number;
  credits: number;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}

export default function PricingCard({
  name,
  price,
  credits,
  features,
  isPopular = false,
  onSelect,
  isLoading = false,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-8 ${
        isPopular
          ? 'bg-gradient-to-b from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
          : 'bg-white text-gray-900 shadow-lg border border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold">{formatPrice(price)}</span>
          {price > 0 && <span className="text-lg opacity-75">/month</span>}
        </div>
        
        <div className="mb-6">
          <span className={`text-lg ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
            {credits === -1 ? 'Unlimited' : credits} blog posts
            {credits !== -1 && ' per month'}
          </span>
        </div>

        <button
          onClick={onSelect}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-colors mb-8 ${
            isPopular
              ? 'bg-white text-blue-600 hover:bg-gray-100'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Processing...' : price === 0 ? 'Get Started Free' : 'Subscribe Now'}
        </button>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <CheckIcon
                className={`h-5 w-5 mr-3 ${
                  isPopular ? 'text-green-300' : 'text-green-500'
                }`}
              />
              <span className={`text-sm ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}