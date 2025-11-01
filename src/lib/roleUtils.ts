export const hasRole = (roles: string[] | undefined, role: string): boolean => {
  if (!roles) return false;
  return roles.includes(role);
};
