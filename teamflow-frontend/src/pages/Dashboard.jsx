import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import { Loader2, CheckCircle2, Clock, Calendar, ArrowRight, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuthStore();

    // Fetch "My Tasks"
    const { data: tasksData, isLoading } = useQuery({
        queryKey: ['my-tasks'],
        queryFn: async () => {
            const res = await axiosInstance.get('/tasks/my-tasks');
            return res.data;
        }
    });

    const myTasks = tasksData?.data || [];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-10">
                <h1 className="text-3xl font-bold text-gray-900">
                    Bonjour, {user?.username} 👋
                </h1>
                <p className="text-gray-500">
                    Voici votre programme pour aujourd'hui.
                </p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Section: My Work Today */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5 text-primary-600" />
                            Mon Travail Aujourd'hui
                        </h2>
                        <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {myTasks.length} En attente
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                        </div>
                    ) : myTasks.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="divide-y divide-gray-50">
                                {myTasks.map((task) => (
                                    <div key={task._id} className="p-5 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                {/* Status Icon */}
                                                <div className="mt-1">
                                                    {task.status === 'IN_PROGRESS' ? (
                                                        <Clock className="w-5 h-5 text-yellow-500" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                        {task.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <span className={`w-2 h-2 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500' :
                                                                task.priority === 'MEDIUM' ? 'bg-orange-400' : 'bg-blue-400'
                                                                }`} />
                                                            {task.priority.toLowerCase()}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            {task.project?.name || 'Projet Inconnu'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Due Date */}
                                            <div className="text-right">
                                                {task.dueDate && (
                                                    <div className={`text-xs font-medium px-2 py-1 rounded-lg ${new Date(task.dueDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                                                        }`}>
                                                        {format(new Date(task.dueDate), 'MMM d')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 border-dashed">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Tout est à jour !</h3>
                            <p className="text-gray-500 mt-1">Aucune tâche en attente ne vous est assignée.</p>
                            <Link to="/projects" className="inline-flex items-center gap-2 mt-4 text-primary-600 font-medium hover:underline">
                                Voir les Projets <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar Section (Stats / Profile) */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">Astuce Pro</h3>
                        <p className="text-primary-100 text-sm mb-4">
                            Utilisez la vue Planning dans vos projets pour organiser efficacement votre semaine.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Statistiques Rapides</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Tâches Assignées</span>
                                <span className="font-mono font-medium">{myTasks.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Haute Priorité</span>
                                <span className="font-mono font-medium text-red-600">
                                    {myTasks.filter(t => t.priority === 'HIGH').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
