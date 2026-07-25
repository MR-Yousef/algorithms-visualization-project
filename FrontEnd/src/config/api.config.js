// src/config/api.config.js
const API_BASE_URL = '/api/v1';

export const ENDPOINTS = {
    REGISTER: `${API_BASE_URL}/accounts/register/`,
    LOGIN: `${API_BASE_URL}/accounts/login/`,
    REFRESH: `${API_BASE_URL}/accounts/refresh/`,
    ME: `${API_BASE_URL}/accounts/me/`,
    LOGOUT: `${API_BASE_URL}/accounts/logout/`,
    DELETE_ACCOUNT: `${API_BASE_URL}/accounts/delete-account/`,
    CHANGE_PASSWORD: `${API_BASE_URL}/accounts/change-password/`,
    FORGOT_PASSWORD: `${API_BASE_URL}/accounts/forgot-password/`,
    VERIFY_OTP: `${API_BASE_URL}/accounts/verify-otp/`,
    RESET_PASSWORD: `${API_BASE_URL}/accounts/reset-password/`,
    ALGORITHMS: `${API_BASE_URL}/algorithms/`,
    DOCUMENTATION: `${API_BASE_URL}/algorithms/documentation/`,
    MY_PUBLISHED: `${API_BASE_URL}/algorithms/my-published/`,
    SAVED: `${API_BASE_URL}/algorithms/saved/`,

};
export default API_BASE_URL;