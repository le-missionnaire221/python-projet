import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Shield, Activity, LogOut, Save, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { User } from '../types/index';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProfile();
      setUser(data);
      setFormData({ name: data.name, email: data.email, password: '' });
    } catch (err) {
      setError('Impossible de charger le profil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const updateData: any = { name: formData.name, email: formData.email };
      if (formData.password) updateData.password = formData.password;
      
      const updatedUser = await apiService.updateProfile(updateData);
      setUser(updatedUser);
      setSuccess('Profil mis à jour avec succès !');
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }} className="animate-pulse">Chargement de votre profil...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <button 
        onClick={() => navigate('/')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}
      >
        <ArrowLeft size={18} />
        Retour au tableau de bord
      </button>

      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mon Profil</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gérez vos informations personnelles et votre compte</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Colonne de gauche : Résumé */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <UserIcon size={40} />
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{user?.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{user?.email}</p>
            
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.4rem 0.8rem', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <Shield size={14} style={{ color: user?.role === 'admin' ? 'var(--accent)' : 'var(--secondary)' }} />
              {user?.role}
            </div>
          </div>

          <div className="glass card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} />
              Statistiques
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-glass)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tâches totales</span>
              <span style={{ fontWeight: 700 }}>{user?.tasks?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Statut compte</span>
              <span style={{ color: user?.is_active ? 'var(--secondary)' : 'var(--accent)', fontWeight: 600 }}>
                {user?.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '12px', 
              border: '1px solid rgba(244, 63, 94, 0.2)', 
              background: 'rgba(244, 63, 94, 0.05)', 
              color: 'var(--accent)', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)'}
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </aside>

        {/* Colonne de droite : Formulaire */}
        <main>
          <form onSubmit={handleUpdate} className="glass card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Modifier mes informations</h3>

            {error && (
              <div style={{ 
                background: 'rgba(244, 63, 94, 0.1)', 
                color: 'var(--accent)', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem'
              }}>
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                background: 'rgba(6, 182, 212, 0.1)', 
                color: 'var(--secondary)', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem'
              }}>
                <CheckCircle2 size={20} />
                {success}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nom complet</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ paddingLeft: '3rem', width: '100%' }}
                    placeholder={user?.name}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Adresse Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ paddingLeft: '3rem', width: '100%' }}
                    placeholder={user?.email}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nouveau mot de passe (optionnel)</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    style={{ paddingLeft: '3rem', width: '100%' }}
                    placeholder="Laisser vide pour ne pas changer"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={updating}
                style={{ 
                  marginTop: '1rem', 
                  height: '52px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.8rem' 
                }}
              >
                {updating ? 'Enregistrement...' : <><Save size={20} /> Enregistrer les modifications</>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
