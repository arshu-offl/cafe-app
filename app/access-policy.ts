export type Role = 'customer' | 'manager' | 'admin';
export type Surface = Role;
export function roleHome(role: Role) { return role === 'customer' ? '/' : `/${role}`; }
export function canAccessSurface(role: Role, surface: string): surface is Surface {
  return role === surface;
}
export function canPerform(role: Role, action: string) {
  const actions: Record<Role, string[]> = {
    customer: ['order'],
    manager: ['item', 'status'],
    admin: ['settings', 'status'],
  };
  return actions[role].includes(action);
}
