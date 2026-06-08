const API_BASE = 'https://wallsquat.hellodiane.top/api'

export async function fetchCheckins() {
  const res = await fetch(`${API_BASE}/checkins`)
  if (!res.ok) throw new Error('Failed to fetch checkins')
  const data = await res.json()
  return data.records || {}
}

export async function saveCheckins(records) {
  await fetch(`${API_BASE}/checkins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  })
}

export async function fetchWishlist() {
  const res = await fetch(`${API_BASE}/wishlist`)
  if (!res.ok) throw new Error('Failed to fetch wishlist')
  const data = await res.json()
  return data.items || []
}

export async function saveWishlist(items) {
  await fetch(`${API_BASE}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })
}

export async function fetchMessages() {
  const res = await fetch(`${API_BASE}/messages`)
  if (!res.ok) throw new Error('Failed to fetch messages')
  const data = await res.json()
  return data.messages || []
}

export async function saveMessages(messages) {
  await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
}
