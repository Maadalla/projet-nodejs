import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Check, Search, Calendar as CalendarIcon, User as UserIcon, MessageSquare, List, Send, Loader2, Tag, Plus } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TaskComments from './TaskComments';

const fetchMembers = async (projectId) => {
    const { data } = await axiosInstance.get(`/projects/${projectId}`);
    return data.data.members; // returns [{ user: {...}, role: ... }]
};

const STATUS_MAP = {
    'TO_DO': 'A Faire',
    'IN_PROGRESS': 'En Cours',
    'DONE': 'Terminé'
};

const TAG_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const TaskModal = ({ isOpen, onClose, task: initialTask, projectId, initialStatus }) => {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();

    // Tabs state
    const [activeTab, setActiveTab] = useState('details');

    // Fetch latest task data if editing to get comments
    const { data: taskData } = useQuery({
        queryKey: ['task', initialTask?._id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/tasks/${initialTask._id}`);
            return res.data.data;
        },
        enabled: !!initialTask?._id && isOpen,
        initialData: initialTask
    });

    const task = taskData || initialTask;

    // Form State
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
    const [dueDate, setDueDate] = useState(
        task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    );
    const [assignees, setAssignees] = useState(
        task?.assignees ? task.assignees.map(a => a._id || a) : []
    );

    // Tags State
    const [tags, setTags] = useState(task?.tags || []);
    const [newTagName, setNewTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[3]);

    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    const commentsEndRef = useRef(null);

    // Fetch members
    const { data: members = [] } = useQuery({
        queryKey: ['members', projectId],
        queryFn: () => fetchMembers(projectId),
        enabled: !!projectId && isOpen,
    });

    // Scroll to bottom of comments
    useEffect(() => {
        if (activeTab === 'comments') {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [task?.comments, activeTab]);

    const toggleAssignee = (memberId) => {
        setAssignees(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };

    const addTag = () => {
        if (newTagName.trim()) {
            setTags([...tags, { name: newTagName, color: selectedColor }]);
            setNewTagName('');
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // Mutations
    const createMutation = useMutation({
        mutationFn: (newTask) => axiosInstance.post('/tasks', newTask),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', projectId]);
            toast.success("Tâche créée");
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (updates) => axiosInstance.patch(`/tasks/${task._id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', projectId]);
            queryClient.invalidateQueries(['task', task._id]);
            toast.success("Tâche mise à jour");
            onClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => axiosInstance.delete(`/tasks/${task._id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', projectId]);
            toast.success("Tâche supprimée");
            onClose();
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (task?._id) {
            updateMutation.mutate({
                title, description, priority, dueDate: dueDate || null, assignees, tags
            });
        } else {
            createMutation.mutate({
                title, description, priority, project: projectId, status: initialStatus, assignees, dueDate: dueDate || null, tags
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn("text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2",
                                activeTab === 'details' ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-50")}
                        >
                            <List className="w-4 h-4" /> Détails
                        </button>
                        {task?._id && (
                            <button
                                onClick={() => setActiveTab('comments')}
                                className={cn("text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2",
                                    activeTab === 'comments' ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-50")}
                            >
                                <MessageSquare className="w-4 h-4" /> Commentaires
                                <span className="bg-gray-100 text-gray-600 px-1.5 rounded text-xs">{task.comments?.length || 0}</span>
                            </button>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' ? (
                        <form id="taskForm" onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Titre de la tâche"
                                    className="text-2xl font-semibold w-full border-none focus:ring-0 p-0 placeholder:text-gray-300"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Status (ReadOnly) */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Statut</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium capitalize">
                                        {STATUS_MAP[task?.status || initialStatus] || task?.status || initialStatus}
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Priorité</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    >
                                        <option value="LOW">Basse</option>
                                        <option value="MEDIUM">Moyenne</option>
                                        <option value="HIGH">Haute</option>
                                    </select>
                                </div>

                                {/* Due Date */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Échéance</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Assignees */}
                                <div className="space-y-1 relative">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Assignés</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between"
                                    >
                                        <span className="truncate">
                                            {assignees.length > 0
                                                ? `${assignees.length} sélectionnés`
                                                : "Sélectionner des membres..."}
                                        </span>
                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {/* Dropdown */}
                                    {isAssigneeDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                            {members.map((member) => (
                                                <div
                                                    key={member.user._id}
                                                    onClick={() => toggleAssignee(member.user._id)}
                                                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <div className={cn(
                                                        "w-4 h-4 rounded border flex items-center justify-center",
                                                        assignees.includes(member.user._id) ? "bg-primary-600 border-primary-600" : "border-gray-300"
                                                    )}>
                                                        {assignees.includes(member.user._id) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <img src={member.user.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                                                        <span className="text-sm text-gray-700">{member.user.username}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
                                    <Tag className="w-3 h-3" /> Étiquettes
                                </label>

                                {/* Tag List */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white shadow-sm" style={{ backgroundColor: tag.color }}>
                                            {tag.name}
                                            <button type="button" onClick={() => removeTag(i)} className="hover:text-gray-200">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                {/* Add Tag Input */}
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={newTagName}
                                            onChange={(e) => setNewTagName(e.target.value)}
                                            placeholder="Nouveau tag..."
                                            className="w-full pl-3 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        {TAG_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setSelectedColor(color)}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                                                    selectedColor === color ? "border-gray-600 scale-110" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ajouter une description détaillée..."
                                    rows={4}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                />
                            </div>

                            {/* Selected Assignees Avatars */}
                            {assignees.length > 0 && (
                                <div className="flex -space-x-2">
                                    {members
                                        .filter(m => assignees.includes(m.user._id))
                                        .map(m => (
                                            <img
                                                key={m.user._id}
                                                src={m.user.avatarUrl}
                                                alt={m.user.username}
                                                title={m.user.username}
                                                className="w-8 h-8 rounded-full border-2 border-white"
                                            />
                                        ))}
                                </div>
                            )}
                        </form>
                    ) : (
                        // Comments Tab
                        <TaskComments taskId={task?._id} projectId={projectId} />
                    )}
                </div>

                {/* Footer (Actions) */}
                {activeTab === 'details' && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
                        {task?._id ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                                        deleteMutation.mutate();
                                    }
                                }}
                                className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Supprimer
                            </button>
                        ) : <div></div>}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="taskForm"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                                {task?._id ? 'Enregistrer' : 'Créer la tâche'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskModal;
