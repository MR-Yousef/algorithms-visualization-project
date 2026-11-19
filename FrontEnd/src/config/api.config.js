const API_BASE_URL = "/api/v1";

export const ENDPOINTS = {
    // Accounts
    REGISTER: `${API_BASE_URL}/accounts/register/`,
    LOGIN: `${API_BASE_URL}/accounts/login/`,
    LOGOUT: `${API_BASE_URL}/accounts/logout/`,
    LOGOUT_ALL: `${API_BASE_URL}/accounts/logout-all/`,
    REFRESH: `${API_BASE_URL}/accounts/refresh/`,

    ME: `${API_BASE_URL}/accounts/me/`,
    CHANGE_PASSWORD: `${API_BASE_URL}/accounts/change-password/`,
    DELETE_ACCOUNT: `${API_BASE_URL}/accounts/delete-account/`,

    FORGOT_PASSWORD: `${API_BASE_URL}/accounts/forgot-password/`,
    VERIFY_OTP: `${API_BASE_URL}/accounts/verify-otp/`,
    RESET_PASSWORD: `${API_BASE_URL}/accounts/reset-password/`,

    VERIFY_EMAIL: `${API_BASE_URL}/accounts/verify-email/`,
    RESEND_VERIFICATION_OTP:
        `${API_BASE_URL}/accounts/resend-verification-otp/`,

    USERS: `${API_BASE_URL}/accounts/users/`,
    DELETE_USER: (id) =>
        `${API_BASE_URL}/accounts/users/${id}/delete/`,

    // Algorithms
    ALGORITHMS: `${API_BASE_URL}/algorithms/`,

    ALGORITHM_DETAIL: (id) =>
        `${API_BASE_URL}/algorithms/${id}/`,

    EXECUTE_ALGORITHM: (id) =>
        `${API_BASE_URL}/algorithms/${id}/execute/`,

    SAVE_ALGORITHM: (id) =>
        `${API_BASE_URL}/algorithms/${id}/save/`,

    UNSAVE_ALGORITHM: (id) =>
        `${API_BASE_URL}/algorithms/${id}/unsave/`,

    DOCUMENTATION:
        `${API_BASE_URL}/algorithms/documentation/`,

    DOCUMENTATION_DETAIL: (id) =>
        `${API_BASE_URL}/algorithms/documentation/${id}/`,

    MY_ALGORITHMS:
        `${API_BASE_URL}/algorithms/my/`,

    MY_STATISTICS:
        `${API_BASE_URL}/algorithms/my-statistics/`,

    CREATE_MY_ALGORITHM:
        `${API_BASE_URL}/algorithms/my/create/`,

    DELETE_MY_ALGORITHM: (id) =>
        `${API_BASE_URL}/algorithms/my/${id}/delete/`,

    SAVED:
        `${API_BASE_URL}/algorithms/saved/`,

    STATISTICS:
        `${API_BASE_URL}/algorithms/statistics/`,

    TOPICS:
        `${API_BASE_URL}/algorithms/topics/`,
};

export default API_BASE_URL;