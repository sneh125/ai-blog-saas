// Admin configuration
export const ADMIN_EMAIL = "snehprajapati36@gmail.com";

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export type PlanType = 'FREE' | 'PRO' | 'UNLIMITED';

export function canGenerateBlog(plan: PlanType, credits: number): boolean {
  if (plan === 'UNLIMITED') return true;
  return credits > 0;
}

export function getNextPlan(currentPlan: PlanType): PlanType | null {
  switch (currentPlan) {
    case 'FREE':
      return 'PRO';
    case 'PRO':
      return 'UNLIMITED';
    case 'UNLIMITED':
      return null;
    default:
      return 'PRO';
  }
}