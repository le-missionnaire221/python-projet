import React from 'react';
import { NavLink } from 'react-router-dom';

const logoCt = '/assets/img/logo-ct.png';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 bg-white" id="sidenav-main">
      <div className="sidenav-header">
        <i className="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
        <a className="navbar-brand m-0" href="/">
          <img src={logoCt} className="navbar-brand-img h-100" alt="main_logo" />
          <span className="ms-1 font-weight-bold">Soft UI Dash</span>
        </a>
      </div>
      <hr className="horizontal dark mt-0" />
      <div className="collapse navbar-collapse w-auto max-height-vh-100 h-100" id="sidenav-collapse-main">
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <i className="ni ni-tv-2 text-primary text-sm opacity-10"></i>
              </div>
              <span className="nav-link-text ms-1">Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <i className="ni ni-single-02 text-dark text-sm opacity-10"></i>
              </div>
              <span className="nav-link-text ms-1">Profile</span>
            </NavLink>
          </li>
          
          <li className="nav-item mt-3">
            <h6 className="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">Account pages</h6>
          </li>
          <li className="nav-item">
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <i className="ni ni-key-25 text-info text-sm opacity-10"></i>
              </div>
              <span className="nav-link-text ms-1">Sign In</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/signup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <i className="ni ni-rocket text-danger text-sm opacity-10"></i>
              </div>
              <span className="nav-link-text ms-1">Sign Up</span>
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="sidenav-footer mx-3 ">
        <div className="card card-background shadow-none card-background-mask-secondary" id="sidenavCard">
          <div className="full-background" style={{ backgroundImage: "url('/assets/img/curved-images/white-curved.jpeg')" }}></div>
          <div className="card-body text-start p-3 w-100">
            <div className="icon icon-shape icon-sm bg-white shadow text-center mb-3 d-flex align-items-center justify-content-center border-radius-md">
              <i className="ni ni-diamond text-dark text-gradient text-lg top-0" aria-hidden="true" id="sidenavCardIcon"></i>
            </div>
            <div className="docs-info">
              <h6 className="text-white up mb-0">Besoin d'aide ?</h6>
              <p className="text-xs font-weight-bold">Consultez les docs</p>
              <a href="#" className="btn btn-white btn-sm w-100 mb-0">Documentation</a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
