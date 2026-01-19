import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTasks } from '../../hooks/useTasks';
import { Loader2, PieChart as PieIcon, BarChart3, AlertCircle } from 'lucide-react';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
                <p className="font-semibold text-gray-900">{label ? label : payload[0].name}</p>
                <p className="text-primary-600 font-medium">
                    {payload[0].value} Tâches
                </p>
            </div>
        );
    }
    return null;
};

const ProjectAnalytics = ({ projectId }) => {
    const { tasks, isLoading } = useTasks(projectId);

    const stats = useMemo(() => {
        if (!tasks) return { statusData: [], memberData: [] };

        // 1. Status Distribution
        const statusCounts = tasks.reduce((acc, task) => {
            const status = task.status === 'TODO' ? 'À Faire' : task.status === 'IN_PROGRESS' ? 'En Cours' : 'Terminé';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

        // 2. Member Workload
        const memberCounts = {};
        tasks.forEach(task => {
            if (task.assignees && task.assignees.length > 0) {
                task.assignees.forEach(user => {
                    // user can be ID or Object depending on population
                    const name = user.username || 'Inconnu';
                    memberCounts[name] = (memberCounts[name] || 0) + 1;
                });
            } else {
                memberCounts['Non Assigné'] = (memberCounts['Non Assigné'] || 0) + 1;
            }
        });

        const memberData = Object.entries(memberCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort by most tasks

        return { statusData, memberData };
    }, [tasks]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!tasks || tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
                <p>Aucune tâche pour analyser les données.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-2 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20"> {/* pb-20 for scroll space */}

                {/* Status Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <PieIcon className="w-5 h-5 text-primary-500" />
                        Répartition par Statut
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Member Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-500" />
                        Charge de Travail par Membre
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.memberData}>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    {stats.memberData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalytics;
