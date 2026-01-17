import { db } from './firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export type UserRole = 'super_admin' | 'admin' | 'agency_owner' | 'agency_member' | 'user';

export interface UserWithRole {
  uid: string;
  email: string;
  role: UserRole;
  agencyId?: string;
  createdAt: any;
  lastLogin?: any;
}

export const ROLE_HIERARCHY = {
  super_admin: 5,
  admin: 4,
  agency_owner: 3,
  agency_member: 2,
  user: 1,
};

export const ROLE_PERMISSIONS = {
  super_admin: [
    'manage_all_users',
    'manage_admins',
    'view_all_analytics',
    'manage_system_settings',
    'manage_agencies',
    'access_admin_panel',
    'manage_billing',
    'export_data',
  ],
  admin: [
    'manage_users',
    'view_analytics',
    'manage_agencies',
    'access_admin_panel',
    'manage_billing',
    'view_support_tickets',
  ],
  agency_owner: [
    'manage_agency',
    'manage_agency_members',
    'view_agency_analytics',
    'manage_agency_billing',
    'configure_white_label',
  ],
  agency_member: [
    'use_agency_features',
    'generate_blogs',
    'view_agency_content',
  ],
  user: [
    'generate_blogs',
    'manage_own_account',
    'view_own_content',
  ],
};

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if user can perform action on target user
 */
export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Get user role from Firestore
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return 'user'; // Default role
    }
    
    const userData = userDoc.data();
    return userData.role || 'user';
    
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user';
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  adminUserId: string, 
  targetUserId: string, 
  newRole: UserRole
): Promise<void> {
  try {
    // Check admin permissions
    const adminRole = await getUserRole(adminUserId);
    
    if (!hasPermission(adminRole, 'manage_users') && !hasPermission(adminRole, 'manage_all_users')) {
      throw new Error('Insufficient permissions to manage users');
    }
    
    // Get target user's current role
    const targetRole = await getUserRole(targetUserId);
    
    // Check if admin can manage this user
    if (!canManageUser(adminRole, targetRole)) {
      throw new Error('Cannot manage user with equal or higher role');
    }
    
    // Update role
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date(),
      updatedBy: adminUserId,
    });
    
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Get all users with roles (admin only)
 */
export async function getAllUsersWithRoles(adminUserId: string): Promise<UserWithRole[]> {
  try {
    const adminRole = await getUserRole(adminUserId);
    
    if (!hasPermission(adminRole, 'manage_users') && !hasPermission(adminRole, 'manage_all_users')) {
      throw new Error('Insufficient permissions to view users');
    }
    
    const usersQuery = query(collection(db, 'users'));
    const querySnapshot = await getDocs(usersQuery);
    
    const users: UserWithRole[] = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email || 'No email',
        role: userData.role || 'user',
        agencyId: userData.agencyId,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
      });
    });
    
    return users;
    
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(adminUserId: string, role: UserRole): Promise<UserWithRole[]> {
  try {
    const adminRole = await getUserRole(adminUserId);
    
    if (!hasPermission(adminRole, 'manage_users')) {
      throw new Error('Insufficient permissions');
    }
    
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', role)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const users: UserWithRole[] = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email || 'No email',
        role: userData.role || 'user',
        agencyId: userData.agencyId,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
      });
    });
    
    return users;
    
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'super_admin';
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'super_admin';
}

/**
 * Middleware function to check permissions
 */
export async function requirePermission(userId: string, permission: string): Promise<void> {
  const role = await getUserRole(userId);
  
  if (!hasPermission(role, permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`);
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    agency_owner: 'Agency Owner',
    agency_member: 'Agency Member',
    user: 'User',
  };
  
  return roleNames[role] || 'Unknown';
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: UserRole): string {
  const roleColors = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    agency_owner: 'bg-blue-100 text-blue-800',
    agency_member: 'bg-green-100 text-green-800',
    user: 'bg-gray-100 text-gray-800',
  };
  
  return roleColors[role] || 'bg-gray-100 text-gray-800';
}