import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

const LoginPage: React.FC = () => {
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
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      await apiService.login(formData);
      // Redirection force pour rafraîchir l'état global (plus robuste qu'un simple navigate ici)
      window.location.href = '/';
    } catch (err) {
      setError('Email ou mot de passe incorrect');
      setLoading(false);
    }
  };

  return (
    <div className="glass card auth-card animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bon retour !</h2>
        <p style={{ color: 'var(--text-muted)' }}>Connectez-vous pour gérer vos tâches</p>
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
          {loading ? 'Connexion...' : (
            <>
              <LogIn size={20} />
              Se connecter
            </>
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
        Pas encore de compte ? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>S'inscrire</Link>
      </p>
    </div>
  );
};

export default LoginPage;
