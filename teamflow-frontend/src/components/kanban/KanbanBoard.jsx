import { useState, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import TaskModal from '../modals/TaskModal';
import { useTasks } from '../../hooks/useTasks';
import { useSocket } from '../../hooks/useSocket';
import { Loader2 } from 'lucide-react';

const COLUMNS = {
    'TODO': { title: 'To Do', color: 'bg-red-400' },
    'IN_PROGRESS': { title: 'In Progress', color: 'bg-yellow-400' },
    'DONE': { title: 'Done', color: 'bg-green-400' },
};

const KanbanBoard = ({ projectId }) => {
    const { tasks, isLoading, isError, updateStatus } = useTasks(projectId);
    useSocket(projectId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newTaskStatus, setNewTaskStatus] = useState('TODO');

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        // Dropped outside or no movement
        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        const oldStatus = source.droppableId;

        // Call mutation for optimistic update
        updateStatus({
            taskId: draggableId,
            status: newStatus,
            position: destination.index,
            sourceStatus: oldStatus
        });
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleAddTask = (status) => {
        setSelectedTask(null); // Creating new task
        setNewTaskStatus(status);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    // Group tasks by status
    const columns = useMemo(() => {
        const grouped = {
            'TODO': [],
            'IN_PROGRESS': [],
            'DONE': []
        };

        const safeTasks = Array.isArray(tasks) ? tasks : [];
        safeTasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            }
        });

        // Sort by position
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => a.position - b.position);
        });

        return grouped;
    }, [tasks]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (isError) {
        return <div className="text-red-500">Error loading tasks.</div>;
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start px-2">
                    {Object.entries(COLUMNS).map(([status, config]) => (
                        <KanbanColumn
                            key={status}
                            id={status}
                            title={config.title}
                            color={config.color}
                            tasks={columns[status]}
                            onTaskClick={handleTaskClick}
                            onAddTask={handleAddTask}
                        />
                    ))}
                </div>
            </DragDropContext>

            {/* Detail/Create Modal */}
            {isModalOpen && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    task={selectedTask}
                    projectId={projectId}
                    initialStatus={newTaskStatus}
                />
            )}
        </>
    );
};

export default KanbanBoard;
