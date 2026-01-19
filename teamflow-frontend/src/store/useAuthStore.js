import { create } from 'zustand';
import axiosInstance from '../api/axios';

/**
 * Zustand Store pour l'authentification
 * Gère l'état de connexion et les informations utilisateur
 */
const useAuthStore = create((set) => ({
    // État
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    // Actions

    // Charger l'utilisateur connecté depuis /api/auth/me
    fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/auth/me');
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            console.error('Failed to fetch user:', error);
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to authenticate',
            });
        }
    },

    // Connexion
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/auth/login', {
                email,
                password,
            });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            set({
                error: errorMessage,
                isLoading: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Inscription
    register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/auth/register', {
                username,
                email,
                password,
            });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            set({
                error: errorMessage,
                isLoading: false,
            });
            return { success: false, error: errorMessage };
        }
    },

    // Déconnexion
    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            set({
                user: null,
                isAuthenticated: false,
                error: null,
            });
        }
    },

    // Réinitialiser l'erreur
    clearError: () => set({ error: null }),
}));

export default useAuthStore;
