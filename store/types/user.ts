/**
 * User Types
 *
 * Centralized type definitions for user-related functionality.
 * This file consolidates all User interfaces from multiple sources
 * to eliminate duplication and provide better type safety.
 */

// =============================================================================
// BASE USER INTERFACE
// =============================================================================

/**
 * Standardized User interface that combines all user-related properties
 * from different parts of the application
 */
export interface User {
  // Core identification
  id?: string;
  account_id?: string;
  biz_id?: string;
  
  // Basic information
  username: string;
  email?: string;
  name?: string;
  fullName?: string;
  first_name_th?: string;
  last_name_th?: string;
  
  // Role and permissions
  role?: string;
  
  // Additional properties
  department?: string;
  avatar?: string;
}

// =============================================================================
// SPECIALIZED USER INTERFACES
// =============================================================================

/**
 * User interface specifically for authentication context
 */
export interface AuthUser extends Pick<User, 'id' | 'biz_id' | 'username' | 'email' | 'fullName' | 'role' | 'avatar'> {
  business_list?: {
    business_id: string;
    business_name_th: string;
    business_name_eng: string;
    business_level: string;
    is_registered: boolean;
  }[];
}

/**
 * User interface for citizen data (from API)
 */
export interface CitizenUser extends Pick<User, 'id' | 'email' | 'first_name_th' | 'last_name_th' | 'department'> {
  // Additional properties specific to citizen data
  first_name_th: string;
  last_name_th: string;
}

/**
 * User interface for access rights and permissions
 */
export interface AccessUser {
  // Required properties for access control
  id: string | null;
  name: string;
  email: string;
  role?: string;
  department?: string;
}

/**
 * User interface for organization stamps
 */
export interface StampUser extends Pick<User, 'name' | 'email' | 'role' | 'department' | 'account_id'> {
  // Required properties for stamp functionality
  name: string;
  email: string;
}

export interface LogActionUser {
  id: string | null;
  name: string;
  creation_date: string;
  type: string;
  description: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Type for user arrays that can be "all" or specific users
 */
export type UserArray = User[] | "all";

/**
 * Type for user selection in forms
 */
export type UserSelection = User[] | "all";

// =============================================================================
// USER UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert citizen data to standard User format
 */
export const convertCitizenToUser = (citizen: CitizenUser): User => ({
  id: citizen.id,
  username: citizen.email || `${citizen.first_name_th} ${citizen.last_name_th}`,
  name: `${citizen.first_name_th} ${citizen.last_name_th}`,
  email: citizen.email,
  department: citizen.department,
});

/**
 * Convert any user object to AccessUser format
 */
export const convertToAccessUser = (user: User): AccessUser => ({
  id: user.id || null,
  name: user.name || user.fullName || user.username || user.email || '',
  email: user.email || '',
  role: user.role,
  department: user.department,
});

/**
 * Convert any user object to StampUser format
 */
export const convertToStampUser = (user: User): StampUser => ({
  name: user.name || user.fullName || user.username || user.email || '',
  email: user.email || '',
  role: user.role,
  department: user.department,
  account_id: user.account_id,
});

/**
 * Check if user object is valid
 */
export const isValidUser = (user: any): user is User => {
  return user && typeof user === 'object' && (
    user.username || user.email || user.name || user.fullName
  );
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user: User): string => {
  return user.name || user.fullName || user.username || user.email || 'Unknown User';
};

/**
 * Get user email safely
 */
export const getUserEmail = (user: User): string => {
  return user.email || '';
};

// =============================================================================
// EXPORTS
// =============================================================================

// All types and utilities are already exported above
// No additional exports needed 