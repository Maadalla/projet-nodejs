import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import TaskModal from '../modals/TaskModal';
import { format } from 'date-fns';
import { Calendar, User, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const PlanningView = ({ projectId }) => {
    const { tasks, isLoading } = useTasks(projectId);
    const [selectedTask, setSelectedTask] = useState(null);

    // Sort by due date (ascending), then priority
    const sortedTasks = [...(tasks || [])].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DONE': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-yellow-500" />;
            default: return <Circle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-50';
            case 'MEDIUM': return 'text-orange-600 bg-orange-50';
            case 'LOW': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading tasks...</div>;

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <div className="col-span-1">Status</div>
                <div className="col-span-5">Task Name</div>
                <div className="col-span-2">Assignees</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Priority</div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
                {sortedTasks.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No tasks found. Create one to get started!
                    </div>
                ) : (
                    sortedTasks.map((task) => (
                        <div
                            key={task._id}
                            onClick={() => setSelectedTask(task)}
                            className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 cursor-pointer items-center transition-colors group"
                        >
                            {/* Status */}
                            <div className="col-span-1 flex items-center">
                                <div className="p-1 rounded-full bg-white border border-gray-100 shadow-sm group-hover:border-gray-200">
                                    {getStatusIcon(task.status)}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="col-span-5 font-medium text-gray-900 truncate">
                                {task.title}
                            </div>

                            {/* Assignees */}
                            <div className="col-span-2 flex -space-x-2">
                                {task.assignees?.map((assignee) => (
                                    <img
                                        key={assignee._id || assignee}
                                        src={assignee.avatarUrl || `https://ui-avatars.com/api/?name=User`}
                                        alt=""
                                        className="w-6 h-6 rounded-full border-2 border-white"
                                        title={assignee.username}
                                    />
                                ))}
                                {(!task.assignees || task.assignees.length === 0) && (
                                    <span className="text-gray-400 text-xs flex items-center gap-1">
                                        <User className="w-3 h-3" /> Unassigned
                                    </span>
                                )}
                            </div>

                            {/* Due Date */}
                            <div className="col-span-2 text-sm text-gray-600 flex items-center gap-2">
                                {task.dueDate ? (
                                    <>
                                        <Calendar className="w-3 h-3 text-gray-400" />
                                        <span className={cn(
                                            new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? "text-red-600 font-medium" : ""
                                        )}>
                                            {format(new Date(task.dueDate), 'MMM d')}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-gray-300">-</span>
                                )}
                            </div>

                            {/* Priority */}
                            <div className="col-span-2">
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide",
                                    getPriorityColor(task.priority)
                                )}>
                                    {task.priority || 'MEDIUM'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Task Modal */}
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

export default PlanningView;
