// API layer — matches existing Cloudflare Worker blob-style API
// Pattern: GET reads full collection → client modifies → POST writes full collection back
const API = '/wallsquat/api';

// ── Checkins ──────────────────────────────────────────────────
// Data shape: { "YYYY-MM-DD": { duration: number, userId: number }, ... }

export async function fetchCheckins() {
  const res = await fetch(`${API}/checkins`);
  if (!res.ok) throw new Error('Failed to fetch checkins');
  const data = await res.json();
  return data.records || {};
}

export async function saveCheckins(records) {
  const res = await fetch(`${API}/checkins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  });
  if (!res.ok) throw new Error('Failed to save checkins');
  return res.json();
}

// ── Wishlist ──────────────────────────────────────────────────
// Data shape: [{ id, content, userId, category, createdAt }, ...]

export async function fetchWishlist() {
  const res = await fetch(`${API}/wishlist`);
  if (!res.ok) throw new Error('Failed to fetch wishlist');
  const data = await res.json();
  return data.items || [];
}

export async function saveWishlist(items) {
  const res = await fetch(`${API}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('Failed to save wishlist');
  return res.json();
}

// ── Messages ──────────────────────────────────────────────────
// Data shape: [{ id, content, user, createdAt }, ...]

export async function fetchMessages() {
  const res = await fetch(`${API}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  const data = await res.json();
  return data.messages || [];
}

export async function saveMessages(messages) {
  const res = await fetch(`${API}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error('Failed to save messages');
  return res.json();
}

// ── Utilities ─────────────────────────────────────────────────

let _counter = 0;
export function uid() {
  _counter += 1;
  return `${Date.now()}-${_counter}-${Math.random().toString(36).slice(2, 8)}`;
}
