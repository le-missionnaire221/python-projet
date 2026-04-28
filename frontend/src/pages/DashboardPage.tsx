import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Todo } from '../types/index';

const DashboardPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    try {
      const data = await apiService.getTodos();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    todayMoney: '$53,000',
    todayUsers: '2,300',
    newClients: '+3,462',
    sales: '$103,430',
  };

  return (
    <div className="container-fluid py-4">
      {loading && <div className="text-center p-4">Chargement...</div>}
      {/* 4 Cards at the top */}
      <div className="row">
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card">
            <div className="card-body p-3">
              <div className="row">
                <div className="col-8">
                  <div className="numbers">
                    <p className="text-sm mb-0 text-capitalize font-weight-bold">Today's Money</p>
                    <h5 className="font-weight-bolder mb-0">
                      {stats.todayMoney}
                      <span className="text-success text-sm font-weight-bolder"> +55%</span>
                    </h5>
                  </div>
                </div>
                <div className="col-4 text-end">
                  <div className="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                    <i className="ni ni-money-coins text-lg opacity-10" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card">
            <div className="card-body p-3">
              <div className="row">
                <div className="col-8">
                  <div className="numbers">
                    <p className="text-sm mb-0 text-capitalize font-weight-bold">Today's Users</p>
                    <h5 className="font-weight-bolder mb-0">
                      {stats.todayUsers}
                      <span className="text-success text-sm font-weight-bolder"> +3%</span>
                    </h5>
                  </div>
                </div>
                <div className="col-4 text-end">
                  <div className="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                    <i className="ni ni-world text-lg opacity-10" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card">
            <div className="card-body p-3">
              <div className="row">
                <div className="col-8">
                  <div className="numbers">
                    <p className="text-sm mb-0 text-capitalize font-weight-bold">New Clients</p>
                    <h5 className="font-weight-bolder mb-0">
                      {stats.newClients}
                      <span className="text-danger text-sm font-weight-bolder"> -2%</span>
                    </h5>
                  </div>
                </div>
                <div className="col-4 text-end">
                  <div className="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                    <i className="ni ni-paper-diploma text-lg opacity-10" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="card">
            <div className="card-body p-3">
              <div className="row">
                <div className="col-8">
                  <div className="numbers">
                    <p className="text-sm mb-0 text-capitalize font-weight-bold">Sales</p>
                    <h5 className="font-weight-bolder mb-0">
                      {stats.sales}
                      <span className="text-success text-sm font-weight-bolder"> +5%</span>
                    </h5>
                  </div>
                </div>
                <div className="col-4 text-end">
                  <div className="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                    <i className="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row with Rocket and Developers cards */}
      <div className="row mt-4">
        <div className="col-lg-7 mb-lg-0 mb-4">
          <div className="card">
            <div className="card-body p-3">
              <div className="row">
                <div className="col-lg-6">
                  <div className="d-flex flex-column h-100">
                    <p className="mb-1 pt-2 text-bold">Built by developers</p>
                    <h5 className="font-weight-bolder">Soft UI Dashboard</h5>
                    <p className="mb-5">From colors, cards, typography to complex elements, you will find the full documentation.</p>
                    <a className="text-body text-sm font-weight-bold mb-0 icon-move-right mt-auto" href="#">
                      Read More
                      <i className="fas fa-arrow-right text-sm ms-1" aria-hidden="true"></i>
                    </a>
                  </div>
                </div>
                <div className="col-lg-5 ms-auto text-center mt-5 mt-lg-0">
                  <div className="bg-gradient-primary border-radius-lg h-100">
                    <img src="/assets/img/shapes/waves-white.svg" className="position-absolute h-100 w-50 top-0 d-lg-block d-none" alt="waves" />
                    <div className="position-relative d-flex align-items-center justify-content-center h-100">
                      <img className="w-100 position-relative z-index-2 pt-4" src="/assets/img/illustrations/rocket-white.png" alt="rocket" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card h-100 p-3">
            <div className="overflow-hidden position-relative border-radius-lg bg-cover h-100" style={{ backgroundImage: "url('/assets/img/ivancik.jpg')" }}>
              <span className="mask bg-gradient-dark"></span>
              <div className="card-body position-relative z-index-1 d-flex flex-column h-100 p-3">
                <h5 className="text-white font-weight-bolder mb-4 pt-2">Work with the rockets</h5>
                <p className="text-white">Wealth creation is an evolutionarily recent positive-sum game. It is all about who you work with.</p>
                <a className="text-white text-sm font-weight-bold mb-0 icon-move-right mt-auto" href="#">
                  Read More
                  <i className="fas fa-arrow-right text-sm ms-1" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row with Charts Placeholder (Static design) */}
      <div className="row mt-4">
        <div className="col-lg-5 mb-lg-0 mb-4">
          <div className="card z-index-2">
            <div className="card-body p-3">
              <div className="bg-gradient-dark border-radius-lg py-3 pe-1 mb-3">
                <div className="chart">
                  <div style={{ height: '170px' }} className="d-flex align-items-center justify-content-center text-white opacity-5">Chart Placeholder</div>
                </div>
              </div>
              <h6 className="ms-2 mt-4 mb-0"> Active Users </h6>
              <p className="text-sm ms-2"> (<span className="font-weight-bolder">+23%</span>) than last week </p>
              <div className="container border-radius-lg">
                <div className="row">
                  <div className="col-3 py-3 ps-0">
                    <div className="d-flex mb-2">
                      <div className="icon icon-shape icon-xxs shadow border-radius-sm bg-gradient-primary text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="ni ni-library text-white opacity-10"></i>
                      </div>
                      <p className="text-xs mt-1 mb-0 font-weight-bold">Users</p>
                    </div>
                    <h4 className="font-weight-bolder">36K</h4>
                    <div className="progress w-75">
                      <div className="progress-bar bg-dark w-60" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                  </div>
                  <div className="col-3 py-3 ps-0">
                    <div className="d-flex mb-2">
                      <div className="icon icon-shape icon-xxs shadow border-radius-sm bg-gradient-info text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="ni ni-delivery-fast text-white opacity-10"></i>
                      </div>
                      <p className="text-xs mt-1 mb-0 font-weight-bold">Clicks</p>
                    </div>
                    <h4 className="font-weight-bolder">2m</h4>
                    <div className="progress w-75">
                      <div className="progress-bar bg-dark w-90" role="progressbar" aria-valuenow={90} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card z-index-2">
            <div className="card-header pb-0">
              <h6>Sales overview</h6>
              <p className="text-sm">
                <i className="fa fa-arrow-up text-success"></i>
                <span className="font-weight-bold">4% more</span> in 2021
              </p>
            </div>
            <div className="card-body p-3">
              <div className="chart">
                <div style={{ height: '300px' }} className="d-flex align-items-center justify-content-center text-secondary opacity-5">Chart Placeholder</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table & Orders */}
      <div className="row my-4">
        <div className="col-lg-8 col-md-6 mb-md-0 mb-4">
          <div className="card">
            <div className="card-header pb-0">
              <div className="row">
                <div className="col-lg-6 col-7">
                  <h6>Projects (Todos)</h6>
                  <p className="text-sm mb-0">
                    <i className="fa fa-check text-info" aria-hidden="true"></i>
                    <span className="font-weight-bold ms-1">{todos.length} done</span> this month
                  </p>
                </div>
                <div className="col-lg-6 col-5 text-end">
                  <div className="dropdown float-lg-end pe-4">
                    <a className="cursor-pointer" id="dropdownTable" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="fa fa-ellipsis-v text-secondary"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body px-0 pb-2">
              <div className="table-responsive">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Companies (Titre)</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Members (Owner)</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Budget (Priorité)</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todos.map(todo => (
                      <tr key={todo.id}>
                        <td>
                          <div className="d-flex px-2 py-1">
                            <div>
                              <div className="icon icon-sm bg-gradient-info shadow border-radius-sm me-3 d-flex align-items-center justify-content-center">
                                <i className="ni ni-check-bold text-white text-xs"></i>
                              </div>
                            </div>
                            <div className="d-flex flex-column justify-content-center">
                              <h6 className="mb-0 text-sm">{todo.titre}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="avatar-group mt-2">
                            <span className="text-xs font-weight-bold">Owner: {todo.owner_id}</span>
                          </div>
                        </td>
                        <td className="align-middle text-center text-sm">
                          <span className={`text-xs font-weight-bold ${todo.priority === 'high' ? 'text-danger' : 'text-info'}`}> {todo.priority.toUpperCase()} </span>
                        </td>
                        <td className="align-middle">
                          <div className="progress-wrapper w-75 mx-auto">
                            <div className="progress-info">
                              <div className="progress-percentage">
                                <span className="text-xs font-weight-bold">{todo.priority === 'high' ? '10%' : '50%'}</span>
                              </div>
                            </div>
                            <div className="progress">
                              <div className={`progress-bar bg-gradient-${todo.priority === 'high' ? 'danger' : 'info'} w-${todo.priority === 'high' ? '10' : '50'}`} role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="card h-100">
            <div className="card-header pb-0">
              <h6>Orders overview</h6>
              <p className="text-sm">
                <i className="fa fa-arrow-up text-success" aria-hidden="true"></i>
                <span className="font-weight-bold">24%</span> this month
              </p>
            </div>
            <div className="card-body p-3">
              <div className="timeline timeline-one-side">
                <div className="timeline-block mb-3">
                  <span className="timeline-step">
                    <i className="ni ni-bell-55 text-success text-gradient"></i>
                  </span>
                  <div className="timeline-content">
                    <h6 className="text-dark text-sm font-weight-bold mb-0">$2400, Design changes</h6>
                    <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">22 DEC 7:20 PM</p>
                  </div>
                </div>
                {/* ... more timeline blocks ... */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
