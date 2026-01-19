import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * AuthController - Gestion complète de l'authentification
 * Utilise JWT avec HttpOnly Cookies pour la sécurité
 */

// Fonction utilitaire pour générer un JWT
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token valide 7 jours
    );
};

// Fonction utilitaire pour définir le cookie
const setCookieToken = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,        // Protection XSS - Le cookie n'est pas accessible en JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS en production
        sameSite: 'lax',       // Protection CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours en millisecondes
    });
};

// POST /api/auth/register - Inscription d'un nouvel utilisateur
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation des champs
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email and password'
            });
        }

        // Validation du mot de passe (minimum 6 caractères)
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({
                success: false,
                message: `This ${field} is already taken`
            });
        }

        // Hasher le mot de passe avec bcrypt
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Créer l'utilisateur (avatarUrl sera généré automatiquement par le modèle)
        const user = new User({
            username,
            email,
            passwordHash
        });

        await user.save();

        // Générer le token JWT
        const token = generateToken(user._id);

        // Définir le cookie HttpOnly
        setCookieToken(res, token);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during registration',
            error: error.message
        });
    }
};

// POST /api/auth/login - Connexion d'un utilisateur
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Trouver l'utilisateur (incluant le passwordHash pour la vérification)
        const user = await User.findOne({ email }).select('+passwordHash');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Générer le token JWT
        const token = generateToken(user._id);

        // Définir le cookie HttpOnly
        setCookieToken(res, token);

        // Ne pas renvoyer le passwordHash
        user.passwordHash = undefined;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
};

// GET /api/auth/me - Récupérer l'utilisateur connecté
export const getMe = async (req, res) => {
    try {
        // req.user est défini par le middleware protect
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl
            }
        });

    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};

// POST /api/auth/logout - Déconnexion
export const logout = async (req, res) => {
    try {
        // Supprimer le cookie en le définissant avec une date d'expiration passée
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        });

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout',
            error: error.message
        });
    }
};
