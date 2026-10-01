import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

export async function updateUserProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<{ data: Profile | null; error: any }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        return { data: data as Profile, error: null };
      }
      if (error) {
        return { data: null, error };
      }
    }
  } catch (err) {
    console.warn('Supabase profile update failed:', err);
    return { data: null, error: err };
  }

  return { data: updates as Profile, error: null };
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: any }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return { url: null, error: uploadError };
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return { url: data.publicUrl, error: null };
    }
  } catch (err) {
    console.warn('Supabase avatar upload failed:', err);
    return { url: null, error: err };
  }

  return { url: null, error: 'Storage not configured' };
}
