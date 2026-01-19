import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../api/socket';

export const useSocket = (projectId) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!projectId) return;

        // Connect to socket
        if (!socket.connected) {
            socket.connect();
        }

        // Join project room
        socket.emit('join_project', projectId);

        // Event handlers
        const handleTaskMoved = (data) => {
            queryClient.invalidateQueries(['tasks', projectId]);
        };

        const handleTaskCreated = () => {
            queryClient.invalidateQueries(['tasks', projectId]);
        };

        const handleTaskUpdated = () => {
            queryClient.invalidateQueries(['tasks', projectId]);
        };

        const handleTaskDeleted = () => {
            queryClient.invalidateQueries(['tasks', projectId]);
        };

        const handleUserInvited = () => {
            queryClient.invalidateQueries(['project', projectId]);
        };

        // Listen to events
        socket.on('task_moved', handleTaskMoved);
        socket.on('task_created', handleTaskCreated);
        socket.on('task_updated', handleTaskUpdated);
        socket.on('task_deleted', handleTaskDeleted);
        socket.on('user_invited', handleUserInvited);

        // Cleanup
        return () => {
            socket.emit('leave_project', projectId);
            socket.off('task_moved', handleTaskMoved);
            socket.off('task_created', handleTaskCreated);
            socket.off('task_updated', handleTaskUpdated);
            socket.off('task_deleted', handleTaskDeleted);
            socket.off('user_invited', handleUserInvited);
        };
    }, [projectId, queryClient]);
};
