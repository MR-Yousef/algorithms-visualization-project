import { ENDPOINTS } from "../config/api.config";
import {
    getApiErrorMessage,
    parseResponse,
    unwrapData,
} from "./api.service";

class AuthService {
    static async register(username, email, password) {
        const response = await fetch(ENDPOINTS.REGISTER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        });

        const payload = await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(payload, "Registration failed.")
            );
        }

        return payload;
    }

    static async verifyRegistrationOtp(email, code) {
        const response = await fetch(ENDPOINTS.VERIFY_EMAIL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code }),
        });

        const payload = await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(payload, "Invalid verification code.")
            );
        }

        return payload;
    }

    static async resendVerificationOtp(email) {
        const response = await fetch(ENDPOINTS.RESEND_VERIFICATION_OTP, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        const payload = await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(payload, "Failed to resend verification code.")
            );
        }

        return payload;
    }

    static async login(login, password) {
        const response = await fetch(ENDPOINTS.LOGIN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ login, password }),
        });

        const payload = await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(payload, "Invalid username/email or password.")
            );
        }

        return payload;
    }

    static async getCurrentUser(accessToken) {
        const response = await fetch(ENDPOINTS.ME, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const payload = await parseResponse(response);

        if (response.status === 401) {
            throw new Error("Token expired");
        }

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(payload, "Failed to fetch user profile.")
            );
        }

        return unwrapData(payload) ?? payload;
    }

    static async refreshToken(refreshToken) {
        const response = await fetch(ENDPOINTS.REFRESH, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        const payload = await parseResponse(response);
        const data = unwrapData(payload) ?? payload;

        if (!response.ok || !data?.access) {
            throw new Error(
                getApiErrorMessage(payload, "Token refresh failed.")
            );
        }

        return data;
    }

    static async logout(accessToken, refreshToken) {
        const response = await fetch(ENDPOINTS.LOGOUT, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        const payload = await parseResponse(response);

        if (!response.ok && response.status !== 401) {
            throw new Error(
                getApiErrorMessage(payload, "Logout failed.")
            );
        }

        return payload;
    }

    static async logoutAll(accessToken) {
        const response = await fetch(ENDPOINTS.LOGOUT_ALL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const payload = await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(payload, "Logout from all devices failed.")
            );
        }

        return payload;
    }
}

export default AuthService;
