import { ENDPOINTS } from '../config/api.config';

class AuthService {
    static async register(username, email, password) {
        const response = await fetch(ENDPOINTS.REGISTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        // 👇 Check if response is OK before parsing JSON
        const text = await response.text(); // Get raw text first
        console.log("Register response:", text); // Debug

        try {
            const data = JSON.parse(text); // Try to parse as JSON

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

    static async login(email, password) {
        console.log("Logging in with:", { email }); // Debug

        const response = await fetch(ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const text = await response.text();
        console.log("Login response:", text); // Debug

        try {
            const data = JSON.parse(text);

            if (!response.ok) {
                throw new Error(data.message || data.detail || 'Invalid credentials');
            }

            return data; // { access, refresh }
        } catch (error) {
            if (error.message.includes('JSON')) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            throw error;
        }
    }

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
    static async deleteAccount(accessToken, password) {
        const response = await fetch(ENDPOINTS.DELETE_ACCOUNT, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        const text = await response.text();

        if (!response.ok) {
            try {
                const data = JSON.parse(text);
                throw new Error(data.message || data.detail || 'Failed to delete account');
            } catch (e) {
                if (text) {
                    throw new Error(`Failed to delete account: ${text.substring(0, 100)}`);
                }
                throw new Error('Failed to delete account');
            }
        }

        if (!text) {
            return { status: 'success', message: 'Account deleted successfully' };
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            return { status: 'success', message: 'Account deleted successfully' };
        }
    }
}

export default AuthService;