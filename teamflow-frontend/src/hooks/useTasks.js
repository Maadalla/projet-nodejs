import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { toast } from 'sonner';

// Fetch tasks
const fetchTasks = async (projectId) => {
    const { data } = await axiosInstance.get(`/tasks?projectId=${projectId}`);
    return data.data;
};

// Update task status (for drag & drop)
const updateTaskStatus = async ({ taskId, status, position, sourceStatus }) => {
    const { data } = await axiosInstance.patch(`/tasks/${taskId}/status`, {
        status,
        position,
        sourceStatus
    });
    return data.data;
};

export const useTasks = (projectId) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['tasks', projectId],
        queryFn: () => fetchTasks(projectId),
        enabled: !!projectId,
    });

    const updateStatusMutation = useMutation({
        mutationFn: updateTaskStatus,
        onMutate: async (newStatusData) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries(['tasks', projectId]);

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData(['tasks', projectId]);

            // Optimistically update to the new value
            queryClient.setQueryData(['tasks', projectId], (oldTasks) => {
                if (!oldTasks) return [];

                const { taskId, status, position, sourceStatus } = newStatusData;

                // Deep clone to avoid mutating state directly
                let newTasks = JSON.parse(JSON.stringify(oldTasks));
                const taskIndex = newTasks.findIndex(t => t._id === taskId);

                if (taskIndex === -1) return oldTasks;

                const task = newTasks[taskIndex];

                // Remove task from list
                newTasks.splice(taskIndex, 1);

                // Update task properties
                task.status = status;
                task.position = position; // This is a bit simplified, usually backend handles exact position re-calc
                // In a real optimistic update for a list, we need to insert it at the right index
                // But since we are sorting by position in the render, just updating the property helps.
                // However, precise "insert at index" logic for optimistic UI requires simulating the array reorder.

                // Let's rely on the board component to give us the reordered list visually for dnd, 
                // but for the query cache, we should try to approximate.
                // For now, simpler optimistic update: just update the properties.
                // The dnd library keeps the visual state while dragging.
                // Once dropped, if we update the cache, it might jump if calculation is wrong.
                // Best approach: Optimistic update usually replaces the whole list if we have it from the drag end handler.
                // But here we only pass params. 
                // Let's leave strictly complex reordering to the backend response or invalidation 
                // EXCEPT if we want super smooth experience, we just update the specific task's status so it jumps column instantly.

                // 1. Update status
                task.status = status;

                // 2. Insert back? Actually for optimistic sort, we might just push it and let the sort function handle it if we trust positions.
                // But positions are relative. 
                // Let's just update the status so it moves columns.
                newTasks.push(task);

                return newTasks;
            });

            return { previousTasks };
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            queryClient.setQueryData(['tasks', projectId], context.previousTasks);
            toast.error("Failed to update task status");
        },
        onSettled: () => {
            // Always refetch after error or success to ensure sync
            queryClient.invalidateQueries(['tasks', projectId]);
        },
    });

    return {
        tasks: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        updateStatus: updateStatusMutation.mutate,
    };
};
