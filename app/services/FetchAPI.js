import { supabase } from '../../lib/supabaseClient';

export async function apiFetch(path, options = {}) {
  try {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `/api${cleanPath}`;

    // Récupérer le token Supabase à la volée
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || null;
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };


    const response = await fetch(url, { ...options, headers });

    // Gérer ici les erreurs si besoin (401 par exemple)

    return response;

  } catch (error) {
    throw error;
  }
}

export function getPhotoUrl(photoUrl) {
  return photoUrl || 'https://ik.imagekit.io/csooo1xpoo/users/default.png';
}
