import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Save, Loader2, Lock, Mail } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { toast } from 'sonner';

const Settings = () => {
    const { user, fetchUser } = useAuthStore();

    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        avatarUrl: user?.avatarUrl || '',
        password: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl
            }));
        }
    }, [user]);

    const updateProfileMutation = useMutation({
        mutationFn: (data) => axiosInstance.put('/users/profile', data),
        onSuccess: (response) => {
            toast.success("Profil mis à jour avec succès");
            fetchUser(); // Refresh user in store
            setFormData(prev => ({ ...prev, password: '' })); // Clear password
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Erreur lors de la mise à jour");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) delete dataToUpdate.password;

        updateProfileMutation.mutate(dataToUpdate);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-primary-600" />
                Paramètres
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    Mon Profil
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'Avatar</label>
                            <input
                                type="url"
                                value={formData.avatarUrl}
                                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="https://..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Laissez vide pour l'avatar par défaut.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Username */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1 pt-4 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700">Nouveau Mot de Passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Laisser vide pour ne pas changer"
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    TeamFlow v2.1 - Plateforme de Collaboration
                </div>
            </div>
        </div>
    );
};

export default Settings;
