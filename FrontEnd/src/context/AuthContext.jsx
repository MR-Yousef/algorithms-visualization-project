import { createContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/auth.service';

// Create the authentication context
export const AuthContext = createContext(null);

/**
 * Provides authentication state and actions to the entire application.
 * Manages user data, tokens (access & refresh), and login/logout flows.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ---------- Stable storage helpers ----------

    /** Returns localStorage if "remember me" is true, otherwise sessionStorage. */
    const getStorage = useCallback(() => {
        const rememberMe = localStorage.getItem('remember_me') === 'true';
        return rememberMe ? localStorage : sessionStorage;
    }, []);

    /** Retrieves the access token from the appropriate storage. */
    const getAccessToken = useCallback(
        () => getStorage().getItem('access_token'),
        [getStorage]
    );

    /** Retrieves the refresh token from the appropriate storage. */
    const getRefreshToken = useCallback(
        () => getStorage().getItem('refresh_token'),
        [getStorage]
    );

    /**
     * Stores access and refresh tokens, and persists the "remember me" preference.
     * @param {string} access - Access token
     * @param {string} refresh - Refresh token
     * @param {boolean} rememberMe - Whether to persist tokens across browser sessions
     */
    const setTokens = useCallback((access, refresh, rememberMe = false) => {
        localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('access_token', access);
        storage.setItem('refresh_token', refresh);
    }, []);

    /** Removes all stored tokens and remembered settings from both storages. */
    const clearTokens = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('remember_me');
        localStorage.removeItem('remembered_email');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
    }, []);

    // ---------- Initial user loading (runs once on mount) ----------

    useEffect(() => {
        let cancelled = false; // Prevents state update if component unmounts

        const loadUser = async () => {
            const token = getAccessToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await AuthService.getCurrentUser(token);
                if (!cancelled) setUser(userData);
            } catch (error) {
                // Token may be expired – attempt to refresh it
                const refreshToken = getRefreshToken();
                if (refreshToken && !cancelled) {
                    try {
                        const data = await AuthService.refreshToken(refreshToken);
                        // Store the new access token in the same storage type
                        const storage = getStorage();
                        storage.setItem('access_token', data.access);
                        const userData = await AuthService.getCurrentUser(data.access);
                        if (!cancelled) setUser(userData);
                    } catch (refreshError) {
                        // Refresh failed – clear everything
                        if (!cancelled) {
                            clearTokens();
                            setUser(null);
                        }
                    }
                } else {
                    // No refresh token available
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
    }, []); // Runs only once on mount (empty dependency array)

    // ---------- Auth actions ----------

    /**
     * Authenticates the user, stores tokens, fetches the full user profile,
     * and updates the context state.
     */
    const login = useCallback(async (login, password, rememberMe = false) => {
        setError(null);
        try {
            const response = await AuthService.login(login, password);
            const { access, refresh, user } = response.data;
            setTokens(access, refresh, rememberMe);

            // Fetch the complete user profile (includes bio, avatar, etc.)
            const fullUser = await AuthService.getCurrentUser(access);
            setUser(fullUser);

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, [setTokens]);

    /** Registers a new user. */
    const register = useCallback(async (username, email, password) => {
        setError(null);
        try {
            await AuthService.register(username, email, password);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    /** Logs out the user, clears tokens, and resets user state. */
    const logout = useCallback(async () => {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();
        if (accessToken && refreshToken) {
            try {
                await AuthService.logout(accessToken, refreshToken);
            } catch (err) {
                console.error('Logout error:', err);
            }
        }
        clearTokens();
        setUser(null);
    }, [getAccessToken, getRefreshToken, clearTokens]);

    /** Partially updates the current user object (e.g., after profile edit). */
    const updateUser = useCallback((updatedFields) => {
        setUser(prev => prev ? { ...prev, ...updatedFields } : null);
    }, []);

    // Expose everything through the context value
    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        getAccessToken,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}