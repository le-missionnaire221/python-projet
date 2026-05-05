import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tâches',
  '/employees': 'Employés',
  '/profile': 'Profil',
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const [userName, setUserName] = useState<string>('');

  const pageTitle = routeLabels[location.pathname] ?? 
    location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2);

  useEffect(() => {
    // Charge le nom de l'utilisateur connecté depuis le backend
    const token = apiService.getToken();
    if (!token) return;

    apiService.getProfile()
      .then(user => setUserName(user.name))
      .catch(() => setUserName(''));
  }, []);

  return (
    <nav className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl" id="navbarBlur">
      <div className="container-fluid py-1 px-3">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
            <li className="breadcrumb-item text-sm">
              <Link className="opacity-5 text-dark" to="/">Pages</Link>
            </li>
            <li className="breadcrumb-item text-sm text-dark active" aria-current="page">
              {pageTitle}
            </li>
          </ol>
          <h6 className="font-weight-bolder mb-0">{pageTitle}</h6>
        </nav>

        <div className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
          <div className="ms-md-auto pe-md-3 d-flex align-items-center">
            <div className="input-group">
              <span className="input-group-text text-body border-end-0">
                <i className="fas fa-search" aria-hidden="true"></i>
              </span>
              <input type="text" className="form-control ps-2" placeholder="Rechercher..." />
            </div>
          </div>

          <ul className="navbar-nav justify-content-end">
            {/* Nom de l'utilisateur connecté → lien vers le profil */}
            <li className="nav-item d-flex align-items-center">
              <Link to="/profile" className="nav-link text-body font-weight-bold px-0">
                <i className="fa fa-user me-sm-1"></i>
                <span className="d-sm-inline d-none">
                  {userName || '…'}
                </span>
              </Link>
            </li>

            <li className="nav-item d-xl-none ps-3 d-flex align-items-center">
              <a href="#" className="nav-link text-body p-0" id="iconNavbarSidenav">
                <div className="sidenav-toggler-inner">
                  <i className="sidenav-toggler-line"></i>
                  <i className="sidenav-toggler-line"></i>
                  <i className="sidenav-toggler-line"></i>
                </div>
              </a>
            </li>

            <li className="nav-item px-3 d-flex align-items-center">
              <a href="#" className="nav-link text-body p-0">
                <i className="fa fa-cog fixed-plugin-button-nav cursor-pointer"></i>
              </a>
            </li>

            <li className="nav-item pe-2 d-flex align-items-center">
              <a href="#" className="nav-link text-body p-0">
                <i className="fa fa-bell cursor-pointer"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
