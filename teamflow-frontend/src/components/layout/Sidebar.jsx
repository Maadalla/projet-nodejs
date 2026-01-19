import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, User, Users, Settings } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const navigation = [
        { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
        { name: 'Projets', href: '/projects', icon: FolderKanban },
        { name: 'Équipe', href: '/team', icon: Users },
        { name: 'Paramètres', href: '/settings', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-dark-900 text-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-dark-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">Collaboration Plateforme</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${active
                                    ? 'bg-primary-600 text-white'
                                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                                }
              `}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-dark-700">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="w-full h-full rounded-full"
                            />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.username || 'User'}
                        </p>
                        <p className="text-xs text-dark-400 truncate">
                            {user?.email || ''}
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition-all"
                >
                    <LogOut size={18} />
                    <span className="font-medium">Déconnexion</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
