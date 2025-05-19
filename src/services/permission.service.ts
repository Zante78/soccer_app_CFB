import { supabase } from './database';
import { Permission, UserRole } from '../types/core/user';

export class PermissionService {
  private rolePermissions: Record<UserRole, Permission[]> = {
    admin: [
      'manage:players',
      'view:players',
      'manage:teams',
      'view:teams',
      'manage:evaluations',
      'view:evaluations',
      'manage:medical',
      'view:medical',
      'manage:users',
      'export:data'
    ],
    headCoach: [
      'manage:players',
      'view:players',
      'manage:teams',
      'view:teams',
      'manage:evaluations',
      'view:evaluations',
      'view:medical',
      'export:data'
    ],
    assistantCoach: [
      'view:players',
      'view:teams',
      'manage:evaluations',
      'view:evaluations'
    ],
    medicalStaff: [
      'view:players',
      'manage:medical',
      'view:medical'
    ],
    analyst: [
      'view:players',
      'view:teams',
      'view:evaluations',
      'export:data'
    ],
    scout: [
      'view:players',
      'manage:evaluations',
      'view:evaluations'
    ]
  };

  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const { data: user, error } = await supabase
      .from('users')
      .select('role, permissions')
      .eq('id', userId)
      .single();
    
    if (error) throw error;

    // Check role-based permissions
    const rolePerms = this.rolePermissions[user.role] || [];
    if (rolePerms.includes(permission)) return true;

    // Check additional user-specific permissions
    return user.permissions?.includes(permission) || false;
  }

  async grantPermission(userId: string, permission: Permission): Promise<void> {
    const { error } = await supabase
      .from('user_permissions')
      .insert([{ userId, permission }]);
    
    if (error) throw error;
  }

  async revokePermission(userId: string, permission: Permission): Promise<void> {
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('userId', userId)
      .eq('permission', permission);
    
    if (error) throw error;
  }
}