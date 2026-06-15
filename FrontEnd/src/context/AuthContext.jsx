import { createContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/auth.service';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get storage type based on remember me
    const getStorage = () => {
        const rememberMe = localStorage.getItem('remember_me') === 'true';
        return rememberMe ? localStorage : sessionStorage;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getAccessToken = useCallback(() => getStorage().getItem('access_token'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getRefreshToken = useCallback(() => getStorage().getItem('refresh_token'));

    // Save tokens with rememberMe option
    const setTokens = (access, refresh, rememberMe = false) => {
        // Save remember preference
        localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');

        if (rememberMe) {
            // Remember Me = localStorage (persists)
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
        } else {
            // No Remember Me = sessionStorage (cleared when browser closes)
            sessionStorage.setItem('access_token', access);
            sessionStorage.setItem('refresh_token', refresh);
        }
    };

    // Clear tokens from BOTH storages
    const clearTokens = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('remember_me');
        localStorage.removeItem('remembered_email');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
    };

    const isAuthenticated = !!getAccessToken();

    // Load user on app start
    useEffect(() => {
        const loadUser = async () => {
            const token = getAccessToken();

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await AuthService.getCurrentUser(token);
                setUser(userData);
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    try {
                        const data = await AuthService.refreshToken(refreshToken);
                        // Save new access token to the same storage
                        const storage = getStorage();
                        storage.setItem('access_token', data.access);
                        const userData = await AuthService.getCurrentUser(data.access);
                        setUser(userData);
                        // eslint-disable-next-line no-unused-vars
                    } catch (refreshError) {
                        clearTokens();
                        setUser(null);
                    }
                } else {
                    clearTokens();
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [getAccessToken, getRefreshToken]);

    // Login now accepts rememberMe parameter
    const login = useCallback(async (email, password, rememberMe = false) => {
        setError(null);
        try {
            const data = await AuthService.login(email, password);
            setTokens(data.access, data.refresh, rememberMe);
            const userData = await AuthService.getCurrentUser(data.access);
            setUser(userData);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        }
    }, []);

    const register = useCallback(async (username, email, password) => {
        setError(null);
        try {
            await AuthService.register(username, email, password);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        }
    }, []);

    const logout = useCallback(async () => {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (accessToken && refreshToken) {
            try {
                await AuthService.logout(accessToken, refreshToken);
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        clearTokens();
        setUser(null);
    }, [getAccessToken, getRefreshToken]);

    const deleteAccount = useCallback(async (password) => {
        const accessToken = getAccessToken();

        try {
            await AuthService.deleteAccount(accessToken, password);
            clearTokens();
            setUser(null);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }, [getAccessToken]);

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        getAccessToken,
        deleteAccount,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}