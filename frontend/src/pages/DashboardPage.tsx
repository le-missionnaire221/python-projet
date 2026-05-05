import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Todo, User, Status, Priority } from '../types/index';
import TaskModal from '../components/TaskModal';
import type { TaskFormData } from '../components/TaskModal';

// ── Helpers visuels ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { label: string; cls: string; icon: string; bg: string }> = {
  en_cours: { label: 'En cours',  cls: 'badge bg-gradient-info',    icon: 'ni-settings-gear-65', bg: 'bg-gradient-info' },
  a_tester: { label: 'À tester',  cls: 'badge bg-gradient-warning', icon: 'ni-time-alarm',        bg: 'bg-gradient-warning' },
  approuve: { label: 'Approuvé',  cls: 'badge bg-gradient-success', icon: 'ni-check-bold',        bg: 'bg-gradient-success' },
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

// ── Composant panneau de détail ────────────────────────────────────────────────

interface DetailPanelProps {
  todo: Todo;
  ownerName?: string;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ todo, ownerName, onClose }) => (
  <div className="card h-100">
    <div className="card-header pb-0 d-flex justify-content-between align-items-center">
      <h6 className="mb-0">Détail de la tâche</h6>
      <button className="btn btn-link p-0 mb-0 text-secondary" onClick={onClose} title="Fermer">
        <i className="ni ni-fat-remove"></i>
      </button>
    </div>
    <div className="card-body p-3">
      <h5 className="font-weight-bolder mb-1">{todo.titre}</h5>
      <p className="text-sm text-secondary mb-3">
        {todo.description || <em className="opacity-5">Aucune description</em>}
      </p>
      <hr className="horizontal gray-light my-3" />
      <ul className="list-group list-group-flush">
        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
          <span className="text-sm font-weight-bold text-dark">Statut</span>
          {statusBadge(todo.status)}
        </li>
        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
          <span className="text-sm font-weight-bold text-dark">Priorité</span>
          {priorityBadge(todo.priority)}
        </li>
        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
          <span className="text-sm font-weight-bold text-dark">Assigné à</span>
          <span className="text-sm">{ownerName ?? `#${todo.owner_id}`}</span>
        </li>
        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
          <span className="text-sm font-weight-bold text-dark">ID</span>
          <span className="text-sm text-secondary">#{todo.id}</span>
        </li>
      </ul>
      <div className="mt-3">
        <Link to="/tasks" className="btn bg-gradient-primary btn-sm w-100 mb-0">
          <i className="ni ni-settings-gear-65 me-1"></i>Gérer dans Tâches
        </Link>
      </div>
    </div>
  </div>
);

// ── Page principale ────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [users, setUsers] = useState<User[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  // Filtres
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterOwner, setFilterOwner] = useState<'all' | 'me'>('all');
  const [search, setSearch] = useState('');

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

  const handleCreateTodo = async (data: TaskFormData) => {
    await apiService.createTodo(data);
    await loadAll();
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    todos.length,
    en_cours: todos.filter(t => t.status === 'en_cours').length,
    a_tester: todos.filter(t => t.status === 'a_tester').length,
    approuve: todos.filter(t => t.status === 'approuve').length,
    high:     todos.filter(t => t.priority === 'HIGH').length,
  }), [todos]);

  // ── Filtrage ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return todos.filter(t => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterOwner === 'me' && t.owner_id !== currentUserId) return false;
      if (search && !t.titre.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [todos, filterStatus, filterPriority, filterOwner, search, currentUserId]);

  const ownerName = (id: number) => users.find(u => u.id === id)?.name ?? `#${id}`;

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterOwner('all');
    setSearch('');
  };

  const hasActiveFilters = filterStatus !== 'all' || filterPriority !== 'all' || filterOwner !== 'all' || search !== '';

  return (
    <div className="container-fluid py-4">

      {/* ── Cartes de statistiques ── */}
      <div className="row mb-4">
        {/* Total */}
        <div className="col-xl col-sm-6 mb-xl-0 mb-3">
          <div className="card cursor-pointer" onClick={() => setFilterStatus('all')} style={{ cursor: 'pointer' }}>
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col-8">
                  <p className="text-sm mb-0 font-weight-bold text-secondary">Total</p>
                  <h4 className="font-weight-bolder mb-0">{loading ? '—' : stats.total}</h4>
                </div>
                <div className="col-4 text-end">
                  <div className="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                    <i className="ni ni-bullet-list-67 text-lg opacity-10"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* En cours */}
        <div className="col-xl col-sm-6 mb-xl-0 mb-3">
          <div className="card" onClick={() => setFilterStatus('en_cours')} style={{ cursor: 'pointer', outline: filterStatus === 'en_cours' ? '2px solid #17c1e8' : 'none' }}>
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col-8">
                  <p className="text-sm mb-0 font-weight-bold text-secondary">En cours</p>
                  <h4 className="font-weight-bolder mb-0 text-info">{loading ? '—' : stats.en_cours}</h4>
                </div>
                <div className="col-4 text-end">
                  <div className="icon icon-shape bg-gradient-info shadow text-center border-radius-md">
                    <i className="ni ni-settings-gear-65 text-lg opacity-10"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* À tester */}
        <div className="col-xl col-sm-6 mb-xl-0 mb-3">
          <div className="card" onClick={() => setFilterStatus('a_tester')} style={{ cursor: 'pointer', outline: filterStatus === 'a_tester' ? '2px solid #f53939' : 'none' }}>
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col-8">
                  <p className="text-sm mb-0 font-weight-bold text-secondary">À tester</p>
                  <h4 className="font-weight-bolder mb-0 text-warning">{loading ? '—' : stats.a_tester}</h4>
                </div>
                <div className="col-4 text-end">
                  <div className="icon icon-shape bg-gradient-warning shadow text-center border-radius-md">
                    <i className="ni ni-time-alarm text-lg opacity-10"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approuvé */}
        <div className="col-xl col-sm-6 mb-xl-0 mb-3">
          <div className="card" onClick={() => setFilterStatus('approuve')} style={{ cursor: 'pointer', outline: filterStatus === 'approuve' ? '2px solid #82d616' : 'none' }}>
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col-8">
                  <p className="text-sm mb-0 font-weight-bold text-secondary">Approuvées</p>
                  <h4 className="font-weight-bolder mb-0 text-success">{loading ? '—' : stats.approuve}</h4>
                </div>
                <div className="col-4 text-end">
                  <div className="icon icon-shape bg-gradient-success shadow text-center border-radius-md">
                    <i className="ni ni-check-bold text-lg opacity-10"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Haute priorité */}
        <div className="col-xl col-sm-6 mb-xl-0 mb-3">
          <div className="card" onClick={() => setFilterPriority('HIGH')} style={{ cursor: 'pointer', outline: filterPriority === 'HIGH' ? '2px solid #ea0606' : 'none' }}>
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col-8">
                  <p className="text-sm mb-0 font-weight-bold text-secondary">Priorité haute</p>
                  <h4 className="font-weight-bolder mb-0 text-danger">{loading ? '—' : stats.high}</h4>
                </div>
                <div className="col-4 text-end">
                  <div className="icon icon-shape bg-gradient-danger shadow text-center border-radius-md">
                    <i className="ni ni-fat-remove text-lg opacity-10"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tableau + détail ── */}
      <div className="row">
        {/* Tableau */}
        <div className={selectedTodo ? 'col-lg-8' : 'col-12'}>
          <div className="card">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h6 className="mb-0">Mes tâches</h6>
                  <p className="text-sm mb-0 text-secondary">
                    {filtered.length} tâche{filtered.length !== 1 ? 's' : ''}
                    {hasActiveFilters && <span className="text-info"> (filtrées)</span>}
                  </p>
                </div>
                <button className="btn bg-gradient-primary btn-sm mb-0" onClick={() => setModalOpen(true)}>
                  <i className="ni ni-fat-add me-1"></i>Nouvelle tâche
                </button>
              </div>

              {/* Barre de filtres */}
              <div className="row g-2 pb-2">
                {/* Recherche */}
                <div className="col-12 col-md-4">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text border-end-0 bg-transparent">
                      <i className="ni ni-zoom-split-in text-secondary text-xs"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-sm ps-1"
                      placeholder="Rechercher une tâche..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filtre statut */}
                <div className="col-6 col-md-2">
                  <select
                    className="form-select form-select-sm"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as Status | 'all')}
                  >
                    <option value="all">Tous statuts</option>
                    <option value="en_cours">En cours</option>
                    <option value="a_tester">À tester</option>
                    <option value="approuve">Approuvé</option>
                  </select>
                </div>

                {/* Filtre priorité */}
                <div className="col-6 col-md-2">
                  <select
                    className="form-select form-select-sm"
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value as Priority | 'all')}
                  >
                    <option value="all">Toutes priorités</option>
                    <option value="HIGH">Haute</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="LOW">Basse</option>
                  </select>
                </div>

                {/* Filtre assignation (admin) */}
                {isAdmin && (
                  <div className="col-6 col-md-2">
                    <select
                      className="form-select form-select-sm"
                      value={filterOwner}
                      onChange={e => setFilterOwner(e.target.value as 'all' | 'me')}
                    >
                      <option value="all">Tous les membres</option>
                      <option value="me">Mes tâches</option>
                    </select>
                  </div>
                )}

                {/* Reset */}
                {hasActiveFilters && (
                  <div className="col-auto">
                    <button className="btn btn-outline-secondary btn-sm mb-0" onClick={resetFilters}>
                      <i className="ni ni-fat-remove me-1"></i>Réinitialiser
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card-body px-0 pb-2">
              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              )}
              {error && <div className="px-4"><p className="text-danger text-sm">{error}</p></div>}

              {!loading && !error && (
                <div className="table-responsive">
                  <table className="table align-items-center mb-0">
                    <thead>
                      <tr>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Titre</th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Statut</th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Priorité</th>
                        {isAdmin && <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Assigné à</th>}
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Détail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4} className="text-center py-5 text-secondary text-sm">
                            {hasActiveFilters
                              ? <><i className="ni ni-zoom-split-in me-2"></i>Aucune tâche ne correspond aux filtres.</>
                              : <><i className="ni ni-bullet-list-67 me-2"></i>Aucune tâche. Créez votre première tâche !</>
                            }
                          </td>
                        </tr>
                      ) : (
                        filtered.map(todo => (
                          <tr
                            key={todo.id}
                            className={selectedTodo?.id === todo.id ? 'table-active' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedTodo(selectedTodo?.id === todo.id ? null : todo)}
                          >
                            <td>
                              <div className="d-flex px-2 py-1 align-items-center">
                                <div
                                  className={`icon icon-sm border-radius-sm me-3 d-flex align-items-center justify-content-center ${STATUS_CONFIG[todo.status]?.bg ?? 'bg-gradient-secondary'}`}
                                  style={{ width: '28px', height: '28px', minWidth: '28px' }}
                                >
                                  <i className={`ni ${STATUS_CONFIG[todo.status]?.icon ?? 'ni-bullet-list-67'} text-white text-xs`}></i>
                                </div>
                                <div>
                                  <h6 className="mb-0 text-sm">{todo.titre}</h6>
                                  {todo.description && (
                                    <p className="text-xs text-secondary mb-0" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {todo.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="align-middle text-center">{statusBadge(todo.status)}</td>
                            <td className="align-middle text-center">{priorityBadge(todo.priority)}</td>
                            {isAdmin && (
                              <td className="align-middle">
                                <span className="text-xs text-secondary px-2">{ownerName(todo.owner_id)}</span>
                              </td>
                            )}
                            <td className="align-middle text-center">
                              <button
                                className={`btn btn-link p-0 mb-0 ${selectedTodo?.id === todo.id ? 'text-primary' : 'text-secondary'}`}
                                title="Voir le détail"
                                onClick={e => { e.stopPropagation(); setSelectedTodo(selectedTodo?.id === todo.id ? null : todo); }}
                              >
                                <i className="ni ni-zoom-split-in text-sm"></i>
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

        {/* Panneau de détail */}
        {selectedTodo && (
          <div className="col-lg-4 mt-4 mt-lg-0">
            <DetailPanel
              todo={selectedTodo}
              ownerName={isAdmin ? ownerName(selectedTodo.owner_id) : undefined}
              onClose={() => setSelectedTodo(null)}
            />
          </div>
        )}
      </div>

      {/* Modal création */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTodo}
        title="Nouvelle tâche"
        isAdmin={isAdmin}
        users={users}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default DashboardPage;
