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
    SAVE_ALGORITHM: (id) => `${API_BASE_URL}/algorithms/${id}/save/`,
    UNSAVE_ALGORITHM: (id) => `${API_BASE_URL}/algorithms/${id}/unsave/`,
    ALGORITHM_DETAIL: (id) => `${API_BASE_URL}/algorithms/${id}/`,
    MY_PUBLISHED: `${API_BASE_URL}/algorithms/my-published/`,
    SAVED: `${API_BASE_URL}/algorithms/saved/`,
    TOPICS: `${API_BASE_URL}/algorithms/topics/`,
    SAVE_ALGORITHM_CLOUD: `${API_BASE_URL}/algorithms/my-algorithms/save/`,
    MY_SAVED_ALGORITHMS: `${API_BASE_URL}/algorithms/algorithms/my/`,
};
export default API_BASE_URL;