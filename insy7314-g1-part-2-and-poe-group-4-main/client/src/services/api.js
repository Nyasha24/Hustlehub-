const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000');

export const getToken = () => {
  return sessionStorage.getItem('token');
};

export const saveAuth = (token, user) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

export const getSavedUser = () => {
  const user = sessionStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const apiRequest = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

// Authentication Methods
export const loginUser = (email, password) => {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const registerUser = (fullName, email, password, role) => {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password, role })
  });
};

export const googleLoginUser = (idToken, role) => {
  return apiRequest('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken, role })
  });
};

export const fetchAllUsers = async () => {
  const res = await apiRequest('/api/auth/users');
  return Array.isArray(res) ? res : (res.data || []);
};

// Gigs Methods
export const fetchGigs = async () => {
  const res = await apiRequest('/api/gigs');
  return Array.isArray(res) ? res : (res.data || []);
};

export const createGig = (gigData) => {
  return apiRequest('/api/gigs', {
    method: 'POST',
    body: JSON.stringify(gigData)
  });
};

export const deleteGig = (gigId) => {
  return apiRequest(`/api/gigs/${gigId}`, {
    method: 'DELETE'
  });
};

// Bookings Methods
export const fetchBookings = async () => {
  const res = await apiRequest('/api/bookings');
  return Array.isArray(res) ? res : (res.data || []);
};

export const createBooking = (gigId, requirements) => {
  return apiRequest('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ gigId, requirements })
  });
};

export const updateBookingStatus = (bookingId, status) => {
  return apiRequest(`/api/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

// Transactions & Financials
export const fetchTransactions = async () => {
  const res = await apiRequest('/api/transactions');
  return Array.isArray(res) ? res : (res.data || []);
};

export const fetchFreelancerIncome = async () => {
  const res = await apiRequest('/api/transactions/freelancer-income');
  return res.data || res;
};