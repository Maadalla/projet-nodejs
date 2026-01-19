import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { Mail, User, Shield } from 'lucide-react';

const Team = () => {
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosInstance.get('/users');
            return res.data;
        }
    });

    const users = usersData?.data || [];

    if (isLoading) {
        return (
            <div className="p-8 text-center text-gray-500">Chargement de l'équipe...</div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-primary-600" />
                Membres de l'équipe
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl flex-shrink-0 overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                user.username.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{user.username}</h3>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {/* Simple role badge if we had roles on user model directly, assuming 'Membre' for now */}
                            <div className="flex items-center gap-1 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Membre
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Team;
