import {
    createContext,
    useCallback,
    useEffect,
    useState,
} from "react";
import AuthService from "../services/auth.service";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getStorage = useCallback(() => {
        const rememberMe = localStorage.getItem("remember_me") === "true";
        return rememberMe ? localStorage : sessionStorage;
    }, []);

    const getAccessToken = useCallback(() => {
        const preferred = getStorage();
        const secondary = preferred === localStorage ? sessionStorage : localStorage;
        return preferred.getItem("access_token") || secondary.getItem("access_token");
    }, [getStorage]);

    const getRefreshToken = useCallback(() => {
        const preferred = getStorage();
        const secondary = preferred === localStorage ? sessionStorage : localStorage;
        return preferred.getItem("refresh_token") || secondary.getItem("refresh_token");
    }, [getStorage]);

    const setTokens = useCallback((access, refresh, rememberMe = false) => {
        localStorage.setItem("remember_me", rememberMe ? "true" : "false");

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("access_token", access);
        storage.setItem("refresh_token", refresh);
    }, []);

    const clearTokens = useCallback(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("remember_me");
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_ID");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadUser = async () => {
            const accessToken = getAccessToken();

            if (!accessToken) {
                if (!cancelled) setLoading(false);
                return;
            }

            try {
                const userData = await AuthService.getCurrentUser(accessToken);
                if (!cancelled) setUser(userData);
            } catch {
                const refreshToken = getRefreshToken();

                if (!refreshToken) {
                    if (!cancelled) {
                        clearTokens();
                        setUser(null);
                    }
                    return;
                }

                try {
                    const refreshed = await AuthService.refreshToken(refreshToken);
                    const storage = getStorage();
                    storage.setItem("access_token", refreshed.access);

                    const userData = await AuthService.getCurrentUser(refreshed.access);
                    if (!cancelled) setUser(userData);
                } catch {
                    if (!cancelled) {
                        clearTokens();
                        setUser(null);
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadUser();

        return () => {
            cancelled = true;
        };
    }, [clearTokens, getAccessToken, getRefreshToken, getStorage]);

    const login = useCallback(async (loginValue, password, rememberMe = false) => {
        setError(null);

        try {
            const response = await AuthService.login(loginValue, password);
            const data = response?.data ?? response;
            const access = data?.access;
            const refresh = data?.refresh;

            if (!access || !refresh) {
                throw new Error("Login response did not contain access and refresh tokens.");
            }

            setTokens(access, refresh, rememberMe);

            const fullUser = await AuthService.getCurrentUser(access);
            setUser(fullUser);

            return {
                success: true,
                data: fullUser,
            };
        } catch (err) {
            setError(err.message);
            return {
                success: false,
                error: err.message,
            };
        }
    }, [setTokens]);

    const register = useCallback(async (username, email, password) => {
        setError(null);

        try {
            const data = await AuthService.register(username, email, password);
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    const verifyRegistrationOtp = useCallback(async (email, code) => {
        setError(null);

        try {
            const data = await AuthService.verifyRegistrationOtp(email, code);
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    const resendVerificationOtp = useCallback(async (email) => {
        setError(null);

        try {
            const data = await AuthService.resendVerificationOtp(email);
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    const logout = useCallback(async () => {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (accessToken && refreshToken) {
            try {
                await AuthService.logout(accessToken, refreshToken);
            } catch (err) {
                console.error("Logout error:", err);
            }
        }

        clearTokens();
        setUser(null);
    }, [clearTokens, getAccessToken, getRefreshToken]);

    const logoutAll = useCallback(async () => {
        const accessToken = getAccessToken();

        if (accessToken) {
            try {
                await AuthService.logoutAll(accessToken);
            } catch (err) {
                console.error("Logout-all error:", err);
            }
        }

        clearTokens();
        setUser(null);
    }, [clearTokens, getAccessToken]);

    const updateUser = useCallback((updatedFields) => {
        setUser((previous) => previous
            ? { ...previous, ...updatedFields }
            : null
        );
    }, []);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: Boolean(user),
        login,
        register,
        verifyRegistrationOtp,
        resendVerificationOtp,
        logout,
        logoutAll,
        getAccessToken,
        getRefreshToken,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
