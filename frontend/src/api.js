// API services - uses Spring Boot backend at /api
const API_BASE = ''

export async function fetchRatings() {
  try {
    const res = await fetch(`${API_BASE}/api/ratings`)
    if (!res.ok) return null
    const data = await res.json()
    return {
      average: data.average || 0,
      total: data.total || 0,
      distribution: data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentRatings: (data.recentRatings || []).map(r => ({
        stars: r.stars,
        client_name: r.client_name,
        review_text: r.review_text,
      })),
    }
  } catch (e) {
    return null
  }
}

export async function submitRating(stars, clientName = '', reviewText = '') {
  try {
    const res = await fetch(`${API_BASE}/api/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stars: parseInt(stars), clientName: clientName.trim(), reviewText: reviewText.trim() }),
    })
    const data = await res.json()
    return data.success ? { success: true } : { success: false, error: data.error || 'Failed' }
  } catch (e) {
    return { success: false, error: 'Could not connect' }
  }
}

export async function submitContact(name, email, phone, message) {
  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone: phone || '', message }),
    })
    const data = await res.json()
    return data.success ? { success: true } : { success: false, error: data.error || 'Failed' }
  } catch (e) {
    return { success: false, error: 'Could not connect' }
  }
}

export async function submitBooking(data) {
  try {
    const res = await fetch(`${API_BASE}/api/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    return result.success ? { success: true } : { success: false, error: result.error || 'Failed' }
  } catch (e) {
    return { success: false, error: 'Backend not available' }
  }
}

// Google Reviews
export async function fetchGoogleReviews() {
  try {
    const res = await fetch(`${API_BASE}/api/google-reviews`)
    if (!res.ok) return { reviews: [], configured: false }
    return res.json()
  } catch (e) {
    return { reviews: [], configured: false }
  }
}

// Payment
export async function fetchPaymentConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/payment/config`)
    if (!res.ok) return { enabled: false }
    return res.json()
  } catch (e) {
    return { enabled: false }
  }
}

export async function createPaymentOrder(bookingData) {
  try {
    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
    return res.json()
  } catch (e) {
    return { error: 'Payment service unavailable' }
  }
}

export async function verifyPayment(data) {
  try {
    const res = await fetch(`${API_BASE}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  } catch (e) {
    return { success: false, error: 'Verification failed' }
  }
}

// Admin API - requires X-Admin-Password header
function adminHeaders(password) {
  return { 'X-Admin-Password': password || '' }
}

export async function fetchAdminRatings(password) {
  const res = await fetch(`${API_BASE}/api/admin/ratings`, { headers: adminHeaders(password) })
  if (res.status === 401) return { unauthorized: true }
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export async function fetchAdminContacts(password) {
  const res = await fetch(`${API_BASE}/api/admin/contacts`, { headers: adminHeaders(password) })
  if (res.status === 401) return { unauthorized: true }
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export async function fetchAdminBookings(password) {
  const res = await fetch(`${API_BASE}/api/admin/bookings`, { headers: adminHeaders(password) })
  if (res.status === 401) return { unauthorized: true }
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
