/**
 * Error Middleware - Gestion centralisée des erreurs
 * Renvoie des réponses JSON structurées pour faciliter le débogage
 */

// Middleware pour les routes non trouvées (404)
export const notFound = (req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

// Middleware de gestion globale des erreurs
export const errorHandler = (err, req, res, next) => {
    // Déterminer le code de statut
    const statusCode = err.status || err.statusCode || 500;

    // Logger l'erreur dans la console (utile pour le débogage)
    console.error('❌ Error Handler:', {
        message: err.message,
        statusCode,
        path: req.originalUrl,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Construire la réponse d'erreur
    const errorResponse = {
        success: false,
        message: err.message || 'Internal server error',
        statusCode
    };

    // Ajouter le stack trace en mode développement
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.error = err;
    }

    // Gérer les erreurs spécifiques de Mongoose
    if (err.name === 'ValidationError') {
        errorResponse.message = 'Validation error';
        errorResponse.errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(400).json(errorResponse);
    }

    // Erreur de duplication de clé unique (MongoDB)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        errorResponse.message = `This ${field} is already taken`;
        return res.status(400).json(errorResponse);
    }

    // Erreur de cast (ID invalide)
    if (err.name === 'CastError') {
        errorResponse.message = `Invalid ${err.path}: ${err.value}`;
        return res.status(400).json(errorResponse);
    }

    // Erreur JWT
    if (err.name === 'JsonWebTokenError') {
        errorResponse.message = 'Invalid token';
        return res.status(401).json(errorResponse);
    }

    if (err.name === 'TokenExpiredError') {
        errorResponse.message = 'Token expired';
        return res.status(401).json(errorResponse);
    }

    // Réponse par défaut
    res.status(statusCode).json(errorResponse);
};

// Middleware pour wrapper les fonctions async et gérer les erreurs automatiquement
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
