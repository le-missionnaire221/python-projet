import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Todo, User, Status, Priority } from '../types/index';
import TaskModal from '../components/TaskModal';
import type { TaskFormData } from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';

// ── Helpers visuels ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { label: string; cls: string }> = {
  en_cours: { cls: 'badge bg-gradient-info',    label: 'En cours' },
  a_tester: { cls: 'badge bg-gradient-warning', label: 'À tester' },
  approuve: { cls: 'badge bg-gradient-success', label: 'Approuvé' },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; cls: string }> = {
  HIGH:   { label: 'Haute',   cls: 'badge bg-gradient-danger' },
  MEDIUM: { label: 'Moyenne', cls: 'badge bg-gradient-warning' },
  LOW:    { label: 'Basse',   cls: 'badge bg-gradient-success' },
};

const statusBadge = (s: Status) => {
  const c = STATUS_CONFIG[s] ?? { label: s, cls: 'badge bg-gradient-secondary' };
  return <span className={c.cls}>{c.label}</span>;
};

const priorityBadge = (p: Priority) => {
  const c = PRIORITY_CONFIG[p] ?? { label: p, cls: 'badge bg-gradient-secondary' };
  return <span className={c.cls}>{c.label}</span>;
};

const MAX_DESC = 60;
const truncate = (text: string) =>
  text.length > MAX_DESC ? text.slice(0, MAX_DESC) + '…' : text;

// ── Panneau de détail ──────────────────────────────────────────────────────────

interface DetailPanelProps {
  todo: Todo;
  ownerName?: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ todo, ownerName, onClose, onEdit, onDelete }) => (
  <div className="card h-100">
    <div className="card-header pb-0 d-flex justify-content-between align-items-center">
      <h6 className="mb-0">Détail de la tâche</h6>
      <button className="btn btn-link p-0 mb-0 text-secondary" onClick={onClose} title="Fermer">
        <i className="ni ni-fat-remove"></i>
      </button>
    </div>
    <div className="card-body p-3">
      <h5 className="font-weight-bolder mb-1">{todo.titre}</h5>
      <p className="text-sm text-secondary mb-3" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {todo.description || <em className="opacity-5">Aucune description</em>}
      </p>
      <hr className="horizontal gray-light my-3" />
      <ul className="list-group list-group-flush mb-3">
        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
          <span className="text-sm font-weight-bold text-dark">Statut</span>
          {statusBadge(todo.status)}
        </li>
        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
          <span className="text-sm font-weight-bold text-dark">Priorité</span>
          {priorityBadge(todo.priority)}
        </li>
        {ownerName && (
          <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
            <span className="text-sm font-weight-bold text-dark">Assigné à</span>
            <span className="text-sm">{ownerName}</span>
          </li>
        )}
        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
          <span className="text-sm font-weight-bold text-dark">ID</span>
          <span className="text-sm text-secondary">#{todo.id}</span>
        </li>
      </ul>
      <div className="d-flex gap-2">
        <button className="btn bg-gradient-info btn-sm mb-0 flex-fill" onClick={onEdit}>
          <i className="ni ni-settings-gear-65 me-1"></i>Modifier
        </button>
        <button className="btn bg-gradient-danger btn-sm mb-0 flex-fill" onClick={onDelete}>
          <i className="ni ni-fat-remove me-1"></i>Supprimer
        </button>
      </div>
    </div>
  </div>
);

// ── Page principale ────────────────────────────────────────────────────────────

const TasksPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [users, setUsers] = useState<User[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [todosData, profile] = await Promise.all([
        apiService.getTodos(),
        apiService.getProfile(),
      ]);
      setTodos(Array.isArray(todosData) ? todosData : []);
      setCurrentUserId(profile.id);
      if (profile.role === 'ADMIN') {
        setIsAdmin(true);
        const allUsers = await apiService.getUsers();
        setUsers(allUsers);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement.';
      if (msg === 'Non authentifié') { window.location.href = '/login'; return; }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const ownerName = (id: number) => users.find(u => u.id === id)?.name ?? `#${id}`;

  const handleOpenCreate = () => { setEditingTodo(null); setModalOpen(true); };
  const handleOpenEdit = (todo: Todo) => { setEditingTodo(todo); setModalOpen(true); };

  const handleSubmit = async (data: TaskFormData) => {
    if (editingTodo) {
      await apiService.updateTodo(editingTodo.id, data);
    } else {
      await apiService.createTodo(data);
    }
    setSelectedTodo(null);
    await loadAll();
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) return;
    setDeleteError('');
    try {
      await apiService.deleteTodo(confirmDeleteId);
      setTodos(prev => prev.filter(t => t.id !== confirmDeleteId));
      if (selectedTodo?.id === confirmDeleteId) setSelectedTodo(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">

        {/* ── Tableau ── */}
        <div className={selectedTodo ? 'col-lg-8' : 'col-12'}>
          <div className="card">
            <div className="card-header pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0">Gestion des tâches</h6>
                <p className="text-sm mb-0 text-secondary">{todos.length} tâche{todos.length !== 1 ? 's' : ''}</p>
              </div>
              <button className="btn bg-gradient-primary btn-sm mb-0" onClick={handleOpenCreate}>
                <i className="ni ni-fat-add me-1"></i>Créer une tâche
              </button>
            </div>

            <div className="card-body px-0 pb-2">
              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              )}
              {(error || deleteError) && (
                <div className="px-4">
                  <p className="text-danger text-sm">{error || deleteError}</p>
                </div>
              )}
              {!loading && !error && (
                <div className="table-responsive">
                  <table className="table align-items-center mb-0">
                    <thead>
                      <tr>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Titre</th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Description</th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Priorité</th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Statut</th>
                        {isAdmin && <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Assigné à</th>}
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todos.length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin ? 6 : 5} className="text-center py-4 text-secondary text-sm">
                            Aucune tâche. Cliquez sur "Créer une tâche" pour commencer.
                          </td>
                        </tr>
                      ) : (
                        todos.map(todo => (
                          <tr
                            key={todo.id}
                            className={selectedTodo?.id === todo.id ? 'table-active' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedTodo(selectedTodo?.id === todo.id ? null : todo)}
                          >
                            <td>
                              <div className="d-flex px-2 py-1">
                                <div className="d-flex flex-column justify-content-center">
                                  <h6 className="mb-0 text-sm">{todo.titre}</h6>
                                </div>
                              </div>
                            </td>
                            <td>
                              <p className="text-xs text-secondary mb-0 px-2" title={todo.description || ''}>
                                {todo.description
                                  ? truncate(todo.description)
                                  : <em className="opacity-5">—</em>
                                }
                                {todo.description && todo.description.length > MAX_DESC && (
                                  <button
                                    className="btn btn-link p-0 ms-1 text-info"
                                    style={{ fontSize: '0.7rem', verticalAlign: 'baseline' }}
                                    title="Voir la description complète"
                                    onClick={e => { e.stopPropagation(); setSelectedTodo(todo); }}
                                  >
                                    voir plus
                                  </button>
                                )}
                              </p>
                            </td>
                            <td className="align-middle text-center">
                              {priorityBadge(todo.priority)}
                            </td>
                            <td className="align-middle text-center">
                              {statusBadge(todo.status)}
                            </td>
                            {isAdmin && (
                              <td className="align-middle">
                                <span className="text-xs text-secondary px-2">{ownerName(todo.owner_id)}</span>
                              </td>
                            )}
                            <td className="align-middle text-center" onClick={e => e.stopPropagation()}>
                              <button
                                className="btn btn-link text-info p-0 mb-0 me-2"
                                title="Modifier"
                                onClick={() => handleOpenEdit(todo)}
                              >
                                <i className="ni ni-settings-gear-65 text-sm"></i>
                              </button>
                              <button
                                className="btn btn-link text-secondary p-0 mb-0 me-2"
                                title="Voir le détail"
                                onClick={() => setSelectedTodo(selectedTodo?.id === todo.id ? null : todo)}
                              >
                                <i className="ni ni-zoom-split-in text-sm"></i>
                              </button>
                              <button
                                className="btn btn-link text-danger p-0 mb-0"
                                title="Supprimer"
                                onClick={() => setConfirmDeleteId(todo.id)}
                              >
                                <i className="ni ni-fat-remove text-sm"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Panneau de détail ── */}
        {selectedTodo && (
          <div className="col-lg-4 mt-4 mt-lg-0">
            <DetailPanel
              todo={selectedTodo}
              ownerName={isAdmin ? ownerName(selectedTodo.owner_id) : undefined}
              onClose={() => setSelectedTodo(null)}
              onEdit={() => { handleOpenEdit(selectedTodo); }}
              onDelete={() => { setConfirmDeleteId(selectedTodo.id); }}
            />
          </div>
        )}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingTodo ?? undefined}
        title={editingTodo ? 'Modifier la tâche' : 'Nouvelle tâche'}
        isAdmin={isAdmin}
        users={users}
        currentUserId={currentUserId}
      />

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Supprimer la tâche"
        message="Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default TasksPage;
