export interface InstagramMediaItem {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
  caption?: string;
  permalink: string;
}

export async function getInstagramMedia(): Promise<InstagramMediaItem[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return [];
  }

  try {
    const url = `https://graph.instagram.com/v22.0/${userId}/media?fields=id,media_type,media_url,thumbnail_url,timestamp,caption,permalink&limit=100&access_token=${token}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error('Instagram API error:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return (data.data as InstagramMediaItem[]) ?? [];
  } catch (err) {
    console.error('Failed to fetch Instagram media:', err);
    return [];
  }
}

export async function refreshInstagramToken(): Promise<{ access_token: string; expires_in: number } | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) return null;

  try {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
