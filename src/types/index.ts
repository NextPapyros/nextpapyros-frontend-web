export const Role = {
  Admin: "Admin",
  Employee: "Employee",
} as const;
export type Role = (typeof Role)[keyof typeof Role];
