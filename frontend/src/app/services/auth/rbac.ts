// Role-Based Access Control for the election portal

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ECZ_NATIONAL'
  | 'ECZ_PROVINCIAL'
  | 'RETURNING_OFFICER_DISTRICT'
  | 'RETURNING_OFFICER_CONSTITUENCY'
  | 'RETURNING_OFFICER_WARD'
  | 'POLLING_AGENT'
  | 'OBSERVER';

export type Permission =
  | 'results:read'
  | 'results:write'
  | 'results:delete'
  | 'results:approve'
  | 'verification:read'
  | 'verification:write'
  | 'verification:sign_national'
  | 'verification:sign_provincial'
  | 'verification:sign_district'
  | 'verification:sign_constituency'
  | 'verification:sign_ward'
  | 'verification:sign_polling'
  | 'ecz_figures:read'
  | 'ecz_figures:write'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'audit:read'
  | 'reports:export'
  | 'admin:full';

export type ScopeLevel = 'national' | 'province' | 'district' | 'constituency' | 'ward' | 'polling_station';

export interface UserScope {
  level: ScopeLevel;
  ids: string[]; // which geographic IDs this user can access (empty = all)
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'results:read', 'results:write', 'results:delete', 'results:approve',
    'verification:read', 'verification:write',
    'verification:sign_national', 'verification:sign_provincial', 'verification:sign_district',
    'verification:sign_constituency', 'verification:sign_ward', 'verification:sign_polling',
    'ecz_figures:read', 'ecz_figures:write',
    'users:read', 'users:write', 'users:delete',
    'audit:read', 'reports:export', 'admin:full',
  ],
  ECZ_NATIONAL: [
    'results:read', 'results:approve',
    'verification:read', 'verification:write', 'verification:sign_national',
    'ecz_figures:read', 'ecz_figures:write',
    'users:read', 'audit:read', 'reports:export',
  ],
  ECZ_PROVINCIAL: [
    'results:read', 'results:approve',
    'verification:read', 'verification:write', 'verification:sign_provincial',
    'ecz_figures:read', 'ecz_figures:write',
    'audit:read', 'reports:export',
  ],
  RETURNING_OFFICER_DISTRICT: [
    'results:read',
    'verification:read', 'verification:write', 'verification:sign_district',
    'ecz_figures:read', 'ecz_figures:write',
    'reports:export',
  ],
  RETURNING_OFFICER_CONSTITUENCY: [
    'results:read',
    'verification:read', 'verification:write', 'verification:sign_constituency',
    'ecz_figures:read', 'ecz_figures:write',
    'reports:export',
  ],
  RETURNING_OFFICER_WARD: [
    'results:read',
    'verification:read', 'verification:write', 'verification:sign_ward',
    'ecz_figures:read', 'ecz_figures:write',
    'reports:export',
  ],
  POLLING_AGENT: [
    'results:read', 'results:write',
    'verification:read', 'verification:sign_polling',
  ],
  OBSERVER: [
    'results:read',
    'verification:read',
    'ecz_figures:read',
    'reports:export',
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Administrator',
  ECZ_NATIONAL: 'ECZ National Official',
  ECZ_PROVINCIAL: 'ECZ Provincial Official',
  RETURNING_OFFICER_DISTRICT: 'District Returning Officer',
  RETURNING_OFFICER_CONSTITUENCY: 'Constituency Returning Officer',
  RETURNING_OFFICER_WARD: 'Ward Returning Officer',
  POLLING_AGENT: 'Polling Agent',
  OBSERVER: 'Observer / Public',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: '#7c3aed',
  ECZ_NATIONAL: '#dc2626',
  ECZ_PROVINCIAL: '#ea580c',
  RETURNING_OFFICER_DISTRICT: '#2563eb',
  RETURNING_OFFICER_CONSTITUENCY: '#0891b2',
  RETURNING_OFFICER_WARD: '#16a34a',
  POLLING_AGENT: '#ca8a04',
  OBSERVER: '#6b7280',
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function canAccessScope(userScope: UserScope, targetLevel: ScopeLevel, targetId: string): boolean {
  const levelOrder: ScopeLevel[] = ['national', 'province', 'district', 'constituency', 'ward', 'polling_station'];
  const userLevelIndex = levelOrder.indexOf(userScope.level);
  const targetLevelIndex = levelOrder.indexOf(targetLevel);

  // Higher-level users can access lower levels
  if (userLevelIndex < targetLevelIndex) return true;

  // Same level: check if the ID is in scope
  if (userLevelIndex === targetLevelIndex) {
    return userScope.ids.length === 0 || userScope.ids.includes(targetId);
  }

  return false;
}
