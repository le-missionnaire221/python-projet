import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiService.signup({ name, email, password });
      navigate('/login');
    } catch (err) {
      setError('Erreur lors de l’inscription. Cet email est peut-être déjà utilisé.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass card auth-card animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Créer un compte</h2>
        <p style={{ color: 'var(--text-muted)' }}>Rejoignez TaskMaster Pro aujourd'hui</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            padding: '0.8rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="input-icon-wrapper">
          <User size={18} className="input-icon" />
          <input
            type="text"
            placeholder="Nom complet"
            className="input-with-icon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-icon-wrapper">
          <Mail size={18} className="input-icon" />
          <input
            type="email"
            placeholder="Adresse email"
            className="input-with-icon"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-icon-wrapper">
          <Lock size={18} className="input-icon" />
          <input
            type="password"
            placeholder="Mot de passe"
            className="input-with-icon"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading}
          style={{ marginTop: '1rem', height: '52px' }}
        >
          {loading ? 'Création...' : (
            <>
              <UserPlus size={20} />
              S'inscrire
            </>
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
        Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
      </p>
    </div>
  );
};

export default SignupPage;
