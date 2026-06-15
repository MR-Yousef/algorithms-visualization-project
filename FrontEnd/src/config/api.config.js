// src/config/api.config.js

// When using Vite proxy (recommended for development)
const API_BASE_URL = '/api/v1';

// Alternative: Direct URL (only if CORS is fixed on backend)
// const API_BASE_URL = 'http://localhost:8000/api/v1';

export const ENDPOINTS = {
    REGISTER: `${API_BASE_URL}/accounts/register/`,
    LOGIN: `${API_BASE_URL}/accounts/login/`,
    REFRESH: `${API_BASE_URL}/accounts/refresh/`,
    ME: `${API_BASE_URL}/accounts/me/`,
    LOGOUT: `${API_BASE_URL}/accounts/logout/`,
    DELETE_ACCOUNT: `${API_BASE_URL}/accounts/delete-account/`,
};

export default API_BASE_URL;