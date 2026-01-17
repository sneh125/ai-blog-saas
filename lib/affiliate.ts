import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

export interface Affiliate {
  id: string;
  email: string;
  referralCode: string;
  totalEarnings: number;
  totalClicks: number;
  totalConversions: number;
  createdAt: any;
  status: 'active' | 'pending' | 'suspended';
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  referralCode: string;
  ipAddress: string;
  userAgent: string;
  timestamp: any;
}

export interface AffiliateConversion {
  id: string;
  affiliateId: string;
  referralCode: string;
  userId: string;
  userEmail: string;
  planType: string;
  amount: number;
  commission: number;
  timestamp: any;
  status: 'pending' | 'paid';
}

// Commission rates
export const COMMISSION_RATES = {
  PRO: 0.30, // 30% commission
  UNLIMITED: 0.30, // 30% commission
  MINIMUM_PAYOUT: 50 // $50 minimum payout
};

// Generate unique referral code
export function generateReferralCode(email: string): string {
  const username = email.split('@')[0];
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${username}${randomSuffix}`.toLowerCase();
}

// Create new affiliate
export async function createAffiliate(email: string): Promise<string> {
  try {
    const referralCode = generateReferralCode(email);
    const affiliateId = doc(collection(db, 'affiliates')).id;
    
    const affiliateData: Omit<Affiliate, 'id'> = {
      email,
      referralCode,
      totalEarnings: 0,
      totalClicks: 0,
      totalConversions: 0,
      createdAt: serverTimestamp(),
      status: 'active'
    };

    await setDoc(doc(db, 'affiliates', affiliateId), affiliateData);
    return referralCode;
  } catch (error) {
    console.error('Error creating affiliate:', error);
    throw error;
  }
}

// Get affiliate by referral code
export async function getAffiliateByCode(referralCode: string): Promise<Affiliate | null> {
  try {
    const q = query(
      collection(db, 'affiliates'), 
      where('referralCode', '==', referralCode)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Affiliate;
  } catch (error) {
    console.error('Error getting affiliate:', error);
    return null;
  }
}

// Track affiliate click
export async function trackAffiliateClick(
  referralCode: string, 
  ipAddress: string, 
  userAgent: string
): Promise<void> {
  try {
    const affiliate = await getAffiliateByCode(referralCode);
    if (!affiliate) return;

    // Record click
    const clickId = doc(collection(db, 'affiliateClicks')).id;
    await setDoc(doc(db, 'affiliateClicks', clickId), {
      affiliateId: affiliate.id,
      referralCode,
      ipAddress,
      userAgent,
      timestamp: serverTimestamp()
    });

    // Update affiliate stats
    await updateDoc(doc(db, 'affiliates', affiliate.id), {
      totalClicks: increment(1)
    });
  } catch (error) {
    console.error('Error tracking click:', error);
  }
}

// Track affiliate conversion (when user pays)
export async function trackAffiliateConversion(
  referralCode: string,
  userId: string,
  userEmail: string,
  planType: string,
  amount: number
): Promise<void> {
  try {
    const affiliate = await getAffiliateByCode(referralCode);
    if (!affiliate) return;

    const commissionRate = COMMISSION_RATES[planType as keyof typeof COMMISSION_RATES] || 0;
    const commission = amount * commissionRate;

    // Record conversion
    const conversionId = doc(collection(db, 'affiliateConversions')).id;
    await setDoc(doc(db, 'affiliateConversions', conversionId), {
      affiliateId: affiliate.id,
      referralCode,
      userId,
      userEmail,
      planType,
      amount,
      commission,
      timestamp: serverTimestamp(),
      status: 'pending'
    });

    // Update affiliate stats
    await updateDoc(doc(db, 'affiliates', affiliate.id), {
      totalConversions: increment(1),
      totalEarnings: increment(commission)
    });
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
}

// Get affiliate dashboard data
export async function getAffiliateDashboard(affiliateId: string) {
  try {
    // Get affiliate info
    const affiliateDoc = await getDoc(doc(db, 'affiliates', affiliateId));
    if (!affiliateDoc.exists()) return null;

    const affiliate = { id: affiliateDoc.id, ...affiliateDoc.data() } as Affiliate;

    // Get recent clicks
    const clicksQuery = query(
      collection(db, 'affiliateClicks'),
      where('affiliateId', '==', affiliateId)
    );
    const clicksSnapshot = await getDocs(clicksQuery);
    const clicks = clicksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get conversions
    const conversionsQuery = query(
      collection(db, 'affiliateConversions'),
      where('affiliateId', '==', affiliateId)
    );
    const conversionsSnapshot = await getDocs(conversionsQuery);
    const conversions = conversionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      affiliate,
      clicks,
      conversions,
      stats: {
        totalClicks: clicks.length,
        totalConversions: conversions.length,
        totalEarnings: affiliate.totalEarnings,
        conversionRate: clicks.length > 0 ? (conversions.length / clicks.length * 100).toFixed(2) : '0'
      }
    };
  } catch (error) {
    console.error('Error getting affiliate dashboard:', error);
    return null;
  }
}

// Generate affiliate link
export function generateAffiliateLink(referralCode: string, baseUrl: string = ''): string {
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${url}/?ref=${referralCode}`;
}

// Check if user came from affiliate link
export function getAffiliateCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

// Store affiliate code in localStorage for conversion tracking
export function storeAffiliateCode(referralCode: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('affiliateCode', referralCode);
  localStorage.setItem('affiliateCodeExpiry', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString()); // 30 days
}

// Get stored affiliate code
export function getStoredAffiliateCode(): string | null {
  if (typeof window === 'undefined') return null;
  
  const code = localStorage.getItem('affiliateCode');
  const expiry = localStorage.getItem('affiliateCodeExpiry');
  
  if (!code || !expiry) return null;
  
  if (Date.now() > parseInt(expiry)) {
    localStorage.removeItem('affiliateCode');
    localStorage.removeItem('affiliateCodeExpiry');
    return null;
  }
  
  return code;
}