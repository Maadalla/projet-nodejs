import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import KanbanBoard from '../components/kanban/KanbanBoard';
import ProjectMembersModal from '../components/modals/ProjectMembersModal';
import ProjectPlanning from '../components/views/ProjectPlanning';
import ProjectAnalytics from '../components/views/ProjectAnalytics';
import { Loader2, Plus, Users, Layout, List, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const Projects = () => {
    const queryClient = useQueryClient();
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' | 'PLANNING' | 'ANALYTICS'

    // 1. Fetch projects
    const { data: projectsData, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await axiosInstance.get('/projects');
            return res.data;
        }
    });

    const projects = projectsData?.data || [];

    // Auto-select first project
    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0]._id);
        }
    }, [projects, selectedProjectId]);

    // Create Project Mutation
    const createProjectMutation = useMutation({
        mutationFn: (newProject) => axiosInstance.post('/projects', newProject),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['projects']);
            toast.success("Projet créé avec succès");
            // Automatically select the new project
            setSelectedProjectId(response.data.data._id);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Erreur lors de la création du projet");
        }
    });

    const handleCreateProject = () => {
        const name = prompt("Nom du projet :"); // Simple prompt for now, can be a modal
        if (name) {
            createProjectMutation.mutate({ name });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        )
    }

    const currentProject = projects.find(p => p._id === selectedProjectId);

    if (projects.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue sur la Plateforme</h2>
                    <p className="text-gray-500 mb-6">Créez votre premier projet pour commencer.</p>
                    <button
                        onClick={handleCreateProject}
                        disabled={createProjectMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                        {createProjectMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        Créer un Projet de Démo
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {currentProject?.name}
                    </h1>
                    <button
                        onClick={() => setIsMembersModalOpen(true)}
                        className="text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                        title="Gérer l'équipe"
                    >
                        <Users className="w-3 h-3" />
                        {currentProject?.members?.length || 1} membres
                    </button>

                    {/* View Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('KANBAN')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'KANBAN' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vue Kanban"
                        >
                            <Layout className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('PLANNING')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'PLANNING' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vue Planning"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('ANALYTICS')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'ANALYTICS' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Statistiques"
                        >
                            <BarChart3 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Project Switcher */}
                    <select
                        value={selectedProjectId || ''}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    >
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleCreateProject}
                        className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                        title="Nouveau Projet"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden p-6 relative">
                {selectedProjectId && (
                    <>
                        {viewMode === 'KANBAN' && <KanbanBoard projectId={selectedProjectId} />}
                        {viewMode === 'PLANNING' && <ProjectPlanning projectId={selectedProjectId} />}
                        {viewMode === 'ANALYTICS' && <ProjectAnalytics projectId={selectedProjectId} />}

                        <ProjectMembersModal
                            isOpen={isMembersModalOpen}
                            onClose={() => setIsMembersModalOpen(false)}
                            project={currentProject}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Projects;
