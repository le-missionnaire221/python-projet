import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { User } from '../types/index';

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Formulaire création de compte
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, profile] = await Promise.all([
        apiService.getUsers(),
        apiService.getProfile(),
      ]);
      setEmployees(Array.isArray(data) ? data : []);
      setIsAdmin(profile.role === 'ADMIN');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement.';
      if (msg === 'Non authentifié') { window.location.href = '/login'; return; }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = async (id: number) => {
    setLoadingDetail(true);
    setDetailError('');
    setSelectedEmployee(null);
    try {
      const data = await apiService.getUserById(id);
      setSelectedEmployee(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement du détail.';
      if (msg === 'Non authentifié') { window.location.href = '/login'; return; }
      setDetailError(msg);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreating(true);
    try {
      await apiService.createUser({ name: newName, email: newEmail, password: newPassword, role: newRole });
      setCreateSuccess(`Compte créé pour ${newName}.`);
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('user');
      setShowCreateForm(false);
      await loadAll();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Erreur lors de la création.');
    } finally {
      setCreating(false);
    }
  };

  const priorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      HIGH: 'badge bg-gradient-danger',
      MEDIUM: 'badge bg-gradient-warning',
      LOW: 'badge bg-gradient-success',
    };
    const labels: Record<string, string> = { HIGH: 'Haute', MEDIUM: 'Moyenne', LOW: 'Basse' };
    return <span className={map[priority] ?? 'badge bg-gradient-secondary'}>{labels[priority] ?? priority}</span>;
  };

  return (
    <div className="container-fluid py-4">

      {createSuccess && (
        <div className="alert alert-success text-sm mb-3" role="alert">{createSuccess}</div>
      )}

      <div className="row">
        {/* Liste des employés */}
        <div className={selectedEmployee || loadingDetail || detailError ? 'col-lg-7' : 'col-12'}>
          <div className="card">
            <div className="card-header pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0">Équipe</h6>
                <p className="text-sm mb-0 text-secondary">{employees.length} membre{employees.length !== 1 ? 's' : ''}</p>
              </div>
              {isAdmin && (
                <button
                  className="btn bg-gradient-primary btn-sm mb-0"
                  onClick={() => { setShowCreateForm(true); setCreateError(''); setCreateSuccess(''); }}
                >
                  <i className="ni ni-fat-add me-1"></i>Créer un compte
                </button>
              )}
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
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nom</th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Email</th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Rôle</th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-secondary text-sm">Aucun employé trouvé.</td>
                        </tr>
                      ) : (
                        employees.map(emp => (
                          <tr
                            key={emp.id}
                            style={{ cursor: 'pointer' }}
                            className={selectedEmployee?.id === emp.id ? 'table-active' : ''}
                            onClick={() => handleSelectEmployee(emp.id)}
                          >
                            <td>
                              <div className="d-flex px-2 py-1 align-items-center">
                                <div className="avatar avatar-sm me-3 bg-gradient-primary border-radius-md d-flex align-items-center justify-content-center">
                                  <span className="text-white text-xs font-weight-bold">{emp.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="text-sm font-weight-bold">{emp.name}</span>
                              </div>
                            </td>
                            <td><p className="text-xs text-secondary mb-0 px-2">{emp.email}</p></td>
                            <td className="align-middle text-center">
                              <span className={`badge ${emp.role === 'ADMIN' ? 'bg-gradient-primary' : 'bg-gradient-secondary'}`}>
                                {emp.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}
                              </span>
                            </td>
                            <td className="align-middle text-center">
                              <span className={`badge ${emp.is_active ? 'bg-gradient-success' : 'bg-gradient-danger'}`}>
                                {emp.is_active ? 'Actif' : 'Inactif'}
                              </span>
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
        {(selectedEmployee || loadingDetail || detailError) && (
          <div className="col-lg-5 mt-4 mt-lg-0">
            <div className="card h-100">
              <div className="card-header pb-0 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Détail de l'employé</h6>
                <button className="btn btn-link p-0 mb-0 text-secondary" onClick={() => { setSelectedEmployee(null); setDetailError(''); }} title="Fermer">
                  <i className="ni ni-fat-remove"></i>
                </button>
              </div>
              <div className="card-body p-3">
                {loadingDetail && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>
                  </div>
                )}
                {detailError && <p className="text-danger text-sm">{detailError}</p>}
                {selectedEmployee && !loadingDetail && (
                  <>
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar avatar-lg bg-gradient-primary border-radius-md d-flex align-items-center justify-content-center me-3">
                        <span className="text-white font-weight-bold">{selectedEmployee.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h6 className="mb-0">{selectedEmployee.name}</h6>
                        <p className="text-xs text-secondary mb-0">{selectedEmployee.email}</p>
                      </div>
                    </div>
                    <hr className="horizontal gray-light my-3" />
                    <ul className="list-group list-group-flush mb-3">
                      <li className="list-group-item border-0 px-0 py-1 text-sm">
                        <strong>Rôle :</strong>{' '}
                        <span className={`badge ${selectedEmployee.role === 'ADMIN' ? 'bg-gradient-primary' : 'bg-gradient-secondary'}`}>
                          {selectedEmployee.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}
                        </span>
                      </li>
                      <li className="list-group-item border-0 px-0 py-1 text-sm">
                        <strong>Tâches :</strong> {selectedEmployee.tasks?.length ?? 0}
                      </li>
                    </ul>
                    {selectedEmployee.tasks && selectedEmployee.tasks.length > 0 && (
                      <>
                        <h6 className="text-xs text-uppercase font-weight-bolder opacity-6 mb-2">Tâches assignées</h6>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {selectedEmployee.tasks.map(task => (
                            <div key={task.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border-radius-md" style={{ backgroundColor: '#f8f9fa' }}>
                              <span className="text-sm">{task.titre}</span>
                              {priorityBadge(task.priority)}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal création de compte (admin) */}
      {showCreateForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="card mb-0">
                <div className="card-header pb-0 pt-3 px-4 d-flex justify-content-between align-items-center">
                  <h6 className="font-weight-bolder mb-0">Créer un compte</h6>
                  <button type="button" className="btn-close" onClick={() => setShowCreateForm(false)} aria-label="Fermer" />
                </div>
                <div className="card-body px-4 py-3">
                  <form onSubmit={handleCreateUser}>
                    <div className="mb-3">
                      <label className="form-label text-sm font-weight-bold">Nom <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={newName} onChange={e => setNewName(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-sm font-weight-bold">Email <span className="text-danger">*</span></label>
                      <input type="email" className="form-control" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-sm font-weight-bold">Mot de passe <span className="text-danger">*</span></label>
                      <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-sm font-weight-bold">Rôle</label>
                      <select className="form-control" value={newRole} onChange={e => setNewRole(e.target.value as 'user' | 'admin')}>
                        <option value="user">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                    {createError && <p className="text-danger text-xs mb-2">{createError}</p>}
                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button type="button" className="btn btn-outline-secondary btn-sm mb-0" onClick={() => setShowCreateForm(false)} disabled={creating}>Annuler</button>
                      <button type="submit" className="btn bg-gradient-primary btn-sm mb-0" disabled={creating}>
                        {creating ? 'Création...' : 'Créer le compte'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
