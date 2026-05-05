import React, { useState, useEffect } from 'react';
import type { Todo, Priority, Status, User } from '../types/index';

export interface TaskFormData {
  titre: string;
  description: string;
  priority: Priority;
  status: Status;
  owner_id?: number;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Partial<Todo>;
  title: string;
  isAdmin?: boolean;
  users?: User[];
  currentUserId?: number;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  isAdmin = false,
  users = [],
  currentUserId,
}) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [status, setStatus] = useState<Status>('en_cours');
  const [ownerId, setOwnerId] = useState<number | undefined>(currentUserId);
  const [titreError, setTitreError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitre(initialData?.titre ?? '');
      setDescription(initialData?.description ?? '');
      setPriority(initialData?.priority ?? 'MEDIUM');
      setStatus(initialData?.status ?? 'en_cours');
      setOwnerId(initialData?.owner_id ?? currentUserId);
      setTitreError('');
      setSubmitError('');
    }
  }, [isOpen, initialData, currentUserId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitreError('');
    setSubmitError('');

    if (!titre.trim()) {
      setTitreError('Le titre est obligatoire.');
      return;
    }

    setLoading(true);
    try {
      const data: TaskFormData = {
        titre: titre.trim(),
        description: description.trim(),
        priority,
        status,
      };
      if (isAdmin && ownerId !== undefined) {
        data.owner_id = ownerId;
      }
      await onSubmit(data);
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="card mb-0">
            <div className="card-header pb-0 pt-3 px-4 d-flex justify-content-between align-items-center">
              <h6 className="font-weight-bolder mb-0">{title}</h6>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fermer" />
            </div>
            <div className="card-body px-4 py-3">
              <form onSubmit={handleSubmit}>

                {/* Titre */}
                <div className="mb-3">
                  <label className="form-label text-sm font-weight-bold" htmlFor="task-titre">
                    Titre <span className="text-danger">*</span>
                  </label>
                  <input
                    id="task-titre"
                    type="text"
                    className={`form-control ${titreError ? 'is-invalid' : ''}`}
                    placeholder="Titre de la tâche"
                    value={titre}
                    onChange={e => setTitre(e.target.value)}
                    aria-label="Titre"
                  />
                  {titreError && <p className="text-danger text-xs mt-1">{titreError}</p>}
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label text-sm font-weight-bold" htmlFor="task-description">
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    className="form-control"
                    placeholder="Description (optionnelle)"
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    aria-label="Description"
                  />
                </div>

                {/* Priorité */}
                <div className="mb-3">
                  <label className="form-label text-sm font-weight-bold" htmlFor="task-priority">
                    Priorité
                  </label>
                  <select
                    id="task-priority"
                    className="form-control"
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    aria-label="Priorité"
                  >
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                  </select>
                </div>

                {/* Statut */}
                <div className="mb-3">
                  <label className="form-label text-sm font-weight-bold" htmlFor="task-status">
                    Statut
                  </label>
                  <select
                    id="task-status"
                    className="form-control"
                    value={status}
                    onChange={e => setStatus(e.target.value as Status)}
                    aria-label="Statut"
                  >
                    <option value="en_cours">En cours</option>
                    <option value="a_tester">À tester</option>
                    <option value="approuve">Approuvé</option>
                  </select>
                </div>

                {/* Assigner à (admin uniquement) */}
                {isAdmin && users.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label text-sm font-weight-bold" htmlFor="task-owner">
                      Assigner à
                    </label>
                    <select
                      id="task-owner"
                      className="form-control"
                      value={ownerId ?? ''}
                      onChange={e => setOwnerId(Number(e.target.value))}
                      aria-label="Assigner à"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.id === currentUserId ? '(moi)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {submitError && (
                  <p className="text-danger text-xs mt-1 mb-2">{submitError}</p>
                )}

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm mb-0"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn bg-gradient-primary btn-sm mb-0"
                    disabled={loading}
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
