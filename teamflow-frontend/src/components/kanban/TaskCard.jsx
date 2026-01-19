import { Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns'; // Would require date-fns, user didn't specify but it's standard. I'll use native Date for now or simple format.

// Priority configurations
const PRIORITY_STYLES = {
    HIGH: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        dot: 'bg-red-600',
    },
    MEDIUM: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        dot: 'bg-yellow-500',
    },
    LOW: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        dot: 'bg-blue-600',
    },
};

const TaskCard = ({ task, index, onClick }) => {
    const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        "group bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all mb-3 select-none",
                        snapshot.isDragging && "shadow-lg ring-2 ring-primary-500 rotate-2 z-50",
                        task.status === 'DONE' && "opacity-75"
                    )}
                    onClick={() => onClick(task)}
                >
                    {/* Header: ID & Priority */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-400">
                            {task.taskId || `#${task._id.slice(-4)}`}
                        </span>
                        <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium", priorityStyle.bg, priorityStyle.text)}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", priorityStyle.dot)} />
                            {task.priority}
                        </div>
                    </div>

                    {/* Title */}
                    <h4 className={cn(
                        "text-sm font-semibold text-gray-800 mb-3 line-clamp-2",
                        task.status === 'DONE' && "line-through text-gray-500"
                    )}>
                        {task.title}
                    </h4>

                    {/* Footer: Date & Assignees */}
                    <div className="flex items-center justify-between mt-auto">
                        {/* Due Date */}
                        {task.dueDate ? (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(task.dueDate)}</span>
                            </div>
                        ) : (
                            <div /> /* Spacer */
                        )}

                        {/* Assignees */}
                        <div className="flex -space-x-1.5">
                            {task.assignees && task.assignees.map((assignee, i) => (
                                <div
                                    key={assignee._id}
                                    className="w-6 h-6 rounded-full border border-white bg-gray-100 overflow-hidden ring-1 ring-white"
                                    title={assignee.username}
                                >
                                    <img
                                        src={assignee.avatarUrl}
                                        alt={assignee.username}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                            {/* Optional: Add +N if too many assignees */}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
