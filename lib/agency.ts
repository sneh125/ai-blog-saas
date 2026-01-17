import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface AgencyConfig {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  ownerId: string;
  plan: string;
  isActive: boolean;
  createdAt: any;
  settings: {
    hideOriginalBranding: boolean;
    customFooter: string;
    supportEmail: string;
    companyName: string;
  };
}

export interface AgencyBranding {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  hideOriginalBranding: boolean;
  customFooter: string;
}

/**
 * Get agency configuration by custom domain
 */
export async function getAgencyByDomain(domain: string): Promise<AgencyConfig | null> {
  try {
    const agenciesQuery = query(
      collection(db, 'agencies'),
      where('customDomain', '==', domain),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(agenciesQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const agencyDoc = querySnapshot.docs[0];
    return {
      id: agencyDoc.id,
      ...agencyDoc.data()
    } as AgencyConfig;
    
  } catch (error) {
    console.error('Error fetching agency by domain:', error);
    return null;
  }
}

/**
 * Get agency configuration by ID
 */
export async function getAgencyById(agencyId: string): Promise<AgencyConfig | null> {
  try {
    const agencyDoc = await getDoc(doc(db, 'agencies', agencyId));
    
    if (!agencyDoc.exists()) {
      return null;
    }
    
    return {
      id: agencyDoc.id,
      ...agencyDoc.data()
    } as AgencyConfig;
    
  } catch (error) {
    console.error('Error fetching agency by ID:', error);
    return null;
  }
}

/**
 * Create new agency configuration
 */
export async function createAgency(agencyData: Omit<AgencyConfig, 'id' | 'createdAt'>): Promise<string> {
  try {
    const agencyRef = doc(collection(db, 'agencies'));
    
    const newAgency = {
      ...agencyData,
      createdAt: new Date(),
      isActive: true,
    };
    
    await setDoc(agencyRef, newAgency);
    
    return agencyRef.id;
    
  } catch (error) {
    console.error('Error creating agency:', error);
    throw error;
  }
}

/**
 * Update agency configuration
 */
export async function updateAgency(agencyId: string, updates: Partial<AgencyConfig>): Promise<void> {
  try {
    const agencyRef = doc(db, 'agencies', agencyId);
    
    await updateDoc(agencyRef, {
      ...updates,
      updatedAt: new Date(),
    });
    
  } catch (error) {
    console.error('Error updating agency:', error);
    throw error;
  }
}

/**
 * Check if user owns an agency
 */
export async function getUserAgency(userId: string): Promise<AgencyConfig | null> {
  try {
    const agenciesQuery = query(
      collection(db, 'agencies'),
      where('ownerId', '==', userId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(agenciesQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const agencyDoc = querySnapshot.docs[0];
    return {
      id: agencyDoc.id,
      ...agencyDoc.data()
    } as AgencyConfig;
    
  } catch (error) {
    console.error('Error fetching user agency:', error);
    return null;
  }
}

/**
 * Get agency branding for UI
 */
export function getAgencyBranding(agency: AgencyConfig | null): AgencyBranding {
  if (!agency) {
    return {
      logoUrl: '/logo.png',
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      companyName: 'BlogAI',
      hideOriginalBranding: false,
      customFooter: '',
    };
  }
  
  return {
    logoUrl: agency.logoUrl || '/logo.png',
    primaryColor: agency.primaryColor || '#3B82F6',
    secondaryColor: agency.secondaryColor || '#8B5CF6',
    companyName: agency.settings?.companyName || agency.name,
    hideOriginalBranding: agency.settings?.hideOriginalBranding || false,
    customFooter: agency.settings?.customFooter || '',
  };
}

/**
 * Validate custom domain format
 */
export function validateCustomDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Check if domain is available
 */
export async function isDomainAvailable(domain: string, excludeAgencyId?: string): Promise<boolean> {
  try {
    let agenciesQuery = query(
      collection(db, 'agencies'),
      where('customDomain', '==', domain)
    );
    
    const querySnapshot = await getDocs(agenciesQuery);
    
    if (excludeAgencyId) {
      return querySnapshot.docs.every(doc => doc.id !== excludeAgencyId);
    }
    
    return querySnapshot.empty;
    
  } catch (error) {
    console.error('Error checking domain availability:', error);
    return false;
  }
}