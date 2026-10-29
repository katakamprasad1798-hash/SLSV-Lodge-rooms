// API Service with Automatic Standalone Offline Fallback
// Guarantees the SLSV Lodge APK always functions without failing to fetch.

import { localDb } from './localDb';

export const DEFAULT_SERVER_URL = 'https://outreach-mental-assure-steering.trycloudflare.com/api';

export const isCapacitor = typeof window !== 'undefined' && (
  window.location.protocol === 'capacitor:' ||
  window.location.protocol === 'ionic:' ||
  window.location.protocol === 'file:' ||
  (typeof window.Capacitor !== 'undefined' && Boolean(window.Capacitor.isNativePlatform?.()))
);

let isUsingOfflineDb = false;

export function getIsOffline() {
  return isUsingOfflineDb;
}

export function getApiBase() {
  const savedServerUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('slsv_custom_api_url') : null;
  // If the saved URL is an old local LAN IP, ignore and clear it so mobile app connects cleanly
  if (savedServerUrl && (savedServerUrl.includes('10.205.') || savedServerUrl.includes('192.168.') || savedServerUrl.includes('127.0.0.1') || savedServerUrl.includes('localhost:8000'))) {
    try { localStorage.removeItem('slsv_custom_api_url'); } catch (e) {}
  }
  const customApiUrl = import.meta.env.VITE_API_URL || (savedServerUrl && !savedServerUrl.includes('10.205.') ? savedServerUrl : null);
  if (customApiUrl) {
    return customApiUrl.replace(/\/$/, '');
  }
  return isCapacitor ? DEFAULT_SERVER_URL : '/api';
}

export function setApiBase(url) {
  if (typeof localStorage !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('slsv_custom_api_url', url.trim().replace(/\/$/, ''));
    } else {
      localStorage.removeItem('slsv_custom_api_url');
    }
  }
}

async function fetchJson(url, options = {}) {
  const apiBase = getApiBase();
  const controller = new AbortController();
  // 3 second timeout for quick fallback to local DB on mobile
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 3000);

  let response;
  try {
    response = await fetch(`${apiBase}${url}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  } catch (networkErr) {
    throw new Error(`Server unreachable at ${apiBase}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let errorDetail = 'API Request failed';
    try {
      const errorData = await response.json();
      if (typeof errorData.detail === 'string') {
        errorDetail = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorDetail = errorData.detail.map(e => `${e.loc ? e.loc.join('.') : 'field'}: ${e.msg}`).join(', ');
      } else if (errorData.detail) {
        errorDetail = JSON.stringify(errorData.detail);
      } else {
        errorDetail = JSON.stringify(errorData);
      }
    } catch (e) {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// Executes a server request with automatic seamless fallback to local standalone database
async function withFallback(serverCall, localCall) {
  try {
    const res = await serverCall();
    isUsingOfflineDb = false;
    return res;
  } catch (err) {
    console.info('[SLSV Lodge] Operating in Standalone Mode via Local Engine:', err.message);
    isUsingOfflineDb = true;
    return await localCall();
  }
}

export const api = {
  // Stats
  getStats: () => withFallback(() => fetchJson('/stats'), () => localDb.getStats()),

  // Rooms
  getRooms: (status, category) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return withFallback(() => fetchJson(`/rooms${query}`), () => localDb.getRooms(status, category));
  },

  getRoom: (id) => withFallback(() => fetchJson(`/rooms/${id}`), () => localDb.getRoom(id)),

  createRoom: (roomData) =>
    withFallback(
      () => fetchJson('/rooms', { method: 'POST', body: JSON.stringify(roomData) }),
      () => localDb.createRoom(roomData)
    ),

  updateRoom: (id, roomData) =>
    withFallback(
      () => fetchJson(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(roomData) }),
      () => localDb.updateRoom(id, roomData)
    ),

  updateRoomStatus: (id, status) =>
    withFallback(
      () => fetchJson(`/rooms/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' }),
      () => localDb.updateRoomStatus(id, status)
    ),

  deleteRoom: (id) =>
    withFallback(
      () => fetchJson(`/rooms/${id}`, { method: 'DELETE' }),
      () => localDb.deleteRoom(id)
    ),

  // Bookings
  getBookings: (status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return withFallback(() => fetchJson(`/bookings${query}`), () => localDb.getBookings(status));
  },

  getBooking: (id) => withFallback(() => fetchJson(`/bookings/${id}`), () => localDb.getBooking(id)),

  createBooking: (bookingData) =>
    withFallback(
      () => fetchJson('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
      () => localDb.createBooking(bookingData)
    ),

  addServiceCharge: (bookingId, title, amount, category = 'Food/Service') => {
    const params = new URLSearchParams({ title, amount: amount.toString(), category });
    return withFallback(
      () => fetchJson(`/bookings/${bookingId}/services?${params.toString()}`, { method: 'POST' }),
      () => localDb.addServiceCharge(bookingId, title, amount, category)
    );
  },

  checkOut: (bookingId, checkoutData) =>
    withFallback(
      () => fetchJson(`/bookings/${bookingId}/checkout`, { method: 'POST', body: JSON.stringify(checkoutData) }),
      () => localDb.checkOut(bookingId, checkoutData)
    ),

  // Invoices
  getInvoices: (search, paymentMethod) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (paymentMethod) params.append('payment_method', paymentMethod);
    const query = params.toString() ? `?${params.toString()}` : '';
    return withFallback(() => fetchJson(`/invoices${query}`), () => localDb.getInvoices(search, paymentMethod));
  },

  getInvoice: (id) => withFallback(() => fetchJson(`/invoices/${id}`), () => localDb.getInvoice(id)),

  createInvoice: (invoiceData) =>
    withFallback(
      () => fetchJson('/invoices', { method: 'POST', body: JSON.stringify(invoiceData) }),
      () => localDb.createInvoice(invoiceData)
    ),

  updateInvoice: (id, invoiceData) =>
    withFallback(
      () => fetchJson(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(invoiceData) }),
      () => localDb.updateInvoice(id, invoiceData)
    ),

  deleteInvoice: (id) =>
    withFallback(
      () => fetchJson(`/invoices/${id}`, { method: 'DELETE' }),
      () => localDb.deleteInvoice(id)
    ),

  // Settings
  getSettings: () => withFallback(() => fetchJson('/settings'), () => localDb.getSettings()),

  updateSettings: (settingsData) =>
    withFallback(
      () => fetchJson('/settings', { method: 'POST', body: JSON.stringify(settingsData) }),
      () => localDb.updateSettings(settingsData)
    ),

  // Authentication
  login: (credentials) =>
    withFallback(
      () => fetchJson('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
      () => localDb.login(credentials)
    ),

  register: (userData) =>
    withFallback(
      () => fetchJson('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
      () => localDb.register(userData)
    ),

  // Server URL Configuration
  getApiBase,
  setApiBase,
  getIsOffline: () => isUsingOfflineDb,
};
