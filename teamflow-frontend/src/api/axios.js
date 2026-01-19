import axios from 'axios';

/**
 * Instance Axios configurée pour TeamFlow
 * CRUCIAL: withCredentials: true pour envoyer les cookies HttpOnly
 */
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // ⚡ CRITIQUE : Permet l'envoi des cookies HttpOnly
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur de requête (optionnel - pour debug)
axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur de réponse (gestion des erreurs)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Gestion spécifique des erreurs 401 (non authentifié)
        if (error.response?.status === 401) {
            // Le store Zustand gèrera la déconnexion si besoin
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
