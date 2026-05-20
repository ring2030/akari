/** supabase/seed.sql と一致する固定 ID */

export const DEMO_FACILITY_ID = "11111111-1111-4111-8111-111111111101";

export const DEMO_RESIDENTS = [
  { id: "11111111-1111-4111-8111-111111111201", name: "やすこ" },
  { id: "11111111-1111-4111-8111-111111111202", name: "いちろう" },
  { id: "11111111-1111-4111-8111-111111111203", name: "みち" },
] as const;

export const DEMO_RESIDENT_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
export const DEMO_RESIDENT_PROFILE_RESIDENT_ID =
  "11111111-1111-4111-8111-111111111201";

export const DEMO_CAREGIVER_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
export const DEMO_FAMILY_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3";
