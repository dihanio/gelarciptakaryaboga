import type { UserRole } from '@/types';

// Permission definitions per resource
type Permission = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import';

type Resource =
  | 'events'
  | 'participants'
  | 'booths'
  | 'schedules'
  | 'news'
  | 'gallery'
  | 'tickets'
  | 'orders'
  | 'visitors'
  | 'checkin'
  | 'sections'
  | 'users'
  | 'settings'
  | 'stats';

const PERMISSIONS: Record<UserRole, Partial<Record<Resource, Permission[]>>> = {
  super_admin: {
    events: ['create', 'read', 'update', 'delete', 'export', 'import'],
    participants: ['create', 'read', 'update', 'delete', 'export', 'import'],
    booths: ['create', 'read', 'update', 'delete', 'export', 'import'],
    schedules: ['create', 'read', 'update', 'delete'],
    news: ['create', 'read', 'update', 'delete'],
    gallery: ['create', 'read', 'update', 'delete'],
    tickets: ['create', 'read', 'update', 'delete', 'export'],
    orders: ['create', 'read', 'update', 'delete', 'export'],
    visitors: ['read', 'update', 'delete', 'export'],
    checkin: ['create', 'read'],
    sections: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
    stats: ['read'],
  },
  admin_event: {
    events: ['read', 'update'],
    participants: ['create', 'read', 'update', 'delete', 'export', 'import'],
    booths: ['create', 'read', 'update', 'delete', 'export', 'import'],
    schedules: ['create', 'read', 'update', 'delete'],
    news: ['create', 'read', 'update', 'delete'],
    gallery: ['create', 'read', 'update', 'delete'],
    tickets: ['create', 'read', 'update', 'delete', 'export'],
    orders: ['create', 'read', 'update', 'delete', 'export'],
    visitors: ['read', 'update', 'delete', 'export'],
    checkin: ['create', 'read'],
    sections: ['create', 'read', 'update', 'delete'],
    stats: ['read'],
  },
  ticket_officer: {
    tickets: ['create', 'read', 'update', 'export'],
    orders: ['create', 'read', 'update', 'export'],
    visitors: ['read', 'export'],
    stats: ['read'],
  },
  checkin_officer: {
    checkin: ['create', 'read'],
    tickets: ['read'],
    visitors: ['read'],
  },
  content_editor: {
    news: ['create', 'read', 'update', 'delete'],
    gallery: ['create', 'read', 'update', 'delete'],
    sections: ['create', 'read', 'update', 'delete'],
    participants: ['read'],
    schedules: ['read'],
  },
  media: {
    gallery: ['create', 'read'],
  },
  viewer: {
    events: ['read'],
    participants: ['read'],
    booths: ['read'],
    schedules: ['read'],
    news: ['read'],
    gallery: ['read'],
    tickets: ['read'],
    orders: ['read'],
    visitors: ['read'],
    stats: ['read'],
  },
};

export function checkPermission(
  role: UserRole,
  resource: Resource,
  permission: Permission
): boolean {
  if (role === 'super_admin') return true;
  
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions.includes(permission);
}

export function getPermissions(role: UserRole): Partial<Record<Resource, Permission[]>> {
  return PERMISSIONS[role] || {};
}

export function getAllowedRolesForResource(
  resource: Resource,
  permission: Permission
): UserRole[] {
  const roles: UserRole[] = [];
  
  for (const [role, perms] of Object.entries(PERMISSIONS)) {
    const resourcePerms = perms[resource];
    if (resourcePerms?.includes(permission)) {
      roles.push(role as UserRole);
    }
  }
  
  return roles;
}
