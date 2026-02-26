import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiCalendar } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      toast.success('Login successful!');
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(result.message || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <FiCalendar />
            </div>
            <h1>Smart Seat Booking</h1>
            <p>Manage your hybrid workspace efficiently</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              icon={<FiMail />}
              required
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              icon={<FiLock />}
              required
            />

            <Button type="submit" fullWidth loading={loading} size="large">
              Sign In
            </Button>
          </form>

          <div className="login-footer">
            <div className="login-demo-credentials">
              <p className="demo-title">Demo Credentials:</p>
              <div className="demo-items">
                <div className="demo-item">
                  <strong>Admin:</strong> admin@company.com / admin123
                </div>
                <div className="demo-item">
                  <strong>Employee:</strong> employee1@company.com / employee123
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-features">
          <div className="feature-item">
            <div className="feature-icon">
              <FiCalendar />
            </div>
            <h3>Smart Scheduling</h3>
            <p>Automated batch rotation with intelligent seat allocation</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <FiCalendar />
            </div>
            <h3>Real-time Availability</h3>
            <p>Check seat availability and book instantly</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <FiCalendar />
            </div>
            <h3>Buffer Seats</h3>
            <p>Flexible booking options for non-scheduled days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
