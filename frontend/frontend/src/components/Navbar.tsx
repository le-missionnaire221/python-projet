import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, CheckSquare, PlusCircle, User } from 'lucide-react';
import { apiService } from '../services/api';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!apiService.getToken();

  const handleLogout = () => {
    apiService.logout();
    window.location.href = '/login'; // Plus robuste pour vider les états React
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <CheckSquare size={24} />
        </div>
        <h1 className="gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>TaskMaster Pro</h1>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {isLoggedIn ? (
          <>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/')}
              style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
            >
              <PlusCircle size={18} />
              <span>Tableau de bord</span>
            </button>
            <button 
              onClick={() => navigate('/profile')}
              style={{ 
                color: 'var(--text-main)', 
                fontWeight: 500,
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'rgba(255,255,255,0.05)', 
                border: 'none', 
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.9rem'
              }}
            >
              <User size={18} />
              <span>Profil</span>
            </button>
            <button 
              onClick={handleLogout}
              style={{ 
                color: 'var(--text-muted)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '1rem'
              }}
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontWeight: 500, color: 'var(--text-main)', textDecoration: 'none' }}>Connexion</Link>
            <Link to="/signup" className="btn-primary" style={{ padding: '0.6rem 1.2rem', textDecoration: 'none' }}>S'inscrire</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
