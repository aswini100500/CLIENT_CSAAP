import React, { useState, useEffect } from 'react';
import { MoreVertical, Filter, Download, Loader2, AlertCircle } from 'lucide-react';
import api from '../submodules/crm/api';

const ProjectsTable = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/api/projects/options');
        const projectsData = response.data?.data || [];

        // Map the API response to match table structure
        const mappedProjects = projectsData.map((item, index) => ({
          id: item.project_id || item.id || index + 1,
          name: item.name || 'Unnamed Project',
          location: item.location || 'N/A',
          propertyType: item.property_type || 'N/A',
          displayType: item.display_type || 'N/A',
        }));

        setProjects(mappedProjects);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="crm-module-root">
        <div className="app-panel p-8">
          <div className="flex flex-col justify-center items-center h-40 gap-3">
            <Loader2 className="size-8 animate-spin text-(--brand)" strokeWidth={2.5} />
            <span className="text-(--text-soft) font-semibold text-sm">Loading projects...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="crm-module-root">
        <div className="app-panel p-8 border-rose-100 bg-rose-50/10">
          <div className="text-center">
            <div className="text-rose-600 mb-4 flex flex-col items-center gap-2">
              <AlertCircle className="size-8 text-rose-500" />
              <p className="font-bold text-[15px]">Unable to load projects</p>
              <p className="text-sm text-rose-500/80 max-w-md mx-auto">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="app-btn-secondary text-xs min-h-9 py-1.5 px-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crm-module-root">
      <div className="app-panel overflow-hidden">
        {/* Table Header / Toolbar */}
        <div className="app-section-bar p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="app-heading">
            Active Projects ({projects.length})
          </h2>
          <div className="flex items-center gap-2">
            <button className="app-btn-secondary flex items-center gap-2 text-xs font-semibold py-1.5 px-3 min-h-9 rounded-xl border border-(--border-soft) hover:border-(--border-strong) transition-all">
              <Filter size={14} /> Filter
            </button>
            <button className="app-btn-secondary flex items-center gap-2 text-xs font-semibold py-1.5 px-3 min-h-9 rounded-xl border border-(--border-soft) hover:border-(--border-strong) transition-all">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="app-section-bar border-b border-(--border-soft)">
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">Project Name</th>
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">Location</th>
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">Property Type</th>
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">Display Type</th>
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-soft)">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <AlertCircle className="size-8 mx-auto mb-3 text-(--text-faint)" />
                    <p className="text-[14px] font-medium text-(--text-strong)">No projects found</p>
                    <p className="text-[13px] mt-1 text-(--text-soft)">
                      No active projects are currently listed in the system.
                    </p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-(--bg-subtle)/40 transition-colors duration-200">
                    <td className="px-4 py-3 text-[14px] font-bold text-(--text-strong)">{project.name}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-(--text-body)">{project.location}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-(--text-body) capitalize">{project.propertyType}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-(--text-body) capitalize">{project.displayType}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-(--text-faint) hover:text-(--brand) transition-colors p-1 rounded-lg hover:bg-(--bg-subtle)">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;