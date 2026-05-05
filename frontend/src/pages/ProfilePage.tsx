import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { User } from '../types/index';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulaire de modification
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getProfile();
      setUser(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement du profil.';
      if (msg === 'Non authentifié') { window.location.href = '/login'; return; }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setNameError('');
    setEmailError('');
    setUpdateError('');
    setUpdateSuccess('');
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');
    setUpdateError('');
    setUpdateSuccess('');

    let valid = true;
    if (!name.trim()) { setNameError('Le nom est obligatoire.'); valid = false; }
    if (!email.trim()) { setEmailError("L'email est obligatoire."); valid = false; }
    if (!valid) return;

    setSaving(true);
    try {
      const updated = await apiService.updateProfile({ name: name.trim(), email: email.trim() });
      setUser(updated);
      setUpdateSuccess('Profil mis à jour avec succès.');
      setEditing(false);
    } catch (err: unknown) {
      setUpdateError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <p className="text-danger text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      {/* En-tête profil */}
      <div className="page-header min-height-200 border-radius-xl mt-2" style={{ backgroundImage: "url('/assets/img/curved-images/curved0.jpg')", backgroundPositionY: '50%' }}>
        <span className="mask bg-gradient-primary opacity-6"></span>
      </div>

      <div className="card card-body blur shadow-blur mx-4 mt-n6 overflow-hidden mb-4">
        <div className="row gx-4 align-items-center">
          <div className="col-auto">
            <div className="avatar avatar-xl bg-gradient-primary border-radius-md d-flex align-items-center justify-content-center shadow">
              <span className="text-white font-weight-bold" style={{ fontSize: '2rem' }}>
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="col-auto my-auto">
            <h5 className="mb-1">{user?.name}</h5>
            <p className="mb-0 font-weight-bold text-sm text-secondary">
              {user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'} · {user?.email}
            </p>
          </div>
          <div className="col-auto ms-auto">
            {!editing && (
              <button
                className="btn bg-gradient-primary btn-sm mb-0"
                onClick={handleOpenEdit}
              >
                <i className="ni ni-settings-gear-65 me-1"></i>
                Modifier le profil
              </button>
            )}
          </div>
        </div>
      </div>

      {updateSuccess && (
        <div className="alert alert-success text-sm mx-4 mb-3" role="alert">
          {updateSuccess}
        </div>
      )}

      <div className="row mx-0">

        {/* Informations + formulaire */}
        <div className="col-12 col-xl-4 mb-4">
          <div className="card h-100">
            <div className="card-header pb-0 p-3">
              <h6 className="mb-0">Informations du profil</h6>
            </div>
            <div className="card-body p-3">
              {!editing ? (
                <ul className="list-group list-group-flush">
                  <li className="list-group-item border-0 ps-0 pt-0 text-sm">
                    <strong className="text-dark">Nom :</strong> {user?.name}
                  </li>
                  <li className="list-group-item border-0 ps-0 text-sm">
                    <strong className="text-dark">Email :</strong> {user?.email}
                  </li>
                  <li className="list-group-item border-0 ps-0 text-sm">
                    <strong className="text-dark">Rôle :</strong>{' '}
                    <span className={`badge ${user?.role === 'ADMIN' ? 'bg-gradient-primary' : 'bg-gradient-secondary'}`}>
                      {user?.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}
                    </span>
                  </li>
                  <li className="list-group-item border-0 ps-0 text-sm">
                    <strong className="text-dark">Statut :</strong>{' '}
                    <span className={`badge ${user?.is_active ? 'bg-gradient-success' : 'bg-gradient-danger'}`}>
                      {user?.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </li>
                  <li className="list-group-item border-0 ps-0 text-sm">
                    <strong className="text-dark">Tâches :</strong> {user?.tasks?.length ?? 0}
                  </li>
                </ul>
              ) : (
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label text-sm font-weight-bold" htmlFor="profile-name">
                      Nom <span className="text-danger">*</span>
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      className={`form-control ${nameError ? 'is-invalid' : ''}`}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      aria-label="Nom"
                    />
                    {nameError && <p className="text-danger text-xs mt-1">{nameError}</p>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-sm font-weight-bold" htmlFor="profile-email">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      className={`form-control ${emailError ? 'is-invalid' : ''}`}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      aria-label="Email"
                    />
                    {emailError && <p className="text-danger text-xs mt-1">{emailError}</p>}
                  </div>
                  {updateError && <p className="text-danger text-xs mb-2">{updateError}</p>}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn bg-gradient-primary btn-sm mb-0"
                      disabled={saving}
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm mb-0"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="col-12 col-xl-8 mb-4">
          <div className="card h-100">
            <div className="card-header pb-0 p-3">
              <h6 className="mb-0">Mes tâches ({user?.tasks?.length ?? 0})</h6>
            </div>
            <div className="card-body p-3">
              {!user?.tasks || user.tasks.length === 0 ? (
                <p className="text-secondary text-sm">Aucune tâche assignée.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-items-center mb-0">
                    <thead>
                      <tr>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Titre</th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Description</th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Priorité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.tasks.map(task => (
                        <tr key={task.id}>
                          <td>
                            <p className="text-sm font-weight-bold mb-0 px-2">{task.titre}</p>
                          </td>
                          <td>
                            <p className="text-xs text-secondary mb-0 px-2">
                              {task.description || <em className="opacity-5">—</em>}
                            </p>
                          </td>
                          <td className="align-middle text-center">
                            {priorityBadge(task.priority)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
