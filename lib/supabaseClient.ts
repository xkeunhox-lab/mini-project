import { createClient } from "@supabase/supabase-js";

// supabase-info.md 기준 프로젝트 자격증명을 소스코드에 직접 하드코딩합니다.
// Publishable Key는 RLS 정책으로 보호되는 클라이언트 공개 키이며 service_role 키가 아니므로
// 프런트엔드 번들에 포함되어도 안전하도록 설계되어 있습니다.
const SUPABASE_PROJECT_ID = "vmdathlgogmxxymbwieu";
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7ucoB48vF9z3RWEdh7Jc6Q_hKuYLqQr";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
