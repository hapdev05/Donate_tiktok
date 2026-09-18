export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://lightbox-supplied-myspace-screens.trycloudflare.com';

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'wss://lightbox-supplied-myspace-screens.trycloudflare.com';

export interface StreamerProfile {
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  bank: {
    bankId: string;
    accountNumber: string;
    accountName: string;
  };
  overlayToken?: string;
}

export interface DonateSessionData {
  sessionCode: string;
  displayName: string;
  message: string | null;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrCodeUrl: string;
  expiresAt: string;
}

export interface SessionStatus {
  sessionCode: string;
  status: 'PENDING' | 'SUCCESS' | 'EXPIRED';
  actualAmount: number | null;
  paidAt: string | null;
}

export async function fetchStreamer(slug: string): Promise<StreamerProfile> {
  const res = await fetch(`${API_BASE_URL}/api/v1/streamers/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không tìm thấy thông tin Streamer');
  const json = await res.json();
  return json.data;
}

export async function createDonateSession(slug: string, displayName: string, message: string): Promise<DonateSessionData> {
  const res = await fetch(`${API_BASE_URL}/api/v1/sessions/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamerSlug: slug,
      displayName,
      message: message || undefined,
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Lỗi khi tạo phiên donate');
  }
  const json = await res.json();
  return json.data;
}

export async function checkSessionStatus(sessionCode: string): Promise<SessionStatus> {
  const res = await fetch(`${API_BASE_URL}/api/v1/sessions/check/${sessionCode}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Lỗi kiểm tra trạng thái phiên');
  const json = await res.json();
  return json.data;
}

export async function triggerTestAlert(slug: string, displayName: string, amount: number, message: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/test-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamerSlug: slug,
      displayName,
      amount,
      message,
    }),
  });
  return res.json();
}

export async function fetchRecentSessions(slug: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/sessions/${slug}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data;
}
