import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axios';
import useAuthStore from '../../store/useAuthStore';
import { X, UserPlus, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ProjectMembersModal = ({ isOpen, onClose, project }) => {
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [inviteEmail, setInviteEmail] = useState('');

    const members = project?.members || [];

    // Check if current user is ADMIN (Safely)
    const currentMemberRecord = members.find(m => m.user._id === currentUser?._id);
    const isAdmin = project && currentUser ? (currentMemberRecord?.role === 'ADMIN' || project.owner?._id === currentUser._id) : false;

    const inviteMutation = useMutation({
        mutationFn: (email) => axiosInstance.post(`/projects/${project?._id}/invite`, { email }),
        onSuccess: (response) => {
            toast.success("Utilisateur invité avec succès");
            setInviteEmail('');
            // Invalidate projects to refresh members list
            queryClient.invalidateQueries(['projects']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Échec de l'invitation");
        }
    });

    const handleInvite = (e) => {
        e.preventDefault();
        if (inviteEmail.trim()) {
            inviteMutation.mutate(inviteEmail.trim());
        }
    };

    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Membres de l'équipe</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Invite Section (Admin Only) */}
                {isAdmin && (
                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                        <form onSubmit={handleInvite} className="flex gap-2">
                            <input
                                type="email"
                                placeholder="collegue@exemple.com"
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={inviteMutation.isPending}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Inviter
                            </button>
                        </form>
                    </div>
                )}

                {/* Members List */}
                <div className="p-6 max-h-[400px] overflow-y-auto">
                    <div className="space-y-4">
                        {members.map((member) => (
                            <div key={member._id || member.user._id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={member.user.avatarUrl}
                                        alt={member.user.username}
                                        className="w-10 h-10 rounded-full border border-gray-100"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">{member.user.username}</div>
                                        <div className="text-xs text-gray-500">{member.user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {member.role === 'ADMIN' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                                            <Shield className="w-3 h-3" />
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                            <UserIcon className="w-3 h-3" />
                                            Membre
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectMembersModal;
