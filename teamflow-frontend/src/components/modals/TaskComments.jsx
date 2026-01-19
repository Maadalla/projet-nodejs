import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axios'; // Adjust path if needed
import useAuthStore from '../../store/useAuthStore';
import { useSocket } from '../../hooks/useSocket'; // Adjust path
import { Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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

    // ... (socket/mutation logic unchanged)

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
                                            {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
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
