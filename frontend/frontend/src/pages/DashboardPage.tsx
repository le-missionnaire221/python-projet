import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Clock, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import type { Todo, Priority } from '../types/index';

const DashboardPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState({ titre: '', description: '', priority: 'medium' as Priority });
  const [filter, setFilter] = useState<Priority | 'all'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const token = apiService.getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getTodos();
      console.log('Tâches chargées:', data);
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Impossible de récupérer vos tâches. Vérifiez votre connexion.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiService.createTodo(newTodo);
      setSuccess('Tâche créée avec succès !');
      setNewTodo({ titre: '', description: '', priority: 'medium' });
      setShowForm(false);
      loadTodos();
    } catch (err) {
      setError('Erreur lors de la création de la tâche.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;
    setError('');
    setSuccess('');
    try {
      await apiService.updateTodo(editingTodo.id, {
        titre: editingTodo.titre,
        description: editingTodo.description,
        priority: editingTodo.priority
      });
      setSuccess('Tâche mise à jour !');
      setEditingTodo(null);
      loadTodos();
    } catch (err) {
      setError('Erreur lors de la modification.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      setError('');
      try {
        await apiService.deleteTodo(id);
        setSuccess('Tâche supprimée.');
        loadTodos();
      } catch (err) {
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const filteredTodos = filter === 'all' ? todos : todos.filter(t => t.priority === filter);

  const translatePriority = (p: string) => {
    switch (p) {
      case 'all': return 'Tout';
      case 'low': return 'Basse';
      case 'medium': return 'Moyenne';
      case 'high': return 'Haute';
      default: return p;
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        marginBottom: '2.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mes Tâches</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez vos objectifs quotidiens</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
           {/* Messages d'état */}
           {error && <div style={{ color: 'var(--accent)', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(244,63,94,0.1)', borderRadius: '8px' }}>{error}</div>}
           {success && <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(6,182,212,0.1)', borderRadius: '8px' }}>{success}</div>}
           
           <div className="glass" style={{ 
             display: 'flex', 
             borderRadius: '12px', 
             padding: '0.3rem',
             alignItems: 'center'
           }}>
             {(['all', 'low', 'medium', 'high'] as const).map(p => (
               <button
                key={p}
                onClick={() => setFilter(p)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: filter === p ? 'white' : 'var(--text-muted)',
                  background: filter === p ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
               >
                 {translatePriority(p)}
               </button>
             ))}
           </div>
           
           <button 
             className="btn-primary" 
             onClick={() => setShowForm(!showForm)}
           >
             <Plus size={20} />
             {showForm ? 'Annuler' : 'Ajouter'}
           </button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleCreate} className="glass card animate-fade-in" style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Nouvelle Tâche</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                placeholder="Titre de la tâche" 
                value={newTodo.titre}
                onChange={e => setNewTodo({ ...newTodo, titre: e.target.value })}
                required 
              />
              <textarea 
                placeholder="Description détaillée..." 
                rows={4}
                value={newTodo.description}
                onChange={e => setNewTodo({ ...newTodo, description: e.target.value })}
                style={{ resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Priorité</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewTodo({ ...newTodo, priority: p })}
                    className={newTodo.priority === p ? `badge-${p}` : ''}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: newTodo.priority === p ? `2px solid var(--${p === 'low' ? 'secondary' : p === 'high' ? 'accent' : 'primary'})` : '2px solid rgba(255,255,255,0.1)',
                      background: newTodo.priority === p ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: newTodo.priority === p ? 'inherit' : 'var(--text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {translatePriority(p)}
                  </button>
                ))}
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: 'auto', height: '52px' }}>
                Créer la tâche
              </button>
            </div>
          </div>
        </form>
      )}

      {editingTodo && (
        <form onSubmit={handleUpdate} className="glass card animate-fade-in" style={{ marginBottom: '3rem', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Modifier la Tâche</h3>
            <button type="button" onClick={() => setEditingTodo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Annuler</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                placeholder="Titre" 
                value={editingTodo.titre}
                onChange={e => setEditingTodo({ ...editingTodo, titre: e.target.value })}
                required 
              />
              <textarea 
                placeholder="Description" 
                rows={4}
                value={editingTodo.description}
                onChange={e => setEditingTodo({ ...editingTodo, description: e.target.value })}
                style={{ resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Priorité</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditingTodo({ ...editingTodo, priority: p })}
                    className={editingTodo.priority === p ? `badge-${p}` : ''}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: editingTodo.priority === p ? `2px solid var(--${p === 'low' ? 'secondary' : p === 'high' ? 'accent' : 'primary'})` : '2px solid rgba(255,255,255,0.1)',
                      background: editingTodo.priority === p ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: editingTodo.priority === p ? 'inherit' : 'var(--text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {translatePriority(p)}
                  </button>
                ))}
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: 'auto', height: '52px' }}>
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Chargement...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {filteredTodos.map(todo => (
            <div key={todo.id} className={`glass card animate-fade-in badge-${todo.priority}`} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              borderWidth: '1px',
              borderLeftWidth: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.1)'
                }}>
                  {translatePriority(todo.priority)}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setEditingTodo(todo)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => handleDelete(todo.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{todo.titre}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', flex: 1 }}>
                {todo.description}
              </p>
              
              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                <Clock size={14} />
                <span>ID: {todo.id}</span>
              </div>
            </div>
          ))}
          
          {filteredTodos.length === 0 && (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '4rem', 
              color: 'var(--text-muted)',
              border: '2px dashed var(--border-glass)',
              borderRadius: '16px'
            }}>
              <CheckCircle2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Aucune tâche trouvée. Commencez par en créer une !</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
