import { db } from './firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { PLANS } from './stripe';

export interface UsageData {
  plan: string;
  blogCredits: number;
  wordsUsed: number;
  teamMembersCount: number;
  billingCycleEnd: any;
  stripeCustomerId?: string;
}

export class UsageLimitError extends Error {
  constructor(message: string, public limitType: 'blogs' | 'words' | 'team') {
    super(message);
    this.name = 'UsageLimitError';
  }
}

/**
 * Check if user can generate a blog post
 */
export async function checkBlogLimit(userId: string): Promise<void> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data() as UsageData;
  const currentPlan = PLANS[userData.plan as keyof typeof PLANS];

  if (!currentPlan) {
    throw new Error('Invalid plan');
  }

  // Check blog credits (unlimited = -1)
  if (currentPlan.blogCredits > 0 && userData.blogCredits >= currentPlan.blogCredits) {
    throw new UsageLimitError(
      `Blog limit exceeded. You've used ${userData.blogCredits}/${currentPlan.blogCredits} blogs this month. Upgrade your plan to continue.`,
      'blogs'
    );
  }
}

/**
 * Check if user can generate content with specific word count
 */
export async function checkWordLimit(userId: string, additionalWords: number): Promise<void> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data() as UsageData;
  const currentPlan = PLANS[userData.plan as keyof typeof PLANS];

  if (!currentPlan) {
    throw new Error('Invalid plan');
  }

  // Check word limit (unlimited = -1)
  if (currentPlan.wordLimit > 0) {
    const totalWords = (userData.wordsUsed || 0) + additionalWords;
    
    if (totalWords > currentPlan.wordLimit) {
      throw new UsageLimitError(
        `Word limit exceeded. This would use ${totalWords}/${currentPlan.wordLimit} words. Upgrade your plan to continue.`,
        'words'
      );
    }
  }
}

/**
 * Check if team can add more members
 */
export async function checkTeamLimit(userId: string): Promise<void> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data() as UsageData;
  const currentPlan = PLANS[userData.plan as keyof typeof PLANS];

  if (!currentPlan) {
    throw new Error('Invalid plan');
  }

  // Check team member limit (unlimited = -1)
  if (currentPlan.teamLimit > 0 && userData.teamMembersCount >= currentPlan.teamLimit) {
    throw new UsageLimitError(
      `Team member limit reached. You have ${userData.teamMembersCount}/${currentPlan.teamLimit} members. Upgrade your plan to add more.`,
      'team'
    );
  }
}

/**
 * Update usage after successful blog generation
 */
export async function updateUsage(userId: string, wordCount: number): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    blogCredits: increment(1),
    wordsUsed: increment(wordCount),
  });
}

/**
 * Reset monthly usage (called by Stripe webhook on billing cycle)
 */
export async function resetMonthlyUsage(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  // Calculate next billing cycle (30 days from now)
  const nextBillingCycle = new Date();
  nextBillingCycle.setDate(nextBillingCycle.getDate() + 30);
  
  await updateDoc(userRef, {
    blogCredits: 0,
    wordsUsed: 0,
    billingCycleEnd: nextBillingCycle,
  });
}

/**
 * Get usage statistics for dashboard
 */
export async function getUsageStats(userId: string) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data() as UsageData;
  const currentPlan = PLANS[userData.plan as keyof typeof PLANS];

  if (!currentPlan) {
    throw new Error('Invalid plan');
  }

  return {
    plan: currentPlan,
    usage: {
      blogs: {
        used: userData.blogCredits || 0,
        limit: currentPlan.blogCredits,
        percentage: currentPlan.blogCredits > 0 
          ? ((userData.blogCredits || 0) / currentPlan.blogCredits) * 100 
          : 0,
      },
      words: {
        used: userData.wordsUsed || 0,
        limit: currentPlan.wordLimit,
        percentage: currentPlan.wordLimit > 0 
          ? ((userData.wordsUsed || 0) / currentPlan.wordLimit) * 100 
          : 0,
      },
      team: {
        used: userData.teamMembersCount || 1,
        limit: currentPlan.teamLimit,
        percentage: currentPlan.teamLimit > 0 
          ? ((userData.teamMembersCount || 1) / currentPlan.teamLimit) * 100 
          : 0,
      },
    },
    billingCycleEnd: userData.billingCycleEnd,
  };
}