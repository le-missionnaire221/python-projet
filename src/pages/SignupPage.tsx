import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    } catch {
      setError('Erreur lors de l’inscription. Cet email est peut-être déjà utilisé.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-vh-100 mb-8">
      <div className="page-header align-items-start min-vh-50 pt-5 pb-11 m-3 border-radius-lg" style={{ backgroundImage: "url('/assets/img/curved-images/curved14.jpg')" }}>
        <span className="mask bg-gradient-dark opacity-6"></span>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 text-center mx-auto">
              <h1 className="text-white mb-2 mt-5">Welcome!</h1>
              <p className="text-lead text-white">Use these awesome forms to login or create new account in your project for free.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row mt-n12 justify-content-center">
          <div className="col-xl-4 col-lg-5 col-md-7 mx-auto">
            <div className="card z-index-0">
              <div className="card-header text-center pt-4">
                <h5>Register with</h5>
              </div>
              <div className="row px-xl-5 px-sm-4 px-3">
                <div className="col-4 px-1">
                  <a className="btn btn-outline-light w-100" href="#">
                    <i className="fab fa-facebook text-lg text-dark"></i>
                  </a>
                </div>
                <div className="col-4 px-1">
                  <a className="btn btn-outline-light w-100" href="#">
                    <i className="fab fa-apple text-lg text-dark"></i>
                  </a>
                </div>
                <div className="col-4 px-1">
                  <a className="btn btn-outline-light w-100" href="#">
                    <i className="fab fa-google text-lg text-dark"></i>
                  </a>
                </div>
                <div className="mt-2 position-relative text-center">
                  <p className="text-sm font-weight-bold mb-2 text-secondary text-border d-inline z-index-2 bg-white px-3"> or </p>
                </div>
              </div>
              <div className="card-body">
                <form role="form text-left" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Name" 
                      aria-label="Name" 
                      aria-describedby="email-addon"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="Email" 
                      aria-label="Email" 
                      aria-describedby="email-addon"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Password" 
                      aria-label="Password" 
                      aria-describedby="password-addon"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-check form-check-info text-left">
                    <input className="form-check-input" type="checkbox" id="flexCheckDefault" defaultChecked />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                      I agree the <a href="#" className="text-dark font-weight-bold">Terms and Conditions</a>
                    </label>
                  </div>
                  {error && <p className="text-danger text-xs mt-2">{error}</p>}
                  <div className="text-center">
                    <button type="submit" className="btn bg-gradient-dark w-100 my-4 mb-2" disabled={loading}>
                      {loading ? 'Signing up...' : 'Sign up'}
                    </button>
                  </div>
                  <p className="text-sm mt-3 mb-0">Already have an account? <Link to="/login" className="text-dark font-weight-bold">Sign in</Link></p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
