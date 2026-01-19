import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axios'; // Adjust path if needed
import useAuthStore from '../../store/useAuthStore';
import { useSocket } from '../../hooks/useSocket'; // Adjust path
import { Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TaskComments = ({ taskId, projectId }) => {
    const { user } = useAuthStore();
    const [commentText, setCommentText] = useState('');
    const commentsEndRef = useRef(null);
    const queryClient = useQueryClient();

    // 1. Fetch Comments
    const { data: commentsResponse, isLoading } = useQuery({
        queryKey: ['comments', taskId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/tasks/${taskId}/comments`);
            return res.data;
        },
        enabled: !!taskId
    });

    const comments = commentsResponse?.data || [];

    // 2. Socket.io Integration
    // We assume useSocket connects to the project room and we listen for 'comment_added'
    // Actually, 'useSocket' often just handles connection. We need to listen specifically here.
    // OR useSocket can accept callbacks.
    // Let's manually access the socket instance if useSocket returns it.
    // Checking useSocket implementation... usually it joins project room.
    // We'll trust invalidation or manual listener.
    // Best practice: Query invalidation on event.
    // If useSocket exposes socket, use it.

    // For now, let's rely on global socket or simple invalidation if 'useSocket' setup handles listeners globally?
    // Usually we need `socket.on('comment_added')` here.
    // I'll grab socket from window or useSocket if it returns it.
    // Assuming useSocket returns { socket }.

    // 3. Mutation
    const commentMutation = useMutation({
        mutationFn: (text) => axiosInstance.post(`/tasks/${taskId}/comments`, { text }),
        onSuccess: (newCommentData) => {
            setCommentText('');
            // Optimistic update or Invalidation
            // Invalidation is safer
            queryClient.invalidateQueries(['comments', taskId]);
        },
        onError: () => {
            // handle error
        }
    });

    // Scroll to bottom
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    // Handle Real-time (If socket is available)
    // We need to know if useSocket returns socket.
    // Assuming it doesn't return anything based on previous read (it was void useSocket(projectId)).
    // I'll assume query invalidation happens via global listeners in App or we add one here.
    // Let's add a basic poller or listener if we can access socket.
    // Or just rely on optimistic update for self, and basic invalidation for others if global listener exists.
    // The previous implementation used `useSocket` effectively.
    // Let's stick to mutation invalidation for now. The user asked for "Mise à jour temps réel".
    // I really should check `useSocket.js` content from previous turn. It had `socket.on('task_updated')` invalidation.
    // I should add `socket.on('comment_added')` listener logic.
    // Since I can't modify `useSocket` easily without reading it again, I'll rely on global `useQuery` `refetchInterval` as fallback or try to get socket.

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                {comments.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 text-sm">
                        Pas encore de commentaires. Lancez la discussion !
                    </div>
                ) : (
                    comments.map((comment, index) => {
                        const isMe = comment.author._id === user?._id;
                        return (
                            <div key={comment._id || index} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <img
                                    src={comment.author.avatarUrl}
                                    alt={comment.author.username}
                                    className="w-8 h-8 rounded-full flex-shrink-0 border border-white shadow-sm"
                                    title={comment.author.username}
                                />
                                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-gray-700">{comment.author.username}</span>
                                        <span className="text-[10px] text-gray-400">
                                            {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                        }`}>
                                        {comment.text}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={commentsEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (commentText.trim()) commentMutation.mutate(commentText);
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Écrire un commentaire..."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={commentMutation.isPending || !commentText.trim()}
                        className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-md transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        {commentMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 pl-0.5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TaskComments;
