/**
 * akari のロール定義。
 * ring-core の nurse_admin / nurse / viewer は使わない。
 */

export const ROLES = [
  "resident",
  "caregiver",
  "life-counselor",
  "facility-admin",
  "family",
  "doctor",
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
