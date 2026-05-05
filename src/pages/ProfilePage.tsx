import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { User } from '../types/index';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProfile();
      setUser(data);
    } catch (err) {
      console.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container-fluid py-4">Chargement...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="page-header min-height-300 border-radius-xl mt-4" style={{ backgroundImage: "url('/assets/img/curved-images/curved0.jpg')", backgroundPositionY: '50%' }}>
        <span className="mask bg-gradient-primary opacity-6"></span>
      </div>
      <div className="card card-body blur shadow-blur mx-4 mt-n6 overflow-hidden">
        <div className="row gx-4">
          <div className="col-auto">
            <div className="avatar avatar-xl position-relative">
              <img src="/assets/img/bruce-mars.jpg" alt="profile_image" className="w-100 border-radius-lg shadow-sm" />
            </div>
          </div>
          <div className="col-auto my-auto">
            <div className="h-100">
              <h5 className="mb-1">{user?.name}</h5>
              <p className="mb-0 font-weight-bold text-sm">{user?.role || 'Utilisateur'}</p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 my-sm-auto ms-sm-auto me-sm-0 mx-auto mt-3">
            <div className="nav-wrapper position-relative end-0">
              <ul className="nav nav-pills nav-fill p-1 bg-transparent" role="tablist">
                <li className="nav-item">
                  <a className="nav-link mb-0 px-0 py-1 active" data-bs-toggle="tab" href="#" role="tab" aria-selected="true">
                    <i className="ni ni-app text-sm me-2"></i>
                    <span className="ms-1">App</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#" role="tab" aria-selected="false">
                    <i className="ni ni-email-83 text-sm me-2"></i>
                    <span className="ms-1">Messages</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#" role="tab" aria-selected="false">
                    <i className="ni ni-settings-gear-65 text-sm me-2"></i>
                    <span className="ms-1">Settings</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12 col-xl-4">
            <div className="card h-100">
              <div className="card-header pb-0 p-3">
                <h6 className="mb-0">Platform Settings</h6>
              </div>
              <div className="card-body p-3">
                <h6 className="text-uppercase text-body text-xs font-weight-bolder">Account</h6>
                <ul className="list-group">
                  <li className="list-group-item border-0 px-0">
                    <div className="form-check form-switch ps-0">
                      <input className="form-check-input ms-auto" type="checkbox" id="flexSwitchCheckDefault" defaultChecked />
                      <label className="form-check-label text-body ms-3 text-truncate w-80 mb-0" htmlFor="flexSwitchCheckDefault">Email me when someone follows me</label>
                    </div>
                  </li>
                  <li className="list-group-item border-0 px-0">
                    <div className="form-check form-switch ps-0">
                      <input className="form-check-input ms-auto" type="checkbox" id="flexSwitchCheckDefault1" />
                      <label className="form-check-label text-body ms-3 text-truncate w-80 mb-0" htmlFor="flexSwitchCheckDefault1">Email me when someone answers on my post</label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-12 col-xl-4">
            <div className="card h-100">
              <div className="card-header pb-0 p-3">
                <div className="row">
                  <div className="col-md-8 d-flex align-items-center">
                    <h6 className="mb-0">Profile Information</h6>
                  </div>
                  <div className="col-md-4 text-end">
                    <a href="#">
                      <i className="fas fa-user-edit text-secondary text-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Edit Profile"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="card-body p-3">
                <p className="text-sm">
                  Hi, I’m {user?.name}, Decisions: If you can’t decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term.
                </p>
                <hr className="horizontal gray-light my-4" />
                <ul className="list-group">
                  <li className="list-group-item border-0 ps-0 pt-0 text-sm"><strong className="text-dark">Full Name:</strong> &nbsp; {user?.name}</li>
                  <li className="list-group-item border-0 ps-0 text-sm"><strong className="text-dark">Mobile:</strong> &nbsp; (44) 123 1234 123</li>
                  <li className="list-group-item border-0 ps-0 text-sm"><strong className="text-dark">Email:</strong> &nbsp; {user?.email}</li>
                  <li className="list-group-item border-0 ps-0 text-sm"><strong className="text-dark">Location:</strong> &nbsp; USA</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-12 col-xl-4">
            <div className="card h-100">
              <div className="card-header pb-0 p-3">
                <h6 className="mb-0">Conversations</h6>
              </div>
              <div className="card-body p-3">
                <ul className="list-group">
                  <li className="list-group-item border-0 d-flex align-items-center px-0 mb-2">
                    <div className="avatar me-3">
                      <img src="/assets/img/kal-visuals-square.jpg" alt="kal" className="border-radius-lg shadow" />
                    </div>
                    <div className="d-flex align-items-start flex-column justify-content-center">
                      <h6 className="mb-0 text-sm">Sophie B.</h6>
                      <p className="mb-0 text-xs">Hi! I need more information..</p>
                    </div>
                    <a className="btn btn-link pe-3 ps-0 mb-0 ms-auto" href="#">Reply</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-12 mt-4">
            <div className="card mb-4">
              <div className="card-header pb-0 p-3">
                <h6 className="mb-1">Projects</h6>
                <p className="text-sm">Architects design houses</p>
              </div>
              <div className="card-body p-3">
                <div className="row">
                  <div className="col-xl-3 col-md-6 mb-xl-0 mb-4">
                    <div className="card card-blog card-plain">
                      <div className="position-relative">
                        <a className="d-block shadow-xl border-radius-xl">
                          <img src="/assets/img/home-decor-1.jpg" alt="img-blur-shadow" className="img-fluid shadow border-radius-xl" />
                        </a>
                      </div>
                      <div className="card-body px-1 pb-0">
                        <p className="text-gradient text-dark mb-2 text-sm">Project #2</p>
                        <a href="#">
                          <h5>Modern</h5>
                        </a>
                        <p className="mb-4 text-sm">As Uber works through a huge amount of internal management turmoil.</p>
                        <div className="d-flex align-items-center justify-content-between">
                          <button type="button" className="btn btn-outline-primary btn-sm mb-0">View Project</button>
                          <div className="avatar-group mt-2">
                            <a href="#" className="avatar avatar-xs rounded-circle">
                              <img alt="Image placeholder" src="/assets/img/team-1.jpg" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
