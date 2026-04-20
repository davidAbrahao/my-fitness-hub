/**
 * Upload de foto de progresso para o bucket `body-photos` (privado).
 * Path: {user_id}/{date}-{timestamp}.{ext}
 * Retorna a URL assinada (válida por 1 ano) para exibição.
 */
import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'body-photos';
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 ano

export async function uploadBodyPhoto(
  userId: string,
  date: string,
  file: File
): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/${date}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;
  const { data, error: urlErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (urlErr || !data) throw urlErr ?? new Error('Falha ao gerar URL');
  return data.signedUrl;
}

/** Reassina uma URL armazenada (caso expire). Aceita path puro ou URL antiga. */
export async function refreshSignedUrl(pathOrUrl: string): Promise<string> {
  // Tenta extrair o path se já for URL assinada
  const match = pathOrUrl.match(/\/object\/sign\/body-photos\/([^?]+)/);
  const path = match ? decodeURIComponent(match[1]) : pathOrUrl;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data) throw error ?? new Error('Falha ao reassinar URL');
  return data.signedUrl;
}
