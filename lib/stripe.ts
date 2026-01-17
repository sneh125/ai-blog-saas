import Stripe from 'stripe';

// Make Stripe optional for demo mode
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });
}

export { stripe };

// Plan configurations with Stripe integration
export const PLANS = {
  FREE: {
    name: 'Free',
    blogCredits: 3,
    price: 0,
    priceId: null,
    wordLimit: 5000,
    teamLimit: 1,
    features: [
      '3 blog posts per month',
      'Basic templates',
      'Standard support',
      'Basic SEO optimization'
    ],
    popular: false,
    type: 'individual',
  },
  PRO: {
    name: 'Pro',
    blogCredits: 30,
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    wordLimit: 50000,
    teamLimit: 1,
    features: [
      '30 blog posts per month',
      'Premium templates',
      'Priority support',
      'Advanced SEO optimization',
      'Content scheduling',
      'Analytics dashboard'
    ],
    popular: true,
    type: 'individual',
  },
  UNLIMITED: {
    name: 'Unlimited',
    blogCredits: -1, // -1 means unlimited
    price: 99,
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID,
    wordLimit: -1,
    teamLimit: 1,
    features: [
      'Unlimited blog posts',
      'All premium templates',
      '24/7 priority support',
      'Advanced SEO tools',
      'Custom branding',
      'API access',
      'White-label solution',
      'Dedicated account manager'
    ],
    popular: false,
    type: 'individual',
  },
  AGENCY_BASIC: {
    name: 'Agency Basic',
    blogCredits: 100,
    price: 199,
    priceId: process.env.STRIPE_AGENCY_BASIC_PRICE_ID,
    wordLimit: 100000,
    teamLimit: 5,
    features: [
      '100 blog posts per month',
      'Team collaboration (5 members)',
      'Client management dashboard',
      'White-label reports',
      'Priority support',
      'Custom branding',
      'API access'
    ],
    popular: false,
    type: 'agency',
  },
  AGENCY_PRO: {
    name: 'Agency Pro',
    blogCredits: 300,
    price: 499,
    priceId: process.env.STRIPE_AGENCY_PRO_PRICE_ID,
    wordLimit: 300000,
    teamLimit: 15,
    features: [
      '300 blog posts per month',
      'Team collaboration (15 members)',
      'Advanced client management',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced analytics',
      'Priority phone support'
    ],
    popular: true,
    type: 'agency',
  },
  AGENCY_ENTERPRISE: {
    name: 'Agency Enterprise',
    blogCredits: -1,
    price: 999,
    priceId: process.env.STRIPE_AGENCY_ENTERPRISE_PRICE_ID,
    wordLimit: -1,
    teamLimit: -1,
    features: [
      'Unlimited blog posts',
      'Unlimited team members',
      'Custom deployment options',
      'SLA guarantee',
      'Custom integrations',
      'Dedicated infrastructure',
      'Training & onboarding',
      '24/7 phone support'
    ],
    popular: false,
    type: 'agency',
  }
} as const;

export type PlanType = keyof typeof PLANS;

// Stripe webhook events
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.payment_succeeded',
  INVOICE_FAILED: 'invoice.payment_failed',
} as const;