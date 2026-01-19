import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import TaskModal from '../modals/TaskModal';
import { format } from 'date-fns';
import { Calendar, User, CheckCircle2, Circle, Clock, Flame, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQueryClient } from '@tanstack/react-query'; // Ensure access to query client if needed

const ProjectPlanning = ({ projectId }) => {
    const { tasks, isLoading } = useTasks(projectId);
    const [selectedTask, setSelectedTask] = useState(null);

    // Sort by Due Date (Ascending), ensuring nulls are at the end
    const sortedTasks = [...(tasks || [])].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DONE':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Terminé</span>;
            case 'IN_PROGRESS':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3.5 h-3.5" /> En cours</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"><Circle className="w-3.5 h-3.5" /> A Faire</span>;
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'HIGH': return <div className="flex items-center gap-1 text-red-600" title="Haute Priorité"><Flame className="w-4 h-4" /> <span className="text-xs font-medium">Haute</span></div>;
            case 'MEDIUM': return <div className="flex items-center gap-1 text-orange-500" title="Moyenne Priorité"><ArrowUpCircle className="w-4 h-4" /> <span className="text-xs font-medium">Moyenne</span></div>;
            case 'LOW': return <div className="flex items-center gap-1 text-blue-500" title="Basse Priorité"><ArrowDownCircle className="w-4 h-4" /> <span className="text-xs font-medium">Basse</span></div>;
            default: return <div className="text-gray-400 text-xs">-</div>;
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            Chargement du Planning...
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Statut</div>
                <div className="col-span-4">Tâche</div>
                <div className="col-span-2">Assignés</div>
                <div className="col-span-2">Priorité</div>
                <div className="col-span-2 text-right">Échéance</div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
                {sortedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
                        <Calendar className="w-12 h-12 mb-3 text-gray-200" />
                        Aucune tâche planifiée. Basculez en Kanban pour en créer !
                    </div>
                ) : (
                    sortedTasks.map((task) => (
                        <div
                            key={task._id}
                            onClick={() => setSelectedTask(task)}
                            className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 cursor-pointer items-center transition-colors group"
                        >
                            {/* Status */}
                            <div className="col-span-2">
                                {getStatusBadge(task.status)}
                            </div>

                            {/* Title */}
                            <div className="col-span-4 font-medium text-gray-900 truncate pr-4">
                                {task.title}
                            </div>

                            {/* Assignees */}
                            <div className="col-span-2 flex items-center">
                                <div className="flex -space-x-2">
                                    {task.assignees?.length > 0 ? task.assignees.map((assignee) => (
                                        <img
                                            key={assignee._id || assignee}
                                            src={assignee.avatarUrl || `https://ui-avatars.com/api/?name=User`}
                                            alt=""
                                            className="w-7 h-7 rounded-full border-2 border-white ring-1 ring-gray-100"
                                            title={assignee.username}
                                        />
                                    )) : (
                                        <span className="text-xs text-gray-400 italic">Non assigné</span>
                                    )}
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="col-span-2">
                                {getPriorityIcon(task.priority)}
                            </div>

                            {/* Due Date */}
                            <div className="col-span-2 text-right">
                                {task.dueDate ? (
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
                                        new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                                            ? "bg-red-50 text-red-700"
                                            : "bg-gray-50 text-gray-600"
                                    )}>
                                        <Calendar className="w-3.5 h-3.5" />
                                        {format(new Date(task.dueDate), 'd MMM yyyy')}
                                    </div>
                                ) : (
                                    <span className="text-gray-300 text-xs">-</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Task Modal Reuse */}
            {selectedTask && (
                <TaskModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                    projectId={projectId}
                />
            )}
        </div>
    );
};

export default ProjectPlanning;
