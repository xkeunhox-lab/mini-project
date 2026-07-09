import { supabase } from "./supabaseClient";

export async function ensureAnonymousSession(): Promise<string> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  if (sessionData.session?.user) {
    return sessionData.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error("익명 로그인에 실패했습니다.");
  return data.user.id;
}
