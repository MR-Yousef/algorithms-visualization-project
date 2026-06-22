// src/services/auth.service.js
// Centralized HTTP requests for authentication endpoints.
import { ENDPOINTS } from '../config/api.config';

class AuthService {

    /**
     * Registers a new user.
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @returns {Promise<object>} Response data on success
     */
    static async register(username, email, password) {
        const response = await fetch(ENDPOINTS.REGISTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const text = await response.text();
        console.log("Register response:", text);

        try {
            const data = JSON.parse(text);
            if (!response.ok) {
                throw new Error(data.message || data.detail || 'Registration failed');
            }
            return data;
        } catch (error) {
            if (error.message.includes('JSON')) {
                throw new Error(`Server returned invalid response: ${text.substring(0, 100)}`);
            }
            throw error;
        }
    }

    /**
     * Authenticates a user.
     * @param {string} login - username or email
     * @param {string} password
     * @returns {Promise<object>} Object containing access, refresh tokens and user data
     */
    static async login(login, password) {
        console.log("Logging in with:", { login });

        const response = await fetch(ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password }),
        });

        const text = await response.text();
        console.log("Login response:", text);

        try {
            const data = JSON.parse(text);
            if (!response.ok) {
                throw new Error(data.message || data.detail || 'Invalid credentials');
            }
            return data;
        } catch (error) {
            if (error.message.includes('JSON')) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            throw error;
        }
    }

    /**
     * Fetches the currently authenticated user's profile.
     * @param {string} accessToken
     * @returns {Promise<object>} User profile data
     */
    static async getCurrentUser(accessToken) {
        const response = await fetch(ENDPOINTS.ME, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const text = await response.text();
        console.log("Get user response:", text);

        if (response.status === 401) {
            throw new Error('Token expired');
        }

        const data = JSON.parse(text);
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch user');
        }
        return data;
    }

    /**
     * Obtains a new access token using a refresh token.
     * @param {string} refreshToken
     * @returns {Promise<object>} New access token data
     */
    static async refreshToken(refreshToken) {
        const response = await fetch(ENDPOINTS.REFRESH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        const text = await response.text();
        const data = JSON.parse(text);
        if (!response.ok) {
            throw new Error('Token refresh failed');
        }
        return data;
    }

    /**
     * Logs out the user by invalidating the refresh token.
     * @param {string} accessToken
     * @param {string} refreshToken
     * @returns {Promise<object>} Logout confirmation
     */
    static async logout(accessToken, refreshToken) {
        const response = await fetch(ENDPOINTS.LOGOUT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        const text = await response.text();
        return JSON.parse(text);
    }
}

export default AuthService;