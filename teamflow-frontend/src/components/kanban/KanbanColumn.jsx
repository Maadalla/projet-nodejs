import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { cn } from '../../lib/utils';
import { Plus } from 'lucide-react';

const KanbanColumn = ({
    id,
    title,
    tasks,
    color = 'bg-gray-200',
    onTaskClick,
    onAddTask
}) => {
    return (
        <div className="flex flex-col w-80 max-w-xs h-full flex-shrink-0">
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 mb-2">
                <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", color)} />
                    <h3 className="font-semibold text-gray-700 tracking-tight">
                        {title}
                    </h3>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>

                {/* ADD Task button specific to column */}
                <button
                    onClick={() => onAddTask(id)}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                            "flex-1 bg-gray-50/50 rounded-xl p-2 transition-colors overflow-y-auto scrollbar-hide min-h-[150px]",
                            snapshot.isDraggingOver && "bg-gray-100 ring-2 ring-primary-100"
                        )}
                    >
                        {tasks.map((task, index) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                index={index}
                                onClick={onTaskClick}
                            />
                        ))}
                        {provided.placeholder}

                        {/* Empty State placeholder */}
                        {tasks.length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                Drop items here
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default KanbanColumn;
