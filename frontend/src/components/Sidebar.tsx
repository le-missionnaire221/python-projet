import React from 'react';
import { NavLink } from 'react-router-dom';
import { apiService } from '../services/api';

const logoCt = '/assets/img/logo-ct.png';

const Sidebar: React.FC = () => {
  const handleLogout = () => {
    apiService.logout();
    window.location.href = '/login';
  };

  return (
    <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 bg-white" id="sidenav-main">
      <div className="sidenav-header">
        <i className="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
        <a className="navbar-brand m-0" href="/">
          <img src={logoCt} className="navbar-brand-img h-100" alt="main_logo" />
          <span className="ms-1 font-weight-bold">Gestion Équipe</span>
        </a>
      </div>
      <hr className="horizontal dark mt-0" />
      <div className="collapse navbar-collapse w-auto max-height-vh-100 h-100" id="sidenav-collapse-main">
        <ul className="navbar-nav">

          {/* Navigation principale */}
          <li className="nav-item mt-2">
            <h6 className="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">Navigation</h6>
          </li>

          <li className="nav-item">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <i className="ni ni-tv-2 text-primary text-sm opacity-10"></i>
              </div>
              <span className="nav-link-text ms-1">Dashboard</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/tasks"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <i className="ni ni-bullet-list-67 text-warning text-sm opacity-10"></i>
              </div>
              <span className="nav-link-text ms-1">Tâches</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/employees"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <i className="ni ni-single-02 text-dark text-sm opacity-10"></i>
              </div>
              <span className="nav-link-text ms-1">Employés</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <i className="ni ni-circle-08 text-info text-sm opacity-10"></i>
              </div>
              <span className="nav-link-text ms-1">Profil</span>
            </NavLink>
          </li>

          {/* Déconnexion */}
          <li className="nav-item mt-3">
            <h6 className="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">Compte</h6>
          </li>
          <li className="nav-item">
            <button
              className="nav-link border-0 bg-transparent w-100 text-start"
              onClick={handleLogout}
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <i className="ni ni-user-run text-danger text-sm opacity-10"></i>
              </div>
              <span className="nav-link-text ms-1">Déconnexion</span>
            </button>
          </li>

        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
