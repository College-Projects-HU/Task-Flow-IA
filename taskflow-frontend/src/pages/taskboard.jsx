import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import api, { getAllTasks, getProjects } from '../services/api';
import './TaskBoard.css';

const TaskBoard = () => {
  const { user } = useContext(AuthContext);
  
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch all tasks and projects
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allTasks, allProjects] = await Promise.all([
        getAllTasks(),
        getProjects(),
      ]);

      setTasks(allTasks);
      setProjects(allProjects);
      applyFilters(allTasks, searchQuery);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (taskList, query) => {
    let filtered = taskList;

    if (query.trim()) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description?.toLowerCase().includes(query.toLowerCase()) ||
        t.projectName?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters(tasks, searchQuery);
  }, [searchQuery, tasks]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleTaskUpdated = () => {
    fetchTasks();
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const canCreateTask = user?.role === 'ProjectManager' || user?.role === 'Admin';

  const normalizeTask = (task) => ({
    id: task?.id ?? task?.Id,
    title: task?.title ?? task?.Title ?? 'Untitled',
    description: task?.description ?? task?.Description ?? '',
    priority: task?.priority ?? task?.Priority ?? 'Medium',
    status: task?.status ?? task?.Status ?? 'ToDo',
    dueDate: task?.dueDate ?? task?.DueDate ?? null,
    projectId: task?.projectId ?? task?.ProjectId ?? null,
    projectName: task?.projectName ?? task?.ProjectName ?? 'Unknown Project',
    assignedUserId: task?.assignedUserId ?? task?.AssignedUserId ?? null,
    assignedMemberId: task?.assignedMemberId ?? task?.AssignedMemberId ?? null,
    assignedUserName: task?.assignedUserName ?? task?.AssignedUserName ?? '',
    commentsCount: task?.comments?.length ?? 0,
    attachmentsCount: task?.attachments?.length ?? 0,
  });

  const normalizedTasks = filteredTasks.map(normalizeTask);

  const toDoTasks = normalizedTasks.filter(t => t.status === 'ToDo');
  const inProgressTasks = normalizedTasks.filter(t => t.status === 'InProgress');
  const doneTasks = normalizedTasks.filter(t => t.status === 'Done');

  const TaskCard = ({ task }) => {
    const daysRemaining = task.dueDate
      ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null;

    const getInitials = (name) => {
      if (!name) return '?';
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };

    return (
      <div className="taskboard-card" onClick={() => handleEditClick(task)}>
        <div className="taskboard-card-project">
          <span className="taskboard-card-project-badge">{task.projectName}</span>
        </div>

        <div className="taskboard-card-header">
          <h5 className="taskboard-card-title">{task.title}</h5>
          <span className={`taskboard-card-priority ${task.priority?.toLowerCase() || 'medium'}`}>
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="taskboard-card-description">{task.description}</p>
        )}

        {(daysRemaining !== null || task.assignedUserName) && (
          <div className="taskboard-card-meta">
            {daysRemaining !== null && (
              <div className="taskboard-card-meta-item">
                <span className="taskboard-card-meta-icon">📅</span>
                <span>{daysRemaining} days</span>
              </div>
            )}
          </div>
        )}

        <div className="taskboard-card-footer">
          <div className="taskboard-card-engagement">
            <div className="taskboard-card-engagement-item">
              <span>📎</span>
              <span>{task.attachmentsCount}</span>
            </div>
            <div className="taskboard-card-engagement-item">
              <span>💬</span>
              <span>{task.commentsCount}</span>
            </div>
          </div>

          {task.assignedUserName && (
            <div className="taskboard-card-avatars">
              <div
                className="taskboard-card-avatar"
                title={task.assignedUserName}
              >
                {getInitials(task.assignedUserName)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TaskColumn = ({ title, tasks: columnTasks, status }) => (
    <div className="taskboard-column">
      <div className="taskboard-column-header">
        <div className="taskboard-column-title">
          <h4>{title}</h4>
          <span className="taskboard-column-badge">{columnTasks.length}</span>
        </div>
        <div className="taskboard-column-actions">
          <button className="taskboard-column-btn" title="Options">
            ⋯
          </button>
        </div>
      </div>

      <div className="taskboard-column-body">
        {canCreateTask && columnTasks.length === 0 && (
          <div
            className="taskboard-add-card"
            onClick={() => {
              setSelectedTask(null);
              setShowCreateModal(true);
            }}
          >
            +
          </div>
        )}

        {columnTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}

        {columnTasks.length === 0 && !canCreateTask && (
          <div className="taskboard-empty">
            <div className="taskboard-empty-icon">📭</div>
            <p>No tasks here</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout title="Tasks Board" activeItem="tasks">
        <div className="taskboard-loading">
          <div className="taskboard-spinner"></div>
          <span>Loading tasks...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tasks Board" activeItem="tasks">
      <div className="taskboard-container">
        {error && (
          <div className="taskboard-error">
            <span className="taskboard-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="taskboard-header">
          <div>
            <h3>All Tasks</h3>
            <p style={{ margin: '0.5rem 0 0', color: '#9ca3af', fontSize: '0.875rem' }}>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} across {new Set(filteredTasks.map(t => t.projectId)).size} project{new Set(filteredTasks.map(t => t.projectId)).size !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="taskboard-header-actions">
            <div className="taskboard-search">
              <input
                type="text"
                placeholder="Search tasks by name or project..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {canCreateTask && (
              <button
                className="btn btn-primary"
                style={{
                  padding: '0.625rem 1rem',
                  background: '#4a90e2',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: '0.2s',
                }}
                onClick={() => {
                  setSelectedTask(null);
                  setShowCreateModal(true);
                }}
              >
                + Add Task
              </button>
            )}
          </div>
        </div>

        <div className="taskboard-content">
          <TaskColumn title="Backlog" tasks={toDoTasks} status="ToDo" />
          <TaskColumn title="In Progress" tasks={inProgressTasks} status="InProgress" />
          <TaskColumn title="Completed" tasks={doneTasks} status="Done" />
        </div>
      </div>

      <CreateTaskModal
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        projects={projects}
        onTaskCreated={handleTaskCreated}
      />

      <EditTaskModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        projectId={selectedTask?.projectId}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
      />
    </DashboardLayout>
  );
};

export default TaskBoard;